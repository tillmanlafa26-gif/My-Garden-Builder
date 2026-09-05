import {
    Link
} from "react-router";


import Icon from "./Icon";

import {
    getPlantGrowthStage
} from "../utils/plantGrowthStage";


function MyGardenPlants({
    gardenPlants = [],
    onRemoveGardenPlant
}) {

    return (

        <section className="my-garden-plants">

            <div className="my-garden-plants-header">

                <div>

                    <h2>
                        🌱 My Garden Plants
                    </h2>

                    <p>
                        {gardenPlants.length}

                        {
                            gardenPlants.length === 1
                                ? " plant"
                                : " plants"
                        }
                    </p>

                </div>


                <Link
                    to="/plants"
                    className="view-plants-link"
                >
                    Browse
                </Link>

            </div>


            {
                gardenPlants.length === 0
                    ? (

                        <div className="my-garden-empty">

                            <span>
                                🌱
                            </span>

                            <p>
                                You haven't added any
                                plants yet.
                            </p>

                            <Link
                                to="/plants"
                                className="garden-profile-link"
                            >
                                Find Plants
                            </Link>

                        </div>

                    )
                    : (

                        <div className="my-garden-plant-list">

                            {
                                gardenPlants.map(
                                    (plant) => {

                                        const growthStage =
                                            getPlantGrowthStage(
                                                plant
                                            );


                                        return (

                                        <div
                                            className="my-garden-plant"
                                            key={plant.plantKey}
                                        >

                                            {
                                                plant.image
                                                    ? (

                                                        <img
                                                            src={plant.image}
                                                            alt={plant.name}
                                                            className="my-garden-plant-image"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />

                                                    )
                                                    : (

                                                        <span className="my-garden-plant-icon">
                                                            {
                                                                plant.icon ||
                                                                "🌱"
                                                            }
                                                        </span>

                                                    )
                                            }


                                            <div className="my-garden-plant-info">

                                                <strong>
                                                    {plant.name}
                                                </strong>

                                                <small>

                                                    {
                                                        plant.category ||
                                                        "Plant"
                                                    }

                                                    {" • "}

                                                    💧{" "}

                                                    {
                                                        plant.water ||
                                                        plant.watering ||
                                                        "Unknown"
                                                    }

                                                </small>


                                                <span className="my-garden-growth-stage">
                                                    <Icon
                                                        name={
                                                            growthStage.icon
                                                        }
                                                        size={13}
                                                    />

                                                    {
                                                        growthStage.label
                                                    }

                                                    {
                                                        growthStage.source ===
                                                        "manual"
                                                            ? " • Manual"
                                                            : ""
                                                    }
                                                </span>


                                                {
                                                    plant.source ===
                                                    "perenual" && (

                                                        <span className="garden-api-label">
                                                            External Library
                                                        </span>

                                                    )
                                                }

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveGardenPlant(
                                                        plant
                                                    )
                                                }
                                                aria-label={
                                                    `Remove ${plant.name} from garden`
                                                }
                                            >
                                                <Icon
                                                    name="close"
                                                    size={16}
                                                />
                                            </button>

                                        </div>

                                        );

                                    }
                                )
                            }

                        </div>

                    )
            }

        </section>

    );

}


export default MyGardenPlants;