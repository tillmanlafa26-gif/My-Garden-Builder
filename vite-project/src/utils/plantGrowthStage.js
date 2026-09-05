import {
    getCropById
} from "../data/cropPlanningData";


/* =========================
   STAGE METADATA
========================= */

const stageMetadata = {
    seedling: {
        id: "seedling",
        label: "Seedling",
        shortLabel: "Seedling",
        icon: "sprout",
        description: "Young plant establishing roots and early leaves."
    },

    planted: {
        id: "planted",
        label: "Planted",
        shortLabel: "Planted",
        icon: "mapPin",
        description: "Recently planted or direct-sown in its growing space."
    },

    transplanted: {
        id: "transplanted",
        label: "Transplanted",
        shortLabel: "Transplanted",
        icon: "arrowRight",
        description: "Recently moved into its final growing space."
    },

    growing: {
        id: "growing",
        label: "Growing",
        shortLabel: "Growing",
        icon: "leaf",
        description: "Actively developing foliage, roots, and structure."
    },

    flowering: {
        id: "flowering",
        label: "Flowering",
        shortLabel: "Flowering",
        icon: "flower",
        description: "Producing blossoms before fruit or pods develop."
    },

    producing: {
        id: "producing",
        label: "Producing",
        shortLabel: "Producing",
        icon: "fruit",
        description: "Fruit, pods, or other harvestable growth is developing."
    },

    "harvest-ready": {
        id: "harvest-ready",
        label: "Harvest Ready",
        shortLabel: "Harvest Ready",
        icon: "harvest",
        description: "The crop is within its estimated harvest window."
    },

    harvested: {
        id: "harvested",
        label: "Harvested",
        shortLabel: "Harvested",
        icon: "check",
        description: "Marked complete after harvesting."
    }
};


/* =========================
   DATE HELPERS
========================= */

function parseLocalDate(
    dateString
) {

    if (
        !dateString
    ) {

        return null;

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

        return null;

    }


    return date;

}


function differenceInDays(
    startDateString,
    endDate
) {

    const startDate =
        parseLocalDate(
            startDateString
        );


    if (
        !startDate ||
        !(endDate instanceof Date) ||
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        return 0;

    }


    const start =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );


    const end =
        new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
        );


    return Math.max(
        0,
        Math.floor(
            (
                end.getTime() -
                start.getTime()
            ) /
            86400000
        )
    );

}


function clamp(
    value,
    minimum,
    maximum
) {

    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );

}


/* =========================
   STAGE OPTIONS
========================= */

function cropUsesFloweringStages(
    crop
) {

    return [
        "fruiting",
        "vining"
    ].includes(
        crop?.placementGroup
    );

}


export function getAvailableGrowthStages(
    plant
) {

    const crop =
        plant?.cropId
            ? getCropById(
                plant.cropId
            )
            : null;


    const stageIds =
        cropUsesFloweringStages(
            crop
        )
            ? [
                "seedling",
                "planted",
                "transplanted",
                "growing",
                "flowering",
                "producing",
                "harvest-ready",
                "harvested"
            ]
            : [
                "seedling",
                "planted",
                "transplanted",
                "growing",
                "harvest-ready",
                "harvested"
            ];


    return stageIds.map(
        (stageId) =>
            stageMetadata[
                stageId
            ]
    );

}


export function getGrowthStageMeta(
    stageId
) {

    return (
        stageMetadata[
            stageId
        ] ||
        stageMetadata.growing
    );

}


/* =========================
   ESTIMATE GROWTH STAGE
========================= */

