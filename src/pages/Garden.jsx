import {
    Link
} from "react-router";


import BottomNav
    from "../components/BottomNav";


import Icon
    from "../components/Icon";


import GardenLayoutPreview
    from "../components/GardenLayoutPreview";


import GardenMaterials
    from "../components/GardenMaterials";


import GardenBuildPlan
    from "../components/GardenBuildPlan";


import GardenPlantingPlan
    from "../components/GardenPlantingPlan";


import GardenBedPlantingMap
    from "../components/GardenBedPlantingMap";


import PlantPairingGuide
    from "../components/PlantPairingGuide";


import SeasonalPlantingGuide
    from "../components/SeasonalPlantingGuide";


import IndoorLayoutPreview
    from "../components/IndoorLayoutPreview";


import IndoorMaterials
    from "../components/IndoorMaterials";


import IndoorSetupPlan
    from "../components/IndoorSetupPlan";


import GardenPhotoPlanPreview
    from "../components/GardenPhotoPlanPreview";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


import {
    cropPlanningData
} from "../data/cropPlanningData";


import {
    indoorPlantData
} from "../data/indoorPlantData";


import {
    supplies
} from "../data/supplies";


/* =========================================================
   SPACE TYPES
========================================================= */

const spaceTypes = [
    {
        id: "backyard",
        name: "Backyard",
        icon: "🏡"
    },
    {
        id: "patio",
        name: "Patio",
        icon: "🧱"
    },
    {
        id: "balcony",
        name: "Balcony",
        icon: "🏢"
    },
    {
        id: "indoor",
        name: "Indoor",
        icon: "🏠"
    },
    {
        id: "other",
        name: "Garden Space",
        icon: "📐"
    }
];


/* =========================================================
   SURFACE TYPES
========================================================= */

const surfaceTypes = [
    {
        id: "grass",
        name: "Grass",
        icon: "🌱"
    },
    {
        id: "soil",
        name: "Bare Soil",
        icon: "🟫"
    },
    {
        id: "concrete",
        name: "Concrete",
        icon: "⬜"
    },
    {
        id: "deck",
        name: "Deck",
        icon: "🪵"
    },
    {
        id: "indoor-floor",
        name: "Indoor Floor",
        icon: "🏠"
    },
    {
        id: "other",
        name: "Other",
        icon: "📍"
    }
];


/* =========================================================
   DESIGN GOALS
========================================================= */

const designGoals = [
    {
        id: "balanced",
        name: "Balanced Garden",
        icon: "🌿"
    },
    {
        id: "maximum-growing",
        name: "Maximum Growing",
        icon: "🌽"
    },
    {
        id: "easy-access",
        name: "Easy Access",
        icon: "🚶"
    },
    {
        id: "simple-build",
        name: "Simple Build",
        icon: "🔨"
    }
];


/* =========================================================
   GARDEN FEATURES
========================================================= */

const gardenFeatures = [
    {
        id: "raised-beds",
        name: "Raised Beds",
        icon: "🥕"
    },
    {
        id: "containers",
        name: "Containers",
        icon: "🪴"
    },
    {
        id: "vertical-growing",
        name: "Vertical Growing",
        icon: "🌿"
    },
    {
        id: "trellis",
        name: "Trellis",
        icon: "🫘"
    },
    {
        id: "compost",
        name: "Compost Area",
        icon: "♻️"
    },
    {
        id: "irrigation",
        name: "Irrigation",
        icon: "💧"
    },
    {
        id: "hydroponics",
        name: "Hydroponics",
        icon: "🧪"
    }
];


/* =========================================================
   GARDEN PAGE
========================================================= */

