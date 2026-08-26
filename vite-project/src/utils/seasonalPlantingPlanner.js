import {
    getCropById
} from "../data/cropPlanningData";


/* =========================
   PARSE DATE
========================= */

function parseDate(
    value
) {

    if (
        !value
    ) {

        return null;

    }


    const date =
        new Date(
            `${value}T12:00:00`
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


/* =========================
   ADD WEEKS
========================= */

function addWeeks(
    date,
    weeks
) {

    const result =
        new Date(
            date
        );


    result.setDate(
        result.getDate() +
        weeks * 7
    );


    return result;

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(
    date
) {

    if (
        !date
    ) {

        return "";

    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================
   WARM SEASON GUIDANCE
========================= */

function getWarmSeasonGuidance({
    crop,
    today,
    lastFrost,
    firstFrost
}) {

    const indoorWeeks =
        crop.startIndoorsWeeksBeforeLastFrost;


    const transplantWeeks =
        crop.transplantWeeksAfterLastFrost ??
        crop.directSowWeeksAfterLastFrost ??
        0;


    const indoorStart =
        Number.isFinite(
            indoorWeeks
        )
            ? addWeeks(
                lastFrost,
                -indoorWeeks
            )
            : null;


    const outdoorStart =
        addWeeks(
            lastFrost,
            transplantWeeks
        );


    /* =========================
       START INDOORS
    ========================= */

    if (
        indoorStart &&
        today >= indoorStart &&
        today < outdoorStart
    ) {

        return {

            status:
                "start-indoors",

            label:
                "Start Indoors",

            icon:
                "🌱",

            message:
                `Outdoor planting is expected around ${formatDate(
                    outdoorStart
                )}.`

        };

    }


    /* =========================
       TOO EARLY
    ========================= */

    if (
        today < outdoorStart
    ) {

        return {

            status:
                "wait",

            label:
                "Wait",

            icon:
                "⏳",

            message:
                `Wait until around ${formatDate(
                    outdoorStart
                )} before planting outdoors.`

        };

    }


    /* =========================
       FALL FROST PASSED
    ========================= */

    if (
        firstFrost &&
        today >= firstFrost
    ) {

        return {

            status:
                "season-ended",

            label:
                "Warm Season Ending",

            icon:
                "🍂",

            message:
                "The average first fall frost has already arrived or passed."

        };

    }


    /* =========================
       PLANT OUTDOORS
    ========================= */

    return {

        status:
            "plant-now",

        label:
            "Plant Outdoors",

        icon:
            "✅",

        message:
            crop.frostSensitive
                ? "The average frost window supports outdoor planting."
                : "Conditions are within the expected outdoor planting window."

    };

}


/* =========================
   COOL SEASON GUIDANCE
========================= */

function getCoolSeasonGuidance({
    crop,
    today,
    lastFrost,
    firstFrost
}) {

    const springWeeks =
        crop.directSowWeeksBeforeLastFrost ??
        0;


    const springStart =
        addWeeks(
            lastFrost,
            -springWeeks
        );


    const fallWeeks =
        crop.fallWeeksBeforeFirstFrost;


    const fallStart =
        Number.isFinite(
            fallWeeks
        ) &&
        firstFrost
            ? addWeeks(
                firstFrost,
                -fallWeeks
            )
            : null;


    /* =========================
       BEFORE SPRING WINDOW
    ========================= */

    if (
        today < springStart
    ) {

        return {

            status:
                "wait",

            label:
                "Wait",

            icon:
                "⏳",

            message:
                `Spring planting begins around ${formatDate(
                    springStart
                )}.`

        };

    }


    /* =========================
       SPRING WINDOW
    ========================= */

    if (
        today <=
        addWeeks(
            lastFrost,
            6
        )
    ) {

        return {

            status:
                "plant-now",

            label:
                "Plant Now",

            icon:
                "✅",

            message:
                "This crop fits the expected cool-season spring planting window."

        };

    }


    /* =========================
       FALL WINDOW
    ========================= */

    if (
        fallStart &&
        firstFrost &&
        today >= fallStart &&
        today < firstFrost
    ) {

        return {

            status:
                "fall-window",

            label:
                "Fall Planting Window",

            icon:
                "🍂",

            message:
                `The average first fall frost is ${formatDate(
                    firstFrost
                )}.`

        };

    }


    /* =========================
       WAIT FOR FALL
    ========================= */

    if (
        fallStart &&
        today < fallStart
    ) {

        return {

            status:
                "wait-for-fall",

            label:
                "Wait for Fall Window",

            icon:
                "🌤️",

            message:
                `A fall planting window may begin around ${formatDate(
                    fallStart
                )}.`

        };

    }


    /* =========================
       SEASON PASSED
    ========================= */

    return {

        status:
            "season-ended",

        label:
            "Season Window Passed",

        icon:
            "🍂",

        message:
            "The calculated spring and fall planting windows have passed."

    };

}


/* =========================
   MAIN SEASONAL PLANNER
========================= */

export function generateSeasonalPlantingGuide({
    selectedCrops,
    lastSpringFrost,
    firstFallFrost
}) {

    if (
        !Array.isArray(
            selectedCrops
        ) ||
        selectedCrops.length ===
            0
    ) {

        return null;

    }


    const lastFrost =
        parseDate(
            lastSpringFrost
        );


    const firstFrost =
        parseDate(
            firstFallFrost
        );


    /*
        USDA hardiness zone alone
        is not enough to accurately
        determine annual vegetable
        planting dates.

        For now we require a spring
        frost date.

        Later this can be filled
        automatically from location.
    */

    if (
        !lastFrost
    ) {

        return {

            ready:
                false,

            recommendations:
                [],

            message:
                "Add your average last spring frost date to generate seasonal planting guidance."

        };

    }


    const today =
        new Date();


    const recommendations =
        selectedCrops
            .map(
                (cropId) =>
                    getCropById(
                        cropId
                    )
            )
            .filter(
                Boolean
            )
            .map(
                (crop) => {

                    const guidance =
                        crop.seasonType ===
                        "warm"
                            ? getWarmSeasonGuidance({

                                crop,

                                today,

                                lastFrost,

                                firstFrost

                            })
                            : getCoolSeasonGuidance({

                                crop,

                                today,

                                lastFrost,

                                firstFrost

                            });


                    return {

                        id:
                            crop.id,

                        name:
                            crop.name,

                        icon:
                            crop.icon,

                        seasonType:
                            crop.seasonType,

                        ...guidance

                    };

                }
            );


    return {

        version:
            1,

        ready:
            true,

        today:
            today.toISOString(),

        lastSpringFrost,

        firstFallFrost:
            firstFallFrost ||
            null,

        recommendations,

        disclaimer:
            "These are planning windows based on average frost dates. Current weather, soil temperature, crop variety, and local microclimates can shift actual planting timing."

    };

}