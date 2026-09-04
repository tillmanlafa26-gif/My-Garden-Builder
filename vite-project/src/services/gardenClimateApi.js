/* =========================================================
   MY GARDEN BUILDER
   LOCAL GARDEN CLIMATE SERVICE

   Uses Open-Meteo ERA5-Land historical climate data.

   Climate normal period:
   1991-2020

   Calculates:
   - Estimated USDA-style hardiness zone
   - Average last spring frost
   - Average first fall frost

   IMPORTANT:
   The hardiness zone is an estimate derived from
   ERA5-Land climate data. It is not an official
   USDA Plant Hardiness Zone Map lookup.
========================================================= */


const CLIMATE_START_DATE =
    "1991-01-01";


const CLIMATE_END_DATE =
    "2020-12-31";


const CLIMATE_PERIOD =
    "1991-2020";


const FROST_TEMPERATURE_F =
    32;


/* =========================================================
   VALIDATE COORDINATES
========================================================= */

function validateCoordinates(
    latitude,
    longitude
) {

    const lat =
        Number(
            latitude
        );


    const lng =
        Number(
            longitude
        );


    if (
        !Number.isFinite(
            lat
        ) ||
        !Number.isFinite(
            lng
        )
    ) {

        throw new Error(
            "Valid latitude and longitude are required."
        );

    }


    if (
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {

        throw new Error(
            "Garden coordinates are outside the valid geographic range."
        );

    }


    return {
        latitude:
            lat,

        longitude:
            lng
    };

}


/* =========================================================
   DATE → NORMALIZED DAY OF YEAR

   Uses 2001 because it is not a leap year.

   This prevents February 29 from shifting
   averages when combining 30 climate years.
========================================================= */

function getReferenceDayOfYear(
    dateString
) {

    if (
        !dateString
    ) {

        return null;

    }


    const [
        ,
        monthString,
        dayString
    ] =
        dateString.split(
            "-"
        );


    const month =
        Number(
            monthString
        );


    const day =
        Number(
            dayString
        );


    if (
        !month ||
        !day
    ) {

        return null;

    }


    /*
        February 29 cannot exist in our
        non-leap reference year.

        Treat it as February 28 for averaging.
    */

    const normalizedDay =
        month === 2 &&
        day === 29
            ? 28
            : day;


    const date =
        new Date(
            Date.UTC(
                2001,
                month - 1,
                normalizedDay
            )
        );


    const firstDay =
        new Date(
            Date.UTC(
                2001,
                0,
                1
            )
        );


    return (
        Math.floor(
            (
                date.getTime() -
                firstDay.getTime()
            ) /
            86400000
        ) +
        1
    );

}


/* =========================================================
   DAY OF YEAR → CURRENT YEAR DATE
========================================================= */

function dayOfYearToCurrentYearDate(
    dayOfYear
) {

    const numericDay =
        Math.round(
            Number(
                dayOfYear
            )
        );


    if (
        !Number.isFinite(
            numericDay
        ) ||
        numericDay < 1 ||
        numericDay > 365
    ) {

        return "";

    }


    const referenceDate =
        new Date(
            Date.UTC(
                2001,
                0,
                numericDay
            )
        );


    const month =
        String(
            referenceDate
                .getUTCMonth() +
            1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            referenceDate
                .getUTCDate()
        ).padStart(
            2,
            "0"
        );


    const currentYear =
        new Date()
            .getFullYear();


    return (
        `${currentYear}-${month}-${day}`
    );

}


/* =========================================================
   AVERAGE
========================================================= */

function average(
    numbers
) {

    const validNumbers =
        numbers.filter(
            Number.isFinite
        );


    if (
        validNumbers.length === 0
    ) {

        return null;

    }


    return (
        validNumbers.reduce(
            (
                total,
                number
            ) =>
                total +
                number,
            0
        ) /
        validNumbers.length
    );

}


/* =========================================================
   TEMPERATURE → USDA-STYLE ZONE

   Standard half-zone bands are 5°F wide.

   Examples:
   10°F → 8a
   15°F → 8b
   20°F → 9a
========================================================= */

function getHardinessZoneFromTemperature(
    temperatureF
) {

    if (
        !Number.isFinite(
            temperatureF
        )
    ) {

        return null;

    }


    let halfZoneIndex =
        Math.floor(
            (
                temperatureF +
                60
            ) /
            5
        );


    /*
        Current USDA system spans
        zones 1a through 13b.
    */

    halfZoneIndex =
        Math.max(
            0,
            Math.min(
                25,
                halfZoneIndex
            )
        );


    const zoneNumber =
        Math.floor(
            halfZoneIndex /
            2
        ) +
        1;


    const half =
        halfZoneIndex %
            2 ===
        0
            ? "a"
            : "b";


    const lowerTemperature =
        -60 +
        (
            halfZoneIndex *
            5
        );


    const upperTemperature =
        lowerTemperature +
        5;


    return {

        zone:
            `${zoneNumber}${half}`,

        lowerTemperatureF:
            lowerTemperature,

        upperTemperatureF:
            upperTemperature

    };

}


/* =========================================================
   FETCH HISTORICAL DAILY LOWS
========================================================= */

async function fetchHistoricalDailyMinimums(
    latitude,
    longitude
) {

    const coordinates =
        validateCoordinates(
            latitude,
            longitude
        );


    const params =
        new URLSearchParams({

            latitude:
                String(
                    coordinates.latitude
                ),

            longitude:
                String(
                    coordinates.longitude
                ),

            start_date:
                CLIMATE_START_DATE,

            end_date:
                CLIMATE_END_DATE,

            daily:
                "temperature_2m_min",

            temperature_unit:
                "fahrenheit",

            timezone:
                "auto",

            models:
                "era5_land",

            cell_selection:
                "land"

        });


    const response =
        await fetch(
            `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Climate request failed with status ${response.status}.`
        );

    }


    const data =
        await response.json();


    const dates =
        data
            ?.daily
            ?.time;


    const temperatures =
        data
            ?.daily
            ?.temperature_2m_min;


    if (
        !Array.isArray(
            dates
        ) ||
        !Array.isArray(
            temperatures
        ) ||
        dates.length === 0 ||
        dates.length !==
            temperatures.length
    ) {

        throw new Error(
            "Historical climate data was incomplete."
        );

    }


    return {
        dates,
        temperatures
    };

}


