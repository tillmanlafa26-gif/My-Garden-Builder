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

import Icon
    from "../components/Icon";

import PlantHarvestTracker
    from "../components/PlantHarvestTracker";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


import {
    cropPlanningData,
    getCropById
} from "../data/cropPlanningData";


import {
    indoorPlantData
} from "../data/indoorPlantData";


import {
    calculateHarvestSchedule
} from "../utils/harvestScheduleGenerator";

import {
    getAvailableGrowthStages,
    getPlantGrowthStage
} from "../utils/plantGrowthStage";


import {
    getIndoorCareScheduleForPlant
} from "../utils/indoorCareScheduler";


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
   INDOOR PLANT CONVERSION
========================= */

function createIndoorGardenPlant(
    plant
) {
    return {
        id:
            `indoor-${plant.id}`,

        indoorPlantId:
            plant.id,

        plantKey:
            `indoor:${plant.id}`,

        source:
            "indoor",

        name:
            plant.name,

        common_name:
            plant.name,

        icon:
            plant.icon,

        category:
            "Indoor Plant",

        sunlight:
            plant.lightLabel,

        watering:
            plant.waterPreference ||
            "Average",

        water:
            plant.waterPreference ||
            "Average",

        waterEveryDays:
            Number(
                plant.waterEveryDays
            ) ||
            7,

        humidityPreference:
            plant.humidityPreference ||
            "Average",

        careTip:
            plant.careTip ||
            "",

        rotateEveryDays:
            Number(
                plant.rotateEveryDays
            ) ||
            14,

        lightCheckEveryDays:
            Number(
                plant.lightCheckEveryDays
            ) ||
            30,

        repotCheckEveryDays:
            Number(
                plant.repotCheckEveryDays
            ) ||
            0,

        potDiameterInches:
            plant.potDiameterInches,

        matureWidthInches:
            plant.matureWidthInches,

        matureHeightInches:
            plant.matureHeightInches,

        placementStyle:
            plant.placementStyle,

        lightLabel:
            plant.lightLabel,

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

    onUpdatePlantStart,

    onUpdateGrowthStage,

    onRecordHarvest,

    onUpdateIndoorCare

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


    const isIndoorGarden =
        gardenProfile
            ?.designSpace
            ?.spaceType ===
        "indoor";


    const selectedIndoorPlantIds =
        Array.isArray(
            gardenProfile
                ?.designSpace
                ?.indoorPlantGoals
        )
            ? gardenProfile
                .designSpace
                .indoorPlantGoals
            : [];


    const selectedIndoorPlants =
        selectedIndoorPlantIds
            .map(
                (plantId) =>
                    indoorPlantData.find(
                        (plant) =>
                            plant.id ===
                            plantId
                    )
            )
            .filter(
                Boolean
            );


    const trackedIndoorPlants =
        gardenPlants.filter(
            (plant) =>
                plant.source ===
                "indoor"
        );


    const outdoorGardenPlants =
        gardenPlants.filter(
            (plant) =>
                plant.source !==
                "indoor"
        );


    /* =========================
       INDOOR CARE TRACKING
    ========================= */

    function getTrackedIndoorPlant(
        plantId
    ) {
        return gardenPlants.find(
            (plant) =>
                plant.plantKey ===
                    `indoor:${plantId}` ||
                (
                    plant.source ===
                        "indoor" &&
                    plant.indoorPlantId ===
                        plantId
                )
        );
    }


    function handleTrackIndoorPlant(
        indoorPlant
    ) {
        if (
            getTrackedIndoorPlant(
                indoorPlant.id
            )
        ) {
            return;
        }


        onAddPlant?.(
            createIndoorGardenPlant(
                indoorPlant
            )
        );
    }


    function handleRemoveIndoorPlant(
        indoorPlant
    ) {
        const tracked =
            getTrackedIndoorPlant(
                indoorPlant.id
            );


        if (
            !tracked
        ) {
            return;
        }


        onRemovePlant?.(
            tracked
        );
    }


    function handleIndoorCareAction(
        trackedPlant,
        action
    ) {
        if (
            !trackedPlant ||
            typeof onUpdateIndoorCare !==
                "function"
        ) {
            return;
        }


        onUpdateIndoorCare({
            plantKey:
                trackedPlant.plantKey,

            action
        });
    }


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
                            to="/"

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
                                    isIndoorGarden
                                        ? (
                                            gardenProfile
                                                ?.designSpace
                                                ?.indoorLayout
                                                ?.indoorSpaceName ||
                                            "Indoor Plant Space"
                                        )
                                        : selectedGarden?.name
                                }

                                {" • "}

                                {
                                    sunlightNames[
                                        gardenProfile.sunlight
                                    ]
                                }

                                {
                                    !isIndoorGarden &&
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
                INDOOR PLANT CARE
            ========================= */}

            {
                isIndoorGarden &&
                selectedIndoorPlants.length >
                0 && (

                    <section className="designer-card indoor-care-section">

                        <div className="designer-section-heading">

                            <span>
                                🏠
                            </span>


                            <div>

                                <h2>
                                    Indoor Plant Care
                                </h2>


                                <p>
                                    Track plants from your indoor layout. Watering reminders are moisture-check prompts based on a starting interval, not automatic instructions to water.
                                </p>

                            </div>

                        </div>


                        <div className="indoor-care-list">

                            {
                                selectedIndoorPlants.map(
                                    (indoorPlant) => {

                                        const tracked =
                                            getTrackedIndoorPlant(
                                                indoorPlant.id
                                            );


                                        const careSchedule =
                                            tracked
                                                ? getIndoorCareScheduleForPlant(
                                                    tracked,
                                                    gardenProfile
                                                )
                                                : null;


                                        return (
                                            <article
                                                key={
                                                    indoorPlant.id
                                                }
                                                className={
                                                    tracked
                                                        ? "indoor-care-card tracked"
                                                        : "indoor-care-card"
                                                }
                                            >

                                                <div className="indoor-care-card-heading">

                                                    <span className="indoor-care-plant-icon">
                                                        {
                                                            indoorPlant.icon
                                                        }
                                                    </span>


                                                    <div>

                                                        <strong>
                                                            {
                                                                indoorPlant.name
                                                            }
                                                        </strong>


                                                        <small>
                                                            {
                                                                indoorPlant.lightLabel
                                                            }
                                                        </small>

                                                    </div>


                                                    <span className="indoor-care-pot-badge">
                                                        {
                                                            indoorPlant.potDiameterInches
                                                        } in pot
                                                    </span>

                                                </div>


                                                <div className="indoor-care-facts">

                                                    <div>

                                                        <span>
                                                            💧
                                                        </span>


                                                        <strong>
                                                            Check about every {
                                                                indoorPlant.waterEveryDays
                                                            } days
                                                        </strong>


                                                        <small>
                                                            {
                                                                indoorPlant.waterPreference
                                                            } moisture
                                                        </small>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            💨
                                                        </span>


                                                        <strong>
                                                            {
                                                                indoorPlant.humidityPreference
                                                            }
                                                        </strong>


                                                        <small>
                                                            Humidity preference
                                                        </small>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            📏
                                                        </span>


                                                        <strong>
                                                            {
                                                                indoorPlant.matureWidthInches
                                                            } × {
                                                                indoorPlant.matureHeightInches
                                                            } in
                                                        </strong>


                                                        <small>
                                                            Approx. mature W × H
                                                        </small>

                                                    </div>

                                                </div>


                                                <p className="indoor-care-tip">
                                                    {
                                                        indoorPlant.careTip
                                                    }
                                                </p>


                                                {
                                                    tracked
                                                        ? (
                                                            <>

                                                                {
                                                                    careSchedule && (

                                                                        <div className="indoor-care-schedule">

                                                                            <strong>
                                                                                Care Schedule
                                                                            </strong>


                                                                            <div className="indoor-care-schedule-grid">

                                                                                {
                                                                                    careSchedule.rotation && (

                                                                                        <div>

                                                                                            <span>
                                                                                                🔄
                                                                                            </span>


                                                                                            <strong>
                                                                                                Rotate / orientation
                                                                                            </strong>


                                                                                            <small>
                                                                                                {
                                                                                                    careSchedule.rotation.overdue
                                                                                                        ? "Due now"
                                                                                                        : formatGardenDate(
                                                                                                            careSchedule.rotation.dueDate
                                                                                                        )
                                                                                                }
                                                                                            </small>

                                                                                        </div>

                                                                                    )
                                                                                }


                                                                                {
                                                                                    careSchedule.light && (

                                                                                        <div>

                                                                                            <span>
                                                                                                💡
                                                                                            </span>


                                                                                            <strong>
                                                                                                {
                                                                                                    careSchedule.needsGrowLight
                                                                                                        ? "Grow-light check"
                                                                                                        : "Light check"
                                                                                                }
                                                                                            </strong>


                                                                                            <small>
                                                                                                {
                                                                                                    careSchedule.light.overdue
                                                                                                        ? "Due now"
                                                                                                        : formatGardenDate(
                                                                                                            careSchedule.light.dueDate
                                                                                                        )
                                                                                                }
                                                                                            </small>

                                                                                        </div>

                                                                                    )
                                                                                }


                                                                                {
                                                                                    careSchedule.repotCheck && (

                                                                                        <div>

                                                                                            <span>
                                                                                                🪴
                                                                                            </span>


                                                                                            <strong>
                                                                                                Repot assessment
                                                                                            </strong>


                                                                                            <small>
                                                                                                {
                                                                                                    careSchedule.repotCheck.overdue
                                                                                                        ? "Due now"
                                                                                                        : formatGardenDate(
                                                                                                            careSchedule.repotCheck.dueDate
                                                                                                        )
                                                                                                }
                                                                                            </small>

                                                                                        </div>

                                                                                    )
                                                                                }

                                                                            </div>


                                                                            <div className="indoor-care-quick-actions">

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleIndoorCareAction(
                                                                                            tracked,
                                                                                            "rotate"
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    🔄 Rotated
                                                                                </button>


                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleIndoorCareAction(
                                                                                            tracked,
                                                                                            "light-check"
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    💡 Light Checked
                                                                                </button>


                                                                                {
                                                                                    careSchedule.repotCheck && (

                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                handleIndoorCareAction(
                                                                                                    tracked,
                                                                                                    "repotted"
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            🪴 Repotted
                                                                                        </button>

                                                                                    )
                                                                                }

                                                                            </div>

                                                                        </div>

                                                                    )
                                                                }


                                                                <div className="indoor-care-actions">

                                                                    <span className="indoor-care-tracked-badge">
                                                                        ✓ Care tracking active
                                                                    </span>


                                                                    <button
                                                                        type="button"
                                                                        className="indoor-care-remove-button"
                                                                        onClick={() =>
                                                                            handleRemoveIndoorPlant(
                                                                                indoorPlant
                                                                            )
                                                                        }
                                                                    >
                                                                        Stop Tracking
                                                                    </button>

                                                                </div>

                                                            </>
                                                        )
                                                        : (
                                                            <button
                                                                type="button"
                                                                className="indoor-care-track-button"
                                                                onClick={() =>
                                                                    handleTrackIndoorPlant(
                                                                        indoorPlant
                                                                    )
                                                                }
                                                            >
                                                                Track This Plant
                                                            </button>
                                                        )
                                                }

                                            </article>
                                        );

                                    }
                                )
                            }

                        </div>


                        {
                            trackedIndoorPlants.length >
                            0 && (

                                <div className="indoor-care-note">

                                    <strong>
                                        📅 Indoor care reminders connected
                                    </strong>


                                    <p>
                                        Tracked indoor plants now feed moisture checks, plant rotation, light checks, and repot assessments into the Calendar.
                                    </p>

                                </div>

                            )
                        }

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
                GROWTH STAGES
            ========================= */}

            {
                outdoorGardenPlants.length >
                0 && (

                    <section className="designer-card plant-growth-section">

                        <div className="designer-section-heading">

                            <span className="plant-growth-heading-icon">
                                <Icon
                                    name="sprout"
                                    size={18}
                                />
                            </span>


                            <div>

                                <h2>
                                    Growth Stages
                                </h2>


                                <p>
                                    Track where each crop is
                                    in its lifecycle. Estimates
                                    update automatically from
                                    planting dates and maturity.
                                </p>

                            </div>

                        </div>


                        <div className="plant-growth-list">

                            {
                                outdoorGardenPlants.map(
                                    (plant) => {

                                        const growthStage =
                                            getPlantGrowthStage(
                                                plant
                                            );


                                        const stageOptions =
                                            getAvailableGrowthStages(
                                                plant
                                            );


                                        return (

                                            <article
                                                key={
                                                    plant.plantKey
                                                }
                                                className="plant-growth-card"
                                            >

                                                <div className="plant-growth-card-header">

                                                    <span className="plant-growth-crop-icon">
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
                                                                growthStage.source ===
                                                                "manual"
                                                                    ? "Manual stage"
                                                                    : "Automatic estimate"
                                                            }
                                                        </small>

                                                    </div>


                                                    <span className="plant-growth-stage-badge">
                                                        <Icon
                                                            name={
                                                                growthStage.icon
                                                            }
                                                            size={14}
                                                        />

                                                        {
                                                            growthStage.label
                                                        }
                                                    </span>

                                                </div>


                                                {
                                                    growthStage.progress !==
                                                    null &&
                                                    growthStage.progress !==
                                                    undefined && (

                                                        <div className="plant-growth-progress-wrap">

                                                            <div className="plant-growth-progress-label">

                                                                <span>
                                                                    Estimated maturity progress
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        growthStage.progress
                                                                    }%
                                                                </strong>

                                                            </div>


                                                            <div className="plant-growth-progress-bar">

                                                                <div
                                                                    className="plant-growth-progress-fill"
                                                                    style={{
                                                                        width:
                                                                            `${growthStage.progress}%`
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    )
                                                }


                                                <p className="plant-growth-next-step">
                                                    {
                                                        growthStage.nextLabel
                                                    }
                                                </p>


                                                <div className="plant-growth-controls">

                                                    <label>

                                                        <span>
                                                            Stage
                                                        </span>

                                                        <select
                                                            value={
                                                                plant.growthStageOverride ||
                                                                "automatic"
                                                            }
                                                            onChange={
                                                                (event) =>
                                                                    onUpdateGrowthStage?.({
                                                                        plantKey:
                                                                            plant.plantKey,
                                                                        stage:
                                                                            event.target.value ===
                                                                            "automatic"
                                                                                ? null
                                                                                : event.target.value
                                                                    })
                                                            }
                                                        >

                                                            <option value="automatic">
                                                                Automatic
                                                            </option>

                                                            {
                                                                stageOptions.map(
                                                                    (stage) => (

                                                                        <option
                                                                            key={
                                                                                stage.id
                                                                            }
                                                                            value={
                                                                                stage.id
                                                                            }
                                                                        >
                                                                            {
                                                                                stage.label
                                                                            }
                                                                        </option>

                                                                    )
                                                                )
                                                            }

                                                        </select>

                                                    </label>


                                                    {
                                                        plant.growthStageOverride && (

                                                            <button
                                                                type="button"
                                                                className="plant-growth-auto-button"
                                                                onClick={() =>
                                                                    onUpdateGrowthStage?.({
                                                                        plantKey:
                                                                            plant.plantKey,
                                                                        stage:
                                                                            null
                                                                    })
                                                                }
                                                            >
                                                                Use Automatic
                                                            </button>

                                                        )
                                                    }

                                                </div>


                                                <PlantHarvestTracker
                                                    plant={
                                                        plant
                                                    }
                                                    growthStage={
                                                        growthStage
                                                    }
                                                    onRecordHarvest={
                                                        onRecordHarvest
                                                    }
                                                />

                                            </article>

                                        );

                                    }
                                )
                            }

                        </div>


                        <div className="plant-growth-note">

                            <Icon
                                name="leaf"
                                size={16}
                            />

                            <p>
                                Growth stages are estimates.
                                Weather, variety, soil, light,
                                and local conditions can shift
                                actual development, so you can
                                correct any stage manually.
                            </p>

                        </div>

                    </section>

                )
            }


            {/* =========================
                PLANT START SETUP
            ========================= */}

            {
                outdoorGardenPlants.length >
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
                                outdoorGardenPlants.map(
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