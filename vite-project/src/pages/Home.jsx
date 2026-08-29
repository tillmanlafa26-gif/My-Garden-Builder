import {
    useRef,
    useState
} from "react";


import Header
    from "../components/Header";

import WeatherCard
    from "../components/WeatherCard";

import GardenProfile
    from "../components/GardenProfile";

import MyGardenPlants
    from "../components/MyGardenPlants";

import WateringReminder
    from "../components/WateringReminder";

import TaskForm
    from "../components/TaskForm";

import TaskList
    from "../components/TaskList";

import SustainabilityScore
    from "../components/SustainabilityScore";

import BottomNav
    from "../components/BottomNav";

import GardenLocationCard
    from "../components/GardenLocationCard";

import HomeGardenDesignStep
    from "../components/HomeGardenDesignStep";


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
        name: "Other",
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
   GARDEN FEATURES
========================================================= */

const gardenFeatureOptions = [
    {
        id: "raised-beds",
        name: "Raised Beds",
        icon: "🥕",
        description:
            "Structured growing beds with defined dimensions."
    },
    {
        id: "containers",
        name: "Containers",
        icon: "🪴",
        description:
            "Pots and planters for flexible growing."
    },
    {
        id: "vertical-growing",
        name: "Vertical Growing",
        icon: "🌿",
        description:
            "Use vertical space to increase growing capacity."
    },
    {
        id: "trellis",
        name: "Trellis",
        icon: "🫘",
        description:
            "Support climbing crops such as beans and cucumbers."
    },
    {
        id: "compost",
        name: "Compost Area",
        icon: "♻️",
        description:
            "Reserve space for composting garden material."
    },
    {
        id: "irrigation",
        name: "Irrigation",
        icon: "💧",
        description:
            "Include a basic garden watering system."
    },
    {
        id: "hydroponics",
        name: "Hydroponics",
        icon: "🧪",
        description:
            "Include a soil-free growing system."
    }
];


/* =========================================================
   CROP CATEGORIES
========================================================= */

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


/* =========================================================
   GARDEN SIZE
========================================================= */

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


/* =========================================================
   HOME PAGE
========================================================= */

