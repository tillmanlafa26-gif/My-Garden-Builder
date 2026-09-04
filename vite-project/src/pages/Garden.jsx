import {
    Link
} from "react-router";


import BottomNav
    from "../components/BottomNav";


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


import SeasonalPlantingGuide
    from "../components/SeasonalPlantingGuide";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


import {
    cropPlanningData
} from "../data/cropPlanningData";


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
    gardenProfile
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


    /* =====================================================
       COMPLETION
    ===================================================== */

    const designReady =
        Boolean(
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
                    🪴 My Garden Plan
                </h1>


                <p>
                    Your design, planting plan,
                    materials, and instructions.
                </p>

            </header>


            {/* =================================================
                STATUS
            ================================================= */}

            <section
                className={
                    gardenReady
                        ? "garden-plan-status ready"
                        : "garden-plan-status incomplete"
                }
            >

                <span>

                    {
                        gardenReady
                            ? "✓"
                            : "🌱"
                    }

                </span>


                <div>

                    <strong>

                        {
                            gardenReady
                                ? "Garden Plan Complete"
                                : "Garden Plan In Progress"
                        }

                    </strong>


                    <p>

                        {
                            gardenReady
                                ? "Your saved design and build instructions are ready."
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
                            ? "Edit"
                            : "Continue"
                    }

                </Link>

            </section>


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
                            Garden Overview
                        </h2>


                        <p>

                            {
                                selectedDesignGoal?.name ||
                                "Garden Design"
                            }

                            {
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
                            🌡️
                        </span>


                        <strong>
                            Growing Zone
                        </strong>


                        <small>

                            {
                                gardenProfile
                                    .hardinessZone
                                    ? `Zone ${gardenProfile.hardinessZone}`
                                    : "Not set"
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
                            Planned Crops
                        </h2>


                        <p>

                            {
                                selectedCropData.length
                            }

                            {
                                selectedCropData.length ===
                                1
                                    ? " crop"
                                    : " crops"
                            }

                            {" included in this design."}

                        </p>

                    </div>

                </div>


                {
                    selectedCropData.length > 0
                        ? (

                            <div className="garden-plan-crop-grid">

                                {
                                    selectedCropData.map(
                                        (crop) => (

                                            <div
                                                key={
                                                    crop.id
                                                }

                                                className="garden-plan-crop"
                                            >

                                                <span>
                                                    {
                                                        crop.icon
                                                    }
                                                </span>


                                                <div>

                                                    <strong>
                                                        {
                                                            crop.name
                                                        }
                                                    </strong>


                                                    <small>

                                                        {
                                                            crop.seasonType ===
                                                            "warm"
                                                                ? "Warm season"
                                                                : "Cool season"
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
                                No crops selected yet.
                            </p>

                        )
                }

            </section>


            {/* =================================================
                DESIGN STATS
            ================================================= */}

            {
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
                LAYOUT
            ================================================= */}

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
                bedPlantingPlan && (

                    <GardenBedPlantingMap

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
                materialPlan && (

                    <GardenMaterials

                        materialPlan={
                            materialPlan
                        }

                    />

                )
            }


            {/* =================================================
                BUILD PLAN
            ================================================= */}

            {
                buildPlan && (

                    <GardenBuildPlan

                        buildPlan={
                            buildPlan
                        }

                    />

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
                                Your Garden Is Ready to Build
                            </strong>


                            <p>
                                Use this page as your
                                reference while preparing
                                the space and building
                                the garden.
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