/* =========================================================
   CALCULATE HARDINESS
========================================================= */

function calculateHardiness(
    dates,
    temperatures
) {

    const yearlyMinimums =
        new Map();


    for (
        let index = 0;
        index < dates.length;
        index += 1
    ) {

        const date =
            dates[
                index
            ];


        const temperature =
            Number(
                temperatures[
                    index
                ]
            );


        if (
            !date ||
            !Number.isFinite(
                temperature
            )
        ) {

            continue;

        }


        const year =
            date.slice(
                0,
                4
            );


        const currentMinimum =
            yearlyMinimums.get(
                year
            );


        if (
            currentMinimum ===
                undefined ||
            temperature <
                currentMinimum
        ) {

            yearlyMinimums.set(
                year,
                temperature
            );

        }

    }


    const annualExtremeMinimums =
        Array.from(
            yearlyMinimums.values()
        );


    const averageAnnualExtremeMinimumF =
        average(
            annualExtremeMinimums
        );


    const zone =
        getHardinessZoneFromTemperature(
            averageAnnualExtremeMinimumF
        );


    return {

        hardinessZone:
            zone?.zone ||
            "",

        averageAnnualExtremeMinimumF:
            Number.isFinite(
                averageAnnualExtremeMinimumF
            )
                ? Number(
                    averageAnnualExtremeMinimumF
                        .toFixed(
                            1
                        )
                )
                : null,

        hardinessTemperatureRangeF:
            zone
                ? {
                    min:
                        zone.lowerTemperatureF,

                    max:
                        zone.upperTemperatureF
                }
                : null,

        yearsAnalyzed:
            annualExtremeMinimums.length

    };

}


