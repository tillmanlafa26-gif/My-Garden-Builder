import {
    getCropById
} from "../data/cropPlanningData";


/* =========================
   FALLBACK MATURITY DATA

   This prevents the calendar
   from failing if cropPlanningData
   is missing a maturity value.
========================= */

const fallbackHarvestData = {

    tomato: {
        daysToMaturity: 75,
        seedToTransplantDays: 42,
        harvestWindowDays: 21,
        preferredStartMethod: "transplant"
    },

    pepper: {
        daysToMaturity: 75,
        seedToTransplantDays: 56,
        harvestWindowDays: 28,
        preferredStartMethod: "transplant"
    },

    cucumber: {
        daysToMaturity: 55,
        seedToTransplantDays: 21,
        harvestWindowDays: 21,
        preferredStartMethod: "direct-sow"
    },

    beans: {
        daysToMaturity: 60,
        seedToTransplantDays: 0,
        harvestWindowDays: 21,
        preferredStartMethod: "direct-sow"
    },

    lettuce: {
        daysToMaturity: 45,
        seedToTransplantDays: 28,
        harvestWindowDays: 14,
        preferredStartMethod: "direct-sow"
    },

    kale: {
        daysToMaturity: 55,
        seedToTransplantDays: 28,
        harvestWindowDays: 30,
        preferredStartMethod: "direct-sow"
    },

    carrot: {
        daysToMaturity: 70,
        seedToTransplantDays: 0,
        harvestWindowDays: 21,
        preferredStartMethod: "direct-sow"
    },

    radish: {
        daysToMaturity: 28,
        seedToTransplantDays: 0,
        harvestWindowDays: 10,
        preferredStartMethod: "direct-sow"
    },

    basil: {
        daysToMaturity: 60,
        seedToTransplantDays: 42,
        harvestWindowDays: 30,
        preferredStartMethod: "transplant"
    },

    strawberry: {
        daysToMaturity: 90,
        seedToTransplantDays: 0,
        harvestWindowDays: 28,
        preferredStartMethod: "transplant"
    }

};


/* =========================
   PARSE LOCAL DATE
========================= */

function parseLocalDate(
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
   ADD DAYS
========================= */

function addDays(
    date,
    days
) {

    const result =
        new Date(
            date
        );


    result.setDate(
        result.getDate() +
        days
    );


    return result;

}


/* =========================
   LOCAL DATE STRING
========================= */

function toLocalDateString(
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


/* =========================
   CROP HARVEST DATA
========================= */

function getHarvestData(
    cropId
) {

    const crop =
        getCropById(
            cropId
        );


    const fallback =
        fallbackHarvestData[
            cropId
        ];


    if (
        !crop &&
        !fallback
    ) {

        return null;

    }


    return {

        crop,

        daysToMaturity:
            Number(
                crop?.daysToMaturity
            ) ||
            fallback?.daysToMaturity ||
            0,

        seedToTransplantDays:
            Number(
                crop?.seedToTransplantDays
            ) ||
            fallback?.seedToTransplantDays ||
            0,

        harvestWindowDays:
            Number(
                crop?.harvestWindowDays
            ) ||
            fallback?.harvestWindowDays ||
            14,

        preferredStartMethod:
            crop?.preferredStartMethod ||
            fallback?.preferredStartMethod ||
            "direct-sow"

    };

}


/* =========================
   CALCULATE HARVEST
========================= */

export function calculateHarvestSchedule({

    cropId,

    startDate,

    startMethod

}) {

    const harvestData =
        getHarvestData(
            cropId
        );


    if (
        !harvestData
    ) {

        return null;

    }


    const parsedStartDate =
        parseLocalDate(
            startDate
        );


    if (
        !parsedStartDate
    ) {

        return null;

    }


    const crop =
        harvestData.crop;


    const resolvedStartMethod =
        startMethod ||
        harvestData
            .preferredStartMethod;


    let totalDays =
        harvestData
            .daysToMaturity;


    /*
        Seed-started transplant crops
        need seedling development time
        added before their normal
        maturity period.
    */

    if (
        resolvedStartMethod ===
        "seed"
    ) {

        totalDays +=
            harvestData
                .seedToTransplantDays;

    }


    if (
        totalDays <= 0
    ) {

        return null;

    }


    const firstHarvestDate =
        addDays(
            parsedStartDate,
            totalDays
        );


    const harvestEndDate =
        addDays(
            firstHarvestDate,
            harvestData
                .harvestWindowDays
        );


    return {

        cropId,

        cropName:
            crop?.name ||
            cropId,

        cropIcon:
            crop?.icon ||
            "🧺",

        startMethod:
            resolvedStartMethod,

        startDate,

        maturityDays:
            totalDays,

        estimatedHarvestDate:
            toLocalDateString(
                firstHarvestDate
            ),

        estimatedHarvestEndDate:
            toLocalDateString(
                harvestEndDate
            ),

        harvestWindowDays:
            harvestData
                .harvestWindowDays

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
        schedule.cropName;


    return [

        {
            id:
                `auto-harvest-start-${plantKey}`,

            date:
                schedule
                    .estimatedHarvestDate,

            type:
                "harvest",

            title:
                `${schedule.cropIcon} ${displayName} Harvest Begins`,

            description:
                `Estimated first harvest after about ${schedule.maturityDays} days.`,

            plantKey,

            plantId,

            cropId,

            automatic:
                true,

            source:
                "harvest-scheduler"
        },


        {
            id:
                `auto-harvest-end-${plantKey}`,

            date:
                schedule
                    .estimatedHarvestEndDate,

            type:
                "harvest-window-end",

            title:
                `${schedule.cropIcon} ${displayName} Harvest Window Ends`,

            description:
                `Estimated end of the initial ${schedule.harvestWindowDays}-day harvest window.`,

            plantKey,

            plantId,

            cropId,

            automatic:
                true,

            source:
                "harvest-scheduler"
        }

    ];

}