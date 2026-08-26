import {
    Link
} from "react-router";


import {
    useWeather
} from "../context/WeatherContext";


function WateringReminder({
    gardenProfile,
    gardenPlants = [],
    wateringRecords = [],
    onMarkPlantWatered,
    onDelayWatering,
    onRainWatered
}) {

    const {
        weather
    } = useWeather();


    /* =========================
       DATE HELPERS
    ========================= */

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


    function getDaysDifference(
        startDate,
        endDate
    ) {

        const start =
            new Date(
                `${startDate}T12:00:00`
            );


        const end =
            new Date(
                `${endDate}T12:00:00`
            );


        return Math.round(
            (
                end -
                start
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    }


    function getDueText(
        nextWatering
    ) {

        const today =
            getLocalDateString(
                new Date()
            );


        const difference =
            getDaysDifference(
                today,
                nextWatering
            );


        if (
            difference < 0
        ) {

            const daysOverdue =
                Math.abs(
                    difference
                );


            return daysOverdue === 1
                ? "1 day overdue"
                : `${daysOverdue} days overdue`;

        }


        if (
            difference === 0
        ) {

            return "Due today";

        }


        if (
            difference === 1
        ) {

            return "Tomorrow";

        }


        return `In ${difference} days`;

    }


    /* =========================
       GARDEN EXPOSURE
    ========================= */

    function getGardenExposure() {

        if (
            !gardenProfile
        ) {

            return "unknown";

        }


        if (
            gardenProfile.type ===
            "backyard" ||

            gardenProfile.type ===
            "raised"
        ) {

            return "outdoor";

        }


        if (
            gardenProfile.type ===
            "container" ||

            gardenProfile.type ===
            "balcony"
        ) {

            return "variable";

        }


        if (
            gardenProfile.type ===
            "hydroponic"
        ) {

            return "hydroponic";

        }


        return "unknown";

    }


    /* =========================
       WATER NEED
    ========================= */

    function getPlantWaterNeed(
        plant
    ) {

        const wateringText =
            String(
                plant.watering ||
                plant.water ||
                ""
            ).toLowerCase();


        if (
            wateringText.includes(
                "frequent"
            ) ||

            Number(
                plant.waterEveryDays
            ) <= 1
        ) {

            return "high";

        }


        if (
            wateringText.includes(
                "minimum"
            ) ||

            Number(
                plant.waterEveryDays
            ) >= 4
        ) {

            return "low";

        }


        return "medium";

    }


    /* =========================
       WEATHER ADVICE
    ========================= */

    function getWeatherAdvice(
        plant
    ) {

        if (
            !weather
        ) {

            return null;

        }


        const todayForecast =
            weather.forecast?.[0];


        if (
            !todayForecast
        ) {

            return null;

        }


        const gardenExposure =
            getGardenExposure();


        const plantWaterNeed =
            getPlantWaterNeed(
                plant
            );


        const rainLikely =
            todayForecast.rainChance >=
            70 ||

            todayForecast.precipitation >=
            0.1;


        const heavyRain =
            todayForecast.precipitation >=
            0.25;


        const hot =
            weather.current.temperature >=
            90;


        const veryHot =
            weather.current.temperature >=
            95;


        const windy =
            weather.current.windSpeed >=
            20;


        /* HYDROPONIC */

        if (
            gardenExposure ===
            "hydroponic"
        ) {

            if (
                veryHot
            ) {

                return {

                    type:
                        "heat",

                    icon:
                        "🌡️",

                    title:
                        "Check reservoir",

                    text:
                        "Hot weather can increase water loss. Check your hydroponic reservoir level.",

                    allowRainWatering:
                        false

                };

            }


            return {

                type:
                    "hydro",

                icon:
                    "💧",

                title:
                    "Hydroponic system",

                text:
                    "Outdoor rainfall does not replace reservoir maintenance.",

                allowRainWatering:
                    false

            };

        }


        /* OUTDOOR */

        if (
            gardenExposure ===
            "outdoor" &&
            rainLikely
        ) {

            if (
                heavyRain
            ) {

                return {

                    type:
                        "rain",

                    icon:
                        "🌧️",

                    title:
                        "Watering may not be needed",

                    text:
                        "Significant rain is expected. Check the soil before adding more water.",

                    allowRainWatering:
                        true

                };

            }


            return {

                type:
                    "rain",

                icon:
                    "🌦️",

                title:
                    "Rain may help",

                text:
                    "Rain is likely today. Check soil moisture before watering.",

                allowRainWatering:
                    true

            };

        }


        /* CONTAINER / BALCONY */

        if (
            gardenExposure ===
            "variable" &&
            rainLikely
        ) {

            return {

                type:
                    "rain",

                icon:
                    "🪴",

                title:
                    "Check plant exposure",

                text:
                    "Rain is expected. Use Rain Watered only if the container actually received enough rain.",

                allowRainWatering:
                    true

            };

        }


        /* VERY HOT */

        if (
            veryHot
        ) {

            if (
                plantWaterNeed ===
                "high"
            ) {

                return {

                    type:
                        "heat",

                    icon:
                        "🔥",

                    title:
                        "High water demand",

                    text:
                        "Very hot weather plus a thirsty plant can dry soil quickly. Check moisture today.",

                    allowRainWatering:
                        false

                };

            }


            return {

                type:
                    "heat",

                icon:
                    "☀️",

                title:
                    "Heat alert",

                text:
                    "Very hot conditions may dry the soil faster than the normal schedule.",

                allowRainWatering:
                    false

            };

        }


        /* HOT */

        if (
            hot &&
            plantWaterNeed !==
            "low"
        ) {

            return {

                type:
                    "heat",

                icon:
                    "☀️",

                title:
                    "Warm conditions",

                text:
                    "Hot weather may increase this plant's water needs.",

                allowRainWatering:
                    false

            };

        }


        /* WIND */

        if (
            windy &&
            gardenExposure !==
            "unknown"
        ) {

            return {

                type:
                    "wind",

                icon:
                    "💨",

                title:
                    "Drying winds",

                text:
                    "Wind can increase evaporation. Check exposed soil and containers.",

                allowRainWatering:
                    false

            };

        }


        return null;

    }


    /* =========================
       SCHEDULE
    ========================= */

    const scheduledPlants =
        gardenPlants
            .map(
                (plant) => {

                    const record =
                        wateringRecords.find(
                            (wateringRecord) =>

                                wateringRecord.plantKey ===
                                plant.plantKey

                        );


                    return {

                        ...plant,

                        lastWatered:
                            record?.lastWatered ||
                            null,

                        nextWatering:
                            record?.nextWatering ||
                            null,

                        lastWateringMethod:
                            record?.lastWateringMethod ||
                            null

                    };

                }
            )
            .filter(
                (plant) =>
                    plant.nextWatering
            )
            .sort(
                (
                    plantA,
                    plantB
                ) =>

                    plantA.nextWatering.localeCompare(
                        plantB.nextWatering
                    )

            );


    const today =
        getLocalDateString(
            new Date()
        );


    /* =========================
       GARDEN SUMMARY
    ========================= */

    function getGardenWateringSummary() {

        const exposure =
            getGardenExposure();


        if (
            exposure ===
            "outdoor"
        ) {

            return "Outdoor soil garden";

        }


        if (
            exposure ===
            "variable"
        ) {

            return "Container exposure varies";

        }


        if (
            exposure ===
            "hydroponic"
        ) {

            return "Hydroponic reservoir system";

        }


        return "Garden profile not set";

    }


    /* =========================
       RENDER
    ========================= */

    return (

        <section className="watering-section">


            <div className="watering-header">

                <div>

                    <h2>
                        💧 Smart Watering
                    </h2>

                    <p>
                        Weather + garden type +
                        plant water needs
                    </p>

                </div>


                <span className="watering-garden-type">

                    {
                        getGardenWateringSummary()
                    }

                </span>

            </div>


            {
                !gardenProfile && (

                    <div className="watering-profile-warning">

                        <span>
                            🪴
                        </span>

                        <p>
                            Build your Garden Profile
                            for more accurate watering advice.
                        </p>

                        <Link
                            to="/garden"
                        >
                            Build Garden
                        </Link>

                    </div>

                )
            }


            {
                gardenPlants.length ===
                0
                    ? (

                        <div className="watering-empty">

                            <span>
                                🌱
                            </span>

                            <p>
                                Add plants to My Garden
                                to create watering reminders.
                            </p>

                            <Link
                                to="/plants"
                                className="garden-profile-link"
                            >
                                Find Plants
                            </Link>

                        </div>

                    )
                    : (

                        <div className="watering-list">

                            {
                                scheduledPlants.map(
                                    (plant) => {

                                        const due =
                                            plant.nextWatering <=
                                            today;


                                        const weatherAdvice =
                                            due
                                                ? getWeatherAdvice(
                                                    plant
                                                )
                                                : null;


                                        const waterNeed =
                                            getPlantWaterNeed(
                                                plant
                                            );


                                        return (

                                            <article
                                                className={
                                                    due
                                                        ? "watering-card due"
                                                        : "watering-card"
                                                }
                                                key={
                                                    plant.plantKey
                                                }
                                            >

                                                {
                                                    plant.image
                                                        ? (

                                                            <img
                                                                src={
                                                                    plant.image
                                                                }
                                                                alt={
                                                                    plant.name
                                                                }
                                                                className="watering-plant-image"
                                                            />

                                                        )
                                                        : (

                                                            <span className="watering-plant-icon">

                                                                {
                                                                    plant.icon ||
                                                                    "🌱"
                                                                }

                                                            </span>

                                                        )
                                                }


                                                <div className="watering-info">

                                                    <strong>
                                                        {
                                                            plant.name
                                                        }
                                                    </strong>


                                                    <span
                                                        className={
                                                            due
                                                                ? "watering-due-text due"
                                                                : "watering-due-text"
                                                        }
                                                    >

                                                        {
                                                            getDueText(
                                                                plant.nextWatering
                                                            )
                                                        }

                                                    </span>


                                                    <div className="watering-meta">

                                                        <span>

                                                            💧{" "}

                                                            {
                                                                waterNeed ===
                                                                "high"
                                                                    ? "High need"
                                                                    : waterNeed ===
                                                                      "low"
                                                                        ? "Low need"
                                                                        : "Moderate need"
                                                            }

                                                        </span>


                                                        <span>

                                                            Every{" "}

                                                            {
                                                                plant.waterEveryDays
                                                            }

                                                            {
                                                                plant.waterEveryDays ===
                                                                1
                                                                    ? " day"
                                                                    : " days"
                                                            }

                                                        </span>

                                                    </div>


                                                    {
                                                        plant.lastWateringMethod ===
                                                        "rain" && (

                                                            <div className="last-watering-method">

                                                                🌧️ Last cycle:
                                                                rain

                                                            </div>

                                                        )
                                                    }


                                                    {
                                                        weatherAdvice && (

                                                            <div
                                                                className={
                                                                    `watering-weather-advice ${weatherAdvice.type}`
                                                                }
                                                            >

                                                                <span>
                                                                    {
                                                                        weatherAdvice.icon
                                                                    }
                                                                </span>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            weatherAdvice.title
                                                                        }
                                                                    </strong>

                                                                    <p>
                                                                        {
                                                                            weatherAdvice.text
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )
                                                    }

                                                </div>


                                                {
                                                    due && (

                                                        <div className="watering-actions">


                                                            <button
                                                                type="button"
                                                                className="mark-watered-button"
                                                                onClick={() =>
                                                                    onMarkPlantWatered(
                                                                        plant.plantKey
                                                                    )
                                                                }
                                                            >
                                                                ✓ Watered
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="delay-watering-button"
                                                                onClick={() =>
                                                                    onDelayWatering(
                                                                        plant.plantKey
                                                                    )
                                                                }
                                                            >
                                                                +1 Day
                                                            </button>


                                                            {
                                                                weatherAdvice
                                                                    ?.allowRainWatering && (

                                                                    <button
                                                                        type="button"
                                                                        className="rain-watered-button"
                                                                        onClick={() =>
                                                                            onRainWatered(
                                                                                plant.plantKey
                                                                            )
                                                                        }
                                                                    >
                                                                        🌧️ Rain Watered
                                                                    </button>

                                                                )
                                                            }

                                                        </div>

                                                    )
                                                }

                                            </article>

                                        );

                                    }
                                )
                            }

                        </div>

                    )
            }


        </section>

    );

}


export default WateringReminder;