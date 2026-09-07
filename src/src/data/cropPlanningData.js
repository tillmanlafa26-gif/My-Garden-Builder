/* =========================================================
   MY GARDEN BUILDER
   CORE CROP PLANNING DATA

   This is the internal crop library used by:
   - Garden Builder
   - Crop Search
   - Crop Categories
   - Garden Layout
   - Planting Plans
   - Seasonal Guidance
   - Harvest Scheduling
========================================================= */


export const cropPlanningData = [


    /* =====================================================
       TOMATO
    ===================================================== */

    {
        id: "tomato",

        name: "Tomatoes",

        icon: "🍅",

        squareFeetPerPlant: 4,

        minimumSunlight: "full",

        support: true,

        containerFriendly: true,

        placementGroup: "fruiting",

        canopy: "tall",

        growthStyle: "upright",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 6,

        daysToMaturity: 75,

        seedToTransplantDays: 42,

        harvestWindowDays: 21,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "basil",
            "lettuce",
            "carrot",
            "onion"
        ]
    },


    /* =====================================================
       PEPPER
    ===================================================== */

    {
        id: "pepper",

        name: "Peppers",

        icon: "🌶️",

        squareFeetPerPlant: 2,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "fruiting",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 8,

        daysToMaturity: 75,

        seedToTransplantDays: 56,

        harvestWindowDays: 28,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "basil",
            "onion",
            "carrot"
        ]
    },


    /* =====================================================
       CUCUMBER
    ===================================================== */

    {
        id: "cucumber",

        name: "Cucumbers",

        icon: "🥒",

        squareFeetPerPlant: 2,

        minimumSunlight: "full",

        support: true,

        containerFriendly: true,

        placementGroup: "vining",

        canopy: "tall",

        growthStyle: "spreading",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 3,

        daysToMaturity: 55,

        seedToTransplantDays: 21,

        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "beans",
            "radish",
            "lettuce"
        ]
    },


    /* =====================================================
       POLE BEANS
    ===================================================== */

    {
        id: "beans",

        name: "Pole Beans",

        icon: "🫘",

        squareFeetPerPlant: 1,

        minimumSunlight: "full",

        support: true,

        containerFriendly: true,

        placementGroup: "vining",

        canopy: "tall",

        growthStyle: "climbing",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 1,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 0,

        daysToMaturity: 60,

        seedToTransplantDays: 0,

        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "corn",
            "cucumber",
            "carrot",
            "potato"
        ]
    },


    /* =====================================================
       LETTUCE
    ===================================================== */

    {
        id: "lettuce",

        name: "Lettuce",

        icon: "🥬",

        squareFeetPerPlant: 0.35,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 8,

        indoorStartWeeks: 0,

        daysToMaturity: 45,

        seedToTransplantDays: 28,

        harvestWindowDays: 14,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "carrot",
            "radish",
            "cucumber",
            "tomato"
        ]
    },


    /* =====================================================
       KALE
    ===================================================== */

    {
        id: "kale",

        name: "Kale",

        icon: "🥬",

        squareFeetPerPlant: 1,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 10,

        indoorStartWeeks: 0,

        daysToMaturity: 55,

        seedToTransplantDays: 28,

        harvestWindowDays: 30,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "beet",
            "onion",
            "celery"
        ]
    },


    /* =====================================================
       CARROT
    ===================================================== */

    {
        id: "carrot",

        name: "Carrots",

        icon: "🥕",

        squareFeetPerPlant: 0.2,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "root",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 3,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 10,

        indoorStartWeeks: 0,

        daysToMaturity: 70,

        seedToTransplantDays: 0,

        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "lettuce",
            "onion",
            "tomato",
            "peas"
        ]
    },


    /* =====================================================
       RADISH
    ===================================================== */

    {
        id: "radish",

        name: "Radishes",

        icon: "🔴",

        squareFeetPerPlant: 0.15,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "root",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 6,

        indoorStartWeeks: 0,

        daysToMaturity: 28,

        seedToTransplantDays: 0,

        harvestWindowDays: 10,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "lettuce",
            "cucumber",
            "peas"
        ]
    },


    /* =====================================================
       BASIL
    ===================================================== */

    {
        id: "basil",

        name: "Basil",

        icon: "🌿",

        squareFeetPerPlant: 0.5,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "herb",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 6,

        daysToMaturity: 60,

        seedToTransplantDays: 42,

        harvestWindowDays: 30,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "tomato",
            "pepper"
        ]
    },


    /* =====================================================
       STRAWBERRY
    ===================================================== */

    {
        id: "strawberry",

        name: "Strawberries",

        icon: "🍓",

        squareFeetPerPlant: 0.75,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "fruiting",

        canopy: "low",

        growthStyle: "spreading",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 2,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 8,

        indoorStartWeeks: 0,

        daysToMaturity: 90,

        seedToTransplantDays: 0,

        harvestWindowDays: 28,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "lettuce",
            "spinach",
            "onion"
        ]
    },


    /* =====================================================
       BROCCOLI
    ===================================================== */

    {
        id: "broccoli",

        name: "Broccoli",

        icon: "🥦",

        squareFeetPerPlant: 1.5,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 5,

        daysToMaturity: 70,

        seedToTransplantDays: 35,

        harvestWindowDays: 14,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "onion",
            "celery",
            "beet"
        ]
    },


    /* =====================================================
       CAULIFLOWER
    ===================================================== */

    {
        id: "cauliflower",

        name: "Cauliflower",

        icon: "🥦",

        squareFeetPerPlant: 1.5,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 5,

        daysToMaturity: 75,

        seedToTransplantDays: 35,

        harvestWindowDays: 10,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "onion",
            "celery",
            "beet"
        ]
    },


    /* =====================================================
       CABBAGE
    ===================================================== */

    {
        id: "cabbage",

        name: "Cabbage",

        icon: "🥬",

        squareFeetPerPlant: 1.5,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 6,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 5,

        daysToMaturity: 70,

        seedToTransplantDays: 35,

        harvestWindowDays: 14,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "onion",
            "celery",
            "beet",
            "potato"
        ]
    },


    /* =====================================================
       SPINACH
    ===================================================== */

    {
        id: "spinach",

        name: "Spinach",

        icon: "🥬",

        squareFeetPerPlant: 0.25,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 6,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 8,

        indoorStartWeeks: 0,

        daysToMaturity: 40,

        seedToTransplantDays: 0,

        harvestWindowDays: 14,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "strawberry",
            "peas",
            "radish"
        ]
    },


    /* =====================================================
       PEAS
    ===================================================== */

    {
        id: "peas",

        name: "Peas",

        icon: "🫛",

        squareFeetPerPlant: 0.25,

        minimumSunlight: "full",

        support: true,

        containerFriendly: true,

        placementGroup: "vining",

        canopy: "tall",

        growthStyle: "climbing",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 6,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 10,

        indoorStartWeeks: 0,

        daysToMaturity: 60,

        seedToTransplantDays: 0,

        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "carrot",
            "radish",
            "spinach"
        ]
    },


    /* =====================================================
       SWEET CORN
    ===================================================== */

    {
        id: "corn",

        name: "Sweet Corn",

        icon: "🌽",

        squareFeetPerPlant: 1,

        minimumSunlight: "full",

        support: false,

        containerFriendly: false,

        placementGroup: "fruiting",

        canopy: "tall",

        growthStyle: "upright",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 0,

        daysToMaturity: 80,

        seedToTransplantDays: 0,

        harvestWindowDays: 14,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "beans",
            "cucumber",
            "zucchini"
        ]
    },


    /* =====================================================
       ZUCCHINI
    ===================================================== */

    {
        id: "zucchini",

        name: "Zucchini",

        icon: "🥒",

        squareFeetPerPlant: 9,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "fruiting",

        canopy: "medium",

        growthStyle: "spreading",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 1,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 3,

        daysToMaturity: 50,

        seedToTransplantDays: 21,

        harvestWindowDays: 30,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "corn",
            "beans",
            "radish"
        ]
    },


    /* =====================================================
       EGGPLANT
    ===================================================== */

    {
        id: "eggplant",

        name: "Eggplant",

        icon: "🍆",

        squareFeetPerPlant: 2,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "fruiting",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 2,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 8,

        daysToMaturity: 75,

        seedToTransplantDays: 56,

        harvestWindowDays: 28,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "beans",
            "pepper",
            "basil"
        ]
    },


    /* =====================================================
       ONION
    ===================================================== */

    {
        id: "onion",

        name: "Onions",

        icon: "🧅",

        squareFeetPerPlant: 0.15,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "root",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 8,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 8,

        daysToMaturity: 100,

        seedToTransplantDays: 56,

        harvestWindowDays: 21,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "carrot",
            "broccoli",
            "cabbage",
            "tomato"
        ]
    },


    /* =====================================================
       SWEET POTATO
    ===================================================== */

    {
        id: "sweet-potato",

        name: "Sweet Potatoes",

        icon: "🍠",

        squareFeetPerPlant: 3,

        minimumSunlight: "full",

        support: false,

        containerFriendly: false,

        placementGroup: "root",

        canopy: "low",

        growthStyle: "spreading",

        seasonType: "warm",

        frostSensitive: true,

        weeksBeforeLastFrost: 0,

        weeksAfterLastFrost: 3,

        weeksBeforeFirstFallFrost: 0,

        indoorStartWeeks: 0,

        daysToMaturity: 100,

        seedToTransplantDays: 0,

        harvestWindowDays: 21,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "beans",
            "beet"
        ]
    },


    /* =====================================================
       POTATO
    ===================================================== */

    {
        id: "potato",

        name: "Potatoes",

        icon: "🥔",

        squareFeetPerPlant: 1,

        minimumSunlight: "full",

        support: false,

        containerFriendly: false,

        placementGroup: "root",

        canopy: "medium",

        growthStyle: "spreading",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 2,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 0,

        daysToMaturity: 90,

        seedToTransplantDays: 0,

        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "beans",
            "cabbage",
            "corn"
        ]
    },


    /* =====================================================
       BEET
    ===================================================== */

    {
        id: "beet",

        name: "Beets",

        icon: "🟣",

        squareFeetPerPlant: 0.2,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "root",

        canopy: "low",

        growthStyle: "compact",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 4,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 8,

        indoorStartWeeks: 0,

        daysToMaturity: 55,

        seedToTransplantDays: 0,

        harvestWindowDays: 14,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "onion",
            "kale",
            "broccoli"
        ]
    },


    /* =====================================================
       CELERY
    ===================================================== */

    {
        id: "celery",

        name: "Celery",

        icon: "🥬",

        squareFeetPerPlant: 0.5,

        minimumSunlight: "partial",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "medium",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 8,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 12,

        indoorStartWeeks: 10,

        daysToMaturity: 100,

        seedToTransplantDays: 70,

        harvestWindowDays: 21,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "broccoli",
            "cabbage",
            "cauliflower"
        ]
    },


    /* =====================================================
       BRUSSELS SPROUTS
    ===================================================== */

    {
        id: "brussels-sprouts",

        name: "Brussels Sprouts",

        icon: "🥬",

        squareFeetPerPlant: 1.5,

        minimumSunlight: "full",

        support: false,

        containerFriendly: true,

        placementGroup: "leafy",

        canopy: "tall",

        growthStyle: "upright",

        seasonType: "cool",

        frostSensitive: false,

        weeksBeforeLastFrost: 6,

        weeksAfterLastFrost: 0,

        weeksBeforeFirstFallFrost: 16,

        indoorStartWeeks: 6,

        daysToMaturity: 100,

        seedToTransplantDays: 42,

        harvestWindowDays: 30,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "onion",
            "beet",
            "celery"
        ]
    }

];


/* =========================================================
   GET CROP BY ID

   Example:

   const tomato = getCropById("tomato");

========================================================= */

export function getCropById(
    id
) {

    return (
        cropPlanningData.find(
            (crop) =>
                crop.id ===
                id
        ) ||
        null
    );

}