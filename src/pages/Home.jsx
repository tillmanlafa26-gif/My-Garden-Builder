import {
    useRef,
    useState
} from "react";


import Header
    from "../components/Header";


import GardenAssistant
    from "../components/GardenAssistant";

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

import HomeGardenDesignStep
    from "../components/HomeGardenDesignStep";

import HomeGardenBuildStep
    from "../components/HomeGardenBuildStep";

import LocalGrowingDataCard
    from "../components/LocalGrowingDataCard";


import GardenSpacePhoto
    from "../components/GardenSpacePhoto";


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
    indoorPlantCategories,
    indoorPlantData
} from "../data/indoorPlantData";


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
   INDOOR SPACE TYPES
========================================================= */

const indoorSpaceTypes = [
    {
        id: "windowsill",
        name: "Windowsill",
        icon: "🪟"
    },
    {
        id: "countertop",
        name: "Countertop",
        icon: "🧱"
    },
    {
        id: "shelf",
        name: "Shelf",
        icon: "📚"
    },
    {
        id: "plant-rack",
        name: "Plant Rack",
        icon: "🪴"
    },
    {
        id: "floor",
        name: "Floor / Corner",
        icon: "🏠"
    },
    {
        id: "grow-tent",
        name: "Grow Tent",
        icon: "⛺"
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
   GENERATED PLAN INVALIDATION
========================================================= */

function clearGeneratedPlan(
    designSpace = {}
) {
    return {
        ...designSpace,
        layout: null,
        indoorLayout: null,
        plantingPlan: null,
        bedPlantingPlan: null,
        seasonalGuide: null,
        materials: null,
        buildPlan: null
    };
}


function sameStringArray(
    first = [],
    second = []
) {
    const left = [...first].sort();
    const right = [...second].sort();

    return (
        left.length === right.length &&
        left.every(
            (value, index) =>
                value === right[index]
        )
    );
}


function sameLocation(
    first,
    second
) {
    if (!first && !second) {
        return true;
    }

    if (!first || !second) {
        return false;
    }

    const firstLatitude =
        Number(
            first.latitude ??
            first.lat
        );

    const firstLongitude =
        Number(
            first.longitude ??
            first.lng ??
            first.lon
        );

    const secondLatitude =
        Number(
            second.latitude ??
            second.lat
        );

    const secondLongitude =
        Number(
            second.longitude ??
            second.lng ??
            second.lon
        );

    return (
        firstLatitude === secondLatitude &&
        firstLongitude === secondLongitude
    );
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


    const savedSpaceType =
        designSpace.spaceType ||
        "backyard";


    const isIndoorSpace =
        savedSpaceType ===
        "indoor";


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
        spaceHeight,
        setSpaceHeight
    ] = useState(
        designSpace.height
            ? String(
                designSpace.height
            )
            : ""
    );


    const [
        indoorSpaceType,
        setIndoorSpaceType
    ] = useState(
        designSpace.indoorSpaceType ||
        "shelf"
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
        spacePhoto,
        setSpacePhoto
    ] = useState(
        designSpace.spacePhoto ||
        null
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
        lastSpringFrost,
        setLastSpringFrost
    ] = useState(
        designSpace.lastSpringFrost ||
        ""
    );


    const [
        firstFallFrost,
        setFirstFallFrost
    ] = useState(
        designSpace.firstFallFrost ||
        ""
    );


    const [
        growingDataSource,
        setGrowingDataSource
    ] = useState(
        designSpace.growingDataSource ||
        ""
    );


    const [
        growingDataUpdatedAt,
        setGrowingDataUpdatedAt
    ] = useState(
        designSpace.growingDataUpdatedAt ||
        ""
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
        (
            designSpace.spaceType ===
            "indoor"
        )
            ? (
                Array.isArray(
                    designSpace.indoorPlantGoals
                )
                    ? designSpace.indoorPlantGoals
                    : []
            )
            : (
                Array.isArray(
                    designSpace.growGoals
                )
                    ? designSpace.growGoals
                    : []
            )
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
        ) > 0 &&
        (
            designSpace.spaceType !==
                "indoor" ||
            (
                Number(
                    designSpace.height
                ) > 0 &&
                Boolean(
                    designSpace.indoorSpaceType
                )
            )
        );


    const initialEnvironmentComplete =
        Boolean(
            gardenProfile?.type
        ) &&
        Boolean(
            gardenProfile?.sunlight
        ) &&
        (
            designSpace.spaceType ===
                "indoor" ||
            Boolean(
                gardenProfile?.hardinessZone
            )
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
        (
            designSpace.spaceType ===
            "indoor"
        )
            ? (
                Array.isArray(
                    designSpace.indoorPlantGoals
                ) &&
                designSpace.indoorPlantGoals.length >
                    0
            )
            : (
                Array.isArray(
                    designSpace.growGoals
                ) &&
                designSpace.growGoals.length >
                    0
            );


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

    const spaceStepRef =
        useRef(
            null
        );


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
        ) > 0 &&
        (
            !isIndoorSpace ||
            (
                Number(
                    designSpace.height
                ) > 0 &&
                Boolean(
                    designSpace.indoorSpaceType
                )
            )
        );


    const environmentComplete =
        Boolean(
            gardenProfile?.type
        ) &&
        Boolean(
            gardenProfile?.sunlight
        ) &&
        (
            isIndoorSpace ||
            Boolean(
                gardenProfile?.hardinessZone
            )
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
        isIndoorSpace
            ? (
                Array.isArray(
                    designSpace.indoorPlantGoals
                ) &&
                designSpace.indoorPlantGoals.length >
                    0
            )
            : (
                Array.isArray(
                    designSpace.growGoals
                ) &&
                designSpace.growGoals.length >
                    0
            );


    const designComplete =
        isIndoorSpace
            ? Boolean(
                designSpace.indoorLayout
            )
            : Boolean(
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
            name:
                isIndoorSpace
                    ? "Plants"
                    : "Crops",
            icon:
                isIndoorSpace
                    ? "🪴"
                    : "🥕",
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


    const numericHeight =
        Number(
            spaceHeight
        );


    const draftSpaceValid =
        numericWidth > 0 &&
        numericLength > 0 &&
        (
            spaceType !==
                "indoor" ||
            (
                numericHeight > 0 &&
                Boolean(
                    indoorSpaceType
                )
            )
        );


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
       PLANT / CROP FILTERING
    ===================================================== */

    const activePlantCatalog =
        isIndoorSpace
            ? indoorPlantData
            : cropPlanningData;


    const activePlantCategories =
        isIndoorSpace
            ? indoorPlantCategories
            : cropCategories;


    const normalizedCropSearch =
        cropSearch
            .trim()
            .toLowerCase();


    const filteredCrops =
        activePlantCatalog.filter(
            (plant) => {
                const plantCategory =
                    isIndoorSpace
                        ? plant.category
                        : plant.placementGroup;


                const matchesCategory =
                    cropCategory === "all" ||
                    plantCategory ===
                    cropCategory;


                const matchesSearch =
                    normalizedCropSearch === "" ||
                    plant.name
                        .toLowerCase()
                        .includes(
                            normalizedCropSearch
                        ) ||
                    plant.id
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
            return activePlantCatalog.length;
        }


        return activePlantCatalog.filter(
            (plant) =>
                (
                    isIndoorSpace
                        ? plant.category
                        : plant.placementGroup
                ) ===
                categoryId
        ).length;
    }


    /* =====================================================
       HOME DASHBOARD ACTIONS
    ===================================================== */

    function openSpaceBuilder(
        mode = "dimensions"
    ) {
        setSpaceMessage(
            ""
        );


        setSpaceExpanded(
            true
        );


        scrollToStep(
            spaceStepRef
        );


        if (
            mode ===
            "camera"
        ) {
            window.setTimeout(
                () => {
                    window.dispatchEvent(
                        new CustomEvent(
                            "garden-open-camera"
                        )
                    );
                },
                500
            );
        }
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
                spaceType ===
                    "indoor"
                    ? "Enter a valid width, depth, height, and indoor space type."
                    : "Enter a valid width and length."
            );

            return;
        }


        const spaceChanged =
            designSpace.spaceType !==
                spaceType ||
            Number(
                designSpace.width
            ) !==
                numericWidth ||
            Number(
                designSpace.length
            ) !==
                numericLength ||
            (
                spaceType ===
                    "indoor" &&
                (
                    Number(
                        designSpace.height
                    ) !==
                        numericHeight ||
                    (
                        designSpace.indoorSpaceType ||
                        "shelf"
                    ) !==
                        indoorSpaceType
                )
            ) ||
            (
                designSpace.unit ||
                "ft"
            ) !==
                spaceUnit ||
            (
                designSpace.surface ||
                "grass"
            ) !==
                spaceSurface;


        const nextDesignSpace =
            spaceChanged
                ? clearGeneratedPlan(
                    designSpace
                )
                : designSpace;


        if (
            designSpace.spaceType !==
            spaceType
        ) {
            setSelectedCrops(
                spaceType ===
                    "indoor"
                    ? (
                        Array.isArray(
                            designSpace.indoorPlantGoals
                        )
                            ? designSpace.indoorPlantGoals
                            : []
                    )
                    : (
                        Array.isArray(
                            designSpace.growGoals
                        )
                            ? designSpace.growGoals
                            : []
                    )
            );

            setCropCategory(
                "all"
            );

            setCropSearch(
                ""
            );

            if (
                spaceType ===
                    "indoor" &&
                ![
                    "container",
                    "hydroponic"
                ].includes(
                    gardenType
                )
            ) {
                setGardenType(
                    "container"
                );
            }



            if (
                spaceType ===
                "indoor"
            ) {
                setSpaceSurface(
                    "indoor-floor"
                );
            }
        }


        const updatedProfile = {
            ...(gardenProfile || {}),

            size:
                getGardenSizeFromArea(
                    draftSquareFeet
                ),

            designSpace: {
                ...nextDesignSpace,

                mode:
                    designSpace.mode ||
                    "dimensions",

                spaceType,

                width:
                    numericWidth,

                length:
                    numericLength,

                height:
                    spaceType ===
                        "indoor"
                        ? numericHeight
                        : null,

                indoorSpaceType:
                    spaceType ===
                        "indoor"
                        ? indoorSpaceType
                        : null,

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
                    ),

                spacePhoto:
                    spacePhoto ||
                    null
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
       AI GARDEN ASSISTANT — APPLY DRAFT
    ===================================================== */

    function applyGardenAssistantProposal(
        proposal
    ) {
        if (
            !proposal
        ) {
            return;
        }


        const assistantIndoor =
            proposal.environment ===
            "indoor";


        const nextSpaceType =
            assistantIndoor
                ? "indoor"
                : (
                    proposal.spaceType ||
                    spaceType
                );


        const nextUnit =
            proposal.dimensions?.unit ||
            spaceUnit ||
            "ft";


        const nextWidth =
            proposal.dimensions?.width ??
            (
                spaceWidth
                    ? Number(
                        spaceWidth
                    )
                    : null
            );


        const nextLength =
            proposal.dimensions?.length ??
            (
                spaceLength
                    ? Number(
                        spaceLength
                    )
                    : null
            );


        const nextHeight =
            assistantIndoor
                ? (
                    proposal.dimensions?.height ??
                    (
                        spaceHeight
                            ? Number(
                                spaceHeight
                            )
                            : null
                    )
                )
                : null;


        const nextIndoorSpaceType =
            assistantIndoor
                ? (
                    proposal.indoorSpaceType ||
                    indoorSpaceType ||
                    "shelf"
                )
                : null;


        const nextSunlight =
            proposal.sunlight ||
            sunlight ||
            (
                assistantIndoor
                    ? "partial"
                    : ""
            );


        const nextGardenType =
            proposal.gardenType ||
            (
                assistantIndoor
                    ? "container"
                    : gardenType
            );


        const nextFeatures =
            Array.isArray(
                proposal.features
            ) &&
            proposal.features.length >
                0
                ? proposal.features
                : selectedFeatures;


        const nextSelections =
            Array.isArray(
                proposal.selections
            ) &&
            proposal.selections.length >
                0
                ? proposal.selections
                : (
                    assistantIndoor ===
                    isIndoorSpace
                        ? selectedCrops
                        : []
                );


        setSpaceType(
            nextSpaceType
        );


        setSpaceWidth(
            nextWidth
                ? String(
                    nextWidth
                )
                : ""
        );


        setSpaceLength(
            nextLength
                ? String(
                    nextLength
                )
                : ""
        );


        setSpaceHeight(
            nextHeight
                ? String(
                    nextHeight
                )
                : ""
        );


        setIndoorSpaceType(
            nextIndoorSpaceType ||
            "shelf"
        );


        setSpaceUnit(
            nextUnit
        );


        setSpaceSurface(
            assistantIndoor
                ? "indoor-floor"
                : (
                    nextSpaceType ===
                    "patio"
                        ? "concrete"
                        : nextSpaceType ===
                          "balcony"
                            ? "concrete"
                            : spaceSurface ||
                              "grass"
                )
        );


        setGardenType(
            nextGardenType
        );


        setSunlight(
            nextSunlight
        );


        setSelectedFeatures(
            nextFeatures
        );


        setNoAdditionalFeatures(
            false
        );


        setSelectedCrops(
            nextSelections
        );


        setCropCategory(
            "all"
        );


        setCropSearch(
            ""
        );


        const currentDesignSpace =
            gardenProfile?.designSpace ||
            {};


        const nextDesignSpace =
            clearGeneratedPlan(
                currentDesignSpace
            );


        const areaSquareFeet =
            nextWidth &&
            nextLength
                ? (
                    nextUnit ===
                    "m"
                        ? nextWidth *
                          nextLength *
                          10.7639
                        : nextWidth *
                          nextLength
                )
                : (
                    currentDesignSpace.areaSquareFeet ||
                    null
                );


        const updatedProfile = {
            ...(gardenProfile || {}),

            type:
                nextGardenType ||
                gardenProfile?.type ||
                "",

            sunlight:
                nextSunlight ||
                gardenProfile?.sunlight ||
                "",

            size:
                areaSquareFeet
                    ? getGardenSizeFromArea(
                        areaSquareFeet
                    )
                    : gardenProfile?.size,

            designSpace: {
                ...nextDesignSpace,

                mode:
                    "assistant",

                assistantSourceText:
                    proposal.sourceText,

                assistantUpdatedAt:
                    new Date()
                        .toISOString(),

                spaceType:
                    nextSpaceType,

                width:
                    nextWidth,

                length:
                    nextLength,

                height:
                    assistantIndoor
                        ? nextHeight
                        : null,

                indoorSpaceType:
                    assistantIndoor
                        ? nextIndoorSpaceType
                        : null,

                unit:
                    nextUnit,

                surface:
                    assistantIndoor
                        ? "indoor-floor"
                        : (
                            nextSpaceType ===
                            "patio" ||
                            nextSpaceType ===
                            "balcony"
                                ? "concrete"
                                : (
                                    currentDesignSpace.surface ||
                                    "grass"
                                )
                        ),

                areaSquareFeet:
                    areaSquareFeet
                        ? Number(
                            areaSquareFeet.toFixed(
                                2
                            )
                        )
                        : null,

                spacePhoto:
                    spacePhoto ||
                    currentDesignSpace.spacePhoto ||
                    null,

                features:
                    nextFeatures,

                featuresConfirmed:
                    false,

                plantSelectionMode:
                    assistantIndoor
                        ? "indoor"
                        : "outdoor",

                ...(
                    assistantIndoor
                        ? {
                            indoorPlantGoals:
                                nextSelections,

                            growGoals:
                                []
                        }
                        : {
                            growGoals:
                                nextSelections,

                            indoorPlantGoals:
                                []
                        }
                )
            }
        };


        onSaveGardenProfile(
            updatedProfile
        );


        setSpaceExpanded(
            true
        );


        setEnvironmentExpanded(
            false
        );


        setFeaturesExpanded(
            false
        );


        setCropsExpanded(
            false
        );


        setSpaceMessage(
            ""
        );


        setEnvironmentMessage(
            ""
        );


        setFeaturesMessage(
            ""
        );


        setCropsMessage(
            ""
        );


        scrollToStep(
            spaceStepRef
        );
    }


    /* =====================================================
       AUTOMATIC LOCAL GROWING DATA
    ===================================================== */

    function handleGrowingDataResolved(
        data
    ) {
        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "location"
            )
        ) {
            setGardenLocation(
                data.location ||
                null
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "hardinessZone"
            )
        ) {
            setHardinessZone(
                data.hardinessZone ||
                ""
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "lastSpringFrost"
            )
        ) {
            setLastSpringFrost(
                data.lastSpringFrost ||
                ""
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "firstFallFrost"
            )
        ) {
            setFirstFallFrost(
                data.firstFallFrost ||
                ""
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "growingDataSource"
            )
        ) {
            setGrowingDataSource(
                data.growingDataSource ||
                ""
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "growingDataUpdatedAt"
            )
        ) {
            setGrowingDataUpdatedAt(
                data.growingDataUpdatedAt ||
                ""
            );
        }


        setEnvironmentMessage(
            ""
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
            !isIndoorSpace &&
            !hardinessZone
        ) {
            setEnvironmentMessage(
                "Choose your USDA growing zone."
            );

            return;
        }


        const environmentChanged =
            gardenProfile?.type !== gardenType ||
            gardenProfile?.sunlight !== sunlight ||
            (
                gardenProfile?.hardinessZone ||
                designSpace.hardinessZone ||
                ""
            ) !== hardinessZone ||
            (designSpace.lastSpringFrost || "") !== lastSpringFrost ||
            (designSpace.firstFallFrost || "") !== firstFallFrost ||
            !sameLocation(
                designSpace.location,
                gardenLocation
            );


        const nextDesignSpace =
            environmentChanged
                ? clearGeneratedPlan(
                    designSpace
                )
                : designSpace;


        const updatedProfile = {
            ...(gardenProfile || {}),

            type:
                gardenType,

            sunlight,

            hardinessZone,

            designSpace: {
                ...nextDesignSpace,

                hardinessZone,

                location:
                    gardenLocation,

                lastSpringFrost,

                firstFallFrost,

                growingDataSource,

                growingDataUpdatedAt
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
            (
                currentFeatures
            ) => {
                if (
                    currentFeatures.includes(
                        featureId
                    )
                ) {
                    return currentFeatures.filter(
                        (id) =>
                            id !==
                            featureId
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


        const featuresChanged =
            !sameStringArray(
                designSpace.features || [],
                selectedFeatures
            );


        const nextDesignSpace =
            featuresChanged
                ? clearGeneratedPlan(
                    designSpace
                )
                : designSpace;


        const updatedProfile = {
            ...(gardenProfile || {}),

            designSpace: {
                ...nextDesignSpace,

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
            (
                currentCrops
            ) => {
                if (
                    currentCrops.includes(
                        cropId
                    )
                ) {
                    return currentCrops.filter(
                        (id) =>
                            id !==
                            cropId
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
                isIndoorSpace
                    ? "Choose at least one indoor plant."
                    : "Choose at least one crop you want to grow."
            );

            return;
        }


        const savedSelections =
            isIndoorSpace
                ? (
                    designSpace.indoorPlantGoals ||
                    []
                )
                : (
                    designSpace.growGoals ||
                    []
                );


        const cropsChanged =
            !sameStringArray(
                savedSelections,
                selectedCrops
            );


        const nextDesignSpace =
            cropsChanged
                ? clearGeneratedPlan(
                    designSpace
                )
                : designSpace;


        const updatedProfile = {
            ...(gardenProfile || {}),

            designSpace: {
                ...nextDesignSpace,

                ...(
                    isIndoorSpace
                        ? {
                            indoorPlantGoals:
                                selectedCrops,

                            plantSelectionMode:
                                "indoor"
                        }
                        : {
                            growGoals:
                                selectedCrops,

                            plantSelectionMode:
                                "outdoor"
                        }
                )
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


    const savedIndoorSpace =
        indoorSpaceTypes.find(
            (item) =>
                item.id ===
                designSpace.indoorSpaceType
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


    const savedSelectionIds =
        isIndoorSpace
            ? (
                Array.isArray(
                    designSpace.indoorPlantGoals
                )
                    ? designSpace.indoorPlantGoals
                    : []
            )
            : (
                Array.isArray(
                    designSpace.growGoals
                )
                    ? designSpace.growGoals
                    : []
            );


    const savedCropData =
        savedSelectionIds
            .map(
                (plantId) =>
                    activePlantCatalog.find(
                        (plant) =>
                            plant.id ===
                            plantId
                    )
            )
            .filter(
                Boolean
            );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app-container leafy-app home-page">
            <Header />


            <WeatherCard />


            <section className="leafy-home-welcome">

                <div>

                    <span className="leafy-home-kicker">
                        🌿 START YOUR GARDEN
                    </span>


                    <h2>
                        Build Your Garden
                    </h2>


                    <p>
                        A few simple steps from your real space to a garden plan you can actually build.
                    </p>

                </div>


                <span className="leafy-home-welcome-art" aria-hidden="true">
                    <span>🪴</span>
                    <small>GROW</small>
                </span>

            </section>


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
                                Your Garden Journey
                            </h2>

                            <p>
                                {
                                    gardenComplete
                                        ? "Your garden plan is ready to bring to life."
                                        : "Follow the path from space setup to build day."
                                }
                            </p>
                        </div>
                    </div>

                    <span className="home-build-progress-percent">
                        {
                            progressPercent
                        }%
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
                        } of {
                            buildStages.length
                        } steps complete
                    </strong>

                    {
                        nextStage && (
                            <span>
                                Next: {
                                    nextStage.icon
                                } {
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
                                                Step {
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


            <div className="leafy-home-action-intro">
                <span>Choose how you want to begin</span>
                <small>Measure it yourself or use a photo from your phone.</small>
            </div>


            <section className="leafy-home-action-grid">

                <button
                    type="button"
                    className="leafy-home-action leafy-home-action-primary"
                    onClick={() =>
                        openSpaceBuilder(
                            "dimensions"
                        )
                    }
                >

                    <span className="leafy-home-action-icon">
                        📏
                    </span>


                    <div>

                        <small>
                            START MANUALLY
                        </small>


                        <strong>
                            Enter Dimensions
                        </strong>


                        <p>
                            Add the size of your real growing space.
                        </p>

                    </div>


                    <span className="leafy-home-action-arrow">
                        →
                    </span>

                </button>


                <button
                    type="button"
                    className="leafy-home-action leafy-home-action-camera"
                    onClick={() =>
                        openSpaceBuilder(
                            "camera"
                        )
                    }
                >

                    <span className="leafy-home-action-icon">
                        📷
                    </span>


                    <div>

                        <small>
                            PHOTO MODE
                        </small>


                        <strong>
                            Use Your Camera
                        </strong>


                        <p>
                            Capture and map the space from your phone.
                        </p>

                    </div>


                    <span className="leafy-home-action-arrow">
                        →
                    </span>

                </button>

            </section>


            <SustainabilityScore
                score={
                    sustainabilityScore
                }
            />


            <section className="leafy-inspiration-section">

                <div className="leafy-section-heading">

                    <div>

                        <span className="leafy-section-icon">
                            🌼
                        </span>


                        <div>

                            <small>
                                GET INSPIRED
                            </small>


                            <h2>
                                Inspiration for Your Garden
                            </h2>

                        </div>

                    </div>


                    <span className="leafy-section-more">
                        Pick a direction
                    </span>

                </div>


                <div className="leafy-inspiration-grid">

                    <button
                        type="button"
                        className="leafy-inspiration-card inspiration-small-space"
                        onClick={() =>
                            openSpaceBuilder(
                                "dimensions"
                            )
                        }
                    >

                        <span>
                            🪴
                        </span>


                        <div>

                            <strong>
                                Small Space,
                                Big Impact
                            </strong>


                            <small>
                                Containers • Vertical
                            </small>

                        </div>

                    </button>


                    <button
                        type="button"
                        className="leafy-inspiration-card inspiration-pollinator"
                        onClick={() =>
                            openSpaceBuilder(
                                "dimensions"
                            )
                        }
                    >

                        <span>
                            🦋
                        </span>


                        <div>

                            <strong>
                                Pollinator
                                Paradise
                            </strong>


                            <small>
                                Flowers • Herbs
                            </small>

                        </div>

                    </button>


                    <button
                        type="button"
                        className="leafy-inspiration-card inspiration-edible"
                        onClick={() =>
                            openSpaceBuilder(
                                "dimensions"
                            )
                        }
                    >

                        <span>
                            🍅
                        </span>


                        <div>

                            <strong>
                                Edible
                                Everywhere
                            </strong>


                            <small>
                                Food • Herbs
                            </small>

                        </div>

                    </button>

                </div>

            </section>


            <GardenAssistant
                onApplyProposal={
                    applyGardenAssistantProposal
                }
            />


            {/* =================================================
                STEP 1 — DEFINE SPACE
            ================================================= */}

            <section
                ref={
                    spaceStepRef
                }
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
                            Tell us how much usable growing space you have.
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
                                        } {
                                            savedSpace?.name ||
                                            "Garden Space"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            designSpace.width
                                        } × {
                                            designSpace.length
                                        } {
                                            isIndoorSpace
                                                ? `× ${designSpace.height} `
                                                : ""
                                        }{
                                            designSpace.unit ||
                                            "ft"
                                        } • {
                                            Number(
                                                designSpace.areaSquareFeet ||
                                                0
                                            ).toFixed(
                                                0
                                            )
                                        } sq ft
                                        {
                                            isIndoorSpace &&
                                            savedIndoorSpace
                                                ? ` • ${savedIndoorSpace.icon} ${savedIndoorSpace.name}`
                                                : ""
                                        }
                                    </span>
                                </div>

                                {
                                    designSpace.spacePhoto?.dataUrl && (

                                        <img
                                            className="home-space-photo-thumbnail"
                                            src={
                                                designSpace.spacePhoto.dataUrl
                                            }
                                            alt="Saved garden space"
                                        />

                                    )
                                }


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
                                                        onClick={() => {
                                                            setSpaceType(
                                                                space.id
                                                            );

                                                            if (
                                                                space.id ===
                                                                "indoor"
                                                            ) {
                                                                setSpaceSurface(
                                                                    "indoor-floor"
                                                                );
                                                            }
                                                        }}
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


                                {
                                    spaceType ===
                                    "indoor" && (

                                        <div className="home-builder-field-group">

                                            <h3>
                                                What kind of indoor space is it?
                                            </h3>


                                            <p className="home-builder-helper-text">
                                                Choose the surface or structure that will actually hold the plants.
                                            </p>


                                            <div className="home-builder-choice-grid">

                                                {
                                                    indoorSpaceTypes.map(
                                                        (space) => (

                                                            <button
                                                                type="button"
                                                                key={
                                                                    space.id
                                                                }
                                                                className={
                                                                    indoorSpaceType ===
                                                                    space.id
                                                                        ? "home-builder-choice selected"
                                                                        : "home-builder-choice"
                                                                }
                                                                onClick={() =>
                                                                    setIndoorSpaceType(
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

                                    )
                                }


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


                                        {
                                            spaceType ===
                                            "indoor" && (

                                                <label>
                                                    Height

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="0.1"
                                                        inputMode="decimal"
                                                        value={
                                                            spaceHeight
                                                        }
                                                        onChange={
                                                            (event) =>
                                                                setSpaceHeight(
                                                                    event.target.value
                                                                )
                                                        }
                                                        placeholder="6"
                                                    />
                                                </label>

                                            )
                                        }


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
                                                        } × {
                                                            spaceLength
                                                        } {
                                                            spaceType ===
                                                            "indoor"
                                                                ? `× ${spaceHeight} `
                                                                : ""
                                                        }{
                                                            spaceUnit
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            draftSquareFeet
                                                                .toFixed(
                                                                    1
                                                                )
                                                        } sq ft
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
                                            surfaceTypes
                                                .filter(
                                                    (surface) =>
                                                        spaceType !==
                                                            "indoor" ||
                                                        [
                                                            "indoor-floor",
                                                            "other"
                                                        ].includes(
                                                            surface.id
                                                        )
                                                )
                                                .map(
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


                                <div className="home-builder-field-group">

                                    <GardenSpacePhoto
                                        photo={
                                            spacePhoto
                                        }
                                        onChange={
                                            setSpacePhoto
                                        }
                                        spaceType={
                                            spaceType
                                        }
                                        knownDimensions={{
                                            width:
                                                spaceWidth,

                                            length:
                                                spaceLength,

                                            height:
                                                spaceHeight
                                        }}
                                        unit={
                                            spaceUnit
                                        }
                                    />

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
                            {
                                isIndoorSpace
                                    ? "💡 Indoor Growing Conditions"
                                    : "☀️ Growing Conditions"
                            }
                        </h2>

                        <p>
                            {
                                isIndoorSpace
                                    ? "Choose the indoor growing system and available light for this space."
                                    : "Add sunlight, local growing conditions, and your growing system."
                            }
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
                                    Complete Step 1 before setting your growing conditions.
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
                                            } {
                                                savedGardenSystem?.name ||
                                                "Garden"
                                            }
                                        </strong>

                                        <span>
                                            {
                                                isIndoorSpace
                                                    ? `${savedSunlightName} • Indoor setup`
                                                    : (
                                                        <>
                                                            {
                                                                savedSunlightName
                                                            } • Zone {
                                                                gardenProfile
                                                                    ?.hardinessZone
                                                            }
                                                            {
                                                                designSpace.location
                                                                    ? " • Location ✓"
                                                                    : ""
                                                            }
                                                            {
                                                                designSpace.lastSpringFrost ||
                                                                designSpace.firstFallFrost
                                                                    ? " • Frost data ✓"
                                                                    : ""
                                                            }
                                                        </>
                                                    )
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
                                                )
                                                    .filter(
                                                        ([key]) =>
                                                            !isIndoorSpace ||
                                                            [
                                                                "container",
                                                                "hydroponic"
                                                            ].includes(
                                                                key
                                                            )
                                                    )
                                                    .map(
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
                                            {
                                                isIndoorSpace
                                                    ? "Available Light"
                                                    : "Daily Sunlight"
                                            }
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


                                    {
                                        !isIndoorSpace && (
                                            <>
                                    {/* =========================
                                        AUTOMATIC LOCAL DATA
                                    ========================= */}

                                    <div className="home-builder-field-group">
                                        <h3>
                                            Local Growing Data
                                        </h3>

                                        <LocalGrowingDataCard
                                            location={
                                                gardenLocation
                                            }
                                            hardinessZone={
                                                hardinessZone
                                            }
                                            lastSpringFrost={
                                                lastSpringFrost
                                            }
                                            firstFallFrost={
                                                firstFallFrost
                                            }
                                            onDataResolved={
                                                handleGrowingDataResolved
                                            }
                                        />
                                    </div>


                                    {/* =========================
                                        HARDINESS ZONE
                                    ========================= */}

                                    <div className="home-builder-field-group">
                                        <h3>
                                            Growing Zone
                                        </h3>

                                        <p className="home-builder-helper-text">
                                            Review the automatic result or select the correct zone manually.
                                        </p>


                                        <label className="home-builder-select-field">
                                            <span>
                                                🌡️ Hardiness Zone
                                            </span>

                                            <select
                                                value={
                                                    hardinessZone
                                                }
                                                onChange={
                                                    (event) => {
                                                        setHardinessZone(
                                                            event.target.value
                                                        );

                                                        setGrowingDataSource(
                                                            ""
                                                        );
                                                    }
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
                                                                Zone {zone} — {
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
                                                            Zone {
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


                                    {/* =========================
                                        FROST DATES
                                    ========================= */}

                                    <div className="home-builder-field-group">
                                        <h3>
                                            Average Frost Dates
                                        </h3>

                                        <p className="home-builder-helper-text">
                                            These are planning averages, not weather forecasts. Adjust them if you have better local information.
                                        </p>


                                        <div className="home-frost-date-grid">
                                            <label>
                                                🌱 Last Spring Frost

                                                <input
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


                                            <label>
                                                🍂 First Fall Frost

                                                <input
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
                                    </div>
                                            </>
                                        )
                                    }


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
                            Choose the structures and systems you want included in your garden.
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
                                    Complete your growing conditions first.
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
                                            Select as many as you want. We will use these choices when generating the layout and materials list.
                                        </p>


                                        <div className="home-feature-grid">
                                            {
                                                gardenFeatureOptions
                                                    .filter(
                                                        (feature) =>
                                                            !isIndoorSpace ||
                                                            [
                                                                "containers",
                                                                "vertical-growing",
                                                                "irrigation",
                                                                "hydroponics"
                                                            ].includes(
                                                                feature.id
                                                            )
                                                    )
                                                    .map(
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
                                                Keep the design simple without adding any of the structures above.
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
                                                    } {
                                                        selectedFeatures.length === 1
                                                            ? "feature selected"
                                                            : "features selected"
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
                                                                        } {
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
                            {
                                isIndoorSpace
                                    ? "🪴 Choose Indoor Plants"
                                    : "🥕 Choose Crops"
                            }
                        </h2>

                        <p>
                            {
                                isIndoorSpace
                                    ? "Choose the houseplants, herbs, or indoor edibles you want this space designed around."
                                    : "Choose what you want your garden designed to grow."
                            }
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
                                    Complete your garden features first.
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
                                            } {
                                                savedCropData.length === 1
                                                    ? (
                                                        isIndoorSpace
                                                            ? "plant selected"
                                                            : "crop selected"
                                                    )
                                                    : (
                                                        isIndoorSpace
                                                            ? "plants selected"
                                                            : "crops selected"
                                                    )
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
                                                } {
                                                    selectedCrops.length === 1
                                                        ? (
                                                            isIndoorSpace
                                                                ? "plant selected"
                                                                : "crop selected"
                                                        )
                                                        : (
                                                            isIndoorSpace
                                                                ? "plants selected"
                                                                : "crops selected"
                                                        )
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    isIndoorSpace
                                                        ? "Choose every indoor plant you want the future room layout to consider."
                                                        : "Choose everything you would like the design to consider."
                                                }
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
                                            placeholder={
                                                isIndoorSpace
                                                    ? "Search pothos, snake plant, basil..."
                                                    : "Search tomatoes, broccoli, potatoes..."
                                            }
                                        />
                                    </label>


                                    <div className="home-crop-category-scroll">
                                        {
                                            activePlantCategories.map(
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

                                                                            {
                                                                                isIndoorSpace
                                                                                    ? (
                                                                                        <>
                                                                                            <small>
                                                                                                {
                                                                                                    crop.lightLabel
                                                                                                }
                                                                                            </small>

                                                                                            <small>
                                                                                                {
                                                                                                    crop.potDiameterInches
                                                                                                }

                                                                                                {" in pot • "}

                                                                                                {
                                                                                                    crop.difficulty
                                                                                                }
                                                                                            </small>
                                                                                        </>
                                                                                    )
                                                                                    : (
                                                                                        <>
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
                                                                                        </>
                                                                                    )
                                                                            }
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
                                                        {
                                                            isIndoorSpace
                                                                ? "No indoor plants found"
                                                                : "No crops found"
                                                        }
                                                    </strong>

                                                    <p>
                                                        {
                                                            isIndoorSpace
                                                                ? "Try another search or indoor plant category."
                                                                : "Try another search or crop category."
                                                        }
                                                    </p>
                                                </div>
                                            )
                                    }


                                    {
                                        selectedCrops.length > 0 && (
                                            <div className="home-selected-crops">
                                                <strong>
                                                    {
                                                        isIndoorSpace
                                                            ? "Your Indoor Plants"
                                                            : "Your Garden Crops"
                                                    }
                                                </strong>

                                                <div>
                                                    {
                                                        selectedCrops.map(
                                                            (cropId) => {
                                                                const crop =
                                                                    activePlantCatalog.find(
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
                                                                        } {
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
                                        {
                                            isIndoorSpace
                                                ? "Save Plants & Continue →"
                                                : "Save Crops & Continue →"
                                        }
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
                STEP 6 — MATERIALS & BUILD
            ================================================= */}

            <HomeGardenBuildStep
                gardenProfile={
                    gardenProfile
                }
                onSaveGardenProfile={
                    onSaveGardenProfile
                }
            />


            {/* =================================================
                CURRENT GARDEN DASHBOARD
            ================================================= */}

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


            <BottomNav />
        </div>
    );
}


export default Home;