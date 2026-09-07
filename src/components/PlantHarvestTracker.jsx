import {
    useMemo,
    useState
} from "react";

import Icon
    from "./Icon";

import {
    getCropById
} from "../data/cropPlanningData";


const repeatHarvestCropIds = new Set([
    "tomato",
    "pepper",
    "cucumber",
    "beans",
    "basil",
    "strawberry",
    "kale",
    "spinach",
    "peas",
    "zucchini",
    "eggplant"
]);


function getLocalDateString(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function formatGardenDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "Not recorded";

    }


    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function PlantHarvestTracker({
    plant,
    growthStage,
    onRecordHarvest
}) {

    const crop =
        plant?.cropId
            ? getCropById(
                plant.cropId
            )
            : null;


    const repeatHarvest =
        repeatHarvestCropIds.has(
            crop?.id
        );


    const history =
        useMemo(
            () => {

                const savedHistory =
                    Array.isArray(
                        plant?.harvestHistory
                    )
                        ? plant.harvestHistory
                        : [];


                return [
                    ...savedHistory
                ].sort(
                    (
                        recordA,
                        recordB
                    ) =>
                        String(
                            recordB.date || ""
                        ).localeCompare(
                            String(
                                recordA.date || ""
                            )
                        )
                );

            },
            [
                plant?.harvestHistory
            ]
        );


    const latestHarvest =
        history[0] ||
        null;


    const [
        formOpen,
        setFormOpen
    ] = useState(
        false
    );


    const [
        harvestDate,
        setHarvestDate
    ] = useState(
        () =>
            getLocalDateString(
                new Date()
            )
    );


    const [
        harvestAmount,
        setHarvestAmount
    ] = useState(
        ""
    );


    const [
        harvestNotes,
        setHarvestNotes
    ] = useState(
        ""
    );


    const [
        finalHarvest,
        setFinalHarvest
    ] = useState(
        !repeatHarvest
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const canRecordHarvest = [
        "producing",
        "harvest-ready",
        "harvested"
    ].includes(
        growthStage?.id
    ) ||
    history.length > 0;


    if (
        !canRecordHarvest
    ) {

        return null;

    }


    function resetForm() {

        setHarvestDate(
            getLocalDateString(
                new Date()
            )
        );

        setHarvestAmount(
            ""
        );

        setHarvestNotes(
            ""
        );

        setFinalHarvest(
            !repeatHarvest
        );

    }


    function handleSubmit(
        event
    ) {

        event.preventDefault();


        const cleanAmount =
            harvestAmount.trim();


        if (
            !harvestDate
        ) {

            setMessage(
                "Choose the harvest date."
            );

            return;

        }


        if (
            !cleanAmount
        ) {

            setMessage(
                "Add the amount harvested."
            );

            return;

        }


        if (
            typeof onRecordHarvest !==
            "function"
        ) {

            setMessage(
                "Harvest tracking is unavailable right now."
            );

            return;

        }


        const saved =
            onRecordHarvest({
                plantKey:
                    plant.plantKey,
                date:
                    harvestDate,
                amount:
                    cleanAmount,
                notes:
                    harvestNotes.trim(),
                finalHarvest
            });


        if (
            saved === false
        ) {

            setMessage(
                "Unable to save this harvest."
            );

            return;

        }


        setMessage(
            finalHarvest
                ? "✓ Final harvest recorded. This crop is complete."
                : "✓ Harvest recorded and added to your Journal."
        );


        setFormOpen(
            false
        );


        resetForm();

    }


    return (

        <div className="plant-harvest-tracker">

            <div className="plant-harvest-tracker-header">

                <div className="plant-harvest-tracker-title">

                    <span>
                        <Icon
                            name="harvest"
                            size={16}
                        />
                    </span>


                    <div>

                        <strong>
                            Harvest Tracking
                        </strong>

                        <small>
                            {
                                history.length > 0
                                    ? `${history.length} ${history.length === 1 ? "harvest" : "harvests"} recorded`
                                    : "Ready to record your first harvest"
                            }
                        </small>

                    </div>

                </div>


                {
                    !formOpen && (

                        <button
                            type="button"
                            className="plant-harvest-record-button"
                            onClick={() => {
                                setMessage("");
                                setFormOpen(true);
                            }}
                        >
                            Record Harvest
                        </button>

                    )
                }

            </div>


            {
                latestHarvest && (

                    <div className="plant-harvest-latest">

                        <div>

                            <span>
                                Last harvest
                            </span>

                            <strong>
                                {
                                    latestHarvest.amount ||
                                    "Amount not recorded"
                                }
                            </strong>

                        </div>


                        <small>
                            {
                                formatGardenDate(
                                    latestHarvest.date
                                )
                            }

                            {
                                latestHarvest.finalHarvest
                                    ? " • Final harvest"
                                    : ""
                            }
                        </small>

                    </div>

                )
            }


            {
                formOpen && (

                    <form
                        className="plant-harvest-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="plant-harvest-form-grid">

                            <label>

                                <span>
                                    Date
                                </span>

                                <input
                                    type="date"
                                    value={harvestDate}
                                    onChange={
                                        (event) =>
                                            setHarvestDate(
                                                event.target.value
                                            )
                                    }
                                />

                            </label>


                            <label>

                                <span>
                                    Amount
                                </span>

                                <input
                                    type="text"
                                    placeholder="6 tomatoes or 2 lb"
                                    value={harvestAmount}
                                    onChange={
                                        (event) =>
                                            setHarvestAmount(
                                                event.target.value
                                            )
                                    }
                                />

                            </label>

                        </div>


                        <label className="plant-harvest-notes-field">

                            <span>
                                Notes
                            </span>

                            <textarea
                                rows="3"
                                placeholder="Optional notes about quality, size, flavor, or anything you noticed."
                                value={harvestNotes}
                                onChange={
                                    (event) =>
                                        setHarvestNotes(
                                            event.target.value
                                        )
                                }
                            />

                        </label>


                        <label className="plant-harvest-final-option">

                            <input
                                type="checkbox"
                                checked={finalHarvest}
                                onChange={
                                    (event) =>
                                        setFinalHarvest(
                                            event.target.checked
                                        )
                                }
                            />


                            <span>

                                <strong>
                                    Final harvest for this plant
                                </strong>

                                <small>
                                    {
                                        repeatHarvest
                                            ? "Leave this off if the plant will keep producing."
                                            : "Turn this off if you expect another harvest from this plant."
                                    }
                                </small>

                            </span>

                        </label>


                        <div className="plant-harvest-actions">

                            <button
                                type="button"
                                className="plant-harvest-cancel-button"
                                onClick={() => {
                                    setFormOpen(false);
                                    setMessage("");
                                    resetForm();
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="plant-harvest-save-button"
                            >
                                Save Harvest
                            </button>

                        </div>

                    </form>

                )
            }


            {
                message && (

                    <p className="plant-harvest-message">
                        {message}
                    </p>

                )
            }

        </div>

    );

}


export default PlantHarvestTracker;
