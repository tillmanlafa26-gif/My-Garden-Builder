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


import {
    cropPlanningData
} from "../data/cropPlanningData";


/* =========================
   CORE PLANT CONVERSION

   Turns one of our internal
   planning crops into a plant
   that can be added to My Garden.
========================= */

function createCoreGardenPlant(
    crop
) {

    return {

        id:
            `core-${crop.id}`,

        cropId:
            crop.id,

        plantKey:
            `core:${crop.id}`,

        source:
            "core",

        name:
            crop.name,

        common_name:
            crop.name,

        icon:
            crop.icon,

        category:
            "Garden Crop",

        sunlight:
            crop.minimumSunlight,

        startMethod:
            crop.preferredStartMethod ||
            "direct-sow",

        watering:
            "Average",

        water:
            "Average",

        addedAt:
            new Date()
                .toISOString()

    };

}


/* =========================
   PLANTS PAGE
========================= */

function Plants({

    gardenProfile,

    gardenPlants = [],

    onAddPlant,

    onRemovePlant,

    onUpdatePlantStart

}) {

    const selectedGarden =
        gardenProfile
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;


    /* =========================
       FIND SAVED CROP
    ========================= */

    function getSavedCrop(
        cropId
    ) {

        return gardenPlants.find(
            (plant) =>
                plant.cropId ===
                    cropId ||
                plant.plantKey ===
                    `core:${cropId}`
        );

    }


    /* =========================
       ADD CORE CROP
    ========================= */

    function handleAddCoreCrop(
        crop
    ) {

        const existingPlant =
            getSavedCrop(
                crop.id
            );


        if (
            existingPlant
        ) {

            return;

        }


        const plant =
            createCoreGardenPlant(
                crop
            );


        onAddPlant(
            plant
        );

    }


    /* =========================
       REMOVE CORE CROP
    ========================= */

    function handleRemoveCoreCrop(
        crop
    ) {

        const existingPlant =
            getSavedCrop(
                crop.id
            );


        if (
            !existingPlant
        ) {

            return;

        }


        onRemovePlant(
            existingPlant
        );

    }


    return (

        <div className="app-container">


            {/* =========================
                HEADER
            ========================= */}

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
                            planting, harvest, and
                            seasonal recommendations.
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

                                {
                                    gardenProfile
                                        .hardinessZone
                                        ? ` • Zone ${gardenProfile.hardinessZone}`
                                        : ""
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
                CORE GARDEN CROPS
            ========================= */}

            <section className="designer-card">

                <div className="designer-section-heading">

                    <span>
                        🥕
                    </span>


                    <div>

                        <h2>
                            Garden Crops
                        </h2>


                        <p>
                            Reliable crops built directly
                            into My Garden Builder.
                        </p>

                    </div>

                </div>


                <div className="feature-grid">

                    {
                        cropPlanningData.map(
                            (crop) => {

                                const savedPlant =
                                    getSavedCrop(
                                        crop.id
                                    );


                                const isAdded =
                                    Boolean(
                                        savedPlant
                                    );


                                return (

                                    <div
                                        key={
                                            crop.id
                                        }

                                        className={
                                            isAdded
                                                ? "feature-card selected"
                                                : "feature-card"
                                        }
                                    >

                                        <span>

                                            {
                                                crop.icon
                                            }

                                        </span>


                                        <strong>

                                            {
                                                crop.name
                                            }

                                        </strong>


                                        <small>

                                            {
                                                crop.seasonType ===
                                                "warm"
                                                    ? "Warm-season crop"
                                                    : "Cool-season crop"
                                            }

                                        </small>


                                        <small>

                                            {
                                                crop.preferredStartMethod ===
                                                "transplant"
                                                    ? "Best started as transplant"
                                                    : "Usually direct sown"
                                            }

                                        </small>


                                        {
                                            isAdded
                                                ? (

                                                    <button
                                                        type="button"

                                                        onClick={() =>
                                                            handleRemoveCoreCrop(
                                                                crop
                                                            )
                                                        }
                                                    >

                                                        ✓ In My Garden

                                                    </button>

                                                )
                                                : (

                                                    <button
                                                        type="button"

                                                        onClick={() =>
                                                            handleAddCoreCrop(
                                                                crop
                                                            )
                                                        }
                                                    >

                                                        + Add to My Garden

                                                    </button>

                                                )
                                        }

                                    </div>

                                );

                            }
                        )
                    }

                </div>


                <div className="material-assumptions">

                    <strong>
                        🌱 My Garden Builder Crops
                    </strong>


                    <p>
                        These crops use our own
                        planting, spacing, season,
                        and harvest calculations.
                        They do not depend on the
                        external plant API.
                    </p>

                </div>

            </section>


            {/* =========================
                LIVE PLANT DATABASE
            ========================= */}

            <section className="plant-results-header">

                <h2>
                    More Plants
                </h2>


                <span>
                    Live plant database
                </span>

            </section>


            <VegetableLibrary

                gardenPlants={
                    gardenPlants
                }


                /*
                    IMPORTANT:

                    We are intentionally NOT
                    passing the user's USDA
                    hardiness zone into the
                    external vegetable search.

                    Hardiness describes winter
                    survival and should not
                    remove annual vegetables
                    such as tomatoes from the
                    plant library.
                */

                hardinessZone=""


                onAddPlant={
                    onAddPlant
                }


                onRemovePlant={
                    onRemovePlant
                }


                onUpdatePlantStart={
                    onUpdatePlantStart
                }

            />


            <BottomNav />


        </div>

    );

}


export default Plants;