import {
    useWeather
} from "../context/WeatherContext";


function WeatherCard() {

    const {
        weather,
        loading,
        error,
        updatedAt,
        refreshWeather
    } = useWeather();


    function getDayName(
        dateString,
        index
    ) {

        if (
            index === 0
        ) {

            return "Today";

        }


        if (
            index === 1
        ) {

            return "Tomorrow";

        }


        const date =
            new Date(
                `${dateString}T12:00:00`
            );


        return date
            .toLocaleDateString(
                undefined,
                {
                    weekday:
                        "short"
                }
            );

    }


    function getGardenMessage() {

        const today =
            weather
                ?.forecast?.[0];


        if (
            !today
        ) {

            return null;

        }


        if (
            today.rainChance >=
            70 ||
            today.precipitation >=
            0.1
        ) {

            return {

                icon:
                    "🌧️",

                text:
                    "Rain is likely today. Check soil moisture before watering."

            };

        }


        if (
            weather.current
                .temperature >=
            90
        ) {

            return {

                icon:
                    "🔥",

                text:
                    "Hot conditions may dry garden soil faster than normal."

            };

        }


        if (
            weather.current
                .temperature <=
            35
        ) {

            return {

                icon:
                    "❄️",

                text:
                    "Cold conditions may stress sensitive garden plants."

            };

        }


        return {

            icon:
                "🌱",

            text:
                "Conditions look normal for your garden schedule."

        };

    }


    if (
        loading
    ) {

        return (

            <section className="weather-card live-weather-card">

                <div className="weather-loading">

                    <span>
                        🌤️
                    </span>

                    <div>

                        <strong>
                            Checking local weather...
                        </strong>

                        <p>
                            Allow location access
                            when requested.
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    if (
        error
    ) {

        return (

            <section className="weather-card live-weather-card">

                <div className="weather-card-header">

                    <div>

                        <h2>
                            🌤️ Local Weather
                        </h2>

                        <p>
                            Weather helps improve
                            garden care.
                        </p>

                    </div>

                </div>


                <div className="weather-error">

                    <span>
                        📍
                    </span>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            refreshWeather
                        }
                    >
                        Try Location Again
                    </button>

                </div>

            </section>

        );

    }


    if (
        !weather
    ) {

        return null;

    }


    const gardenMessage =
        getGardenMessage();


    return (

        <section className="weather-card live-weather-card">


            <div className="weather-card-header">

                <div>

                    <h2>
                        🌤️ Local Weather
                    </h2>

                    <p>
                        Your garden conditions
                        right now
                    </p>

                </div>


                <button
                    type="button"
                    className="weather-refresh-button"
                    onClick={
                        refreshWeather
                    }
                    aria-label="Refresh weather"
                    title="Refresh weather"
                >
                    ↻
                </button>

            </div>


            <div className="weather-current">

                <span className="weather-main-icon">
                    {
                        weather.current.icon
                    }
                </span>


                <div className="weather-temperature">

                    <strong>

                        {
                            Math.round(
                                weather.current
                                    .temperature
                            )
                        }

                        °

                    </strong>


                    <span>
                        {
                            weather.current
                                .label
                        }
                    </span>


                    <small>

                        Feels like{" "}

                        {
                            Math.round(
                                weather.current
                                    .feelsLike
                            )
                        }

                        °F

                    </small>

                </div>

            </div>


            <div className="weather-details">

                <div>

                    <span>
                        💧
                    </span>

                    <strong>
                        {
                            weather.current
                                .humidity
                        }%
                    </strong>

                    <small>
                        Humidity
                    </small>

                </div>


                <div>

                    <span>
                        💨
                    </span>

                    <strong>

                        {
                            Math.round(
                                weather.current
                                    .windSpeed
                            )
                        }

                        {" "}
                        mph

                    </strong>

                    <small>
                        Wind
                    </small>

                </div>


                <div>

                    <span>
                        🌧️
                    </span>

                    <strong>

                        {
                            weather.forecast[
                                0
                            ]?.rainChance ??
                            0
                        }

                        %

                    </strong>

                    <small>
                        Rain Chance
                    </small>

                </div>

            </div>


            {
                gardenMessage && (

                    <div className="garden-weather-message">

                        <span>
                            {
                                gardenMessage.icon
                            }
                        </span>

                        <p>
                            {
                                gardenMessage.text
                            }
                        </p>

                    </div>

                )
            }


            <div className="weather-forecast">

                {
                    weather.forecast.map(
                        (
                            day,
                            index
                        ) => (

                            <div
                                className="weather-forecast-day"
                                key={
                                    day.date
                                }
                            >

                                <strong>
                                    {
                                        getDayName(
                                            day.date,
                                            index
                                        )
                                    }
                                </strong>

                                <span className="weather-forecast-icon">
                                    {
                                        day.icon
                                    }
                                </span>

                                <div className="weather-forecast-temperature">

                                    <span>

                                        {
                                            Math.round(
                                                day.high
                                            )
                                        }

                                        °

                                    </span>

                                    <small>

                                        {
                                            Math.round(
                                                day.low
                                            )
                                        }

                                        °

                                    </small>

                                </div>

                                <small>

                                    🌧️{" "}

                                    {
                                        day.rainChance
                                    }

                                    %

                                </small>

                            </div>

                        )
                    )
                }

            </div>


            <div className="weather-footer">

                <span>
                    Updated {updatedAt}
                </span>

                <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Weather by Open-Meteo
                </a>

            </div>

        </section>

    );

}


export default WeatherCard;