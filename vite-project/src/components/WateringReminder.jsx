import {
    Link
} from "react-router";


import {
    useWeather
} from "../context/WeatherContext";


function WateringReminder({
    gardenPlants = [],
    wateringRecords = [],
    onMarkPlantWatered
}) {

    const {
        weather
    } = useWeather();


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


        const rainLikely =
            todayForecast.rainChance >=
            70 ||

            todayForecast.precipitation >=
            0.1;


        const hotWeather =
            weather.current.temperature >=
            90;


        const veryHotWeather =
            weather.current.temperature >=
            95;


        const highWind =
            weather.current.windSpeed >=
            20;


        if (
            rainLikely
        ) {

            return {

                type:
                    "rain",

                icon:
                    "🌧️",

                text:
                    "Rain likely — check soil before watering."

            };

        }


        if (
            veryHotWeather &&
            plant.waterEveryDays <=
            2
        ) {

            return {

                type:
                    "heat",

                icon:
                    "🔥",

                text:
                    "Very hot today — soil may dry faster."

            };

        }


        if (
            hotWeather
        ) {

            return {

                type:
                    "heat",

                icon:
                    "☀️",

                text:
                    "Hot weather — check moisture closely."

            };

        }


        if (
            highWind
        ) {

            return {

                type:
                    "wind",

                icon:
                    "💨",

                text:
                    "Wind may increase moisture loss."

            };

        }


        return null;

    }


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


    return (

        <section className="watering-section">


            <div className="watering-header">

                <h2>
                    💧 Smart Watering
                </h2>

                <p>
                    Plant schedule adjusted
                    with local weather advice.
                </p>

            </div>


            {
                gardenPlants.length === 0
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


                                                    <small>

                                                        Baseline:
                                                        every{" "}

                                                        {
                                                            plant.waterEveryDays
                                                        }

                                                        {
                                                            plant.waterEveryDays ===
                                                            1
                                                                ? " day"
                                                                : " days"
                                                        }

                                                    </small>


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

                                                                <p>
                                                                    {
                                                                        weatherAdvice.text
                                                                    }
                                                                </p>

                                                            </div>

                                                        )
                                                    }

                                                </div>


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