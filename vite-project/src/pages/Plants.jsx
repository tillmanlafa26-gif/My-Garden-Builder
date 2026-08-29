import {
    useState
} from "react";

import {
    Link
} from "react-router";


import VegetableLibrary
    from "../components/VegetableLibrary";


import BottomNav
    from "../components/BottomNav";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


import {
    cropPlanningData,
    getCropById
} from "../data/cropPlanningData";


import {
    calculateHarvestSchedule
} from "../utils/harvestScheduleGenerator";


/* =========================
   CORE PLANT CONVERSION

   Turns one of our internal
   planning crops into a plant
   that can be added to My Garden.
========================= */

function createCoreGardenPlant(
    crop
) {

    return {

        id:
            `core-${crop.id}`,

        cropId:
            crop.id,

        plantKey:
            `core:${crop.id}`,

        source:
            "core",

        name:
            crop.name,

        common_name:
            crop.name,

        icon:
            crop.icon,

        category:
            "Garden Crop",

        sunlight:
            crop.minimumSunlight,

        startMethod:
            crop.preferredStartMethod ||
            "direct-sow",

        watering:
            "Average",

        water:
            "Average",

        addedAt:
            new Date()
                .toISOString()

    };

}


/* =========================
   DATE FORMATTER
========================= */

function formatGardenDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "Not set";

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
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        }
    );

}


/* =========================
   START METHOD LABEL
========================= */

function getStartMethodLabel(
    startMethod
) {

    if (
        startMethod ===
        "seed"
    ) {

        return "Started from Seed";

    }


    if (
        startMethod ===
        "transplant"
    ) {

        return "Transplant";

    }


    if (
        startMethod ===
        "direct-sow"
    ) {

        return "Direct Sow";

    }


    return "Not set";

}


/* =========================
   PLANT DISPLAY NAME
========================= */

function getPlantName(
    plant
) {

    return (
        plant.name ||
        plant.common_name ||
        plant.commonName ||
        "Garden Plant"
    );

}


/* =========================
   PLANT ICON
========================= */

function getPlantIcon(
    plant
) {

    if (
        plant.icon
    ) {

        return plant.icon;

    }


    if (
        plant.cropId
    ) {

        const crop =
            getCropById(
                plant.cropId
            );


        if (
            crop?.icon
        ) {

            return crop.icon;

        }

    }


    return "🌱";

}


/* =========================
   PLANTS PAGE
========================= */

