import {
    getCropById
} from "../data/cropPlanningData";


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


function getLocalDateString(
    date
) {

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

        return null;

    }


    date.setDate(
        date.getDate() +
        Number(
            days || 0
        )
    );


    return getLocalDateString(
        date
    );

}


/* =========================
   NORMALIZE START METHOD
========================= */

function normalizeStartMethod(
    startMethod,
    crop
) {

    if (
        startMethod === "seed" ||
        startMethod === "transplant" ||
        startMethod === "direct-sow"
    ) {

        return startMethod;

    }


    return (
        crop?.preferredStartMethod ||
        "direct-sow"
    );

}


/* =========================
   CALCULATE HARVEST SCHEDULE
========================= */

export function calculateHarvestSchedule({
    cropId,
    startDate,
    startMethod
}) {

    const crop =
        getCropById(
            cropId
        );


    if (
        !crop ||
        !startDate
    ) {

        return null;

    }


    const maturityDays =
        Number(
            crop.daysToMaturity
        );


    const seedToTransplantDays =
        Number(
            crop.seedToTransplantDays ||
            0
        );


    const harvestWindowDays =
        Number(
            crop.harvestWindowDays ||
            14
        );


    if (
        !Number.isFinite(
            maturityDays
        ) ||
        maturityDays <= 0
    ) {

        return null;

    }


    const resolvedStartMethod =
        normalizeStartMethod(
            startMethod,
            crop
        );


    /*
        daysToMaturity is treated as
        the approximate time from the
        crop's normal garden start point.

        If the user starts from seed
        indoors, include the seedling
        development period first.
    */

    let totalDaysToHarvest =
        maturityDays;


    if (
        resolvedStartMethod ===
        "seed"
    ) {

        totalDaysToHarvest +=
            seedToTransplantDays;

    }


    const harvestStartDate =
        addDays(
            startDate,
            totalDaysToHarvest
        );


    if (
        !harvestStartDate
    ) {

        return null;

    }


    const harvestEndDate =
        addDays(
            harvestStartDate,
            harvestWindowDays
        );


    return {

        cropId,

        cropName:
            crop.name,

        cropIcon:
            crop.icon,

        startDate,

        startMethod:
            resolvedStartMethod,

        maturityDays,

        seedToTransplantDays,

        totalDaysToHarvest,

        harvestWindowDays,

        harvestStartDate,

        harvestEndDate

    };

}


/* =========================
   CREATE CALENDAR EVENTS
========================= */

export function createHarvestCalendarEvents({
    plantKey,
    plantId,
    cropId,
    plantName,
    startDate,
    startMethod
}) {

    if (
        !plantKey ||
        !cropId ||
        !startDate
    ) {

        return [];

    }


    const schedule =
        calculateHarvestSchedule({

            cropId,

            startDate,

            startMethod

        });


    if (
        !schedule
    ) {

        return [];

    }


    const displayName =
        plantName ||
        schedule.cropName ||
        "Plant";


    const events = [];


    /* =========================
       HARVEST START
    ========================= */

    if (
        schedule.harvestStartDate
    ) {

        events.push({

            id:
                `auto-harvest-start-${plantKey}`,

            date:
                schedule.harvestStartDate,

            type:
                "harvest",

            title:
                `Harvest ${displayName}`,

            plantKey,

            plantId,

            cropId,

            automatic:
                true,

            source:
                "harvest-scheduler",

            startMethod:
                schedule.startMethod,

            maturityDays:
                schedule.maturityDays,

            harvestWindowDays:
                schedule.harvestWindowDays

        });

    }


    /* =========================
       HARVEST WINDOW END
    ========================= */

    if (
        schedule.harvestEndDate
    ) {

        events.push({

            id:
                `auto-harvest-end-${plantKey}`,

            date:
                schedule.harvestEndDate,

            type:
                "harvest-window-end",

            title:
                `${displayName} harvest window ends`,

            plantKey,

            plantId,

            cropId,

            automatic:
                true,

            source:
                "harvest-scheduler",

            startMethod:
                schedule.startMethod,

            maturityDays:
                schedule.maturityDays,

            harvestWindowDays:
                schedule.harvestWindowDays

        });

    }


    return events;

}