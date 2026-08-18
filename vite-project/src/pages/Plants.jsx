import {
    Link
} from "react-router";


import VegetableLibrary
    from "../components/VegetableLibrary";


import BottomNav
    from "../components/BottomNav";


import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";


function Plants({
    gardenProfile,
    gardenPlants = [],
    onAddPlant,
    onRemovePlant
}) {

    const selectedGarden =
        gardenProfile
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    return (

        <div className="app-container">


            <header className="app-header">

                <h1>
                    🌿 Plant Library
                </h1>


                <p>
                    Discover edible plants
                    for your sustainable garden.
                </p>

            </header>


            {/* =========================
                GARDEN PROFILE NOTICE
            ========================= */}

            {
                !gardenProfile && (

                    <section className="plant-profile-notice">

                        <p>
                            Build your garden profile
                            to help us personalize
                            plant recommendations later.
                        </p>


                        <Link
                            to="/garden"
                            className="garden-profile-link"
                        >

                            Build My Garden

                        </Link>

                    </section>

                )
            }


            {/* =========================
                CURRENT GARDEN
            ========================= */}

            {
                gardenProfile && (

                    <section className="plant-recommendation-summary">

                        <span>

                            {
                                selectedGarden?.icon ||
                                "🌱"
                            }

                        </span>


                        <div>

                            <strong>
                                Your garden
                            </strong>


                            <p>

                                {
                                    selectedGarden?.name
                                }

                                {" • "}

                                {
                                    sunlightNames[
                                        gardenProfile.sunlight
                                    ]
                                }

                            </p>

                        </div>

                    </section>

                )
            }


            {/* =========================
                SAVED PLANT COUNT
            ========================= */}

            <section className="plant-results-header">

                <h2>
                    My Garden
                </h2>


                <span>

                    {
                        gardenPlants.length
                    }

                    {
                        gardenPlants.length ===
                        1
                            ? " plant"
                            : " plants"
                    }

                </span>

            </section>


            {/* =========================
                LIVE PLANT LIBRARY
            ========================= */}

            <VegetableLibrary
                gardenPlants={
                    gardenPlants
                }

                onAddPlant={
                    onAddPlant
                }

                onRemovePlant={
                    onRemovePlant
                }
            />


            <BottomNav />


        </div>

    );

}


export default Plants;