import {
    useMemo,
    useState
} from "react";


import BottomNav
    from "../components/BottomNav";


import GardenLocationCard
    from "../components/GardenLocationCard";


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
    hardinessZones,
    hardinessTemperatureRanges
} from "../data/hardinessZones";


import {
    cropPlanningData
} from "../data/cropPlanningData";


import {
    generateGardenLayout
} from "../utils/gardenLayoutEngine";


import {
    calculateGardenMaterials
} from "../utils/materialsCalculator";


import {
    generateBuildPlan
} from "../utils/buildPlanGenerator";


import {
    generatePlantingPlan
} from "../utils/plantingPlanGenerator";


import {
    generateBedPlantingPlan
} from "../utils/bedPlantingPlanner";


import {
    generateSeasonalPlantingGuide
} from "../utils/seasonalPlantingPlanner";


/* =========================
   SPACE TYPES
========================= */

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
        name: "Other",
        icon: "📐"
    }
];


/* =========================
   SURFACE TYPES
========================= */

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


/* =========================
   BUILD FEATURES
========================= */

const buildFeatures = [
    {
        id: "raised-beds",
        name: "Raised Beds",
        icon: "🥕"
    },
    {
        id: "containers",
        name: "Containers",
        icon: "🌱"
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


/* =========================
   DESIGN GOALS
========================= */

const designGoals = [
    {
        id: "balanced",
        name: "Balanced Garden",
        icon: "🌿",
        description:
            "Balance growing space, access, and supporting garden features."
    },
    {
        id: "maximum-growing",
        name: "Maximum Growing Space",
        icon: "🌽",
        description:
            "Prioritize productive growing area and fit more beds when possible."
    },
    {
        id: "easy-access",
        name: "Easy Access",
        icon: "↔️",
        description:
            "Prioritize wider walkways and comfortable movement through the garden."
    },
    {
        id: "simple-build",
        name: "Simple Build",
        icon: "🧰",
        description:
            "Keep the design straightforward with fewer major structures."
    }
];


/* =========================
   CROP CATEGORIES
========================= */

const cropCategories = [
    {
        id: "all",
        name: "All",
        icon: "🌱"
    },
    {
        id: "fruiting",
        name: "Fruiting",
        icon: "🍅"
    },
    {
        id: "leafy",
        name: "Leafy Greens",
        icon: "🥬"
    },
    {
        id: "root",
        name: "Root Crops",
        icon: "🥕"
    },
    {
        id: "vining",
        name: "Vines & Legumes",
        icon: "🫛"
    },
    {
        id: "herb",
        name: "Herbs",
        icon: "🌿"
    }
];


/* =========================
   DEFAULT BUILD OPTIONS
========================= */

const defaultBuildOptions = {
    bedLength: 8,
    bedWidth: 4,
    bedHeight: 12,
    bedMaterial: "cedar",
    walkwayWidth: 3,
    soilStrategy: "balanced",
    maxRaisedBeds: null
};


/* =========================
   GARDEN SIZE
========================= */

function getGardenSizeFromArea(
    squareFeet
) {

    if (
        squareFeet <= 50
    ) {

        return "small";

    }


    if (
        squareFeet <= 150
    ) {

        return "medium";

    }


    return "large";

}


/* =========================
   GARDEN PAGE
========================= */

function Garden({
    gardenProfile,
    onSaveGardenProfile
}) {

    const savedSpace =
        gardenProfile?.designSpace ||
        {};


    const savedBuildOptions = {

        ...defaultBuildOptions,

        ...(
            savedSpace.buildOptions ||
            {}
        )

    };


    /* =========================
       DESIGN
    ========================= */

    const [
        designMode
    ] = useState(
        savedSpace.mode ||
        "dimensions"
    );


    const [
        designGoal,
        setDesignGoal
    ] = useState(
        savedSpace.designGoal ||
        "balanced"
    );


    /* =========================
       SPACE
    ========================= */

    const [
        spaceType,
        setSpaceType
    ] = useState(
        savedSpace.spaceType ||
        "backyard"
    );


    const [
        width,
        setWidth
    ] = useState(
        savedSpace.width
            ? String(
                savedSpace.width
            )
            : ""
    );


    const [
        length,
        setLength
    ] = useState(
        savedSpace.length
            ? String(
                savedSpace.length
            )
            : ""
    );


    const [
        unit,
        setUnit
    ] = useState(
        savedSpace.unit ||
        "ft"
    );


    const [
        surface,
        setSurface
    ] = useState(
        savedSpace.surface ||
        "grass"
    );


    /* =========================
       DEVICE LOCATION
    ========================= */

    const [
        gardenLocation,
        setGardenLocation
    ] = useState(
        savedSpace.location ||
        null
    );


    /* =========================
       GARDEN PROFILE
    ========================= */

    const [
        gardenType,
        setGardenType
    ] = useState(
        gardenProfile?.type ||
        ""
    );


    const [
        sunlight,
        setSunlight
    ] = useState(
        gardenProfile?.sunlight ||
        ""
    );


    const [
        hardinessZone,
        setHardinessZone
    ] = useState(
        gardenProfile?.hardinessZone ||
        ""
    );


    /* =========================
       FROST DATES
    ========================= */

    const [
        lastSpringFrost,
        setLastSpringFrost
    ] = useState(
        savedSpace.lastSpringFrost ||
        ""
    );


    const [
        firstFallFrost,
        setFirstFallFrost
    ] = useState(
        savedSpace.firstFallFrost ||
        ""
    );


    /* =========================
       FEATURES
    ========================= */

    const [
        selectedFeatures,
        setSelectedFeatures
    ] = useState(
        Array.isArray(
            savedSpace.features
        )
            ? savedSpace.features
            : []
    );


    /* =========================
       CROPS
    ========================= */

    const [
        selectedCrops,
        setSelectedCrops
    ] = useState(
        Array.isArray(
            savedSpace.growGoals
        )
            ? savedSpace.growGoals
            : []
    );


    const [
        cropSearch,
        setCropSearch
    ] = useState(
        ""
    );


    const [
        cropCategory,
        setCropCategory
    ] = useState(
        "all"
    );


    /* =========================
       RAISED BED OPTIONS
    ========================= */

    const [
        bedLength,
        setBedLength
    ] = useState(
        String(
            savedBuildOptions.bedLength
        )
    );


    const [
        bedWidth,
        setBedWidth
    ] = useState(
        String(
            savedBuildOptions.bedWidth
        )
    );


    const [
        bedHeight,
        setBedHeight
    ] = useState(
        String(
            savedBuildOptions.bedHeight
        )
    );


    const [
        bedMaterial,
        setBedMaterial
    ] = useState(
        savedBuildOptions.bedMaterial
    );


    const [
        walkwayWidth,
        setWalkwayWidth
    ] = useState(
        String(
            savedBuildOptions.walkwayWidth
        )
    );


    const [
        soilStrategy,
        setSoilStrategy
    ] = useState(
        savedBuildOptions.soilStrategy
    );


    const [
        bedCountLimit,
        setBedCountLimit
    ] = useState(
        savedBuildOptions.maxRaisedBeds
            ? String(
                savedBuildOptions.maxRaisedBeds
            )
            : "auto"
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    /* =========================
       MEASUREMENTS
    ========================= */

    const measurements =
        useMemo(
            () => {

                const numericWidth =
                    Number(
                        width
                    );


                const numericLength =
                    Number(
                        length
                    );


                if (
                    numericWidth <= 0 ||
                    numericLength <= 0
                ) {

                    return {

                        valid:
                            false,

                        nativeArea:
                            0,

                        squareFeet:
                            0

                    };

                }


                const nativeArea =
                    numericWidth *
                    numericLength;


                const squareFeet =
                    unit === "ft"
                        ? nativeArea
                        : nativeArea *
                          10.7639;


                return {

                    valid:
                        true,

                    nativeArea,

                    squareFeet

                };

            },
            [
                width,
                length,
                unit
            ]
        );


    /* =========================
       BUILD OPTIONS
    ========================= */

    const buildOptions =
        useMemo(
            () => ({

                bedLength:
                    Number(
                        bedLength
                    ) || 8,

                bedWidth:
                    Number(
                        bedWidth
                    ) || 4,

                bedHeight:
                    Number(
                        bedHeight
                    ) || 12,

                bedMaterial,

                walkwayWidth:
                    Number(
                        walkwayWidth
                    ) || 3,

                soilStrategy,

                maxRaisedBeds:
                    bedCountLimit ===
                    "auto"
                        ? null
                        : Number(
                            bedCountLimit
                        )

            }),
            [
                bedLength,
                bedWidth,
                bedHeight,
                bedMaterial,
                walkwayWidth,
                soilStrategy,
                bedCountLimit
            ]
        );


    /* =========================
       DESIGN INPUT
    ========================= */

    const designInput =
        useMemo(
            () => ({

                width:
                    Number(
                        width
                    ),

                length:
                    Number(
                        length
                    ),

                unit,

                features:
                    selectedFeatures,

                designGoal,

                buildOptions

            }),
            [
                width,
                length,
                unit,
                selectedFeatures,
                designGoal,
                buildOptions
            ]
        );


    /* =========================
       GENERATED LAYOUT
    ========================= */

    const generatedLayout =
        useMemo(
            () => {

                if (
                    !measurements.valid
                ) {

                    return null;

                }


                return generateGardenLayout(
                    designInput
                );

            },
            [
                measurements.valid,
                designInput
            ]
        );


    /* =========================
       MATERIAL PLAN
    ========================= */

    const materialPlan =
        useMemo(
            () => {

                if (
                    !generatedLayout
                ) {

                    return null;

                }


                return calculateGardenMaterials(
                    generatedLayout,
                    buildOptions
                );

            },
            [
                generatedLayout,
                buildOptions
            ]
        );


    /* =========================
       BUILD PLAN
    ========================= */

    const buildPlan =
        useMemo(
            () => {

                if (
                    !generatedLayout ||
                    !materialPlan
                ) {

                    return null;

                }


                return generateBuildPlan({

                    layout:
                        generatedLayout,

                    materialPlan,

                    buildOptions,

                    surface,

                    features:
                        selectedFeatures

                });

            },
            [
                generatedLayout,
                materialPlan,
                buildOptions,
                surface,
                selectedFeatures
            ]
        );


    /* =========================
       PLANTING PLAN
    ========================= */

    const plantingPlan =
        useMemo(
            () => {

                if (
                    !generatedLayout ||
                    selectedCrops.length === 0
                ) {

                    return null;

                }


                return generatePlantingPlan({

                    layout:
                        generatedLayout,

                    selectedCrops,

                    sunlight,

                    features:
                        selectedFeatures

                });

            },
            [
                generatedLayout,
                selectedCrops,
                sunlight,
                selectedFeatures
            ]
        );


    /* =========================
       BED PLANTING PLAN
    ========================= */

    const bedPlantingPlan =
        useMemo(
            () => {

                if (
                    !generatedLayout ||
                    !plantingPlan
                ) {

                    return null;

                }


                return generateBedPlantingPlan({

                    layout:
                        generatedLayout,

                    plantingPlan,

                    selectedCrops,

                    features:
                        selectedFeatures

                });

            },
            [
                generatedLayout,
                plantingPlan,
                selectedCrops,
                selectedFeatures
            ]
        );


    /* =========================
       SEASONAL GUIDE
    ========================= */

    const seasonalGuide =
        useMemo(
            () => {

                if (
                    selectedCrops.length === 0
                ) {

                    return null;

                }


                return generateSeasonalPlantingGuide({

                    selectedCrops,

                    lastSpringFrost,

                    firstFallFrost

                });

            },
            [
                selectedCrops,
                lastSpringFrost,
                firstFallFrost
            ]
        );


    /* =========================
       FILTER CROPS
    ========================= */

    const filteredCrops =
        useMemo(
            () => {

                const cleanSearch =
                    cropSearch
                        .trim()
                        .toLowerCase();


                return cropPlanningData.filter(
                    (crop) => {

                        const categoryMatches =
                            cropCategory ===
                            "all" ||
                            crop.placementGroup ===
                            cropCategory;


                        const searchMatches =
                            !cleanSearch ||
                            crop.name
                                .toLowerCase()
                                .includes(
                                    cleanSearch
                                ) ||
                            crop.id
                                .toLowerCase()
                                .includes(
                                    cleanSearch
                                );


                        return (
                            categoryMatches &&
                            searchMatches
                        );

                    }
                );

            },
            [
                cropSearch,
                cropCategory
            ]
        );


    /* =========================
       CROP CATEGORY COUNT
    ========================= */

    function getCropCategoryCount(
        categoryId
    ) {

        if (
            categoryId ===
            "all"
        ) {

            return cropPlanningData.length;

        }


        return cropPlanningData.filter(
            (crop) =>

                crop.placementGroup ===
                categoryId

        ).length;

    }


    /* =========================
       PROGRESS STAGES
    ========================= */

    const progressStages =
        useMemo(
            () => [

                {
                    id:
                        "garden-step-space",

                    name:
                        "Space",

                    icon:
                        "📐",

                    complete:
                        measurements.valid &&
                        Boolean(
                            spaceType
                        ) &&
                        Boolean(
                            surface
                        )
                },

                {
                    id:
                        "garden-step-environment",

                    name:
                        "Environment",

                    icon:
                        "☀️",

                    complete:
                        Boolean(
                            gardenType
                        ) &&
                        Boolean(
                            sunlight
                        ) &&
                        Boolean(
                            hardinessZone
                        )
                },

                {
                    id:
                        "garden-step-features",

                    name:
                        "Features",

                    icon:
                        "🧰",

                    complete:
                        selectedFeatures.length >
                        0
                },

                {
                    id:
                        "garden-step-crops",

                    name:
                        "Crops",

                    icon:
                        "🥕",

                    complete:
                        selectedCrops.length >
                        0
                },

                {
                    id:
                        "garden-step-design",

                    name:
                        "Design",

                    icon:
                        "🗺️",

                    complete:
                        Boolean(
                            generatedLayout
                        )
                },

                {
                    id:
                        "garden-step-build",

                    name:
                        "Build",

                    icon:
                        "🔨",

                    complete:
                        Boolean(
                            materialPlan
                        ) &&
                        Boolean(
                            buildPlan
                        )
                }

            ],
            [
                measurements.valid,
                spaceType,
                surface,
                gardenType,
                sunlight,
                hardinessZone,
                selectedFeatures,
                selectedCrops,
                generatedLayout,
                materialPlan,
                buildPlan
            ]
        );


    const completedStageCount =
        progressStages.filter(
            (stage) =>
                stage.complete
        ).length;


    const progressPercent =
        Math.round(
            (
                completedStageCount /
                progressStages.length
            ) *
            100
        );


    /* =========================
       SCROLL TO STAGE
    ========================= */

    function scrollToStage(
        stageId
    ) {

        const target =
            document.getElementById(
                stageId
            );


        if (
            !target
        ) {

            return;

        }


        target.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }


    /* =========================
       TOGGLE FEATURE
    ========================= */

    function toggleFeature(
        featureId
    ) {

        setSelectedFeatures(
            (current) =>
                current.includes(
                    featureId
                )
                    ? current.filter(
                        (id) =>
                            id !==
                            featureId
                    )
                    : [
                        ...current,
                        featureId
                    ]
        );

    }


    /* =========================
       TOGGLE CROP
    ========================= */

    function toggleCrop(
        cropId
    ) {

        setSelectedCrops(
            (current) =>
                current.includes(
                    cropId
                )
                    ? current.filter(
                        (id) =>
                            id !==
                            cropId
                    )
                    : [
                        ...current,
                        cropId
                    ]
        );

    }


    /* =========================
       SAVE
    ========================= */

    function handleSubmit(
        event
    ) {

        event.preventDefault();


        if (
            !measurements.valid
        ) {

            setMessage(
                "Enter a valid width and length."
            );

            scrollToStage(
                "garden-step-space"
            );

            return;

        }


        if (
            !gardenType
        ) {

            setMessage(
                "Choose a primary garden system."
            );

            scrollToStage(
                "garden-step-environment"
            );

            return;

        }


        if (
            !sunlight
        ) {

            setMessage(
                "Choose your sunlight level."
            );

            scrollToStage(
                "garden-step-environment"
            );

            return;

        }


        if (
            !hardinessZone
        ) {

            setMessage(
                "Choose your USDA growing zone."
            );

            scrollToStage(
                "garden-step-environment"
            );

            return;

        }


        if (
            selectedFeatures.length ===
            0
        ) {

            setMessage(
                "Choose at least one garden feature."
            );

            scrollToStage(
                "garden-step-features"
            );

            return;

        }


        const newProfile = {

            ...gardenProfile,

            type:
                gardenType,

            size:
                getGardenSizeFromArea(
                    measurements.squareFeet
                ),

            sunlight,

            hardinessZone,

            designSpace: {

                mode:
                    designMode,

                designGoal,

                spaceType,

                width:
                    Number(
                        width
                    ),

                length:
                    Number(
                        length
                    ),

                unit,

                surface,

                location:
                    gardenLocation,

                hardinessZone,

                lastSpringFrost,

                firstFallFrost,

                features:
                    selectedFeatures,

                growGoals:
                    selectedCrops,

                buildOptions,

                areaSquareFeet:
                    Number(
                        measurements
                            .squareFeet
                            .toFixed(
                                2
                            )
                    ),

                layout:
                    generatedLayout,

                materials:
                    materialPlan,

                buildPlan,

                plantingPlan,

                bedPlantingPlan,

                seasonalGuide

            }

        };


        onSaveGardenProfile(
            newProfile
        );


        setMessage(
            "✓ Garden project saved with location, layout, materials, planting guidance, and build instructions."
        );

    }


    /* =========================
       DISPLAY HELPERS
    ========================= */

    const selectedGarden =
        gardenType
            ? gardenPlans[
                gardenType
            ]
            : null;


    const selectedSurface =
        surfaceTypes.find(
            (item) =>
                item.id ===
                surface
        );


    const selectedSpace =
        spaceTypes.find(
            (item) =>
                item.id ===
                spaceType
        );


    const selectedDesignGoal =
        designGoals.find(
            (goal) =>
                goal.id ===
                designGoal
        );


    /* =========================
       RENDER
    ========================= */

    return (

        <div className="app-container">


            {/* =========================
                HEADER
            ========================= */}

            <header className="app-header">

                <h1>
                    🪴 Garden Designer
                </h1>

                <p>
                    Design it. Build it.
                    Grow it.
                </p>

            </header>


            {/* =========================
                BUILDER PROGRESS
            ========================= */}

            <section className="garden-builder-progress">

                <div className="garden-builder-progress-top">

                    <div>

                        <strong>
                            Garden Builder Progress
                        </strong>

                        <span>

                            {
                                completedStageCount
                            }

                            {" of "}

                            {
                                progressStages.length
                            }

                            {" stages ready"}

                        </span>

                    </div>


                    <span className="garden-builder-progress-percent">

                        {
                            progressPercent
                        }

                        %

                    </span>

                </div>


                <div className="garden-builder-progress-bar">

                    <div
                        className="garden-builder-progress-fill"

                        style={{
                            width:
                                `${progressPercent}%`
                        }}
                    />

                </div>


                <div className="garden-builder-stage-nav">

                    {
                        progressStages.map(
                            (stage) => (

                                <button
                                    type="button"

                                    key={
                                        stage.id
                                    }

                                    className={
                                        stage.complete
                                            ? "garden-builder-stage complete"
                                            : "garden-builder-stage"
                                    }

                                    onClick={() =>
                                        scrollToStage(
                                            stage.id
                                        )
                                    }
                                >

                                    <span>

                                        {
                                            stage.complete
                                                ? "✓"
                                                : stage.icon
                                        }

                                    </span>

                                    <small>
                                        {
                                            stage.name
                                        }
                                    </small>

                                </button>

                            )
                        )
                    }

                </div>

            </section>


            <form
                className="designer-form"

                onSubmit={
                    handleSubmit
                }
            >


                {/* =========================
                    1 — DEFINE SPACE
                ========================= */}

                <section
                    id="garden-step-space"
                    className="designer-card"
                >

                    <div className="designer-section-heading">

                        <span>1</span>

                        <div>

                            <h2>
                                Define Your Space
                            </h2>

                            <p>
                                Start with the real
                                area available for
                                your garden.
                            </p>

                        </div>

                    </div>


                    <div className="design-mode-grid">

                        <button
                            type="button"
                            className="design-mode-card selected"
                        >

                            <span>
                                📐
                            </span>

                            <strong>
                                Enter Dimensions
                            </strong>

                            <small>
                                Active
                            </small>

                        </button>


                        <button
                            type="button"
                            className="design-mode-card coming-soon"
                            disabled
                        >

                            <span>
                                📷
                            </span>

                            <strong>
                                Use Camera
                            </strong>

                            <small>
                                Coming Soon
                            </small>

                        </button>

                    </div>

                </section>


                {/* =========================
                    2 — SPACE TYPE
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>2</span>

                        <div>

                            <h2>
                                Space Type
                            </h2>

                            <p>
                                Where will the
                                garden be built?
                            </p>

                        </div>

                    </div>


                    <div className="designer-choice-grid">

                        {
                            spaceTypes.map(
                                (space) => (

                                    <button
                                        type="button"

                                        key={
                                            space.id
                                        }

                                        className={
                                            spaceType ===
                                            space.id
                                                ? "designer-choice selected"
                                                : "designer-choice"
                                        }

                                        onClick={() =>
                                            setSpaceType(
                                                space.id
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                space.icon
                                            }
                                        </span>

                                        <strong>
                                            {
                                                space.name
                                            }
                                        </strong>

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    3 — MEASUREMENTS
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>3</span>

                        <div>

                            <h2>
                                Measurements
                            </h2>

                            <p>
                                Enter the usable
                                dimensions.
                            </p>

                        </div>

                    </div>


                    <div className="dimension-grid">

                        <div>

                            <label htmlFor="garden-width">
                                Width
                            </label>

                            <input
                                id="garden-width"

                                type="number"

                                min="1"

                                step="0.1"

                                inputMode="decimal"

                                value={
                                    width
                                }

                                onChange={
                                    (event) =>
                                        setWidth(
                                            event.target.value
                                        )
                                }
                            />

                        </div>


                        <span className="dimension-symbol">
                            ×
                        </span>


                        <div>

                            <label htmlFor="garden-length">
                                Length
                            </label>

                            <input
                                id="garden-length"

                                type="number"

                                min="1"

                                step="0.1"

                                inputMode="decimal"

                                value={
                                    length
                                }

                                onChange={
                                    (event) =>
                                        setLength(
                                            event.target.value
                                        )
                                }
                            />

                        </div>


                        <div>

                            <label htmlFor="garden-unit">
                                Unit
                            </label>

                            <select
                                id="garden-unit"

                                value={
                                    unit
                                }

                                onChange={
                                    (event) =>
                                        setUnit(
                                            event.target.value
                                        )
                                }
                            >

                                <option value="ft">
                                    Feet
                                </option>

                                <option value="m">
                                    Meters
                                </option>

                            </select>

                        </div>

                    </div>


                    {
                        measurements.valid && (

                            <div className="space-area-result">

                                <span>
                                    📏
                                </span>

                                <div>

                                    <strong>

                                        {width}

                                        {" × "}

                                        {length}

                                        {" "}

                                        {unit}

                                    </strong>

                                    <p>

                                        {
                                            measurements
                                                .squareFeet
                                                .toFixed(
                                                    1
                                                )
                                        }

                                        {" sq ft"}

                                    </p>

                                </div>

                            </div>

                        )
                    }

                </section>


                {/* =========================
                    4 — SURFACE
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>4</span>

                        <div>

                            <h2>
                                Surface
                            </h2>

                            <p>
                                What will the
                                garden sit on?
                            </p>

                        </div>

                    </div>


                    <div className="designer-choice-grid">

                        {
                            surfaceTypes.map(
                                (item) => (

                                    <button
                                        type="button"

                                        key={
                                            item.id
                                        }

                                        className={
                                            surface ===
                                            item.id
                                                ? "designer-choice selected"
                                                : "designer-choice"
                                        }

                                        onClick={() =>
                                            setSurface(
                                                item.id
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                item.icon
                                            }
                                        </span>

                                        <strong>
                                            {
                                                item.name
                                            }
                                        </strong>

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    5 — GARDEN SYSTEM
                ========================= */}

                <section
                    id="garden-step-environment"
                    className="designer-card"
                >

                    <div className="designer-section-heading">

                        <span>5</span>

                        <div>

                            <h2>
                                Primary Garden System
                            </h2>

                            <p>
                                Choose your main
                                growing method.
                            </p>

                        </div>

                    </div>


                    <div className="designer-choice-grid">

                        {
                            Object.entries(
                                gardenPlans
                            ).map(
                                ([
                                    key,
                                    garden
                                ]) => (

                                    <button
                                        type="button"

                                        key={
                                            key
                                        }

                                        className={
                                            gardenType ===
                                            key
                                                ? "designer-choice selected"
                                                : "designer-choice"
                                        }

                                        onClick={() =>
                                            setGardenType(
                                                key
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                garden.icon
                                            }
                                        </span>

                                        <strong>
                                            {
                                                garden.name
                                            }
                                        </strong>

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    6 — SUNLIGHT
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>6</span>

                        <div>

                            <h2>
                                Sunlight
                            </h2>

                            <p>
                                How much direct
                                sunlight does the
                                space receive?
                            </p>

                        </div>

                    </div>


                    <div className="designer-choice-grid">

                        {
                            Object.entries(
                                sunlightNames
                            ).map(
                                ([
                                    key,
                                    name
                                ]) => (

                                    <button
                                        type="button"

                                        key={
                                            key
                                        }

                                        className={
                                            sunlight ===
                                            key
                                                ? "designer-choice selected"
                                                : "designer-choice"
                                        }

                                        onClick={() =>
                                            setSunlight(
                                                key
                                            )
                                        }
                                    >

                                        <span>

                                            {
                                                key ===
                                                "full"
                                                    ? "☀️"
                                                    : key ===
                                                      "partial"
                                                        ? "🌤️"
                                                        : "⛅"
                                            }

                                        </span>

                                        <strong>
                                            {
                                                name
                                            }
                                        </strong>

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    7 — USDA ZONE
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>7</span>

                        <div>

                            <h2>
                                USDA Growing Zone
                            </h2>

                            <p>
                                Used for local
                                growing guidance.
                            </p>

                        </div>

                    </div>


                    <select
                        className="hardiness-select"

                        value={
                            hardinessZone
                        }

                        onChange={
                            (event) =>
                                setHardinessZone(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Select your zone
                        </option>


                        {
                            hardinessZones.map(
                                (zone) => (

                                    <option
                                        key={
                                            zone
                                        }

                                        value={
                                            zone
                                        }
                                    >

                                        Zone {zone} —{" "}

                                        {
                                            hardinessTemperatureRanges[
                                                zone
                                            ]
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    {
                        hardinessZone && (

                            <div className="selected-hardiness-zone">

                                <span>
                                    🌡️
                                </span>

                                <div>

                                    <strong>

                                        USDA Zone{" "}

                                        {
                                            hardinessZone
                                        }

                                    </strong>

                                    <p>

                                        {
                                            hardinessTemperatureRanges[
                                                hardinessZone
                                            ]
                                        }

                                    </p>

                                </div>

                            </div>

                        )
                    }

                </section>


                {/* =========================
                    8 — DEVICE LOCATION
                ========================= */}

                <GardenLocationCard
                    location={
                        gardenLocation
                    }

                    onLocationChange={
                        setGardenLocation
                    }
                />


                {/* =========================
                    9 — FROST DATES
                ========================= */}

                <section className="designer-card">

                    <div className="designer-section-heading">

                        <span>9</span>

                        <div>

                            <h2>
                                Local Frost Dates
                            </h2>

                            <p>
                                Optional for now.
                                These help estimate
                                planting windows.
                            </p>

                        </div>

                    </div>


                    <div className="build-options-grid">

                        <label htmlFor="last-spring-frost">

                            Average Last Spring Frost

                            <input
                                id="last-spring-frost"

                                type="date"

                                value={
                                    lastSpringFrost
                                }

                                onChange={
                                    (event) =>
                                        setLastSpringFrost(
                                            event.target.value
                                        )
                                }
                            />

                        </label>


                        <label htmlFor="first-fall-frost">

                            Average First Fall Frost

                            <input
                                id="first-fall-frost"

                                type="date"

                                value={
                                    firstFallFrost
                                }

                                onChange={
                                    (event) =>
                                        setFirstFallFrost(
                                            event.target.value
                                        )
                                }
                            />

                        </label>

                    </div>


                    <div className="material-assumptions">

                        <strong>
                            📍 Next Integration
                        </strong>

                        <p>
                            Once device location is
                            connected to our growing
                            data source, these values
                            can be populated
                            automatically.
                        </p>

                    </div>

                </section>


                {/* =========================
                    10 — FEATURES
                ========================= */}

                <section
                    id="garden-step-features"
                    className="designer-card"
                >

                    <div className="designer-section-heading">

                        <span>10</span>

                        <div>

                            <h2>
                                Garden Features
                            </h2>

                            <p>
                                Select what you want
                                included in the design.
                            </p>

                        </div>

                    </div>


                    <div className="feature-grid">

                        {
                            buildFeatures.map(
                                (feature) => {

                                    const selected =
                                        selectedFeatures.includes(
                                            feature.id
                                        );


                                    return (

                                        <button
                                            type="button"

                                            key={
                                                feature.id
                                            }

                                            className={
                                                selected
                                                    ? "feature-card selected"
                                                    : "feature-card"
                                            }

                                            onClick={() =>
                                                toggleFeature(
                                                    feature.id
                                                )
                                            }
                                        >

                                            <span>
                                                {
                                                    feature.icon
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    feature.name
                                                }
                                            </strong>

                                            <small>

                                                {
                                                    selected
                                                        ? "✓ Selected"
                                                        : "Add"
                                                }

                                            </small>

                                        </button>

                                    );

                                }
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    11 — CROPS
                ========================= */}

                <section
                    id="garden-step-crops"
                    className="designer-card"
                >

                    <div className="designer-section-heading">

                        <span>11</span>

                        <div>

                            <h2>
                                What Do You Want to Grow?
                            </h2>

                            <p>
                                Search and choose crops
                                for your planting plan.
                            </p>

                        </div>

                    </div>


                    {/* =========================
                        SELECTED CROP SUMMARY
                    ========================= */}

                    <div className="crop-selection-summary">

                        <span>
                            🧺
                        </span>

                        <div>

                            <strong>

                                {
                                    selectedCrops.length
                                }

                                {
                                    selectedCrops.length ===
                                    1
                                        ? " crop selected"
                                        : " crops selected"
                                }

                            </strong>

                            <small>
                                Filtering does not
                                remove your selections.
                            </small>

                        </div>

                    </div>


                    {/* =========================
                        SEARCH
                    ========================= */}

                    <div className="crop-library-tools">

                        <label className="crop-search-field">

                            <span>
                                🔎
                            </span>

                            <input
                                type="search"

                                placeholder="Search crops..."

                                value={
                                    cropSearch
                                }

                                onChange={
                                    (event) =>
                                        setCropSearch(
                                            event.target.value
                                        )
                                }
                            />

                        </label>


                        {/* =========================
                            CATEGORY FILTERS
                        ========================= */}

                        <div className="crop-category-filter">

                            {
                                cropCategories.map(
                                    (category) => (

                                        <button
                                            type="button"

                                            key={
                                                category.id
                                            }

                                            className={
                                                cropCategory ===
                                                category.id
                                                    ? "crop-category-button selected"
                                                    : "crop-category-button"
                                            }

                                            onClick={() =>
                                                setCropCategory(
                                                    category.id
                                                )
                                            }
                                        >

                                            <span>
                                                {
                                                    category.icon
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    category.name
                                                }
                                            </strong>

                                            <small>

                                                {
                                                    getCropCategoryCount(
                                                        category.id
                                                    )
                                                }

                                            </small>

                                        </button>

                                    )
                                )
                            }

                        </div>

                    </div>


                    {/* =========================
                        CROP RESULTS
                    ========================= */}

                    {
                        filteredCrops.length ===
                        0
                            ? (

                                <div className="crop-filter-empty">

                                    <span>
                                        🌱
                                    </span>

                                    <strong>
                                        No crops found
                                    </strong>

                                    <p>
                                        Try another search
                                        or select a different
                                        crop category.
                                    </p>

                                </div>

                            )
                            : (

                                <div className="feature-grid">

                                    {
                                        filteredCrops.map(
                                            (crop) => {

                                                const selected =
                                                    selectedCrops.includes(
                                                        crop.id
                                                    );


                                                return (

                                                    <button
                                                        type="button"

                                                        key={
                                                            crop.id
                                                        }

                                                        className={
                                                            selected
                                                                ? "feature-card selected"
                                                                : "feature-card"
                                                        }

                                                        onClick={() =>
                                                            toggleCrop(
                                                                crop.id
                                                            )
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
                                                                selected
                                                                    ? "✓ Selected"
                                                                    : "Add"
                                                            }

                                                        </small>

                                                    </button>

                                                );

                                            }
                                        )
                                    }

                                </div>

                            )
                    }

                </section>


                {/* =========================
                    12 — DESIGN GOAL
                ========================= */}

                <section
                    id="garden-step-design"
                    className="designer-card"
                >

                    <div className="designer-section-heading">

                        <span>12</span>

                        <div>

                            <h2>
                                Design Goal
                            </h2>

                            <p>
                                What should the
                                layout prioritize?
                            </p>

                        </div>

                    </div>


                    <div className="design-goal-grid">

                        {
                            designGoals.map(
                                (goal) => (

                                    <button
                                        type="button"

                                        key={
                                            goal.id
                                        }

                                        className={
                                            designGoal ===
                                            goal.id
                                                ? "design-goal-card selected"
                                                : "design-goal-card"
                                        }

                                        onClick={() =>
                                            setDesignGoal(
                                                goal.id
                                            )
                                        }
                                    >

                                        <span className="design-goal-icon">

                                            {
                                                goal.icon
                                            }

                                        </span>

                                        <strong>
                                            {
                                                goal.name
                                            }
                                        </strong>

                                        <small>
                                            {
                                                goal.description
                                            }
                                        </small>

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =========================
                    13 — BED OPTIONS
                ========================= */}

                {
                    selectedFeatures.includes(
                        "raised-beds"
                    ) && (

                        <section className="designer-card">

                            <div className="designer-section-heading">

                                <span>13</span>

                                <div>

                                    <h2>
                                        Raised Bed Build Options
                                    </h2>

                                    <p>
                                        Customize the
                                        physical structure.
                                    </p>

                                </div>

                            </div>


                            <div className="build-options-grid">

                                <label>

                                    Bed Length

                                    <select
                                        value={
                                            bedLength
                                        }

                                        onChange={
                                            (event) =>
                                                setBedLength(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="4">
                                            4 ft
                                        </option>

                                        <option value="6">
                                            6 ft
                                        </option>

                                        <option value="8">
                                            8 ft
                                        </option>

                                        <option value="10">
                                            10 ft
                                        </option>

                                        <option value="12">
                                            12 ft
                                        </option>

                                    </select>

                                </label>


                                <label>

                                    Bed Width

                                    <select
                                        value={
                                            bedWidth
                                        }

                                        onChange={
                                            (event) =>
                                                setBedWidth(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="2">
                                            2 ft
                                        </option>

                                        <option value="3">
                                            3 ft
                                        </option>

                                        <option value="4">
                                            4 ft
                                        </option>

                                    </select>

                                </label>


                                <label>

                                    Bed Height

                                    <select
                                        value={
                                            bedHeight
                                        }

                                        onChange={
                                            (event) =>
                                                setBedHeight(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="6">
                                            6 in
                                        </option>

                                        <option value="12">
                                            12 in
                                        </option>

                                        <option value="18">
                                            18 in
                                        </option>

                                        <option value="24">
                                            24 in
                                        </option>

                                    </select>

                                </label>


                                <label>

                                    Preferred Walkway

                                    <select
                                        value={
                                            walkwayWidth
                                        }

                                        onChange={
                                            (event) =>
                                                setWalkwayWidth(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="2">
                                            2 ft
                                        </option>

                                        <option value="2.5">
                                            2.5 ft
                                        </option>

                                        <option value="3">
                                            3 ft
                                        </option>

                                        <option value="4">
                                            4 ft
                                        </option>

                                    </select>

                                </label>


                                <label>

                                    Number of Beds

                                    <select
                                        value={
                                            bedCountLimit
                                        }

                                        onChange={
                                            (event) =>
                                                setBedCountLimit(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="auto">
                                            Auto Fit
                                        </option>

                                        <option value="1">
                                            Up to 1
                                        </option>

                                        <option value="2">
                                            Up to 2
                                        </option>

                                        <option value="3">
                                            Up to 3
                                        </option>

                                        <option value="4">
                                            Up to 4
                                        </option>

                                    </select>

                                </label>

                            </div>


                            <h3 className="build-options-subheading">
                                Bed Material
                            </h3>


                            <div className="build-option-button-grid">

                                {
                                    [
                                        [
                                            "cedar",
                                            "Cedar"
                                        ],
                                        [
                                            "pressure-treated",
                                            "Pressure-Treated"
                                        ],
                                        [
                                            "composite",
                                            "Composite"
                                        ],
                                        [
                                            "metal",
                                            "Metal Kit"
                                        ]
                                    ].map(
                                        ([
                                            value,
                                            label
                                        ]) => (

                                            <button
                                                type="button"

                                                key={
                                                    value
                                                }

                                                className={
                                                    bedMaterial ===
                                                    value
                                                        ? "build-option-button selected"
                                                        : "build-option-button"
                                                }

                                                onClick={() =>
                                                    setBedMaterial(
                                                        value
                                                    )
                                                }
                                            >

                                                {
                                                    label
                                                }

                                            </button>

                                        )
                                    )
                                }

                            </div>


                            <h3 className="build-options-subheading">
                                Soil Mix
                            </h3>


                            <div className="build-option-button-grid">

                                {
                                    [
                                        [
                                            "balanced",
                                            "Balanced",
                                            "60 / 30 / 10"
                                        ],
                                        [
                                            "compost-rich",
                                            "Compost Rich",
                                            "45 / 45 / 10"
                                        ],
                                        [
                                            "budget",
                                            "Basic Mix",
                                            "70 / 20 / 10"
                                        ]
                                    ].map(
                                        ([
                                            value,
                                            label,
                                            ratio
                                        ]) => (

                                            <button
                                                type="button"

                                                key={
                                                    value
                                                }

                                                className={
                                                    soilStrategy ===
                                                    value
                                                        ? "build-option-button selected"
                                                        : "build-option-button"
                                                }

                                                onClick={() =>
                                                    setSoilStrategy(
                                                        value
                                                    )
                                                }
                                            >

                                                {
                                                    label
                                                }

                                                <small>
                                                    {
                                                        ratio
                                                    }
                                                </small>

                                            </button>

                                        )
                                    )
                                }

                            </div>

                        </section>

                    )
                }


                {/* =========================
                    BUILD / RESULTS STAGE
                ========================= */}

                <div
                    id="garden-step-build"
                    className="designer-save-area"
                >


                    {/* =========================
                        SPACE PREVIEW
                    ========================= */}

                    {
                        measurements.valid && (

                            <section className="designer-card">

                                <div className="designer-section-heading">

                                    <span>
                                        👁️
                                    </span>

                                    <div>

                                        <h2>
                                            Space Preview
                                        </h2>

                                        <p>
                                            Your available
                                            garden area.
                                        </p>

                                    </div>

                                </div>


                                <div className="space-preview-wrapper">

                                    <div className="space-preview-width">

                                        {width}

                                        {" "}

                                        {unit}

                                    </div>


                                    <div
                                        className="space-preview"

                                        style={{
                                            aspectRatio:
                                                `${Number(
                                                    width
                                                )} / ${Number(
                                                    length
                                                )}`
                                        }}
                                    >

                                        <span>

                                            {
                                                selectedSpace?.icon ||
                                                "📐"
                                            }

                                        </span>

                                        <strong>
                                            {
                                                selectedSpace?.name
                                            }
                                        </strong>

                                        <small>
                                            {
                                                selectedSurface?.name
                                            }
                                        </small>

                                        <div className="space-preview-area">

                                            {
                                                measurements
                                                    .squareFeet
                                                    .toFixed(
                                                        0
                                                    )
                                            }

                                            {" sq ft"}

                                        </div>

                                    </div>


                                    <div className="space-preview-length">

                                        {length}

                                        {" "}

                                        {unit}

                                    </div>

                                </div>

                            </section>

                        )
                    }


                    {/* =========================
                        GENERATED LAYOUT
                    ========================= */}

                    {
                        generatedLayout && (

                            <GardenLayoutPreview
                                layout={
                                    generatedLayout
                                }

                                bedPlantingPlan={
                                    bedPlantingPlan
                                }
                            />

                        )
                    }


                    {/* =========================
                        PLANTING PLAN
                    ========================= */}

                    {
                        plantingPlan && (

                            <GardenPlantingPlan
                                plantingPlan={
                                    plantingPlan
                                }
                            />

                        )
                    }


                    {/* =========================
                        SEASONAL GUIDE
                    ========================= */}

                    {
                        seasonalGuide && (

                            <SeasonalPlantingGuide
                                seasonalGuide={
                                    seasonalGuide
                                }
                            />

                        )
                    }


                    {/* =========================
                        BED PLANTING MAP
                    ========================= */}

                    {
                        bedPlantingPlan && (

                            <GardenBedPlantingMap
                                bedPlantingPlan={
                                    bedPlantingPlan
                                }
                            />

                        )
                    }


                    {/* =========================
                        MATERIALS
                    ========================= */}

                    {
                        materialPlan && (

                            <GardenMaterials
                                materialPlan={
                                    materialPlan
                                }
                            />

                        )
                    }


                    {/* =========================
                        BUILD PLAN
                    ========================= */}

                    {
                        buildPlan && (

                            <GardenBuildPlan
                                buildPlan={
                                    buildPlan
                                }
                            />

                        )
                    }


                    {
                        message && (

                            <p className="designer-message">

                                {
                                    message
                                }

                            </p>

                        )
                    }


                    <button
                        type="submit"

                        className="garden-save-button designer-save-button"
                    >

                        Save Garden Project →

                    </button>

                </div>


            </form>


            {/* =========================
                SUMMARY
            ========================= */}

            {
                selectedGarden &&
                measurements.valid && (

                    <section className="garden-plan-card">

                        <div className="garden-plan-title">

                            <span>

                                {
                                    selectedDesignGoal?.icon ||
                                    "🌿"
                                }

                            </span>

                            <div>

                                <h2>
                                    Design Foundation
                                </h2>

                                <p>

                                    {
                                        selectedDesignGoal?.name
                                    }

                                    {" • "}

                                    {
                                        selectedGarden.name
                                    }

                                </p>

                            </div>

                        </div>


                        {
                            generatedLayout && (

                                <div className="design-foundation-stats">

                                    <div>

                                        <strong>
                                            Space
                                        </strong>

                                        <span>

                                            {
                                                measurements
                                                    .squareFeet
                                                    .toFixed(
                                                        0
                                                    )
                                            }

                                            {" sq ft"}

                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Beds
                                        </strong>

                                        <span>

                                            {
                                                generatedLayout
                                                    .stats
                                                    .raisedBedCount
                                            }

                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Crops
                                        </strong>

                                        <span>
                                            {
                                                selectedCrops.length
                                            }
                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Planned Plants
                                        </strong>

                                        <span>

                                            {
                                                bedPlantingPlan
                                                    ?.stats
                                                    ?.totalPlants ||
                                                0
                                            }

                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Bed Use
                                        </strong>

                                        <span>

                                            {
                                                bedPlantingPlan
                                                    ?.stats
                                                    ?.utilization ||
                                                0
                                            }

                                            %

                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Location
                                        </strong>

                                        <span>

                                            {
                                                gardenLocation
                                                    ? "✓ Captured"
                                                    : "Not Set"
                                            }

                                        </span>

                                    </div>

                                </div>

                            )
                        }


                        <p className="layout-next-message">

                            📍 The garden project can
                            now store the real location
                            where the design will be
                            built.

                        </p>

                    </section>

                )
            }


            <BottomNav />


        </div>

    );

}


export default Garden;