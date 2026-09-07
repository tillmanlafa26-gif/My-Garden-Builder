import {
    createCoordinateCacheKey,
    isOffline,
    loadRuntimeCache,
    saveRuntimeCache,
    withCacheMeta
} from "../utils/runtimeCache";

const WEATHER_BASE_URL =
    "https://api.open-meteo.com/v1/forecast";


/* =========================
   USER LOCATION
========================= */

export function getUserLocation() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (
                !(
                    "geolocation"
                    in navigator
                )
            ) {

                reject(
                    new Error(
                        "Location services are not supported by this browser."
                    )
                );

                return;

            }


            navigator.geolocation
                .getCurrentPosition(

                    (position) => {

                        resolve({

                            latitude:
                                position.coords
                                    .latitude,

                            longitude:
                                position.coords
                                    .longitude

                        });

                    },


                    (error) => {

                        if (
                            error.code ===
                            error.PERMISSION_DENIED
                        ) {

                            reject(
                                new Error(
                                    "Location permission was denied. Allow location access to see local garden weather."
                                )
                            );

                            return;

                        }


                        if (
                            error.code ===
                            error.POSITION_UNAVAILABLE
                        ) {

                            reject(
                                new Error(
                                    "Your location is currently unavailable."
                                )
                            );

                            return;

                        }


                        if (
                            error.code ===
                            error.TIMEOUT
                        ) {

                            reject(
                                new Error(
                                    "Location request timed out. Please try again."
                                )
                            );

                            return;

                        }


                        reject(
                            new Error(
                                "Unable to determine your location."
                            )
                        );

                    },


                    {
                        enableHighAccuracy:
                            false,

                        timeout:
                            10000,

                        maximumAge:
                            900000
                    }

                );

        }
    );

}


/* =========================
   WEATHER CODE
========================= */

export function getWeatherDescription(
    code
) {

    if (
        code === 0
    ) {

        return {
            label:
                "Clear Sky",

            icon:
                "☀️"
        };

    }


    if (
        [
            1,
            2
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Partly Cloudy",

            icon:
                "🌤️"
        };

    }


    if (
        code === 3
    ) {

        return {
            label:
                "Overcast",

            icon:
                "☁️"
        };

    }


    if (
        [
            45,
            48
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Fog",

            icon:
                "🌫️"
        };

    }


    if (
        [
            51,
            53,
            55,
            56,
            57
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Drizzle",

            icon:
                "🌦️"
        };

    }


    if (
        [
            61,
            63,
            65,
            66,
            67,
            80,
            81,
            82
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Rain",

            icon:
                "🌧️"
        };

    }


    if (
        [
            71,
            73,
            75,
            77,
            85,
            86
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Snow",

            icon:
                "❄️"
        };

    }


    if (
        [
            95,
            96,
            99
        ].includes(
            code
        )
    ) {

        return {
            label:
                "Thunderstorm",

            icon:
                "⛈️"
        };

    }


    return {
        label:
            "Weather",

        icon:
            "🌤️"
    };

}


/* =========================
   GET WEATHER
========================= */

export async function getWeather(
    latitude,
    longitude
) {
    const cacheKey =
        createCoordinateCacheKey(
            "weather",
            latitude,
            longitude
        );

    const cachedWeather =
        loadRuntimeCache(
            cacheKey,
            {
                maxAgeMs:
                    6 * 60 * 60 * 1000,
                allowStale:
                    true
            }
        );

    if (
        isOffline()
    ) {
        if (
            cachedWeather
        ) {
            return withCacheMeta(
                cachedWeather.data,
                cachedWeather,
                {
                    offline:
                        true
                }
            );
        }

        throw new Error(
            "You’re offline and no saved weather is available yet. Your garden plan still works offline."
        );
    }

    const parameters =
        new URLSearchParams();

    parameters.set(
        "latitude",
        String(
            latitude
        )
    );

    parameters.set(
        "longitude",
        String(
            longitude
        )
    );

    parameters.set(
        "current",
        [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "wind_speed_10m"
        ].join(",")
    );

    parameters.set(
        "daily",
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max"
        ].join(",")
    );

    parameters.set(
        "temperature_unit",
        "fahrenheit"
    );

    parameters.set(
        "wind_speed_unit",
        "mph"
    );

    parameters.set(
        "precipitation_unit",
        "inch"
    );

    parameters.set(
        "timezone",
        "auto"
    );

    parameters.set(
        "forecast_days",
        "3"
    );

    let response;

    try {
        response =
            await fetch(
                `${WEATHER_BASE_URL}?${parameters.toString()}`
            );
    } catch (error) {
        console.error(
            "Weather network request failed:",
            error
        );

        if (
            cachedWeather
        ) {
            return withCacheMeta(
                cachedWeather.data,
                cachedWeather,
                {
                    fallbackReason:
                        "network-error"
                }
            );
        }

        throw new Error(
            "Live weather is temporarily unavailable. Try again when your connection is stable."
        );
    }

    if (
        !response.ok
    ) {
        if (
            cachedWeather
        ) {
            return withCacheMeta(
                cachedWeather.data,
                cachedWeather,
                {
                    fallbackReason:
                        `http-${response.status}`
                }
            );
        }

        throw new Error(
            `Weather service is unavailable right now (${response.status}). Please try again shortly.`
        );
    }

    const data =
        await response.json();

    const currentWeather =
        getWeatherDescription(
            data.current
                ?.weather_code
        );

    const forecast =
        (
            data.daily
                ?.time ||
            []
        ).map(
            (
                date,
                index
            ) => {
                const weather =
                    getWeatherDescription(
                        data.daily
                            ?.weather_code?.[
                                index
                            ]
                    );

                return {
                    date,
                    weatherCode:
                        data.daily
                            ?.weather_code?.[
                                index
                            ] ?? null,
                    label:
                        weather.label,
                    icon:
                        weather.icon,
                    high:
                        data.daily
                            ?.temperature_2m_max?.[
                                index
                            ] ?? null,
                    low:
                        data.daily
                            ?.temperature_2m_min?.[
                                index
                            ] ?? null,
                    precipitation:
                        data.daily
                            ?.precipitation_sum?.[
                                index
                            ] ?? 0,
                    rainChance:
                        data.daily
                            ?.precipitation_probability_max?.[
                                index
                            ] ?? 0
                };
            }
        );

    if (
        !data.current ||
        forecast.length === 0
    ) {
        if (
            cachedWeather
        ) {
            return withCacheMeta(
                cachedWeather.data,
                cachedWeather,
                {
                    fallbackReason:
                        "incomplete-response"
                }
            );
        }

        throw new Error(
            "Weather data was incomplete. Please try again shortly."
        );
    }

    const result = {
        latitude:
            data.latitude,
        longitude:
            data.longitude,
        timezone:
            data.timezone,
        current: {
            temperature:
                data.current
                    ?.temperature_2m ??
                null,
            feelsLike:
                data.current
                    ?.apparent_temperature ??
                null,
            humidity:
                data.current
                    ?.relative_humidity_2m ??
                null,
            precipitation:
                data.current
                    ?.precipitation ??
                0,
            windSpeed:
                data.current
                    ?.wind_speed_10m ??
                null,
            weatherCode:
                data.current
                    ?.weather_code ??
                null,
            label:
                currentWeather.label,
            icon:
                currentWeather.icon
        },
        forecast
    };

    saveRuntimeCache(
        cacheKey,
        result
    );

    return withCacheMeta(
        result,
        null,
        {
            offline:
                false
        }
    );
}

