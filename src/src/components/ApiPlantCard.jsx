function ApiPlantCard({
    plant,
    isInGarden,
    onAddPlant,
    onRemovePlant
}) {

    function formatSunlight(
        value
    ) {

        return String(
            value
        )
            .replaceAll(
                "_",
                " "
            )
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    }


    function handleGardenClick() {

        if (
            isInGarden
        ) {

            onRemovePlant({
                ...plant,

                source:
                    "perenual",

                plantKey:
                    `perenual:${plant.id}`
            });


            return;

        }


        onAddPlant(
            plant
        );

    }


    return (

        <article className="api-plant-card">


            <div className="api-plant-image-container">

                {
                    plant.image
                        ? (

                            <img
                                src={
                                    plant.image
                                }

                                alt={
                                    plant.name
                                }

                                className="api-plant-image"
                                loading="lazy"
                                decoding="async"
                            />

                        )
                        : (

                            <div className="api-plant-placeholder">

                                🌱

                            </div>

                        )
                }

            </div>


            <div className="api-plant-content">


                <div className="api-plant-heading">

                    <div>

                        <h3>
                            {plant.name}
                        </h3>


                        {
                            plant.scientificName && (

                                <p>

                                    {
                                        plant.scientificName
                                    }

                                </p>

                            )
                        }

                    </div>


                    <span className="api-badge">

                        Plant Database

                    </span>

                </div>


                <div className="api-plant-details">


                    <div>

                        <strong>
                            💧 Water
                        </strong>

                        <span>
                            {
                                plant.watering ||
                                "Unknown"
                            }
                        </span>

                    </div>


                    <div>

                        <strong>
                            ☀️ Sun
                        </strong>

                        <span>

                            {
                                plant.sunlight?.length >
                                0
                                    ? plant.sunlight
                                        .map(
                                            formatSunlight
                                        )
                                        .join(", ")

                                    : "Unknown"
                            }

                        </span>

                    </div>


                    <div>

                        <strong>
                            🔄 Cycle
                        </strong>

                        <span>
                            {
                                plant.cycle ||
                                "Unknown"
                            }
                        </span>

                    </div>


                </div>


                <button
                    type="button"

                    className={
                        isInGarden
                            ? "api-plant-add-button added"
                            : "api-plant-add-button"
                    }

                    onClick={
                        handleGardenClick
                    }
                >

                    {
                        isInGarden
                            ? "✓ Added to My Garden"
                            : "+ Add to My Garden"
                    }

                </button>


            </div>


        </article>

    );

}


export default ApiPlantCard;