function Plants({

    gardenProfile,

    gardenPlants = [],

    onAddPlant,

    onRemovePlant,

    onUpdatePlantStart

}) {


    /* =========================
       EDITING STATE
    ========================= */

    const [
        editingPlantKey,
        setEditingPlantKey
    ] = useState(
        null
    );


    const [
        draftStartMethod,
        setDraftStartMethod
    ] = useState(
        ""
    );


    const [
        draftStartDate,
        setDraftStartDate
    ] = useState(
        ""
    );


    const [
        plantSetupMessage,
        setPlantSetupMessage
    ] = useState(
        ""
    );


    const selectedGarden =
        gardenProfile
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    /* =========================
       FIND SAVED CROP
    ========================= */

    function getSavedCrop(
        cropId
    ) {

        return gardenPlants.find(
            (plant) =>
                plant.cropId ===
                    cropId ||
                plant.plantKey ===
                    `core:${cropId}`
        );

    }


    /* =========================
       ADD CORE CROP
    ========================= */

    function handleAddCoreCrop(
        crop
    ) {

        const existingPlant =
            getSavedCrop(
                crop.id
            );


        if (
            existingPlant
        ) {

            return;

        }


        const plant =
            createCoreGardenPlant(
                crop
            );


        onAddPlant(
            plant
        );

    }


    /* =========================
       REMOVE CORE CROP
    ========================= */

    function handleRemoveCoreCrop(
        crop
    ) {

        const existingPlant =
            getSavedCrop(
                crop.id
            );


        if (
            !existingPlant
        ) {

            return;

        }


        if (
            editingPlantKey ===
            existingPlant.plantKey
        ) {

            setEditingPlantKey(
                null
            );

        }


        onRemovePlant(
            existingPlant
        );

    }


    /* =========================
       START EDITING
    ========================= */

    function beginPlantSetup(
        plant
    ) {

        const crop =
            plant.cropId
                ? getCropById(
                    plant.cropId
                )
                : null;


        setEditingPlantKey(
            plant.plantKey
        );


        setDraftStartMethod(
            plant.startMethod ||
            crop?.preferredStartMethod ||
            "direct-sow"
        );


        setDraftStartDate(
            plant.startDate ||
            ""
        );


        setPlantSetupMessage(
            ""
        );

    }


    /* =========================
       CANCEL EDIT
    ========================= */

    function cancelPlantSetup() {

        setEditingPlantKey(
            null
        );


        setDraftStartMethod(
            ""
        );


        setDraftStartDate(
            ""
        );


        setPlantSetupMessage(
            ""
        );

    }


    /* =========================
       SAVE PLANT START
    ========================= */

    function savePlantSetup(
        plant
    ) {

        if (
            !draftStartMethod
        ) {

            setPlantSetupMessage(
                "Choose how this plant was started."
            );

            return;

        }


        if (
            !draftStartDate
        ) {

            setPlantSetupMessage(
                "Choose the planting or start date."
            );

            return;

        }


        onUpdatePlantStart({

            plantKey:
                plant.plantKey,

            startDate:
                draftStartDate,

            startMethod:
                draftStartMethod

        });


        setPlantSetupMessage(
            ""
        );


        setEditingPlantKey(
            null
        );


        setDraftStartMethod(
            ""
        );


        setDraftStartDate(
            ""
        );

    }


    /* =========================
       HARVEST SCHEDULE
    ========================= */

    function getPlantHarvestSchedule(
        plant
    ) {

        if (
            !plant.cropId ||
            !plant.startDate
        ) {

            return null;

        }


        return calculateHarvestSchedule({

            cropId:
                plant.cropId,

            startDate:
                plant.startDate,

            startMethod:
                plant.startMethod

        });

    }


    /* =========================
       DRAFT HARVEST SCHEDULE
    ========================= */

    function getDraftHarvestSchedule(
        plant
    ) {

        if (
            !plant.cropId ||
            !draftStartDate ||
            !draftStartMethod
        ) {

            return null;

        }


        return calculateHarvestSchedule({

            cropId:
                plant.cropId,

            startDate:
                draftStartDate,

            startMethod:
                draftStartMethod

        });

    }


    return (

        <div className="app-container">


            {/* =========================
                HEADER
            ========================= */}

            <header className="app-header">

                <h1>
                    🌿 Plant Library
                </h1>


                <p>
                    Discover edible plants
                    for your sustainable garden.
                </p>

            </header>


            {/* =========================
                GARDEN PROFILE NOTICE
            ========================= */}

            {
                !gardenProfile && (

                    <section className="plant-profile-notice">

                        <p>
                            Build your garden profile
                            to help us personalize
                            planting, harvest, and
                            seasonal recommendations.
                        </p>


                        <Link
                            to="/garden"

                            className="garden-profile-link"
                        >

                            Build My Garden

                        </Link>

                    </section>

                )
            }


            {/* =========================
                CURRENT GARDEN
            ========================= */}

            {
                gardenProfile && (

                    <section className="plant-recommendation-summary">

                        <span>

                            {
                                selectedGarden?.icon ||
                                "🌱"
                            }

                        </span>


                        <div>

                            <strong>
                                Your garden
                            </strong>


                            <p>

                                {
                                    selectedGarden?.name
                                }

                                {" • "}

                                {
                                    sunlightNames[
                                        gardenProfile.sunlight
                                    ]
                                }

                                {
                                    gardenProfile
                                        .hardinessZone
                                        ? ` • Zone ${gardenProfile.hardinessZone}`
                                        : ""
                                }

                            </p>

                        </div>

                    </section>

                )
            }


            {/* =========================
                SAVED PLANT COUNT
            ========================= */}

            <section className="plant-results-header">

                <h2>
                    My Garden
                </h2>


                <span>

                    {
                        gardenPlants.length
                    }

                    {
                        gardenPlants.length ===
                        1
                            ? " plant"
                            : " plants"
                    }

                </span>

            </section>


            {/* =========================
                PLANT START SETUP
            ========================= */}

            {
                gardenPlants.length >
                0 && (

                    <section className="designer-card plant-start-section">

                        <div className="designer-section-heading">

                            <span>
                                📅
                            </span>


                            <div>

                                <h2>
                                    Planting Setup
                                </h2>


                                <p>
                                    Tell us how and when
                                    each plant was started
                                    for better harvest timing.
                                </p>

                            </div>

                        </div>


                        <div className="plant-start-list">

                            {
                                gardenPlants.map(
                                    (plant) => {

                                        const isEditing =
                                            editingPlantKey ===
                                            plant.plantKey;


                                        const crop =
                                            plant.cropId
                                                ? getCropById(
                                                    plant.cropId
                                                )
                                                : null;


                                        const savedSchedule =
                                            getPlantHarvestSchedule(
                                                plant
                                            );


                                        const draftSchedule =
                                            isEditing
                                                ? getDraftHarvestSchedule(
                                                    plant
                                                )
                                                : null;


                                        return (

                                            <article
                                                key={
                                                    plant.plantKey
                                                }

                                                className="plant-start-card"
                                            >


                                                {/* =========================
                                                    PLANT HEADER
                                                ========================= */}

                                                <div className="plant-start-header">

                                                    <span className="plant-start-icon">

                                                        {
                                                            getPlantIcon(
                                                                plant
                                                            )
                                                        }

                                                    </span>


                                                    <div>

                                                        <strong>

                                                            {
                                                                getPlantName(
                                                                    plant
                                                                )
                                                            }

                                                        </strong>


                                                        <small>

                                                            {
                                                                crop
                                                                    ? crop.seasonType ===
                                                                      "warm"
                                                                        ? "Warm-season crop"
                                                                        : "Cool-season crop"
                                                                    : plant.category ||
                                                                      "Garden plant"
                                                            }

                                                        </small>

                                                    </div>

                                                </div>


                                                {
                                                    !isEditing
                                                        ? (

                                                            <>

                                                                {/* =========================
                                                                    SAVED DETAILS
                                                                ========================= */}

                                                                <div className="plant-start-details">

                                                                    <div>

                                                                        <span>
                                                                            Start Method
                                                                        </span>

                                                                        <strong>

                                                                            {
                                                                                getStartMethodLabel(
                                                                                    plant.startMethod
                                                                                )
                                                                            }

                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            Start Date
                                                                        </span>

                                                                        <strong>

                                                                            {
                                                                                formatGardenDate(
                                                                                    plant.startDate
                                                                                )
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                </div>


                                                                {
                                                                    crop && (

                                                                        <div className="plant-start-recommendation">

                                                                            <span>
                                                                                💡
                                                                            </span>

                                                                            <p>

                                                                                Recommended start:

                                                                                {" "}

                                                                                <strong>

                                                                                    {
                                                                                        getStartMethodLabel(
                                                                                            crop.preferredStartMethod
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                            </p>

                                                                        </div>

                                                                    )
                                                                }


                                                                {/* =========================
                                                                    HARVEST PREVIEW
                                                                ========================= */}

                                                                {
                                                                    savedSchedule
                                                                        ? (

                                                                            <div className="plant-harvest-preview">

                                                                                <span>
                                                                                    🧺
                                                                                </span>


                                                                                <div>

                                                                                    <small>
                                                                                        Estimated Harvest
                                                                                    </small>


                                                                                    <strong>

                                                                                        {
                                                                                            formatGardenDate(
                                                                                                savedSchedule.harvestStartDate
                                                                                            )
                                                                                        }

                                                                                        {" – "}

                                                                                        {
                                                                                            formatGardenDate(
                                                                                                savedSchedule.harvestEndDate
                                                                                            )
                                                                                        }

                                                                                    </strong>

                                                                                </div>

                                                                            </div>

                                                                        )
                                                                        : (

                                                                            <div className="plant-harvest-unavailable">

                                                                                <span>
                                                                                    ℹ️
                                                                                </span>


                                                                                <p>

                                                                                    {
                                                                                        plant.cropId
                                                                                            ? "Set planting information to calculate the harvest window."
                                                                                            : "Harvest timing is not yet available for this database plant."
                                                                                    }

                                                                                </p>

                                                                            </div>

                                                                        )
                                                                }


                                                                <button
                                                                    type="button"

                                                                    className="plant-start-edit-button"

                                                                    onClick={() =>
                                                                        beginPlantSetup(
                                                                            plant
                                                                        )
                                                                    }
                                                                >

                                                                    ✏️ Edit Planting Info

                                                                </button>

                                                            </>

                                                        )
                                                        : (

                                                            <>

                                                                {/* =========================
                                                                    EDIT FORM
                                                                ========================= */}

                                                                <div className="plant-start-editor">

                                                                    <label>

                                                                        How was it started?

                                                                        <select
                                                                            value={
                                                                                draftStartMethod
                                                                            }

                                                                            onChange={
                                                                                (event) =>
                                                                                    setDraftStartMethod(
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        >

                                                                            <option value="seed">
                                                                                🌱 Started from Seed
                                                                            </option>

                                                                            <option value="transplant">
                                                                                🪴 Transplant
                                                                            </option>

                                                                            <option value="direct-sow">
                                                                                🌾 Direct Sow
                                                                            </option>

                                                                        </select>

                                                                    </label>


                                                                    <label>

                                                                        Planting / Start Date

                                                                        <input
                                                                            type="date"

                                                                            value={
                                                                                draftStartDate
                                                                            }

                                                                            onChange={
                                                                                (event) =>
                                                                                    setDraftStartDate(
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        />

                                                                    </label>

                                                                </div>


                                                                {
                                                                    crop && (

                                                                        <div className="plant-start-recommendation">

                                                                            <span>
                                                                                💡
                                                                            </span>

                                                                            <p>

                                                                                Recommended for {

                                                                                    crop.name

                                                                                }:

                                                                                {" "}

                                                                                <strong>

                                                                                    {
                                                                                        getStartMethodLabel(
                                                                                            crop.preferredStartMethod
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                            </p>

                                                                        </div>

                                                                    )
                                                                }


                                                                {/* =========================
                                                                    LIVE HARVEST PREVIEW
                                                                ========================= */}

                                                                {
                                                                    draftSchedule && (

                                                                        <div className="plant-harvest-preview">

                                                                            <span>
                                                                                🧺
                                                                            </span>


                                                                            <div>

                                                                                <small>
                                                                                    New Estimated Harvest
                                                                                </small>


                                                                                <strong>

                                                                                    {
                                                                                        formatGardenDate(
                                                                                            draftSchedule.harvestStartDate
                                                                                        )
                                                                                    }

                                                                                    {" – "}

                                                                                    {
                                                                                        formatGardenDate(
                                                                                            draftSchedule.harvestEndDate
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                            </div>

                                                                        </div>

                                                                    )
                                                                }


                                                                {
                                                                    plantSetupMessage && (

                                                                        <p className="plant-start-message">

                                                                            {
                                                                                plantSetupMessage
                                                                            }

                                                                        </p>

                                                                    )
                                                                }


                                                                <div className="plant-start-actions">

                                                                    <button
                                                                        type="button"

                                                                        className="plant-start-cancel-button"

                                                                        onClick={
                                                                            cancelPlantSetup
                                                                        }
                                                                    >

                                                                        Cancel

                                                                    </button>


                                                                    <button
                                                                        type="button"

                                                                        className="plant-start-save-button"

                                                                        onClick={() =>
                                                                            savePlantSetup(
                                                                                plant
                                                                            )
                                                                        }
                                                                    >

                                                                        Save Planting Info

                                                                    </button>

                                                                </div>

                                                            </>

                                                        )
                                                }

                                            </article>

                                        );

                                    }
                                )
                            }

                        </div>


                        <div className="material-assumptions">

                            <strong>
                                🧺 Harvest Calendar
                            </strong>


                            <p>
                                Changing a start method
                                or planting date will
                                automatically update that
                                crop's estimated harvest
                                dates on your Calendar.
                            </p>

                        </div>

                    </section>

                )
            }


            {/* =========================
                CORE GARDEN CROPS
            ========================= */}

            <section className="designer-card">

                <div className="designer-section-heading">

                    <span>
                        🥕
                    </span>


                    <div>

                        <h2>
                            Garden Crops
                        </h2>


                        <p>
                            Reliable crops built directly
                            into My Garden Builder.
                        </p>

                    </div>

                </div>


                <div className="feature-grid">

                    {
                        cropPlanningData.map(
                            (crop) => {

                                const savedPlant =
                                    getSavedCrop(
                                        crop.id
                                    );


                                const isAdded =
                                    Boolean(
                                        savedPlant
                                    );


                                return (

                                    <div
                                        key={
                                            crop.id
                                        }

                                        className={
                                            isAdded
                                                ? "feature-card selected"
                                                : "feature-card"
                                        }
                                    >

                                        <span>

                                            {
                                                crop.icon
                                            }

                                        </span>


                                        <strong>

                                            {
                                                crop.name
                                            }

                                        </strong>


                                        <small>

                                            {
                                                crop.seasonType ===
                                                "warm"
                                                    ? "Warm-season crop"
                                                    : "Cool-season crop"
                                            }

                                        </small>


                                        <small>

                                            {
                                                crop.preferredStartMethod ===
                                                "transplant"
                                                    ? "Best started as transplant"
                                                    : "Usually direct sown"
                                            }

                                        </small>


                                        {
                                            isAdded
                                                ? (

                                                    <button
                                                        type="button"

                                                        onClick={() =>
                                                            handleRemoveCoreCrop(
                                                                crop
                                                            )
                                                        }
                                                    >

                                                        ✓ In My Garden

                                                    </button>

                                                )
                                                : (

                                                    <button
                                                        type="button"

                                                        onClick={() =>
                                                            handleAddCoreCrop(
                                                                crop
                                                            )
                                                        }
                                                    >

                                                        + Add to My Garden

                                                    </button>

                                                )
                                        }

                                    </div>

                                );

                            }
                        )
                    }

                </div>


                <div className="material-assumptions">

                    <strong>
                        🌱 My Garden Builder Crops
                    </strong>


                    <p>
                        These crops use our own
                        planting, spacing, season,
                        and harvest calculations.
                        They do not depend on the
                        external plant API.
                    </p>

                </div>

            </section>


            {/* =========================
                LIVE PLANT DATABASE
            ========================= */}

            <section className="plant-results-header">

                <h2>
                    More Plants
                </h2>


                <span>
                    Live plant database
                </span>

            </section>


            <VegetableLibrary

                gardenPlants={
                    gardenPlants
                }


                /*
                    IMPORTANT:

                    We are intentionally NOT
                    passing the user's USDA
                    hardiness zone into the
                    external vegetable search.

                    Hardiness describes winter
                    survival and should not
                    remove annual vegetables
                    such as tomatoes from the
                    plant library.
                */

                hardinessZone=""


                onAddPlant={
                    onAddPlant
                }


                onRemovePlant={
                    onRemovePlant
                }


                onUpdatePlantStart={
                    onUpdatePlantStart
                }

            />


            <BottomNav />


        </div>

    );

}


export default Plants;