function Garden({
    gardenProfile,
    onSaveGardenProfile,
    onActivateGarden,
    ownedSupplies = [],
    onOpenSupplies
}) {


    const designSpace =
        gardenProfile?.designSpace ||
        null;


    /* =====================================================
       NO GARDEN YET
    ===================================================== */

    if (
        !gardenProfile ||
        !designSpace
    ) {

        return (

            <div className="app-container">


                <header className="app-header">

                    <h1>
                        🪴 My Garden
                    </h1>


                    <p>
                        Your completed garden
                        plan will live here.
                    </p>

                </header>


                <section className="garden-plan-empty">

                    <span className="garden-plan-empty-icon">
                        🌱
                    </span>


                    <h2>
                        No Garden Plan Yet
                    </h2>


                    <p>
                        Use the guided Garden Builder
                        on Home to design your space,
                        choose crops, and generate
                        your build plan.
                    </p>


                    <Link
                        to="/"

                        className="garden-plan-primary-link"
                    >

                        Start Building My Garden →

                    </Link>

                </section>


                <BottomNav />


            </div>

        );

    }


    /* =====================================================
       SAVED DATA
    ===================================================== */

    const layout =
        designSpace.layout ||
        null;


    const isIndoorSpace =
        designSpace.spaceType ===
        "indoor";


    const indoorLayout =
        designSpace.indoorLayout ||
        null;


    const plantingPlan =
        designSpace.plantingPlan ||
        null;


    const bedPlantingPlan =
        designSpace.bedPlantingPlan ||
        null;


    const seasonalGuide =
        designSpace.seasonalGuide ||
        null;


    const materialPlan =
        designSpace.materials ||
        null;


    const buildPlan =
        designSpace.buildPlan ||
        null;


    const selectedFeatures =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : [];


    const selectedCrops =
        Array.isArray(
            designSpace.growGoals
        )
            ? designSpace.growGoals
            : [];


    const selectedIndoorPlants =
        Array.isArray(
            designSpace.indoorPlantGoals
        )
            ? designSpace.indoorPlantGoals
            : [];


    const selectedGarden =
        gardenProfile.type
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    const selectedSpace =
        spaceTypes.find(
            (space) =>
                space.id ===
                designSpace.spaceType
        );


    const selectedSurface =
        surfaceTypes.find(
            (surface) =>
                surface.id ===
                designSpace.surface
        );


    const selectedDesignGoal =
        designGoals.find(
            (goal) =>
                goal.id ===
                designSpace.designGoal
        );


    const selectedFeatureData =
        selectedFeatures
            .map(
                (featureId) =>
                    gardenFeatures.find(
                        (feature) =>
                            feature.id ===
                            featureId
                    )
            )
            .filter(
                Boolean
            );


    const selectedCropData =
        selectedCrops
            .map(
                (cropId) =>
                    cropPlanningData.find(
                        (crop) =>
                            crop.id ===
                            cropId
                    )
            )
            .filter(
                Boolean
            );


    const selectedIndoorPlantData =
        selectedIndoorPlants
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


    /* =====================================================
       COMPLETION
    ===================================================== */

    const designReady =
        isIndoorSpace
            ? Boolean(
                indoorLayout
            )
            : Boolean(
                layout
            );


    const buildReady =
        Boolean(
            materialPlan
        ) &&
        Boolean(
            buildPlan
        );


    const gardenReady =
        designReady &&
        buildReady;


    const gardenActive =
        gardenReady &&
        Boolean(
            designSpace.isActive
        );


    const recommendedSupplies =
        gardenProfile?.type
            ? supplies.filter(
                (supply) =>
                    supply.gardenTypes.includes(
                        gardenProfile.type
                    )
            )
            : [];


    const ownedSupplyCount =
        recommendedSupplies.filter(
            (supply) =>
                ownedSupplies.includes(
                    supply.id
                )
        ).length;


    const supplyProgressPercent =
        recommendedSupplies.length > 0
            ? Math.round(
                (
                    ownedSupplyCount /
                    recommendedSupplies.length
                ) * 100
            )
            : 0;


    const activatedAt =
        designSpace.activatedAt ||
        null;


    function activateGarden() {

        if (
            !gardenReady
        ) {
            return;
        }


        if (
            typeof onActivateGarden ===
            "function"
        ) {
            onActivateGarden(
                gardenProfile
            );

            return;
        }


        if (
            typeof onSaveGardenProfile !==
            "function"
        ) {
            return;
        }


        onSaveGardenProfile({

            ...gardenProfile,

            designSpace: {

                ...designSpace,

                isActive:
                    true,

                activatedAt:
                    new Date()
                        .toISOString()

            }

        });

    }


    function formatActivationDate(
        value
    ) {

        if (
            !value
        ) {

            return "";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date
            .toLocaleDateString(
                undefined,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }


    /* =====================================================
       STATS
    ===================================================== */

    const areaSquareFeet =
        Number(
            designSpace.areaSquareFeet ||
            0
        );


    const raisedBedCount =
        Number(
            layout
                ?.stats
                ?.raisedBedCount ||
            0
        );


    const plannedPlants =
        Number(
            bedPlantingPlan
                ?.stats
                ?.totalPlants ||
            0
        );


    const bedUtilization =
        Number(
            bedPlantingPlan
                ?.stats
                ?.utilization ||
            0
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="app-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="app-header">

                <h1>
                    {
                        isIndoorSpace
                            ? "🏠 My Indoor Garden Plan"
                            : "🪴 My Garden Plan"
                    }
                </h1>


                <p>
                    {
                        isIndoorSpace
                            ? "Your indoor plant layout, materials, lighting, and setup instructions."
                            : "Your design, planting plan, materials, and instructions."
                    }
                </p>

            </header>


            {/* =================================================
                STATUS
            ================================================= */}

            <section
                className={
                    gardenActive
                        ? "garden-plan-status active"
                        : gardenReady
                            ? "garden-plan-status ready"
                            : "garden-plan-status incomplete"
                }
            >

                <span>

                    {
                        gardenActive
                            ? (
                                <Icon
                                    name="check"
                                    size={20}
                                />
                            )
                            : gardenReady
                                ? "✓"
                                : "🌱"
                    }

                </span>


                <div>

                    <strong>

                        {
                            gardenActive
                                ? (
                                    isIndoorSpace
                                        ? "Indoor Garden Active"
                                        : "Garden Active"
                                )
                                : gardenReady
                                    ? (
                                        isIndoorSpace
                                            ? "Indoor Garden Plan Ready"
                                            : "Garden Plan Ready"
                                    )
                                    : "Garden Plan In Progress"
                        }

                    </strong>


                    <p>

                        {
                            gardenActive
                                ? (
                                    isIndoorSpace
                                        ? "Indoor care tracking is active. Use Plants, Calendar, and Journal to manage watering checks, light, rotation, repotting, and observations."
                                        : "Your plan is active. Use Plants, Calendar, and Journal to manage the garden as you grow."
                                )
                                : gardenReady
                                    ? (
                                        isIndoorSpace
                                            ? "Your indoor layout, materials, grow-light guidance, and setup instructions are complete."
                                            : "Your design and build plan are complete. Activate the garden when you are ready to start growing."
                                    )
                                    : "Return to Home to finish the remaining Garden Builder steps."
                        }

                    </p>

                </div>


                <Link
                    to="/"
                    className="garden-plan-status-link"
                >

                    {
                        gardenReady
                            ? "Edit Plan"
                            : "Continue"
                    }

                </Link>

            </section>


            {/* =================================================
                ACTIVATE GARDEN
            ================================================= */}

            {
                gardenReady &&
                !gardenActive && (

                    <section className="garden-activation-card">

                        <div className="garden-activation-heading">

                            <span className="garden-activation-icon">
                                {
                                    isIndoorSpace
                                        ? "🏠"
                                        : (
                                            <Icon
                                                name="sprout"
                                                size={24}
                                            />
                                        )
                                }
                            </span>


                            <div>

                                <h2>
                                    {
                                        isIndoorSpace
                                            ? "Ready to Start Indoor Care?"
                                            : "Ready to Start Growing?"
                                    }
                                </h2>


                                <p>
                                    {
                                        isIndoorSpace
                                            ? "Activate this indoor plan to automatically start care tracking for the plants you selected. Moisture checks, light checks, rotation, and repot assessments will begin appearing in Plants and Calendar."
                                            : "Activate this plan to make it your working garden. Your planting schedule will stay on the Calendar, and you can begin adding the plants you actually sow or transplant."
                                    }
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="garden-activate-button"
                            onClick={activateGarden}
                        >

                            <Icon
                                name="sprout"
                                size={18}
                            />

                            {
                                isIndoorSpace
                                    ? "Start Indoor Care"
                                    : "Activate My Garden"
                            }

                        </button>


                        <small className="garden-activation-note">
                            {
                                isIndoorSpace
                                    ? "Your selected indoor plants will be added to My Plants automatically. You can stop tracking any plant individually later."
                                    : "Activating the plan does not automatically mark every crop as planted. Add a crop to My Plants when you actually start it so watering and harvest tracking remain accurate."
                            }
                        </small>

                    </section>

                )
            }


            {
                gardenActive && (

                    <section className="garden-activation-card active">

                        <div className="garden-activation-heading">

                            <span className="garden-activation-icon active">
                                <Icon
                                    name="check"
                                    size={22}
                                />
                            </span>


                            <div>

                                <h2>
                                    {
                                        isIndoorSpace
                                            ? "Your Indoor Garden Is Active"
                                            : "Your Garden Is Active"
                                    }
                                </h2>


                                <p>
                                    {
                                        isIndoorSpace
                                            ? "Your selected indoor plants are now enrolled in care tracking. Use Plants for care actions, Calendar for reminders, and Journal for observations."
                                            : "Move from planning into day-to-day growing. Add plants when they are started, follow your local planting calendar, and record progress in the journal."
                                    }
                                </p>

                            </div>


                            <span className="garden-active-badge">
                                Active
                            </span>

                        </div>


                        <div className="garden-active-actions">

                            <Link
                                to="/plants"
                                className="garden-active-action"
                            >

                                <Icon
                                    name="leaf"
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        {
                                            isIndoorSpace
                                                ? "Plant Care"
                                                : "Add Plants"
                                        }
                                    </strong>

                                    <small>
                                        {
                                            isIndoorSpace
                                                ? "Manage tracked indoor plants"
                                                : "Track what you actually plant"
                                        }
                                    </small>
                                </span>

                            </Link>


                            <Link
                                to="/calendar"
                                className="garden-active-action"
                            >

                                <Icon
                                    name="calendar"
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        {
                                            isIndoorSpace
                                                ? "Care Calendar"
                                                : "Calendar"
                                        }
                                    </strong>

                                    <small>
                                        {
                                            isIndoorSpace
                                                ? "Follow watering and care reminders"
                                                : "Follow planting and harvest dates"
                                        }
                                    </small>
                                </span>

                            </Link>


                            <Link
                                to="/journal"
                                className="garden-active-action"
                            >

                                <Icon
                                    name="journal"
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        Journal
                                    </strong>

                                    <small>
                                        {
                                            isIndoorSpace
                                                ? "Record plant health and observations"
                                                : "Record growth and observations"
                                        }
                                    </small>
                                </span>

                            </Link>

                        </div>


                        {
                            formatActivationDate(
                                activatedAt
                            ) && (

                                <small className="garden-activation-note">
                                    Activated {
                                        formatActivationDate(
                                            activatedAt
                                        )
                                    }
                                </small>

                            )
                        }

                    </section>

                )
            }


            {/* =================================================
                MY SUPPLIES
                Appears only after Steps 1-6 are complete.
            ================================================= */}

            {
                gardenReady && (

                    <section className="garden-supplies-card">

                        <div className="garden-supplies-card-heading">

                            <span className="garden-supplies-card-icon">
                                <Icon
                                    name="toolbox"
                                    size={22}
                                />
                            </span>


                            <div>

                                <h2>
                                    My Supplies
                                </h2>


                                <p>
                                    Your garden setup is complete. Use this checklist to track the supplies you have before you start building and planting.
                                </p>

                            </div>

                        </div>


                        <div className="garden-supplies-progress-row">

                            <div>

                                <strong>
                                    Setup Checklist
                                </strong>


                                <small>
                                    {
                                        recommendedSupplies.length > 0
                                            ? `${ownedSupplyCount} of ${recommendedSupplies.length} supplies ready`
                                            : "Open your checklist to review supplies"
                                    }
                                </small>

                            </div>


                            <span>
                                {
                                    recommendedSupplies.length > 0
                                        ? `${supplyProgressPercent}%`
                                        : "Ready"
                                }
                            </span>

                        </div>


                        {
                            recommendedSupplies.length > 0 && (

                                <div
                                    className="garden-supplies-progress-bar"
                                    aria-label={
                                        `Supply checklist ${supplyProgressPercent}% complete`
                                    }
                                >

                                    <div
                                        className="garden-supplies-progress-fill"
                                        style={{
                                            width:
                                                `${supplyProgressPercent}%`
                                        }}
                                    />

                                </div>

                            )
                        }


                        <button
                            type="button"
                            className="garden-supplies-open-button"
                            onClick={onOpenSupplies}
                            disabled={
                                typeof onOpenSupplies !==
                                "function"
                            }
                        >

                            <Icon
                                name="toolbox"
                                size={18}
                            />

                            {
                                ownedSupplyCount > 0
                                    ? "Open My Supplies"
                                    : "View My Supplies"
                            }

                        </button>

                    </section>

                )
            }


            {/* =================================================
                FOUNDATION
            ================================================= */}

            <section className="garden-plan-overview">


                <div className="garden-plan-overview-title">

                    <span>

                        {
                            selectedDesignGoal?.icon ||
                            "🌿"
                        }

                    </span>


                    <div>

                        <h2>
                            {
                                isIndoorSpace
                                    ? "Indoor Garden Overview"
                                    : "Garden Overview"
                            }
                        </h2>


                        <p>

                            {
                                isIndoorSpace
                                    ? (
                                        indoorLayout?.indoorSpaceName ||
                                        "Indoor Plant Space"
                                    )
                                    : (
                                        selectedDesignGoal?.name ||
                                        "Garden Design"
                                    )
                            }

                            {
                                !isIndoorSpace &&
                                selectedGarden?.name
                                    ? ` • ${selectedGarden.name}`
                                    : ""
                            }

                        </p>

                    </div>

                </div>


                <div className="garden-plan-overview-grid">


                    <div>

                        <span>
                            📐
                        </span>


                        <strong>
                            Space
                        </strong>


                        <small>

                            {
                                designSpace.width
                            }

                            {" × "}

                            {
                                designSpace.length
                            }

                            {
                                isIndoorSpace
                                    ? ` × ${designSpace.height}`
                                    : ""
                            }

                            {" "}

                            {
                                designSpace.unit ||
                                "ft"
                            }

                        </small>

                    </div>


                    <div>

                        <span>
                            📏
                        </span>


                        <strong>
                            Area
                        </strong>


                        <small>

                            {
                                areaSquareFeet
                                    .toFixed(
                                        0
                                    )
                            }

                            {" sq ft"}

                        </small>

                    </div>


                    <div>

                        <span>
                            ☀️
                        </span>


                        <strong>
                            Sunlight
                        </strong>


                        <small>

                            {
                                sunlightNames[
                                    gardenProfile.sunlight
                                ] ||
                                "Not set"
                            }

                        </small>

                    </div>


                    <div>

                        <span>
                            {
                                isIndoorSpace
                                    ? "💡"
                                    : "🌡️"
                            }
                        </span>


                        <strong>
                            {
                                isIndoorSpace
                                    ? "Light Zones"
                                    : "Growing Zone"
                            }
                        </strong>


                        <small>

                            {
                                isIndoorSpace
                                    ? `${indoorLayout?.stats?.growLightZoneCount || 0} supplemental`
                                    : (
                                        gardenProfile
                                            .hardinessZone
                                            ? `Zone ${gardenProfile.hardinessZone}`
                                            : "Not set"
                                    )
                            }

                        </small>

                    </div>


                    <div>

                        <span>

                            {
                                selectedSpace?.icon ||
                                "📐"
                            }

                        </span>


                        <strong>
                            Location Type
                        </strong>


                        <small>

                            {
                                selectedSpace?.name ||
                                "Garden Space"
                            }

                        </small>

                    </div>


                    <div>

                        <span>

                            {
                                selectedSurface?.icon ||
                                "📍"
                            }

                        </span>


                        <strong>
                            Surface
                        </strong>


                        <small>

                            {
                                selectedSurface?.name ||
                                "Not set"
                            }

                        </small>

                    </div>

                </div>


                {
                    !isIndoorSpace &&
                    designSpace.location && (

                        <div className="garden-plan-location-status">

                            <span>
                                📍
                            </span>


                            <div>

                                <strong>
                                    Garden Location Saved
                                </strong>


                                <small>
                                    Location data is attached
                                    to this garden plan.
                                </small>

                            </div>

                        </div>

                    )
                }

            </section>


            {/* =================================================
                FEATURES
            ================================================= */}

            <section className="garden-plan-section">

                <div className="garden-plan-section-heading">

                    <span>
                        🧰
                    </span>


                    <div>

                        <h2>
                            Garden Features
                        </h2>


                        <p>
                            Structures and systems
                            included in your design.
                        </p>

                    </div>

                </div>


                {
                    selectedFeatureData.length > 0
                        ? (

                            <div className="garden-plan-chip-list">

                                {
                                    selectedFeatureData.map(
                                        (feature) => (

                                            <span
                                                key={
                                                    feature.id
                                                }
                                            >

                                                {
                                                    feature.icon
                                                }

                                                {" "}

                                                {
                                                    feature.name
                                                }

                                            </span>

                                        )
                                    )
                                }

                            </div>

                        )
                        : (

                            <p className="garden-plan-muted">
                                No additional garden
                                structures selected.
                            </p>

                        )
                }

            </section>


            {/* =================================================
                CROPS
            ================================================= */}

            <section className="garden-plan-section">

                <div className="garden-plan-section-heading">

                    <span>
                        🥕
                    </span>


                    <div>

                        <h2>
                            {
                                isIndoorSpace
                                    ? "Selected Indoor Plants"
                                    : "Planned Crops"
                            }
                        </h2>


                        <p>

                            {
                                isIndoorSpace
                                    ? selectedIndoorPlantData.length
                                    : selectedCropData.length
                            }

                            {
                                (
                                    isIndoorSpace
                                        ? selectedIndoorPlantData.length
                                        : selectedCropData.length
                                ) ===
                                1
                                    ? (
                                        isIndoorSpace
                                            ? " plant"
                                            : " crop"
                                    )
                                    : (
                                        isIndoorSpace
                                            ? " plants"
                                            : " crops"
                                    )
                            }

                            {" included in this design."}

                        </p>

                    </div>

                </div>


                {
                    (
                        isIndoorSpace
                            ? selectedIndoorPlantData
                            : selectedCropData
                    ).length > 0
                        ? (

                            <div className="garden-plan-crop-grid">

                                {
                                    (
                                        isIndoorSpace
                                            ? selectedIndoorPlantData
                                            : selectedCropData
                                    ).map(
                                        (plant) => (

                                            <div
                                                key={
                                                    plant.id
                                                }
                                                className="garden-plan-crop"
                                            >

                                                <span>
                                                    {
                                                        plant.icon
                                                    }
                                                </span>


                                                <div>

                                                    <strong>
                                                        {
                                                            plant.name
                                                        }
                                                    </strong>


                                                    <small>
                                                        {
                                                            isIndoorSpace
                                                                ? (
                                                                    plant.lightLabel ||
                                                                    "Indoor plant"
                                                                )
                                                                : (
                                                                    plant.seasonType ===
                                                                    "warm"
                                                                        ? "Warm season"
                                                                        : "Cool season"
                                                                )
                                                        }
                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )
                        : (

                            <p className="garden-plan-muted">
                                {
                                    isIndoorSpace
                                        ? "No indoor plants selected yet."
                                        : "No crops selected yet."
                                }
                            </p>

                        )
                }

            </section>


            {/* =================================================
                DESIGN STATS
            ================================================= */}

            {
                isIndoorSpace &&
                indoorLayout && (

                    <section className="garden-plan-section">

                        <div className="garden-plan-section-heading">

                            <span>
                                📊
                            </span>


                            <div>

                                <h2>
                                    Indoor Design Summary
                                </h2>


                                <p>
                                    Key numbers from the generated indoor layout.
                                </p>

                            </div>

                        </div>


                        <div className="garden-plan-stat-grid">

                            <div>

                                <strong>
                                    {
                                        indoorLayout.stats
                                            ?.placedPlantCount ||
                                        0
                                    }
                                </strong>


                                <small>
                                    Plants Placed
                                </small>

                            </div>


                            <div>

                                <strong>
                                    {
                                        indoorLayout.stats
                                            ?.levelCount ||
                                        1
                                    }
                                </strong>


                                <small>
                                    Levels / Zones
                                </small>

                            </div>


                            <div>

                                <strong>
                                    {
                                        indoorLayout.stats
                                            ?.growLightZoneCount ||
                                        0
                                    }
                                </strong>


                                <small>
                                    Grow Lights
                                </small>

                            </div>


                            <div>

                                <strong>
                                    {
                                        indoorLayout.stats
                                            ?.estimatedSurfaceUsePercent ||
                                        0
                                    }

                                    %
                                </strong>


                                <small>
                                    Surface Use
                                </small>

                            </div>

                        </div>

                    </section>

                )
            }


            {
                !isIndoorSpace &&
                layout && (

                    <section className="garden-plan-section">

                        <div className="garden-plan-section-heading">

                            <span>
                                📊
                            </span>


                            <div>

                                <h2>
                                    Design Summary
                                </h2>


                                <p>
                                    Key numbers from
                                    your generated layout.
                                </p>

                            </div>

                        </div>


                        <div className="garden-plan-stat-grid">


                            <div>

                                <strong>
                                    {
                                        raisedBedCount
                                    }
                                </strong>


                                <small>
                                    Raised Beds
                                </small>

                            </div>


                            <div>

                                <strong>
                                    {
                                        selectedCropData.length
                                    }
                                </strong>


                                <small>
                                    Crops
                                </small>

                            </div>


                            <div>

                                <strong>
                                    {
                                        plannedPlants
                                    }
                                </strong>


                                <small>
                                    Planned Plants
                                </small>

                            </div>


                            <div>

                                <strong>

                                    {
                                        bedUtilization
                                    }

                                    %

                                </strong>


                                <small>
                                    Bed Use
                                </small>

                            </div>

                        </div>

                    </section>

                )
            }


            {/* =================================================
                PHOTO DESIGN PREVIEW
            ================================================= */}

            {
                designSpace.spacePhoto?.dataUrl &&
                designReady && (

                    <GardenPhotoPlanPreview
                        spacePhoto={
                            designSpace.spacePhoto
                        }
                        layout={
                            layout
                        }
                        indoorLayout={
                            indoorLayout
                        }
                        isIndoorSpace={
                            isIndoorSpace
                        }
                    />

                )
            }


            {/* =================================================
                LAYOUT
            ================================================= */}

            {
                isIndoorSpace &&
                indoorLayout && (

                    <IndoorLayoutPreview
                        indoorLayout={
                            indoorLayout
                        }
                    />

                )
            }


            {
                layout && (

                    <GardenLayoutPreview

                        layout={
                            layout
                        }

                        bedPlantingPlan={
                            bedPlantingPlan
                        }

                    />

                )
            }


            {/* =================================================
                PLANTING PLAN
            ================================================= */}

            {
                !isIndoorSpace &&
                plantingPlan && (

                    <GardenPlantingPlan

                        plantingPlan={
                            plantingPlan
                        }

                    />

                )
            }


            {/* =================================================
                BED MAP
            ================================================= */}

            {
                !isIndoorSpace &&
                bedPlantingPlan && (

                    <GardenBedPlantingMap

                        bedPlantingPlan={
                            bedPlantingPlan
                        }

                    />

                )
            }


            {/* =================================================
                PLANT PAIRING + BED LOAD
            ================================================= */}

            {
                !isIndoorSpace &&
                bedPlantingPlan
                    ?.pairingGuide && (

                    <PlantPairingGuide

                        bedPlantingPlan={
                            bedPlantingPlan
                        }

                    />

                )
            }


            {/* =================================================
                SEASONAL GUIDE
            ================================================= */}

            {
                !isIndoorSpace &&
                seasonalGuide && (

                    <SeasonalPlantingGuide

                        seasonalGuide={
                            seasonalGuide
                        }

                    />

                )
            }


            {/* =================================================
                MATERIALS
            ================================================= */}

            {
                materialPlan &&
                (
                    isIndoorSpace
                        ? (
                            <IndoorMaterials
                                materialPlan={
                                    materialPlan
                                }
                            />
                        )
                        : (
                            <GardenMaterials
                                materialPlan={
                                    materialPlan
                                }
                            />
                        )
                )
            }


            {/* =================================================
                BUILD PLAN
            ================================================= */}

            {
                buildPlan &&
                (
                    isIndoorSpace
                        ? (
                            <IndoorSetupPlan
                                setupPlan={
                                    buildPlan
                                }
                            />
                        )
                        : (
                            <GardenBuildPlan
                                buildPlan={
                                    buildPlan
                                }
                            />
                        )
                )
            }


            {/* =================================================
                INCOMPLETE BUILD CTA
            ================================================= */}

            {
                !gardenReady && (

                    <section className="garden-plan-incomplete">

                        <span>
                            🌱
                        </span>


                        <div>

                            <strong>
                                Finish Your Garden Plan
                            </strong>


                            <p>
                                Complete the remaining
                                steps on Home to unlock
                                your full layout, materials,
                                and build instructions.
                            </p>

                        </div>


                        <Link
                            to="/"

                            className="garden-plan-primary-link"
                        >

                            Continue Building →

                        </Link>

                    </section>

                )
            }


            {/* =================================================
                COMPLETE CTA
            ================================================= */}

            {
                gardenReady && (

                    <section className="garden-plan-complete">

                        <span>
                            ✅
                        </span>


                        <div>

                            <strong>
                                {
                                    isIndoorSpace
                                        ? "Your Indoor Garden Is Ready to Set Up"
                                        : "Your Garden Is Ready to Build"
                                }
                            </strong>


                            <p>
                                {
                                    isIndoorSpace
                                        ? "Use this page as your reference while arranging the space, preparing containers, installing lighting, and placing plants."
                                        : "Use this page as your reference while preparing the space and building the garden."
                                }
                            </p>

                        </div>


                        <Link
                            to="/"

                            className="garden-plan-secondary-link"
                        >

                            Edit Garden Setup

                        </Link>

                    </section>

                )
            }


            <BottomNav />


        </div>

    );

}


export default Garden;