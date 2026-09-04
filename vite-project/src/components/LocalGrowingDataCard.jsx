import {
    useState
} from "react";


import {
    getGardenClimateData
} from "../services/gardenClimateApi";


import Icon from "./Icon";


/* =========================================================
   FORMAT DATE
========================================================= */

function formatGrowingDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "No regular frost";

    }


    return new Date(
        `${dateString}T12:00:00`
    ).toLocaleDateString(
        undefined,
        {
            month:
                "short",

            day:
                "numeric"
        }
    );

}


/* =========================================================
   LOCAL GROWING DATA CARD
========================================================= */

function LocalGrowingDataCard({
    location,
    hardinessZone,
    lastSpringFrost,
    firstFallFrost,
    onDataResolved
}) {

    const [
        status,
        setStatus
    ] = useState(
        "idle"
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const [
        climateDetails,
        setClimateDetails
    ] = useState(
        null
    );


    const isLoading =
        status ===
        "loading";


    /* =====================================================
       WEATHER LOCATION EVENT
    ===================================================== */

    function notifyWeatherSystem(
        locationRecord
    ) {

        window.dispatchEvent(
            new CustomEvent(
                "garden-location-resolved",
                {
                    detail:
                        locationRecord
                }
            )
        );

    }


    /* =====================================================
       LOOK UP CLIMATE DATA
    ===================================================== */

    async function resolveClimateData(
        locationRecord
    ) {

        try {

            setStatus(
                "loading"
            );


            setMessage(
                "Calculating your local growing zone and average frost dates..."
            );


            const climateData =
                await getGardenClimateData(
                    locationRecord.latitude,
                    locationRecord.longitude
                );


            setClimateDetails(
                climateData
            );


            onDataResolved?.({

                location:
                    locationRecord,

                hardinessZone:
                    climateData
                        .hardinessZone,

                lastSpringFrost:
                    climateData
                        .lastSpringFrost,

                firstFallFrost:
                    climateData
                        .firstFallFrost,

                growingDataSource:
                    climateData
                        .source,

                growingDataUpdatedAt:
                    climateData
                        .calculatedAt

            });


            setStatus(
                "success"
            );


            if (
                climateData
                    .lastSpringFrost ||
                climateData
                    .firstFallFrost
            ) {

                setMessage(
                    "Local growing data is ready. Your zone and frost dates have been filled automatically."
                );

            } else {

                setMessage(
                    "Local growing data is ready. This climate does not show a consistent annual frost season."
                );

            }

        } catch (error) {

            console.error(
                "Unable to calculate local growing data:",
                error
            );


            /*
                Keep the location even when
                climate calculation fails.

                Weather can still use it.
            */

            onDataResolved?.({
                location:
                    locationRecord
            });


            setClimateDetails(
                null
            );


            setStatus(
                "error"
            );


            setMessage(
                "Your garden location was captured, but climate data could not be calculated. Weather can still use your location, and you can enter the zone and frost dates manually."
            );

        }

    }


    /* =====================================================
       ENABLE LOCATION
    ===================================================== */

    function enableGardenLocation() {

        setMessage(
            ""
        );


        if (
            !navigator
                .geolocation
        ) {

            setStatus(
                "error"
            );


            setMessage(
                "Location services are not available in this browser."
            );


            return;

        }


        setStatus(
            "loading"
        );


        setMessage(
            "Finding your garden location..."
        );


        navigator
            .geolocation
            .getCurrentPosition(

                (
                    position
                ) => {

                    const latitude =
                        Number(
                            position
                                .coords
                                .latitude
                        );


                    const longitude =
                        Number(
                            position
                                .coords
                                .longitude
                        );


                    const locationRecord = {

                        latitude,

                        longitude,

                        lat:
                            latitude,

                        lng:
                            longitude,

                        accuracy:
                            Number(
                                position
                                    .coords
                                    .accuracy ||
                                0
                            ),

                        capturedAt:
                            new Date()
                                .toISOString(),

                        source:
                            "device-geolocation"

                    };


                    /*
                        Weather starts using the
                        location immediately.
                    */

                    notifyWeatherSystem(
                        locationRecord
                    );


                    /*
                        Then automatically calculate:
                        - hardiness zone
                        - spring frost
                        - fall frost
                    */

                    resolveClimateData(
                        locationRecord
                    );

                },

                (
                    error
                ) => {

                    console.error(
                        "Device location error:",
                        error
                    );


                    setStatus(
                        "error"
                    );


                    if (
                        error.code ===
                        error.PERMISSION_DENIED
                    ) {

                        setMessage(
                            "Location permission was denied. Enable location permission for My Garden Builder or enter your growing information manually."
                        );

                        return;

                    }


                    if (
                        error.code ===
                        error.TIMEOUT
                    ) {

                        setMessage(
                            "Finding your location took too long. Try again or enter your growing information manually."
                        );

                        return;

                    }


                    setMessage(
                        "Your location could not be determined. You can continue by entering your growing information manually."
                    );

                },

                {
                    enableHighAccuracy:
                        false,

                    timeout:
                        12000,

                    maximumAge:
                        15 *
                        60 *
                        1000
                }

            );

    }


    /* =====================================================
       DISPLAY VALUES

       Props update when Home receives the
       calculated climate result.
    ===================================================== */

    const displayZone =
        hardinessZone ||
        climateDetails
            ?.hardinessZone ||
        "";


    const displaySpringFrost =
        lastSpringFrost ||
        climateDetails
            ?.lastSpringFrost ||
        "";


    const displayFallFrost =
        firstFallFrost ||
        climateDetails
            ?.firstFallFrost ||
        "";


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="home-local-growing-card">


            <div className="home-local-growing-heading">

                <span className="home-local-growing-icon">
                    <Icon
                        name="mapPin"
                        size={20}
                    />
                </span>


                <div>

                    <strong>
                        Garden Location
                    </strong>


                    <small>
                        Enable location once and My Garden Builder will automatically calculate weather, your estimated growing zone, and average frost dates.
                    </small>

                </div>

            </div>


            <button
                type="button"

                className="home-local-growing-button"

                onClick={
                    enableGardenLocation
                }

                disabled={
                    isLoading
                }
            >

                <span className="home-local-growing-button-icon">
                    <Icon
                        name={
                            isLoading
                                ? "rotate"
                                : "mapPin"
                        }
                        size={17}
                    />
                </span>

                <span>
                    {
                        isLoading
                            ? "Calculating Local Growing Data..."
                            : location
                                ? "Update Garden Location"
                                : "Enable Garden Location"
                    }
                </span>

            </button>


            {
                location && (

                    <div className="home-local-location-saved">

                        <span className="home-local-growing-check">
                            <Icon
                                name="check"
                                size={17}
                            />
                        </span>


                        <div>

                            <strong>
                                Garden Location Enabled
                            </strong>


                            <small>
                                Weather and garden climate planning now share this location.
                            </small>

                        </div>

                    </div>

                )
            }


            {
                (
                    displayZone ||
                    displaySpringFrost ||
                    displayFallFrost
                ) && (

                    <div className="home-local-growing-results">


                        <div>

                            <span>
                                <Icon
                                    name="thermometer"
                                    size={18}
                                />
                            </span>


                            <strong>

                                {
                                    displayZone
                                        ? `Zone ${displayZone}`
                                        : "—"
                                }

                            </strong>


                            <small>
                                Estimated zone
                            </small>

                        </div>


                        <div>

                            <span>
                                <Icon
                                    name="sprout"
                                    size={18}
                                />
                            </span>


                            <strong>

                                {
                                    formatGrowingDate(
                                        displaySpringFrost
                                    )
                                }

                            </strong>


                            <small>
                                Avg. last frost
                            </small>

                        </div>


                        <div>

                            <span>
                                <Icon
                                    name="leaf"
                                    size={18}
                                />
                            </span>


                            <strong>

                                {
                                    formatGrowingDate(
                                        displayFallFrost
                                    )
                                }

                            </strong>


                            <small>
                                Avg. first frost
                            </small>

                        </div>

                    </div>

                )
            }


            {
                climateDetails
                    ?.averageAnnualExtremeMinimumF !==
                    undefined &&
                climateDetails
                    ?.averageAnnualExtremeMinimumF !==
                    null && (

                    <p className="home-local-growing-disclaimer">

                        1991–2020 average annual extreme minimum:{" "}

                        <strong>

                            {
                                climateDetails
                                    .averageAnnualExtremeMinimumF
                            }

                            °F

                        </strong>

                    </p>

                )
            }


            {
                message && (

                    <p
                        className={
                            status ===
                            "success"
                                ? "home-local-growing-message success"
                                : status ===
                                  "error"
                                    ? "home-local-growing-message error"
                                    : "home-local-growing-message"
                        }
                    >

                        {
                            message
                        }

                    </p>

                )
            }


            <p className="home-local-growing-disclaimer">
                Zone and frost dates are climate estimates from 1991–2020 historical data. Keep the fields below editable for local microclimates.
            </p>

        </div>

    );

}


export default LocalGrowingDataCard;