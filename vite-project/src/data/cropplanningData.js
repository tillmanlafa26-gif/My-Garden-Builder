export const cropPlanningData = [
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

        startIndoorsWeeksBeforeLastFrost: 6,
        transplantWeeksAfterLastFrost: 2,

        daysToMaturity: 75,
        seedToTransplantDays: 42,
        harvestWindowDays: 21,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "basil",
            "lettuce",
            "carrot"
        ]
    },

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

        startIndoorsWeeksBeforeLastFrost: 8,
        transplantWeeksAfterLastFrost: 2,

        daysToMaturity: 75,
        seedToTransplantDays: 56,
        harvestWindowDays: 28,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "basil",
            "lettuce",
            "carrot"
        ]
    },

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

        startIndoorsWeeksBeforeLastFrost: 3,
        transplantWeeksAfterLastFrost: 2,

        daysToMaturity: 55,
        seedToTransplantDays: 21,
        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "beans",
            "lettuce",
            "radish"
        ]
    },

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

        directSowWeeksAfterLastFrost: 1,

        daysToMaturity: 60,
        seedToTransplantDays: 0,
        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "cucumber",
            "lettuce",
            "carrot"
        ]
    },

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

        directSowWeeksBeforeLastFrost: 4,
        fallWeeksBeforeFirstFrost: 8,

        daysToMaturity: 45,
        seedToTransplantDays: 28,
        harvestWindowDays: 14,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "tomato",
            "pepper",
            "cucumber",
            "beans",
            "carrot"
        ]
    },

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

        directSowWeeksBeforeLastFrost: 4,
        fallWeeksBeforeFirstFrost: 10,

        daysToMaturity: 55,
        seedToTransplantDays: 28,
        harvestWindowDays: 30,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "lettuce",
            "radish"
        ]
    },

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

        directSowWeeksBeforeLastFrost: 3,
        fallWeeksBeforeFirstFrost: 10,

        daysToMaturity: 70,
        seedToTransplantDays: 0,
        harvestWindowDays: 21,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "tomato",
            "pepper",
            "beans",
            "lettuce"
        ]
    },

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

        directSowWeeksBeforeLastFrost: 4,
        fallWeeksBeforeFirstFrost: 6,

        daysToMaturity: 28,
        seedToTransplantDays: 0,
        harvestWindowDays: 10,

        preferredStartMethod: "direct-sow",

        preferredNeighbors: [
            "cucumber",
            "kale",
            "lettuce"
        ]
    },

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

        startIndoorsWeeksBeforeLastFrost: 6,
        transplantWeeksAfterLastFrost: 2,

        daysToMaturity: 60,
        seedToTransplantDays: 42,
        harvestWindowDays: 30,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "tomato",
            "pepper"
        ]
    },

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

        directSowWeeksBeforeLastFrost: 2,
        fallWeeksBeforeFirstFrost: 8,

        daysToMaturity: 90,
        seedToTransplantDays: 0,
        harvestWindowDays: 28,

        preferredStartMethod: "transplant",

        preferredNeighbors: [
            "lettuce"
        ]
    }
];


export function getCropById(id) {

    return (
        cropPlanningData.find(
            (crop) =>
                crop.id === id
        ) || null
    );

}