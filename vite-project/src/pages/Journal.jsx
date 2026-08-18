import {
    useState
} from "react";


import BottomNav
    from "../components/BottomNav";


function Journal({
    journalEntries = [],
    gardenPlants = [],
    onAddJournalEntry,
    onDeleteJournalEntry
}) {

    /* =========================
       DATE
    ========================= */

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


    const today =
        getLocalDateString(
            new Date()
        );


    /* =========================
       FORM STATE
    ========================= */

    const [
        entryDate,
        setEntryDate
    ] = useState(
        today
    );


    const [
        entryType,
        setEntryType
    ] = useState(
        "observation"
    );


    const [
        selectedPlantKey,
        setSelectedPlantKey
    ] = useState(
        ""
    );


    const [
        title,
        setTitle
    ] = useState(
        ""
    );


    const [
        notes,
        setNotes
    ] = useState(
        ""
    );


    const [
        harvestAmount,
        setHarvestAmount
    ] = useState(
        ""
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const [
        filter,
        setFilter
    ] = useState(
        "all"
    );


    /* =========================
       ENTRY ICON
    ========================= */

    function getEntryIcon(
        type
    ) {

        if (
            type === "growth"
        ) {
            return "🌱";
        }


        if (
            type === "watering"
        ) {
            return "💧";
        }


        if (
            type === "pest"
        ) {
            return "🐛";
        }


        if (
            type === "harvest"
        ) {
            return "🧺";
        }


        if (
            type === "maintenance"
        ) {
            return "🛠️";
        }


        return "📝";

    }


    function getEntryTypeName(
        type
    ) {

        if (
            type === "growth"
        ) {
            return "Growth";
        }


        if (
            type === "watering"
        ) {
            return "Watering";
        }


        if (
            type === "pest"
        ) {
            return "Pest / Disease";
        }


        if (
            type === "harvest"
        ) {
            return "Harvest";
        }


        if (
            type === "maintenance"
        ) {
            return "Maintenance";
        }


        return "Observation";

    }


    /* =========================
       FIND PLANT
    ========================= */

    function findEntryPlant(
        entry
    ) {

        if (
            entry.plantKey
        ) {

            const plant =
                gardenPlants.find(
                    (item) =>
                        item.plantKey ===
                        entry.plantKey
                );


            if (
                plant
            ) {

                return plant;

            }

        }


        if (
            entry.plantId
        ) {

            return gardenPlants.find(
                (item) =>

                    String(
                        item.id
                    ) ===
                    String(
                        entry.plantId
                    )

            );

        }


        return null;

    }


    /* =========================
       SAVE ENTRY
    ========================= */

    function handleSubmit(
        event
    ) {

        event.preventDefault();


        const cleanTitle =
            title.trim();


        const cleanNotes =
            notes.trim();


        if (
            !entryDate
        ) {

            setMessage(
                "Please choose a date."
            );

            return;

        }


        if (
            !cleanTitle
        ) {

            setMessage(
                "Please enter a title."
            );

            return;

        }


        if (
            !cleanNotes
        ) {

            setMessage(
                "Please add some notes."
            );

            return;

        }


        const selectedPlant =
            gardenPlants.find(
                (plant) =>
                    plant.plantKey ===
                    selectedPlantKey
            );


        const newEntry = {

            id:
                Date.now(),

            date:
                entryDate,

            type:
                entryType,

            plantKey:
                selectedPlant?.plantKey ||
                null,

            plantId:
                selectedPlant?.id ||
                null,

            title:
                cleanTitle,

            notes:
                cleanNotes,

            harvestAmount:
                entryType ===
                "harvest"
                    ? harvestAmount.trim()
                    : ""

        };


        onAddJournalEntry(
            newEntry
        );


        setMessage(
            "✓ Journal entry saved!"
        );


        setTitle(
            ""
        );


        setNotes(
            ""
        );


        setHarvestAmount(
            ""
        );


        setSelectedPlantKey(
            ""
        );

    }


    /* =========================
       FILTER / SORT
    ========================= */

    const displayedEntries =
        [...journalEntries]
            .filter(
                (entry) =>

                    filter === "all" ||
                    entry.type === filter

            )
            .sort(
                (
                    entryA,
                    entryB
                ) =>

                    entryB.date.localeCompare(
                        entryA.date
                    ) ||
                    entryB.id -
                    entryA.id

            );


    return (

        <div className="app-container">

            <header className="app-header">

                <h1>
                    📓 Garden Journal
                </h1>

                <p>
                    Record growth, problems,
                    maintenance, and harvests.
                </p>

            </header>


            <section className="journal-form-card">

                <h2>
                    New Journal Entry
                </h2>


                <form
                    className="journal-form"
                    onSubmit={handleSubmit}
                >

                    <div className="journal-form-field">

                        <label htmlFor="journal-date">
                            Date
                        </label>

                        <input
                            id="journal-date"
                            type="date"
                            value={entryDate}
                            onChange={
                                (event) =>
                                    setEntryDate(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="journal-form-field">

                        <label htmlFor="journal-type">
                            Entry Type
                        </label>

                        <select
                            id="journal-type"
                            value={entryType}
                            onChange={
                                (event) =>
                                    setEntryType(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="observation">
                                📝 Observation
                            </option>

                            <option value="growth">
                                🌱 Growth
                            </option>

                            <option value="watering">
                                💧 Watering
                            </option>

                            <option value="pest">
                                🐛 Pest / Disease
                            </option>

                            <option value="maintenance">
                                🛠️ Maintenance
                            </option>

                            <option value="harvest">
                                🧺 Harvest
                            </option>

                        </select>

                    </div>


                    <div className="journal-form-field">

                        <label htmlFor="journal-plant">
                            Plant
                        </label>

                        <select
                            id="journal-plant"
                            value={selectedPlantKey}
                            onChange={
                                (event) =>
                                    setSelectedPlantKey(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="">
                                General garden entry
                            </option>


                            {
                                gardenPlants.map(
                                    (plant) => (

                                        <option
                                            key={plant.plantKey}
                                            value={plant.plantKey}
                                        >
                                            {plant.name}
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>


                    <div className="journal-form-field">

                        <label htmlFor="journal-title">
                            Title
                        </label>

                        <input
                            id="journal-title"
                            type="text"
                            placeholder="Example: Tomato plant growing quickly"
                            value={title}
                            onChange={
                                (event) =>
                                    setTitle(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="journal-form-field">

                        <label htmlFor="journal-notes">
                            Notes
                        </label>

                        <textarea
                            id="journal-notes"
                            rows="5"
                            placeholder="What did you notice in your garden?"
                            value={notes}
                            onChange={
                                (event) =>
                                    setNotes(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    {
                        entryType ===
                        "harvest" && (

                            <div className="journal-form-field">

                                <label htmlFor="harvest-amount">
                                    Harvest Amount
                                </label>

                                <input
                                    id="harvest-amount"
                                    type="text"
                                    placeholder="Example: 6 tomatoes or 2 lbs"
                                    value={harvestAmount}
                                    onChange={
                                        (event) =>
                                            setHarvestAmount(
                                                event.target.value
                                            )
                                    }
                                />

                            </div>

                        )
                    }


                    {
                        message && (

                            <p className="journal-message">
                                {message}
                            </p>

                        )
                    }


                    <button
                        type="submit"
                        className="journal-save-button"
                    >
                        + Save Journal Entry
                    </button>

                </form>

            </section>


            <section className="journal-history">

                <div className="journal-history-header">

                    <div>

                        <h2>
                            Journal History
                        </h2>

                        <p>
                            {journalEntries.length}

                            {
                                journalEntries.length === 1
                                    ? " entry"
                                    : " entries"
                            }
                        </p>

                    </div>


                    <select
                        value={filter}
                        onChange={
                            (event) =>
                                setFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="all">
                            All Entries
                        </option>

                        <option value="observation">
                            Observations
                        </option>

                        <option value="growth">
                            Growth
                        </option>

                        <option value="watering">
                            Watering
                        </option>

                        <option value="pest">
                            Pest / Disease
                        </option>

                        <option value="maintenance">
                            Maintenance
                        </option>

                        <option value="harvest">
                            Harvest
                        </option>

                    </select>

                </div>


                {
                    displayedEntries.length === 0
                        ? (

                            <div className="journal-empty">

                                <span>
                                    📓
                                </span>

                                <p>
                                    No journal entries yet.
                                </p>

                            </div>

                        )
                        : (

                            <div className="journal-entry-list">

                                {
                                    displayedEntries.map(
                                        (entry) => {

                                            const plant =
                                                findEntryPlant(
                                                    entry
                                                );


                                            return (

                                                <article
                                                    className="journal-entry-card"
                                                    key={entry.id}
                                                >

                                                    <div className="journal-entry-top">

                                                        <span className="journal-entry-icon">
                                                            {
                                                                getEntryIcon(
                                                                    entry.type
                                                                )
                                                            }
                                                        </span>


                                                        <div className="journal-entry-heading">

                                                            <h3>
                                                                {entry.title}
                                                            </h3>

                                                            <small>

                                                                {entry.date}

                                                                {" • "}

                                                                {
                                                                    getEntryTypeName(
                                                                        entry.type
                                                                    )
                                                                }

                                                                {
                                                                    plant
                                                                        ? ` • ${plant.name}`
                                                                        : ""
                                                                }

                                                            </small>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onDeleteJournalEntry(
                                                                    entry.id
                                                                )
                                                            }
                                                        >
                                                            ✕
                                                        </button>

                                                    </div>


                                                    <p className="journal-entry-notes">
                                                        {entry.notes}
                                                    </p>


                                                    {
                                                        entry.type ===
                                                        "harvest" &&
                                                        entry.harvestAmount && (

                                                            <div className="harvest-result">

                                                                🧺 Harvested:{" "}

                                                                <strong>
                                                                    {
                                                                        entry.harvestAmount
                                                                    }
                                                                </strong>

                                                            </div>

                                                        )
                                                    }

                                                </article>

                                            );

                                        }
                                    )
                                }

                            </div>

                        )
                }

            </section>


            <BottomNav />

        </div>

    );

}


export default Journal;