/* =========================================================
   CALCULATE FROST DATES
========================================================= */

function calculateFrostDates(
    dates,
    temperatures
) {

    const lastSpringFrostByYear =
        new Map();


    const firstFallFrostByYear =
        new Map();


    const years =
        new Set();


    for (
        let index = 0;
        index < dates.length;
        index += 1
    ) {

        const dateString =
            dates[
                index
            ];


        const temperature =
            Number(
                temperatures[
                    index
                ]
            );


        if (
            !dateString ||
            !Number.isFinite(
                temperature
            )
        ) {

            continue;

        }


        const [
            year,
            monthString
        ] =
            dateString.split(
                "-"
            );


        const month =
            Number(
                monthString
            );


        years.add(
            year
        );


        if (
            temperature >
            FROST_TEMPERATURE_F
        ) {

            continue;

        }


        const dayOfYear =
            getReferenceDayOfYear(
                dateString
            );


        if (
            !dayOfYear
        ) {

            continue;

        }


        /*
            Spring:
            Jan 1 through June 30.

            We want the LAST day at or below 32°F.
        */

        if (
            month <= 6
        ) {

            const existing =
                lastSpringFrostByYear.get(
                    year
                );


            if (
                existing ===
                    undefined ||
                dayOfYear >
                    existing
            ) {

                lastSpringFrostByYear.set(
                    year,
                    dayOfYear
                );

            }

        }


        /*
            Fall:
            July 1 through Dec 31.

            We want the FIRST day at or below 32°F.
        */

        if (
            month >= 7
        ) {

            const existing =
                firstFallFrostByYear.get(
                    year
                );


            if (
                existing ===
                    undefined ||
                dayOfYear <
                    existing
            ) {

                firstFallFrostByYear.set(
                    year,
                    dayOfYear
                );

            }

        }

    }


    const springValues =
        Array.from(
            lastSpringFrostByYear.values()
        );


    const fallValues =
        Array.from(
            firstFallFrostByYear.values()
        );


    const totalYears =
        years.size;


    /*
        Do not invent a frost date for very
        warm climates where frost was uncommon.

        Require frost to occur in at least
        half of the climate-normal years.
    */

    const minimumReliableYears =
        Math.max(
            1,
            Math.ceil(
                totalYears *
                0.5
            )
        );


    const averageSpringDay =
        springValues.length >=
        minimumReliableYears
            ? average(
                springValues
            )
            : null;


    const averageFallDay =
        fallValues.length >=
        minimumReliableYears
            ? average(
                fallValues
            )
            : null;


    return {

        lastSpringFrost:
            averageSpringDay
                ? dayOfYearToCurrentYearDate(
                    averageSpringDay
                )
                : "",

        firstFallFrost:
            averageFallDay
                ? dayOfYearToCurrentYearDate(
                    averageFallDay
                )
                : "",

        springFrostYears:
            springValues.length,

        fallFrostYears:
            fallValues.length,

        totalYears

    };

}


/* =========================================================
   PUBLIC FUNCTION
========================================================= */

export async function getGardenClimateData(
    latitude,
    longitude
) {

    const {
        dates,
        temperatures
    } =
        await fetchHistoricalDailyMinimums(
            latitude,
            longitude
        );


    const hardiness =
        calculateHardiness(
            dates,
            temperatures
        );


    const frost =
        calculateFrostDates(
            dates,
            temperatures
        );


    return {

        ...hardiness,

        ...frost,

        climatePeriod:
            CLIMATE_PERIOD,

        frostTemperatureF:
            FROST_TEMPERATURE_F,

        source:
            "open-meteo-era5-land",

        hardinessEstimate:
            true,

        calculatedAt:
            new Date()
                .toISOString()

    };

}