import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


import {
    getUserLocation,
    getWeather
} from "../services/weatherApi";


const WeatherContext =
    createContext(
        null
    );


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


    async function refreshWeather() {

        try {

            setLoading(
                true
            );


            setError(
                ""
            );


            const location =
                await getUserLocation();


            const weatherData =
                await getWeather(
                    location.latitude,
                    location.longitude
                );


            setWeather(
                weatherData
            );


            setUpdatedAt(
                new Date()
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

        } catch (error) {

            console.error(
                "Unable to load weather:",
                error
            );


            setError(
                error.message
            );

        } finally {

            setLoading(
                false
            );

        }

    }


    useEffect(() => {

        refreshWeather();

    }, []);


    return (

        <WeatherContext.Provider
            value={{

                weather,

                loading,

                error,

                updatedAt,

                refreshWeather

            }}
        >

            {children}

        </WeatherContext.Provider>

    );

}


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