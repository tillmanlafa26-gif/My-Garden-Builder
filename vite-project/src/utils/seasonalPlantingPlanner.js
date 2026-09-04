import {
    getCropById
} from "../data/cropPlanningData";


/* =========================================================
   DATE HELPERS
========================================================= */

function parseLocalDate(
    dateString
) {

    if (
        !dateString
    ) {

        return null;

    }


    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    if (
        !year ||
        !month ||
        !day
    ) {

        return null;

    }


    return new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
    );

}


function toLocalDateString(
    date
) {

    if (
        !(date instanceof Date) ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function addDays(
    dateString,
    days
) {

    const date =
        parseLocalDate(
            dateString
        );


    if (
        !date
    ) {

        return "";

    }


    date.setDate(
        date.getDate() +
        Number(
            days || 0
        )
    );


    return toLocalDateString(
        date
    );

}


function addWeeks(
    dateString,
    weeks
) {

    return addDays(
        dateString,
        Number(
            weeks || 0
        ) * 7
    );

}


/* =========================================================
   FORMAT METHOD
========================================================= */

function getStartMethodLabel(
    method
) {

    if (
        method === "transplant"
    ) {

        return "Transplant";

    }


    if (
        method === "seed"
    ) {

        return "Start from seed";

    }


    return "Direct sow";

}


/* =========================================================
   SUPPORT CURRENT + LEGACY CROP FIELDS

   Current fields:
   - indoorStartWeeks
   - weeksBeforeLastFrost
   - weeksAfterLastFrost
   - weeksBeforeFirstFallFrost

   Legacy fields:
   - startIndoorsWeeksBeforeLastFrost
   - directSowWeeksBeforeLastFrost
   - directSowWeeksAfterLastFrost
   - transplantWeeksAfterLastFrost
   - fallWeeksBeforeFirstFrost
========================================================= */

function getIndoorStartWeeks(
    crop
) {

    return Number(
        crop.indoorStartWeeks ??
        crop.startIndoorsWeeksBeforeLastFrost ??
        0
    );

}


function getSpringWeeksBefore(
    crop
) {

    return Number(
        crop.weeksBeforeLastFrost ??
        crop.directSowWeeksBeforeLastFrost ??
        0
    );

}


function getSpringWeeksAfter(
    crop
) {

    if (
        crop.preferredStartMethod ===
        "transplant"
    ) {

        return Number(
            crop.weeksAfterLastFrost ??
            crop.transplantWeeksAfterLastFrost ??
            0
        );

    }


    return Number(
        crop.weeksAfterLastFrost ??
        crop.directSowWeeksAfterLastFrost ??
        0
    );

}


function getFallWeeksBefore(
    crop
) {

    return Number(
        crop.weeksBeforeFirstFallFrost ??
        crop.fallWeeksBeforeFirstFrost ??
        0
    );

}


/* =========================================================
   BUILD ONE CROP SCHEDULE
========================================================= */

function buildCropSchedule({
    crop,
    lastSpringFrost,
    firstFallFrost
}) {

    const indoorStartWeeks =
        getIndoorStartWeeks(
            crop
        );


    const springWeeksBefore =
        getSpringWeeksBefore(
            crop
        );


    const springWeeksAfter =
        getSpringWeeksAfter(
            crop
        );


    const fallWeeksBefore =
        getFallWeeksBefore(
            crop
        );


    let indoorStartDate =
        "";


    let springPlantDate =
        "";


    let fallPlantDate =
        "";


    /* =====================================================
       INDOOR START
    ===================================================== */

    if (
        lastSpringFrost &&
        indoorStartWeeks > 0
    ) {

        indoorStartDate =
            addWeeks(
                lastSpringFrost,
                -indoorStartWeeks
            );

    }


    /* =====================================================
       SPRING PLANTING
    ===================================================== */

    if (
        lastSpringFrost
    ) {

        if (
            springWeeksBefore > 0
        ) {

            springPlantDate =
                addWeeks(
                    lastSpringFrost,
                    -springWeeksBefore
                );

        } else {

            springPlantDate =
                addWeeks(
                    lastSpringFrost,
                    springWeeksAfter
                );

        }

    }


    /* =====================================================
       FALL PLANTING
    ===================================================== */

    if (
        firstFallFrost &&
        fallWeeksBefore > 0
    ) {

        fallPlantDate =
            addWeeks(
                firstFallFrost,
                -fallWeeksBefore
            );

    }


    /* =====================================================
       DESCRIPTIONS
    ===================================================== */

    let springAction =
        "Plant outside";


    if (
        crop.preferredStartMethod ===
        "direct-sow"
    ) {

        springAction =
            "Direct sow";

    }


    if (
        crop.preferredStartMethod ===
        "transplant"
    ) {

        springAction =
            "Transplant outside";

    }


    return {

        cropId:
            crop.id,

        name:
            crop.name,

        icon:
            crop.icon,

        seasonType:
            crop.seasonType,

        frostSensitive:
            Boolean(
                crop.frostSensitive
            ),

        preferredStartMethod:
            crop.preferredStartMethod ||
            "direct-sow",

        preferredStartMethodLabel:
            getStartMethodLabel(
                crop.preferredStartMethod
            ),

        indoorStartWeeks,

        springWeeksBefore,

        springWeeksAfter,

        fallWeeksBefore,

        indoorStartDate,

        springPlantDate,

        fallPlantDate,

        springAction,

        daysToMaturity:
            Number(
                crop.daysToMaturity ||
                0
            ),

        notes:
            crop.frostSensitive
                ? "Protect from frost and wait for suitable outdoor temperatures."
                : "This crop can tolerate cooler conditions better than frost-sensitive crops."

    };

}


/* =========================================================
   GENERATE SEASONAL PLANTING GUIDE
========================================================= */

export function generateSeasonalPlantingGuide({
    selectedCrops = [],
    lastSpringFrost = "",
    firstFallFrost = ""
}) {

    const cropSchedules =
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
                (crop) =>
                    buildCropSchedule({
                        crop,
                        lastSpringFrost,
                        firstFallFrost
                    })
            );


    const springSchedule =
        cropSchedules
            .filter(
                (schedule) =>
                    schedule.springPlantDate ||
                    schedule.indoorStartDate
            )
            .sort(
                (
                    cropA,
                    cropB
                ) => {

                    const dateA =
                        cropA.indoorStartDate ||
                        cropA.springPlantDate ||
                        "9999-12-31";


                    const dateB =
                        cropB.indoorStartDate ||
                        cropB.springPlantDate ||
                        "9999-12-31";


                    return dateA.localeCompare(
                        dateB
                    );

                }
            );


    const fallSchedule =
        cropSchedules
            .filter(
                (schedule) =>
                    schedule.fallPlantDate
            )
            .sort(
                (
                    cropA,
                    cropB
                ) =>
                    cropA.fallPlantDate.localeCompare(
                        cropB.fallPlantDate
                    )
            );


    return {

        generatedAt:
            new Date()
                .toISOString(),

        lastSpringFrost,

        firstFallFrost,

        crops:
            cropSchedules,

        springSchedule,

        fallSchedule,

        stats: {

            cropCount:
                cropSchedules.length,

            indoorStartCount:
                cropSchedules.filter(
                    (crop) =>
                        crop.indoorStartDate
                ).length,

            springPlantingCount:
                cropSchedules.filter(
                    (crop) =>
                        crop.springPlantDate
                ).length,

            fallPlantingCount:
                cropSchedules.filter(
                    (crop) =>
                        crop.fallPlantDate
                ).length

        }

    };

}