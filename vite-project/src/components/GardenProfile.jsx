import {
    Link
} from "react-router";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


import {
    hardinessTemperatureRanges
} from "../data/hardinessZones";


function GardenProfile({
    gardenProfile
}) {

    const selectedGarden =
        gardenProfile
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    const designSpace =
        gardenProfile?.designSpace ||
        null;


    return (

        <section className="garden-profile-card">


            <div className="garden-profile-header">

                <h2>
                    📐 My Garden Design
                </h2>


                <Link
                    to="/garden"
                    className="garden-profile-link"
                >

                    {
                        gardenProfile
                            ? "Edit Design"
                            : "Design My Garden"
                    }

                </Link>

            </div>


            {
                !gardenProfile
                    ? (

                        <div className="garden-profile-empty">

                            <span>
                                🌱
                            </span>

                            <p>
                                Enter the dimensions
                                of your space to start
                                designing your garden.
                            </p>

                        </div>

                    )
                    : (

                        <div className="garden-profile-content">


                            <div className="garden-profile-main">

                                <span className="garden-profile-icon">

                                    {
                                        selectedGarden
                                            ?.icon ||
                                        "🌱"
                                    }

                                </span>


                                <div>

                                    <strong>

                                        {
                                            selectedGarden
                                                ?.name ||
                                            "My Garden"
                                        }

                                    </strong>


                                    <p>

                                        {
                                            sunlightNames[
                                                gardenProfile.sunlight
                                            ] ||
                                            "Sunlight not set"
                                        }

                                    </p>

                                </div>

                            </div>


                            {
                                designSpace && (

                                    <div className="garden-space-summary">


                                        <div>

                                            <span>
                                                📏
                                            </span>

                                            <strong>
                                                Dimensions
                                            </strong>

                                            <small>

                                                {
                                                    designSpace.width
                                                }

                                                {" × "}

                                                {
                                                    designSpace.length
                                                }

                                                {" "}

                                                {
                                                    designSpace.unit
                                                }

                                            </small>

                                        </div>


                                        <div>

                                            <span>
                                                📐
                                            </span>

                                            <strong>
                                                Area
                                            </strong>

                                            <small>

                                                {
                                                    Math.round(
                                                        designSpace
                                                            .areaSquareFeet
                                                    )
                                                }

                                                {" sq ft"}

                                            </small>

                                        </div>


                                        <div>

                                            <span>
                                                💵
                                            </span>

                                            <strong>
                                                Budget
                                            </strong>

                                            <small>

                                                {
                                                    designSpace.budget
                                                        ? `$${Number(
                                                            designSpace.budget
                                                        ).toLocaleString()}`
                                                        : "Not set"
                                                }

                                            </small>

                                        </div>


                                    </div>

                                )
                            }


                            {
                                gardenProfile.hardinessZone && (

                                    <div className="garden-zone-card">

                                        <span>
                                            🌡️
                                        </span>


                                        <div>

                                            <strong>

                                                USDA Zone{" "}

                                                {
                                                    gardenProfile
                                                        .hardinessZone
                                                }

                                            </strong>


                                            <small>

                                                {
                                                    hardinessTemperatureRanges[
                                                        gardenProfile
                                                            .hardinessZone
                                                    ]
                                                }

                                            </small>

                                        </div>

                                    </div>

                                )
                            }


                            {
                                designSpace?.features
                                    ?.length >
                                0 && (

                                    <div className="garden-design-features">

                                        {
                                            designSpace.features.map(
                                                (feature) => (

                                                    <span
                                                        key={
                                                            feature
                                                        }
                                                    >

                                                        {
                                                            feature
                                                                .replaceAll(
                                                                    "-",
                                                                    " "
                                                                )
                                                        }

                                                    </span>

                                                )
                                            )
                                        }

                                    </div>

                                )
                            }


                        </div>

                    )
            }


        </section>

    );

}


export default GardenProfile;