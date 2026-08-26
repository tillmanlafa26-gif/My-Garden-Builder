import {
    useState
} from "react";


function GardenLocationCard({
    location,
    onLocationChange
}) {

    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const [
        loading,
        setLoading
    ] = useState(
        false
    );


    function handleUseLocation() {

        if (
            !navigator.geolocation
        ) {

            setMessage(
                "Location services are not supported by this browser."
            );

            return;

        }


        setLoading(
            true
        );


        setMessage(
            "Requesting your location..."
        );


        navigator.geolocation.getCurrentPosition(

            /* =========================
               SUCCESS
            ========================= */

            (position) => {

                const newLocation = {

                    latitude:
                        Number(
                            position
                                .coords
                                .latitude
                                .toFixed(
                                    6
                                )
                        ),

                    longitude:
                        Number(
                            position
                                .coords
                                .longitude
                                .toFixed(
                                    6
                                )
                        ),

                    accuracy:
                        Math.round(
                            position
                                .coords
                                .accuracy
                        ),

                    source:
                        "device",

                    capturedAt:
                        new Date()
                            .toISOString()

                };


                onLocationChange(
                    newLocation
                );


                setMessage(
                    "✓ Location captured."
                );


                setLoading(
                    false
                );

            },


            /* =========================
               ERROR
            ========================= */

            (error) => {

                let errorMessage =
                    "Unable to access your location.";


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    errorMessage =
                        "Location permission was denied. You can allow location access in your browser and try again.";

                }


                if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    errorMessage =
                        "Your location is currently unavailable.";

                }


                if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    errorMessage =
                        "The location request timed out. Try again.";

                }


                setMessage(
                    errorMessage
                );


                setLoading(
                    false
                );

            },


            /* =========================
               OPTIONS
            ========================= */

            {
                enableHighAccuracy:
                    true,

                timeout:
                    10000,

                maximumAge:
                    300000
            }

        );

    }


    function handleClearLocation() {

        onLocationChange(
            null
        );


        setMessage(
            "Saved location removed."
        );

    }


    return (

        <section className="designer-card">


            <div className="designer-section-heading">

                <span>
                    8
                </span>


                <div>

                    <h2>
                        Garden Location
                    </h2>


                    <p>
                        Use your device location
                        to prepare for automatic
                        growing-zone, frost-date,
                        and weather guidance.
                    </p>

                </div>

            </div>


            {
                location
                    ? (

                        <>

                            <div className="material-build-summary">

                                <div>

                                    <strong>
                                        Latitude
                                    </strong>

                                    <span>
                                        {
                                            location.latitude
                                        }
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Longitude
                                    </strong>

                                    <span>
                                        {
                                            location.longitude
                                        }
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Accuracy
                                    </strong>

                                    <span>

                                        ±
                                        {
                                            location.accuracy
                                        }

                                        {" m"}

                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Source
                                    </strong>

                                    <span>
                                        Device
                                    </span>

                                </div>

                            </div>


                            <button
                                type="button"

                                className="primary-button"

                                onClick={
                                    handleUseLocation
                                }

                                disabled={
                                    loading
                                }
                            >

                                {
                                    loading
                                        ? "Updating Location..."
                                        : "Update My Location"
                                }

                            </button>


                            <button
                                type="button"

                                onClick={
                                    handleClearLocation
                                }

                                style={{
                                    width:
                                        "100%",

                                    marginTop:
                                        "8px",

                                    padding:
                                        "10px",

                                    border:
                                        "1px solid #ccd6c9",

                                    borderRadius:
                                        "9px",

                                    background:
                                        "transparent",

                                    cursor:
                                        "pointer"
                                }}
                            >

                                Remove Saved Location

                            </button>

                        </>

                    )
                    : (

                        <button
                            type="button"

                            className="primary-button"

                            onClick={
                                handleUseLocation
                            }

                            disabled={
                                loading
                            }
                        >

                            {
                                loading
                                    ? "Getting Location..."
                                    : "📍 Use My Current Location"
                            }

                        </button>

                    )
            }


            {
                message && (

                    <div className="material-assumptions">

                        <strong>
                            Location Status
                        </strong>

                        <p>
                            {
                                message
                            }
                        </p>

                    </div>

                )
            }


            <div className="material-assumptions">

                <strong>
                    🌱 Why We Need Location
                </strong>

                <p>
                    Your coordinates will later
                    allow My Garden Builder to
                    automatically determine local
                    growing information instead
                    of asking you to manually
                    enter everything.
                </p>

            </div>


        </section>

    );

}


export default GardenLocationCard;