export function getPlantGrowthStage(
    plant,
    referenceDate = new Date()
) {

    if (
        !plant
    ) {

        return {
            ...stageMetadata.growing,
            progress: 0,
            source: "automatic",
            nextLabel: "Keep growing"
        };

    }


    if (
        plant.growthStageOverride &&
        stageMetadata[
            plant.growthStageOverride
        ]
    ) {

        return {
            ...stageMetadata[
                plant.growthStageOverride
            ],
            progress:
                plant.growthStageOverride ===
                "harvested"
                    ? 100
                    : null,
            source: "manual",
            nextLabel: "Manual stage"
        };

    }


    const crop =
        plant.cropId
            ? getCropById(
                plant.cropId
            )
            : null;


    const fallbackStage =
        stageMetadata[
            plant.currentStage
        ]
            ? plant.currentStage
            : "growing";


    if (
        !crop
    ) {

        return {
            ...getGrowthStageMeta(
                fallbackStage
            ),
            progress: null,
            source: "automatic",
            nextLabel: "Update planting details for a better estimate"
        };

    }


    const seedStartDate =
        plant.seedStartDate ||
        (
            plant.startMethod ===
            "seed"
                ? plant.startDate
                : null
        );


    const outsideStartDate =
        plant.transplantDate ||
        plant.directSowDate ||
        plant.fallPlantDate ||
        (
            plant.startMethod !==
            "seed"
                ? plant.startDate
                : null
        );


    /* =========================
       INDOOR SEEDLING PHASE
    ========================= */

    if (
        seedStartDate &&
        !outsideStartDate
    ) {

        const seedlingDays =
            Math.max(
                1,
                Number(
                    crop.seedToTransplantDays ||
                    28
                )
            );


        const elapsedDays =
            differenceInDays(
                seedStartDate,
                referenceDate
            );


        const progress =
            clamp(
                Math.round(
                    (
                        elapsedDays /
                        seedlingDays
                    ) *
                    100
                ),
                0,
                100
            );


        return {
            ...stageMetadata.seedling,
            progress,
            source: "automatic",
            elapsedDays,
            stageDays: seedlingDays,
            nextLabel:
                progress >= 100
                    ? "Ready for transplant planning"
                    : `About ${Math.max(
                        0,
                        seedlingDays -
                        elapsedDays
                    )} days to transplant timing`
        };

    }


    if (
        !outsideStartDate
    ) {

        return {
            ...getGrowthStageMeta(
                fallbackStage
            ),
            progress: null,
            source: "automatic",
            nextLabel: "Add a planting date for automatic progress"
        };

    }


    /* =========================
       OUTDOOR GROWTH PHASE
    ========================= */

    const maturityDays =
        Math.max(
            1,
            Number(
                crop.daysToMaturity ||
                60
            )
        );


    const elapsedDays =
        differenceInDays(
            outsideStartDate,
            referenceDate
        );


    const maturityProgress =
        clamp(
            elapsedDays /
            maturityDays,
            0,
            1.5
        );


    const progress =
        clamp(
            Math.round(
                maturityProgress *
                100
            ),
            0,
            100
        );


    let stageId =
        plant.transplantDate
            ? "transplanted"
            : "planted";


    if (
        maturityProgress >= 1
    ) {

        stageId =
            "harvest-ready";

    } else if (
        cropUsesFloweringStages(
            crop
        )
    ) {

        if (
            maturityProgress >= 0.78
        ) {

            stageId =
                "producing";

        } else if (
            maturityProgress >= 0.55
        ) {

            stageId =
                "flowering";

        } else if (
            maturityProgress >= 0.15
        ) {

            stageId =
                "growing";

        }

    } else if (
        maturityProgress >= 0.2
    ) {

        stageId =
            "growing";

    }


    const daysRemaining =
        Math.max(
            0,
            maturityDays -
            elapsedDays
        );


    let nextLabel =
        daysRemaining > 0
            ? `About ${daysRemaining} days to estimated maturity`
            : "Estimated harvest window has started";


    if (
        stageId ===
        "transplanted" &&
        elapsedDays <= 7
    ) {

        nextLabel =
            "Watch for transplant recovery and new growth";

    }


    if (
        stageId ===
        "planted" &&
        elapsedDays <= 7
    ) {

        nextLabel =
            "Watch for emergence and early establishment";

    }


    return {
        ...stageMetadata[
            stageId
        ],
        progress,
        source: "automatic",
        elapsedDays,
        stageDays: maturityDays,
        nextLabel
    };

}