function Home({
    tasks,
    onAddTask,
    onToggleTask,
    sustainabilityScore,
    gardenProfile,
    onSaveGardenProfile,
    gardenPlants,
    onRemoveGardenPlant,
    wateringRecords,
    onMarkPlantWatered,
    onDelayWatering,
    onRainWatered
}) {


    const designSpace =
        gardenProfile?.designSpace ||
        {};


    /* =====================================================
       STEP 1 — SPACE DRAFT
    ===================================================== */

    const [
        spaceType,
        setSpaceType
    ] = useState(
        designSpace.spaceType ||
        "backyard"
    );


    const [
        spaceWidth,
        setSpaceWidth
    ] = useState(
        designSpace.width
            ? String(
                designSpace.width
            )
            : ""
    );


    const [
        spaceLength,
        setSpaceLength
    ] = useState(
        designSpace.length
            ? String(
                designSpace.length
            )
            : ""
    );


    const [
        spaceUnit,
        setSpaceUnit
    ] = useState(
        designSpace.unit ||
        "ft"
    );


    const [
        spaceSurface,
        setSpaceSurface
    ] = useState(
        designSpace.surface ||
        "grass"
    );


    const [
        spaceMessage,
        setSpaceMessage
    ] = useState(
        ""
    );


    /* =====================================================
       STEP 2 — ENVIRONMENT DRAFT
    ===================================================== */

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
        designSpace.hardinessZone ||
        ""
    );


    const [
        gardenLocation,
        setGardenLocation
    ] = useState(
        designSpace.location ||
        null
    );


    const [
        environmentMessage,
        setEnvironmentMessage
    ] = useState(
        ""
    );


    /* =====================================================
       STEP 3 — FEATURES DRAFT
    ===================================================== */

    const [
        selectedFeatures,
        setSelectedFeatures
    ] = useState(
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : []
    );


    const [
        noAdditionalFeatures,
        setNoAdditionalFeatures
    ] = useState(
        Boolean(
            designSpace.featuresConfirmed
        ) &&
        (
            !Array.isArray(
                designSpace.features
            ) ||
            designSpace.features.length === 0
        )
    );


    const [
        featuresMessage,
        setFeaturesMessage
    ] = useState(
        ""
    );


    /* =====================================================
       STEP 4 — CROPS DRAFT
    ===================================================== */

    const [
        selectedCrops,
        setSelectedCrops
    ] = useState(
        Array.isArray(
            designSpace.growGoals
        )
            ? designSpace.growGoals
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


    const [
        cropsMessage,
        setCropsMessage
    ] = useState(
        ""
    );


    /* =====================================================
       INITIAL COMPLETION
    ===================================================== */

    const initialSpaceComplete =
        Number(
            designSpace.width
        ) > 0 &&
        Number(
            designSpace.length
        ) > 0;


    const initialEnvironmentComplete =
        Boolean(
            gardenProfile?.type
        ) &&
        Boolean(
            gardenProfile?.sunlight
        ) &&
        Boolean(
            gardenProfile?.hardinessZone
        );


    const initialFeaturesComplete =
        Boolean(
            designSpace.featuresConfirmed
        ) ||
        (
            Array.isArray(
                designSpace.features
            ) &&
            designSpace.features.length > 0
        );


    const initialCropsComplete =
        Array.isArray(
            designSpace.growGoals
        ) &&
        designSpace.growGoals.length > 0;


    /* =====================================================
       EXPANDED / COLLAPSED
    ===================================================== */

    const [
        spaceExpanded,
        setSpaceExpanded
    ] = useState(
        !initialSpaceComplete
    );


    const [
        environmentExpanded,
        setEnvironmentExpanded
    ] = useState(
        !initialEnvironmentComplete
    );


    const [
        featuresExpanded,
        setFeaturesExpanded
    ] = useState(
        !initialFeaturesComplete
    );


    const [
        cropsExpanded,
        setCropsExpanded
    ] = useState(
        !initialCropsComplete
    );


    /* =====================================================
       SCROLL TARGETS
    ===================================================== */

    const environmentStepRef =
        useRef(
            null
        );


    const featuresStepRef =
        useRef(
            null
        );


    const cropsStepRef =
        useRef(
            null
        );


    const designStepRef =
        useRef(
            null
        );


    /* =====================================================
       BUILD PROGRESS
    ===================================================== */

    const spaceComplete =
        Number(
            designSpace.width
        ) > 0 &&
        Number(
            designSpace.length
        ) > 0;


    const environmentComplete =
        Boolean(
            gardenProfile?.type
        ) &&
        Boolean(
            gardenProfile?.sunlight
        ) &&
        Boolean(
            gardenProfile?.hardinessZone
        );


    const featuresComplete =
        Boolean(
            designSpace.featuresConfirmed
        ) ||
        (
            Array.isArray(
                designSpace.features
            ) &&
            designSpace.features.length > 0
        );


    const cropsComplete =
        Array.isArray(
            designSpace.growGoals
        ) &&
        designSpace.growGoals.length > 0;


    const designComplete =
        Boolean(
            designSpace.layout
        );


    const buildComplete =
        Boolean(
            designSpace.materials
        ) &&
        Boolean(
            designSpace.buildPlan
        );


    const buildStages = [
        {
            id: "space",
            name: "Space",
            icon: "📐",
            complete:
                spaceComplete
        },
        {
            id: "environment",
            name: "Environment",
            icon: "☀️",
            complete:
                environmentComplete
        },
        {
            id: "features",
            name: "Features",
            icon: "🧰",
            complete:
                featuresComplete
        },
        {
            id: "crops",
            name: "Crops",
            icon: "🥕",
            complete:
                cropsComplete
        },
        {
            id: "design",
            name: "Design",
            icon: "🗺️",
            complete:
                designComplete
        },
        {
            id: "build",
            name: "Build",
            icon: "🔨",
            complete:
                buildComplete
        }
    ];


    const completedStages =
        buildStages.filter(
            (stage) =>
                stage.complete
        ).length;


    const progressPercent =
        Math.round(
            (
                completedStages /
                buildStages.length
            ) *
            100
        );


    const nextStage =
        buildStages.find(
            (stage) =>
                !stage.complete
        );


    const gardenComplete =
        completedStages ===
        buildStages.length;


    /* =====================================================
       SPACE MEASUREMENTS
    ===================================================== */

    const numericWidth =
        Number(
            spaceWidth
        );


    const numericLength =
        Number(
            spaceLength
        );


    const draftSpaceValid =
        numericWidth > 0 &&
        numericLength > 0;


    const draftNativeArea =
        draftSpaceValid
            ? numericWidth *
              numericLength
            : 0;


    const draftSquareFeet =
        spaceUnit === "ft"
            ? draftNativeArea
            : draftNativeArea *
              10.7639;


    /* =====================================================
       CROP FILTERING
    ===================================================== */

    const normalizedCropSearch =
        cropSearch
            .trim()
            .toLowerCase();


    const filteredCrops =
        cropPlanningData.filter(
            (crop) => {

                const matchesCategory =
                    cropCategory === "all" ||
                    crop.placementGroup ===
                    cropCategory;


                const matchesSearch =
                    normalizedCropSearch === "" ||
                    crop.name
                        .toLowerCase()
                        .includes(
                            normalizedCropSearch
                        ) ||
                    crop.id
                        .toLowerCase()
                        .includes(
                            normalizedCropSearch
                        );


                return (
                    matchesCategory &&
                    matchesSearch
                );

            }
        );


    function getCropCategoryCount(
        categoryId
    ) {

        if (
            categoryId === "all"
        ) {

            return cropPlanningData.length;

        }


        return cropPlanningData.filter(
            (crop) =>
                crop.placementGroup ===
                categoryId
        ).length;

    }


    /* =====================================================
       SCROLL HELPER
    ===================================================== */

    function scrollToStep(
        ref
    ) {

        window.setTimeout(
            () => {

                const prefersReducedMotion =
                    window.matchMedia?.(
                        "(prefers-reduced-motion: reduce)"
                    )?.matches;


                ref.current
                    ?.scrollIntoView({
                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth",

                        block:
                            "start"
                    });

            },
            150
        );

    }


    /* =====================================================
       STEP 1 — SAVE SPACE
    ===================================================== */

    function saveSpaceStep() {

        if (
            !draftSpaceValid
        ) {

            setSpaceMessage(
                "Enter a valid width and length."
            );

            return;

        }


        const updatedProfile = {
            ...(gardenProfile || {}),

            size:
                getGardenSizeFromArea(
                    draftSquareFeet
                ),

            designSpace: {
                ...designSpace,

                mode:
                    designSpace.mode ||
                    "dimensions",

                spaceType,

                width:
                    numericWidth,

                length:
                    numericLength,

                unit:
                    spaceUnit,

                surface:
                    spaceSurface,

                areaSquareFeet:
                    Number(
                        draftSquareFeet
                            .toFixed(
                                2
                            )
                    )
            }
        };


        onSaveGardenProfile(
            updatedProfile
        );


        setSpaceMessage(
            ""
        );


        setSpaceExpanded(
            false
        );


        setEnvironmentExpanded(
            true
        );


        scrollToStep(
            environmentStepRef
        );

    }


    function editSpaceStep() {

        setSpaceMessage(
            ""
        );


        setSpaceExpanded(
            true
        );

    }


    /* =====================================================
       STEP 2 — SAVE ENVIRONMENT
    ===================================================== */

    function saveEnvironmentStep() {

        if (
            !gardenType
        ) {

            setEnvironmentMessage(
                "Choose a primary garden system."
            );

            return;

        }


        if (
            !sunlight
        ) {

            setEnvironmentMessage(
                "Choose the sunlight level."
            );

            return;

        }


        if (
            !hardinessZone
        ) {

            setEnvironmentMessage(
                "Choose your USDA growing zone."
            );

            return;

        }


        const updatedProfile = {
            ...(gardenProfile || {}),

            type:
                gardenType,

            sunlight,

            hardinessZone,

            designSpace: {
                ...designSpace,

                hardinessZone,

                location:
                    gardenLocation
            }
        };


        onSaveGardenProfile(
            updatedProfile
        );


        setEnvironmentMessage(
            ""
        );


        setEnvironmentExpanded(
            false
        );


        setFeaturesExpanded(
            true
        );


        scrollToStep(
            featuresStepRef
        );

    }


    function editEnvironmentStep() {

        setEnvironmentMessage(
            ""
        );


        setEnvironmentExpanded(
            true
        );

    }


    /* =====================================================
       STEP 3 — FEATURE TOGGLE
    ===================================================== */

    function toggleGardenFeature(
        featureId
    ) {

        setNoAdditionalFeatures(
            false
        );


        setFeaturesMessage(
            ""
        );


        setSelectedFeatures(
            (currentFeatures) => {

                if (
                    currentFeatures.includes(
                        featureId
                    )
                ) {

                    return currentFeatures.filter(
                        (id) =>
                            id !== featureId
                    );

                }


                return [
                    ...currentFeatures,
                    featureId
                ];

            }
        );

    }


    function chooseNoAdditionalFeatures() {

        setSelectedFeatures(
            []
        );


        setNoAdditionalFeatures(
            true
        );


        setFeaturesMessage(
            ""
        );

    }


    /* =====================================================
       STEP 3 — SAVE FEATURES
    ===================================================== */

    function saveFeaturesStep() {

        if (
            selectedFeatures.length === 0 &&
            !noAdditionalFeatures
        ) {

            setFeaturesMessage(
                "Choose at least one feature, or select No Additional Structures."
            );

            return;

        }


        const updatedProfile = {
            ...(gardenProfile || {}),

            designSpace: {
                ...designSpace,

                features:
                    selectedFeatures,

                featuresConfirmed:
                    true
            }
        };


        onSaveGardenProfile(
            updatedProfile
        );


        setFeaturesMessage(
            ""
        );


        setFeaturesExpanded(
            false
        );


        setCropsExpanded(
            true
        );


        scrollToStep(
            cropsStepRef
        );

    }


    function editFeaturesStep() {

        setFeaturesMessage(
            ""
        );


        setFeaturesExpanded(
            true
        );

    }


    /* =====================================================
       STEP 4 — CROP TOGGLE
    ===================================================== */

    function toggleCrop(
        cropId
    ) {

        setCropsMessage(
            ""
        );


        setSelectedCrops(
            (currentCrops) => {

                if (
                    currentCrops.includes(
                        cropId
                    )
                ) {

                    return currentCrops.filter(
                        (id) =>
                            id !== cropId
                    );

                }


                return [
                    ...currentCrops,
                    cropId
                ];

            }
        );

    }


    /* =====================================================
       STEP 4 — SAVE CROPS
    ===================================================== */

    function saveCropsStep() {

        if (
            selectedCrops.length === 0
        ) {

            setCropsMessage(
                "Choose at least one crop you want to grow."
            );

            return;

        }


        const updatedProfile = {
            ...(gardenProfile || {}),

            designSpace: {
                ...designSpace,

                growGoals:
                    selectedCrops
            }
        };


        onSaveGardenProfile(
            updatedProfile
        );


        setCropsMessage(
            ""
        );


        setCropsExpanded(
            false
        );


        scrollToStep(
            designStepRef
        );

    }


    function editCropsStep() {

        setCropsMessage(
            ""
        );


        setCropsExpanded(
            true
        );

    }


    /* =====================================================
       DISPLAY HELPERS
    ===================================================== */

    const savedSpace =
        spaceTypes.find(
            (item) =>
                item.id ===
                designSpace.spaceType
        );


    const savedGardenSystem =
        gardenProfile?.type
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    const savedSunlightName =
        gardenProfile?.sunlight
            ? sunlightNames[
                gardenProfile.sunlight
            ]
            : "";


    const savedFeatureNames =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
                .map(
                    (featureId) =>
                        gardenFeatureOptions.find(
                            (feature) =>
                                feature.id ===
                                featureId
                        )
                )
                .filter(
                    Boolean
                )
            : [];


    const savedCropData =
        Array.isArray(
            designSpace.growGoals
        )
            ? designSpace.growGoals
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
                )
            : [];


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="app-container">


            <Header />


            {/* =================================================
                GARDEN BUILD PROGRESS
            ================================================= */}

            <section className="home-build-progress">


                <div className="home-build-progress-header">

                    <div>

                        <span className="home-build-progress-icon">
                            🌱
                        </span>


                        <div>

                            <h2>
                                Build My Garden
                            </h2>


                            <p>

                                {
                                    gardenComplete
                                        ? "Your garden plan is ready."
                                        : "Build your garden one step at a time."
                                }

                            </p>

                        </div>

                    </div>


                    <span className="home-build-progress-percent">

                        {
                            progressPercent
                        }

                        %

                    </span>

                </div>


                <div
                    className="home-build-progress-bar"

                    role="progressbar"

                    aria-label="Garden build progress"

                    aria-valuemin="0"

                    aria-valuemax="100"

                    aria-valuenow={
                        progressPercent
                    }
                >

                    <div
                        className="home-build-progress-fill"

                        style={{
                            width:
                                `${progressPercent}%`
                        }}
                    />

                </div>


                <div className="home-build-progress-count">

                    <strong>

                        {
                            completedStages
                        }

                        {" of "}

                        {
                            buildStages.length
                        }

                        {" steps complete"}

                    </strong>


                    {
                        nextStage && (

                            <span>

                                Next:{" "}

                                {
                                    nextStage.icon
                                }

                                {" "}

                                {
                                    nextStage.name
                                }

                            </span>

                        )
                    }

                </div>


                <div className="home-build-stage-list">

                    {
                        buildStages.map(
                            (
                                stage,
                                index
                            ) => {

                                const isNext =
                                    nextStage?.id ===
                                    stage.id;


                                return (

                                    <div
                                        key={
                                            stage.id
                                        }

                                        className={
                                            stage.complete
                                                ? "home-build-stage complete"
                                                : isNext
                                                    ? "home-build-stage active"
                                                    : "home-build-stage"
                                        }
                                    >

                                        <span className="home-build-stage-status">

                                            {
                                                stage.complete
                                                    ? "✓"
                                                    : stage.icon
                                            }

                                        </span>


                                        <div>

                                            <small>

                                                Step{" "}

                                                {
                                                    index + 1
                                                }

                                            </small>


                                            <strong>
                                                {
                                                    stage.name
                                                }
                                            </strong>

                                        </div>


                                        <span className="home-build-stage-state">

                                            {
                                                stage.complete
                                                    ? "Complete"
                                                    : isNext
                                                        ? "Next"
                                                        : "Pending"
                                            }

                                        </span>

                                    </div>

                                );

                            }
                        )
                    }

                </div>

            </section>


            {/* =================================================
                STEP 1 — DEFINE SPACE
            ================================================= */}

            <section
                className={
                    spaceComplete &&
                    !spaceExpanded
                        ? "home-builder-step complete collapsed"
                        : "home-builder-step active"
                }
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">

                        {
                            spaceComplete
                                ? "✓"
                                : "1"
                        }

                    </span>


                    <div>

                        <small>
                            STEP 1
                        </small>


                        <h2>
                            📐 Define Your Space
                        </h2>


                        <p>
                            Tell us how much usable
                            growing space you have.
                        </p>

                    </div>

                </div>


                {
                    spaceComplete &&
                    !spaceExpanded
                        ? (

                            <div className="home-builder-collapsed-content">

                                <div className="home-builder-summary">

                                    <strong>

                                        {
                                            savedSpace?.icon ||
                                            "📐"
                                        }

                                        {" "}

                                        {
                                            savedSpace?.name ||
                                            "Garden Space"
                                        }

                                    </strong>


                                    <span>

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

                                        {" • "}

                                        {
                                            Number(
                                                designSpace.areaSquareFeet ||
                                                0
                                            ).toFixed(
                                                0
                                            )
                                        }

                                        {" sq ft"}

                                    </span>

                                </div>


                                <button
                                    type="button"

                                    className="home-builder-edit-button"

                                    onClick={
                                        editSpaceStep
                                    }
                                >

                                    Edit

                                </button>

                            </div>

                        )
                        : (

                            <>


                                <div className="home-builder-field-group">

                                    <h3>
                                        Where is your garden?
                                    </h3>


                                    <div className="home-builder-choice-grid">

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
                                                                ? "home-builder-choice selected"
                                                                : "home-builder-choice"
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

                                </div>


                                <div className="home-builder-field-group">

                                    <h3>
                                        Measurements
                                    </h3>


                                    <div className="home-space-dimensions">

                                        <label>

                                            Width

                                            <input
                                                type="number"

                                                min="1"

                                                step="0.1"

                                                inputMode="decimal"

                                                value={
                                                    spaceWidth
                                                }

                                                onChange={
                                                    (event) =>
                                                        setSpaceWidth(
                                                            event.target.value
                                                        )
                                                }

                                                placeholder="20"
                                            />

                                        </label>


                                        <span className="home-space-times">
                                            ×
                                        </span>


                                        <label>

                                            Length

                                            <input
                                                type="number"

                                                min="1"

                                                step="0.1"

                                                inputMode="decimal"

                                                value={
                                                    spaceLength
                                                }

                                                onChange={
                                                    (event) =>
                                                        setSpaceLength(
                                                            event.target.value
                                                        )
                                                }

                                                placeholder="14"
                                            />

                                        </label>


                                        <label>

                                            Unit

                                            <select
                                                value={
                                                    spaceUnit
                                                }

                                                onChange={
                                                    (event) =>
                                                        setSpaceUnit(
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

                                        </label>

                                    </div>


                                    {
                                        draftSpaceValid && (

                                            <div className="home-space-area-preview">

                                                <span>
                                                    📏
                                                </span>


                                                <div>

                                                    <strong>

                                                        {
                                                            spaceWidth
                                                        }

                                                        {" × "}

                                                        {
                                                            spaceLength
                                                        }

                                                        {" "}

                                                        {
                                                            spaceUnit
                                                        }

                                                    </strong>


                                                    <small>

                                                        {
                                                            draftSquareFeet
                                                                .toFixed(
                                                                    1
                                                                )
                                                        }

                                                        {" sq ft"}

                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    }

                                </div>


                                <div className="home-builder-field-group">

                                    <h3>
                                        What is underneath it?
                                    </h3>


                                    <div className="home-builder-choice-grid">

                                        {
                                            surfaceTypes.map(
                                                (surface) => (

                                                    <button
                                                        type="button"

                                                        key={
                                                            surface.id
                                                        }

                                                        className={
                                                            spaceSurface ===
                                                            surface.id
                                                                ? "home-builder-choice selected"
                                                                : "home-builder-choice"
                                                        }

                                                        onClick={() =>
                                                            setSpaceSurface(
                                                                surface.id
                                                            )
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                surface.icon
                                                            }
                                                        </span>


                                                        <strong>
                                                            {
                                                                surface.name
                                                            }
                                                        </strong>

                                                    </button>

                                                )
                                            )
                                        }

                                    </div>

                                </div>


                                {
                                    spaceMessage && (

                                        <p className="home-builder-error">

                                            {
                                                spaceMessage
                                            }

                                        </p>

                                    )
                                }


                                <button
                                    type="button"

                                    className="home-builder-continue-button"

                                    onClick={
                                        saveSpaceStep
                                    }
                                >

                                    Save Space & Continue →

                                </button>

                            </>

                        )
                }

            </section>


            {/* =================================================
                STEP 2 — GROWING CONDITIONS
            ================================================= */}

            <section
                ref={
                    environmentStepRef
                }

                className={
                    environmentComplete &&
                    !environmentExpanded
                        ? "home-builder-step complete collapsed"
                        : spaceComplete
                            ? "home-builder-step active"
                            : "home-builder-step upcoming"
                }
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">

                        {
                            environmentComplete
                                ? "✓"
                                : "2"
                        }

                    </span>


                    <div>

                        <small>
                            STEP 2
                        </small>


                        <h2>
                            ☀️ Growing Conditions
                        </h2>


                        <p>
                            Tell us about sunlight,
                            growing method, and your
                            local conditions.
                        </p>

                    </div>

                </div>


                {
                    !spaceComplete
                        ? (

                            <div className="home-builder-locked">

                                <span>
                                    🔒
                                </span>


                                <p>
                                    Complete Step 1
                                    before setting your
                                    growing conditions.
                                </p>

                            </div>

                        )
                        : environmentComplete &&
                          !environmentExpanded
                            ? (

                                <div className="home-builder-collapsed-content">

                                    <div className="home-builder-summary">

                                        <strong>

                                            {
                                                savedGardenSystem?.icon ||
                                                "🌱"
                                            }

                                            {" "}

                                            {
                                                savedGardenSystem?.name ||
                                                "Garden"
                                            }

                                        </strong>


                                        <span>

                                            {
                                                savedSunlightName
                                            }

                                            {" • Zone "}

                                            {
                                                gardenProfile
                                                    ?.hardinessZone
                                            }

                                            {
                                                designSpace.location
                                                    ? " • Location ✓"
                                                    : ""
                                            }

                                        </span>

                                    </div>


                                    <button
                                        type="button"

                                        className="home-builder-edit-button"

                                        onClick={
                                            editEnvironmentStep
                                        }
                                    >

                                        Edit

                                    </button>

                                </div>

                            )
                            : (

                                <>


                                    <div className="home-builder-field-group">

                                        <h3>
                                            Primary Garden System
                                        </h3>


                                        <div className="home-builder-choice-grid">

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
                                                                    ? "home-builder-choice selected"
                                                                    : "home-builder-choice"
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

                                    </div>


                                    <div className="home-builder-field-group">

                                        <h3>
                                            Daily Sunlight
                                        </h3>


                                        <div className="home-builder-choice-grid">

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
                                                                    ? "home-builder-choice selected"
                                                                    : "home-builder-choice"
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

                                    </div>


                                    <div className="home-builder-field-group">

                                        <h3>
                                            USDA Growing Zone
                                        </h3>


                                        <label className="home-builder-select-field">

                                            <span>
                                                🌡️ Growing Zone
                                            </span>


                                            <select
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

                                        </label>


                                        {
                                            hardinessZone && (

                                                <div className="home-zone-preview">

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


                                                        <small>

                                                            {
                                                                hardinessTemperatureRanges[
                                                                    hardinessZone
                                                                ]
                                                            }

                                                        </small>

                                                    </div>

                                                </div>

                                            )
                                        }

                                    </div>


                                    <div className="home-builder-field-group">

                                        <h3>
                                            Garden Location
                                        </h3>


                                        <p className="home-builder-helper-text">
                                            Optional for now. Location
                                            will later help automatically
                                            determine weather, frost
                                            dates, and local growing data.
                                        </p>


                                        <div className="home-builder-location-wrapper">

                                            <GardenLocationCard
                                                location={
                                                    gardenLocation
                                                }

                                                onLocationChange={
                                                    setGardenLocation
                                                }
                                            />

                                        </div>

                                    </div>


                                    {
                                        environmentMessage && (

                                            <p className="home-builder-error">

                                                {
                                                    environmentMessage
                                                }

                                            </p>

                                        )
                                    }


                                    <button
                                        type="button"

                                        className="home-builder-continue-button"

                                        onClick={
                                            saveEnvironmentStep
                                        }
                                    >

                                        Save Conditions & Continue →

                                    </button>

                                </>

                            )
                }

            </section>


            {/* =================================================
                STEP 3 — GARDEN FEATURES
            ================================================= */}

            <section
                ref={
                    featuresStepRef
                }

                className={
                    featuresComplete &&
                    !featuresExpanded
                        ? "home-builder-step complete collapsed"
                        : environmentComplete
                            ? "home-builder-step active"
                            : "home-builder-step upcoming"
                }
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">

                        {
                            featuresComplete
                                ? "✓"
                                : "3"
                        }

                    </span>


                    <div>

                        <small>
                            STEP 3
                        </small>


                        <h2>
                            🧰 Garden Features
                        </h2>


                        <p>
                            Choose the structures and
                            systems you want included
                            in your garden.
                        </p>

                    </div>

                </div>


                {
                    !environmentComplete
                        ? (

                            <div className="home-builder-locked">

                                <span>
                                    🔒
                                </span>


                                <p>
                                    Complete your growing
                                    conditions first.
                                </p>

                            </div>

                        )
                        : featuresComplete &&
                          !featuresExpanded
                            ? (

                                <div className="home-builder-collapsed-content">

                                    <div className="home-builder-summary">

                                        <strong>

                                            {
                                                savedFeatureNames.length > 0
                                                    ? `${savedFeatureNames.length} garden feature${savedFeatureNames.length === 1 ? "" : "s"}`
                                                    : "No additional structures"
                                            }

                                        </strong>


                                        <span>

                                            {
                                                savedFeatureNames.length > 0
                                                    ? savedFeatureNames
                                                        .map(
                                                            (feature) =>
                                                                `${feature.icon} ${feature.name}`
                                                        )
                                                        .join(
                                                            " • "
                                                        )
                                                    : "Simple garden setup"
                                            }

                                        </span>

                                    </div>


                                    <button
                                        type="button"

                                        className="home-builder-edit-button"

                                        onClick={
                                            editFeaturesStep
                                        }
                                    >

                                        Edit

                                    </button>

                                </div>

                            )
                            : (

                                <>


                                    <div className="home-builder-field-group">

                                        <h3>
                                            What should your garden include?
                                        </h3>


                                        <p className="home-builder-helper-text">
                                            Select as many as you want.
                                            We will use these choices when
                                            generating the layout and
                                            materials list.
                                        </p>


                                        <div className="home-feature-grid">

                                            {
                                                gardenFeatureOptions.map(
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
                                                                        ? "home-feature-card selected"
                                                                        : "home-feature-card"
                                                                }

                                                                aria-pressed={
                                                                    selected
                                                                }

                                                                onClick={() =>
                                                                    toggleGardenFeature(
                                                                        feature.id
                                                                    )
                                                                }
                                                            >

                                                                <span className="home-feature-icon">

                                                                    {
                                                                        feature.icon
                                                                    }

                                                                </span>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            feature.name
                                                                        }
                                                                    </strong>


                                                                    <small>
                                                                        {
                                                                            feature.description
                                                                        }
                                                                    </small>

                                                                </div>


                                                                <span className="home-feature-check">

                                                                    {
                                                                        selected
                                                                            ? "✓"
                                                                            : "+"
                                                                    }

                                                                </span>

                                                            </button>

                                                        );

                                                    }
                                                )
                                            }

                                        </div>

                                    </div>


                                    <button
                                        type="button"

                                        className={
                                            noAdditionalFeatures
                                                ? "home-no-features-option selected"
                                                : "home-no-features-option"
                                        }

                                        aria-pressed={
                                            noAdditionalFeatures
                                        }

                                        onClick={
                                            chooseNoAdditionalFeatures
                                        }
                                    >

                                        <span>
                                            🌱
                                        </span>


                                        <div>

                                            <strong>
                                                No Additional Structures
                                            </strong>


                                            <small>
                                                Keep the design simple without
                                                adding any of the structures above.
                                            </small>

                                        </div>


                                        <span className="home-feature-check">

                                            {
                                                noAdditionalFeatures
                                                    ? "✓"
                                                    : "+"
                                            }

                                        </span>

                                    </button>


                                    {
                                        selectedFeatures.length > 0 && (

                                            <div className="home-feature-selection-summary">

                                                <strong>

                                                    {
                                                        selectedFeatures.length
                                                    }

                                                    {
                                                        selectedFeatures.length === 1
                                                            ? " feature selected"
                                                            : " features selected"
                                                    }

                                                </strong>


                                                <div>

                                                    {
                                                        selectedFeatures.map(
                                                            (featureId) => {

                                                                const feature =
                                                                    gardenFeatureOptions.find(
                                                                        (item) =>
                                                                            item.id ===
                                                                            featureId
                                                                    );


                                                                if (
                                                                    !feature
                                                                ) {

                                                                    return null;

                                                                }


                                                                return (

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

                                                                );

                                                            }
                                                        )
                                                    }

                                                </div>

                                            </div>

                                        )
                                    }


                                    {
                                        featuresMessage && (

                                            <p className="home-builder-error">

                                                {
                                                    featuresMessage
                                                }

                                            </p>

                                        )
                                    }


                                    <button
                                        type="button"

                                        className="home-builder-continue-button"

                                        onClick={
                                            saveFeaturesStep
                                        }
                                    >

                                        Save Features & Continue →

                                    </button>

                                </>

                            )
                }

            </section>


            {/* =================================================
                STEP 4 — CHOOSE CROPS
            ================================================= */}

            <section
                ref={
                    cropsStepRef
                }

                className={
                    cropsComplete &&
                    !cropsExpanded
                        ? "home-builder-step complete collapsed"
                        : featuresComplete
                            ? "home-builder-step active"
                            : "home-builder-step upcoming"
                }
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">

                        {
                            cropsComplete
                                ? "✓"
                                : "4"
                        }

                    </span>


                    <div>

                        <small>
                            STEP 4
                        </small>


                        <h2>
                            🥕 Choose Crops
                        </h2>


                        <p>
                            Choose what you want
                            your garden designed to grow.
                        </p>

                    </div>

                </div>


                {
                    !featuresComplete
                        ? (

                            <div className="home-builder-locked">

                                <span>
                                    🔒
                                </span>


                                <p>
                                    Complete your garden
                                    features first.
                                </p>

                            </div>

                        )
                        : cropsComplete &&
                          !cropsExpanded
                            ? (

                                <div className="home-builder-collapsed-content">

                                    <div className="home-builder-summary">

                                        <strong>

                                            {
                                                savedCropData.length
                                            }

                                            {
                                                savedCropData.length === 1
                                                    ? " crop selected"
                                                    : " crops selected"
                                            }

                                        </strong>


                                        <span>

                                            {
                                                savedCropData
                                                    .slice(
                                                        0,
                                                        5
                                                    )
                                                    .map(
                                                        (crop) =>
                                                            `${crop.icon} ${crop.name}`
                                                    )
                                                    .join(
                                                        " • "
                                                    )
                                            }

                                            {
                                                savedCropData.length > 5
                                                    ? ` • +${savedCropData.length - 5} more`
                                                    : ""
                                            }

                                        </span>

                                    </div>


                                    <button
                                        type="button"

                                        className="home-builder-edit-button"

                                        onClick={
                                            editCropsStep
                                        }
                                    >

                                        Edit

                                    </button>

                                </div>

                            )
                            : (

                                <>


                                    <div className="home-crop-selection-header">

                                        <div>

                                            <strong>

                                                {
                                                    selectedCrops.length
                                                }

                                                {
                                                    selectedCrops.length === 1
                                                        ? " crop selected"
                                                        : " crops selected"
                                                }

                                            </strong>


                                            <small>
                                                Choose everything you would
                                                like the design to consider.
                                            </small>

                                        </div>


                                        <span>
                                            🌱
                                        </span>

                                    </div>


                                    <label className="home-crop-search">

                                        <span>
                                            🔎
                                        </span>


                                        <input
                                            type="search"

                                            value={
                                                cropSearch
                                            }

                                            onChange={
                                                (event) =>
                                                    setCropSearch(
                                                        event.target.value
                                                    )
                                            }

                                            placeholder="Search tomatoes, broccoli, potatoes..."
                                        />

                                    </label>


                                    <div className="home-crop-category-scroll">

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
                                                                ? "home-crop-category selected"
                                                                : "home-crop-category"
                                                        }

                                                        aria-pressed={
                                                            cropCategory ===
                                                            category.id
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


                                                        {
                                                            category.name
                                                        }


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


                                    {
                                        filteredCrops.length > 0
                                            ? (

                                                <div className="home-crop-grid">

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
                                                                                ? "home-crop-card selected"
                                                                                : "home-crop-card"
                                                                        }

                                                                        aria-pressed={
                                                                            selected
                                                                        }

                                                                        onClick={() =>
                                                                            toggleCrop(
                                                                                crop.id
                                                                            )
                                                                        }
                                                                    >

                                                                        <span className="home-crop-icon">

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


                                                                            <small>

                                                                                {
                                                                                    crop.preferredStartMethod ===
                                                                                    "transplant"
                                                                                        ? "Transplant"
                                                                                        : crop.preferredStartMethod ===
                                                                                          "seed"
                                                                                            ? "Start from seed"
                                                                                            : "Direct sow"
                                                                                }

                                                                            </small>

                                                                        </div>


                                                                        <span className="home-crop-check">

                                                                            {
                                                                                selected
                                                                                    ? "✓"
                                                                                    : "+"
                                                                            }

                                                                        </span>

                                                                    </button>

                                                                );

                                                            }
                                                        )
                                                    }

                                                </div>

                                            )
                                            : (

                                                <div className="home-crop-empty">

                                                    <span>
                                                        🔎
                                                    </span>


                                                    <strong>
                                                        No crops found
                                                    </strong>


                                                    <p>
                                                        Try another search
                                                        or crop category.
                                                    </p>

                                                </div>

                                            )
                                    }


                                    {
                                        selectedCrops.length > 0 && (

                                            <div className="home-selected-crops">

                                                <strong>
                                                    Your Garden Crops
                                                </strong>


                                                <div>

                                                    {
                                                        selectedCrops.map(
                                                            (cropId) => {

                                                                const crop =
                                                                    cropPlanningData.find(
                                                                        (item) =>
                                                                            item.id ===
                                                                            cropId
                                                                    );


                                                                if (
                                                                    !crop
                                                                ) {

                                                                    return null;

                                                                }


                                                                return (

                                                                    <button
                                                                        type="button"

                                                                        key={
                                                                            crop.id
                                                                        }

                                                                        onClick={() =>
                                                                            toggleCrop(
                                                                                crop.id
                                                                            )
                                                                        }
                                                                    >

                                                                        {
                                                                            crop.icon
                                                                        }

                                                                        {" "}

                                                                        {
                                                                            crop.name
                                                                        }

                                                                        <span>
                                                                            ×
                                                                        </span>

                                                                    </button>

                                                                );

                                                            }
                                                        )
                                                    }

                                                </div>

                                            </div>

                                        )
                                    }


                                    {
                                        cropsMessage && (

                                            <p className="home-builder-error">

                                                {
                                                    cropsMessage
                                                }

                                            </p>

                                        )
                                    }


                                    <button
                                        type="button"

                                        className="home-builder-continue-button"

                                        onClick={
                                            saveCropsStep
                                        }
                                    >

                                        Save Crops & Continue →

                                    </button>

                                </>

                            )
                }

            </section>


            {/* =================================================
                STEP 5 — GENERATE DESIGN
            ================================================= */}

            <div
                ref={
                    designStepRef
                }
            >

                <HomeGardenDesignStep

                    gardenProfile={
                        gardenProfile
                    }

                    onSaveGardenProfile={
                        onSaveGardenProfile
                    }

                />

            </div>


            {/* =================================================
                STEP 6 — MATERIALS / BUILD PREVIEW
            ================================================= */}

            <section
                id="home-builder-step-build"

                className={
                    buildComplete
                        ? "home-builder-step complete collapsed"
                        : designComplete
                            ? "home-builder-step upcoming"
                            : "home-builder-step upcoming"
                }
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">

                        {
                            buildComplete
                                ? "✓"
                                : "6"
                        }

                    </span>


                    <div>

                        <small>
                            STEP 6
                        </small>


                        <h2>
                            🔨 Materials & Build Instructions
                        </h2>


                        <p>
                            Turn your finished layout
                            into the materials and
                            instructions needed to
                            build it.
                        </p>

                    </div>

                </div>


                {
                    !designComplete
                        ? (

                            <div className="home-builder-locked">

                                <span>
                                    🔒
                                </span>


                                <p>
                                    Generate your garden
                                    design first.
                                </p>

                            </div>

                        )
                        : buildComplete
                            ? (

                                <div className="home-builder-summary">

                                    <strong>
                                        Build plan ready
                                    </strong>


                                    <span>
                                        Materials and instructions saved
                                    </span>

                                </div>

                            )
                            : (

                                <div className="home-builder-next-preview">

                                    <span>
                                        🔨
                                    </span>


                                    <p>
                                        Your layout is ready.
                                        Materials, quantities,
                                        and step-by-step build
                                        instructions come next.
                                    </p>

                                </div>

                            )
                }

            </section>


            {/* =================================================
                CURRENT GARDEN DASHBOARD
            ================================================= */}

            <WeatherCard />


            <GardenProfile
                gardenProfile={
                    gardenProfile
                }
            />


            <MyGardenPlants
                gardenPlants={
                    gardenPlants
                }

                onRemoveGardenPlant={
                    onRemoveGardenPlant
                }
            />


            <WateringReminder
                gardenProfile={
                    gardenProfile
                }

                gardenPlants={
                    gardenPlants
                }

                wateringRecords={
                    wateringRecords
                }

                onMarkPlantWatered={
                    onMarkPlantWatered
                }

                onDelayWatering={
                    onDelayWatering
                }

                onRainWatered={
                    onRainWatered
                }
            />


            <TaskForm
                onAddTask={
                    onAddTask
                }
            />


            <TaskList
                tasks={
                    tasks
                }

                onToggle={
                    onToggleTask
                }
            />


            <SustainabilityScore
                score={
                    sustainabilityScore
                }
            />


            <BottomNav />


        </div>

    );

}


export default Home;