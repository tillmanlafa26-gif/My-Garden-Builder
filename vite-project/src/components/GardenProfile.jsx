import {
    Link
} from "react-router";


import {
    gardenPlans,
    gardenSizeNames,
    sunlightNames
} from "../data/gardenPlans";


function GardenProfile({
    gardenProfile
}) {

    const selectedGarden =
        gardenProfile?.type
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    return (
        <section className="garden-profile-card">

            <div className="garden-profile-header">

                <div>

                    <h2>
                        My Garden
                    </h2>


                    {gardenProfile ? (

                        <p>

                            {
                                selectedGarden?.name ||
                                "Garden"
                            }

                            {" • "}

                            {
                                gardenSizeNames[
                                    gardenProfile.size
                                ] ||
                                "Unknown Space"
                            }

                            {" • "}

                            {
                                sunlightNames[
                                    gardenProfile.sunlight
                                ] ||
                                "Unknown Sunlight"
                            }

                        </p>

                    ) : (

                        <p>
                            You haven't created
                            a garden plan yet.
                        </p>

                    )}

                </div>


                <span className="garden-profile-icon">

                    {
                        selectedGarden?.icon ||
                        "🌱"
                    }

                </span>

            </div>


            <Link
                to="/garden"
                className="garden-profile-link"
            >

                {
                    gardenProfile
                        ? "Edit Garden Plan"
                        : "Build My Garden"
                }

            </Link>

        </section>
    );

}


export default GardenProfile;