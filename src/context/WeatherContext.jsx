import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";


import {
    getUserLocation,
    getWeather
} from "../services/weatherApi";

import {
    readJson
} from "../utils/safeStorage";


const WeatherContext =
    createContext(
        null
    );


/* =========================================================
   NORMALIZE LOCATION
========================================================= */

function normalizeLocation(
    location
) {

    if (
        !location
    ) {

        return null;

    }


    const latitude =
        Number(
            location.latitude ??
            location.lat
        );


    const longitude =
        Number(
            location.longitude ??
            location.lng ??
            location.lon
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {

        return null;

    }


    return {
        ...location,

        latitude,

        longitude,

        lat:
            latitude,

        lng:
            longitude
    };

}


/* =========================================================
   GET SAVED GARDEN LOCATION
========================================================= */

function getSavedGardenLocation() {
    const parsedProfile =
        readJson(
            "gardenProfile",
            null
        );

    const savedLocation =
        parsedProfile
            ?.designSpace
            ?.location;

    return normalizeLocation(
        savedLocation
    );
}


/* =========================================================
   WEATHER PROVIDER
========================================================= */

export function WeatherProvider({
    children
}) {

    const [
        weather,
        setWeather
    ] = useState(
        null
    );


    const [
        loading,
        setLoading
    ] = useState(
        true
    );


    const [
        error,
        setError
    ] = useState(
        ""
    );


    const [
        updatedAt,
        setUpdatedAt
    ] = useState(
        ""
    );


    const [
        weatherLocation,
        setWeatherLocation
    ] = useState(
        null
    );


    const [
        locationSource,
        setLocationSource
    ] = useState(
        ""
    );

    const [
        usingCachedWeather,
        setUsingCachedWeather
    ] = useState(
        false
    );


    const [
        weatherCachedAt,
        setWeatherCachedAt
    ] = useState(
        ""
    );


    /* =====================================================
       LOAD WEATHER FOR LOCATION
    ===================================================== */

    const loadWeatherForLocation =
        useCallback(
            async (
                rawLocation,
                source
            ) => {

                const location =
                    normalizeLocation(
                        rawLocation
                    );


                if (
                    !location
                ) {

                    throw new Error(
                        "A valid weather location is unavailable."
                    );

                }


                const weatherData =
                    await getWeather(
                        location.latitude,
                        location.longitude
                    );


                setWeather(
                    weatherData
                );


                setWeatherLocation(
                    location
                );


                setLocationSource(
                    source
                );


                const cachedAt =
                    weatherData
                        ?.cacheMeta
                        ?.cachedAt ||
                    "";


                const fromCache =
                    Boolean(
                        weatherData
                            ?.cacheMeta
                            ?.fromCache
                    );


                setUsingCachedWeather(
                    fromCache
                );


                setWeatherCachedAt(
                    cachedAt
                );


                const displayDate =
                    cachedAt
                        ? new Date(
                            cachedAt
                        )
                        : new Date();


                setUpdatedAt(
                    displayDate
                        .toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "numeric",

                                minute:
                                    "2-digit"
                            }
                        )
                );


                return weatherData;

            },
            []
        );


    /* =====================================================
       REFRESH WEATHER

       Priority:
       1. Explicit location passed in
       2. Saved garden location
       3. Device location
    ===================================================== */

    const refreshWeather =
        useCallback(
            async (
                preferredLocation =
                    null
            ) => {

                try {

                    setLoading(
                        true
                    );


                    setError(
                        ""
                    );


                    const explicitLocation =
                        normalizeLocation(
                            preferredLocation
                        );


                    if (
                        explicitLocation
                    ) {

                        await loadWeatherForLocation(
                            explicitLocation,
                            "garden"
                        );


                        return;

                    }


                    const savedGardenLocation =
                        getSavedGardenLocation();


                    if (
                        savedGardenLocation
                    ) {

                        await loadWeatherForLocation(
                            savedGardenLocation,
                            "garden"
                        );


                        return;

                    }


                    const deviceLocation =
                        await getUserLocation();


                    await loadWeatherForLocation(
                        deviceLocation,
                        "device"
                    );

                } catch (error) {

                    console.error(
                        "Unable to load weather:",
                        error
                    );


                    setError(
                        error?.message ||
                        "Unable to load weather."
                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                loadWeatherForLocation
            ]
        );


    /* =====================================================
       INITIAL WEATHER LOAD
    ===================================================== */

    useEffect(
        () => {

            const timeoutId =
                window.setTimeout(
                    () => {

                        refreshWeather();

                    },
                    0
                );


            return () => {

                window.clearTimeout(
                    timeoutId
                );

            };

        },
        [
            refreshWeather
        ]
    );


    /* =====================================================
       LISTEN FOR NEW GARDEN LOCATION

       LocalGrowingDataCard dispatches this event
       immediately after the device location is found.
    ===================================================== */

    useEffect(
        () => {

            function handleGardenLocation(
                event
            ) {

                const location =
                    normalizeLocation(
                        event.detail
                    );


                if (
                    !location
                ) {

                    return;

                }


                refreshWeather(
                    location
                );

            }


            window.addEventListener(
                "garden-location-resolved",
                handleGardenLocation
            );


            return () => {

                window.removeEventListener(
                    "garden-location-resolved",
                    handleGardenLocation
                );

            };

        },
        [
            refreshWeather
        ]
    );


    /* =====================================================
       LISTEN FOR STORAGE CHANGES

       Useful if the garden profile is changed
       from another browser tab.
    ===================================================== */

    useEffect(
        () => {

            function handleStorageChange(
                event
            ) {

                if (
                    event.key !==
                    "gardenProfile"
                ) {

                    return;

                }


                refreshWeather();

            }


            window.addEventListener(
                "storage",
                handleStorageChange
            );


            return () => {

                window.removeEventListener(
                    "storage",
                    handleStorageChange
                );

            };

        },
        [
            refreshWeather
        ]
    );


    /* =====================================================
       REFRESH CACHED WEATHER AFTER RECONNECT
    ===================================================== */

    useEffect(
        () => {

            function handleOnline() {
                const savedLocation =
                    weatherLocation ||
                    getSavedGardenLocation();


                if (
                    savedLocation
                ) {
                    refreshWeather(
                        savedLocation
                    );
                }
            }


            window.addEventListener(
                "online",
                handleOnline
            );


            return () => {
                window.removeEventListener(
                    "online",
                    handleOnline
                );
            };

        },
        [
            refreshWeather,
            weatherLocation
        ]
    );


    /* =====================================================
       CONTEXT
    ===================================================== */

    return (

        <WeatherContext.Provider
            value={{

                weather,

                loading,

                error,

                updatedAt,

                weatherLocation,

                locationSource,

                usingCachedWeather,

                weatherCachedAt,

                refreshWeather

            }}
        >

            {
                children
            }

        </WeatherContext.Provider>

    );

}


// The hook is intentionally co-located
// with its provider and context.
// eslint-disable-next-line react-refresh/only-export-components
export function useWeather() {

    const context =
        useContext(
            WeatherContext
        );


    if (
        !context
    ) {

        throw new Error(
            "useWeather must be used inside WeatherProvider."
        );

    }


    return context;

}