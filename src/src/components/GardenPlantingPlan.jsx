function GardenPlantingPlan({
    plantingPlan
}) {

    if (
        !plantingPlan
    ) {
        return null;
    }


    return (

        <section className="designer-card">

            <div className="designer-section-heading">

                <span>
                    🌱
                </span>


                <div>

                    <h2>
                        Planting Plan
                    </h2>


                    <p>

                        Suggested plant quantities
                        for approximately{" "}

                        {
                            plantingPlan.growingArea
                        }

                        {" sq ft of growing space."}

                    </p>

                </div>

            </div>


            <div className="material-list">

                {
                    plantingPlan
                        .recommendations
                        .map(
                            (crop) => (

                                <div
                                    className="material-item"
                                    key={
                                        crop.id
                                    }
                                >

                                    <div className="material-item-main">

                                        <strong>

                                            {
                                                crop.icon
                                            }

                                            {" "}

                                            {
                                                crop.name
                                            }

                                        </strong>


                                        <small>

                                            Approx.{" "}

                                            {
                                                crop.allocatedArea
                                            }

                                            {" sq ft allocated"}

                                        </small>


                                        {
                                            !crop.sunlightMatch && (

                                                <small>
                                                    ⚠ Prefers{" "}
                                                    {
                                                        crop.minimumSunlight
                                                    }
                                                    {" sun"}
                                                </small>

                                            )
                                        }


                                        {
                                            crop.needsSupport && (

                                                <small>

                                                    {
                                                        crop.trellisAvailable
                                                            ? "✓ Trellis support available"
                                                            : "⚠ Climbing support recommended"
                                                    }

                                                </small>

                                            )
                                        }

                                    </div>


                                    <div className="material-quantity">

                                        <strong>
                                            {
                                                crop.suggestedQuantity
                                            }
                                        </strong>

                                        <span>
                                            plants
                                        </span>

                                    </div>

                                </div>

                            )
                        )
                }

            </div>


            {
                plantingPlan
                    .warnings
                    .length >
                    0 && (

                    <div className="layout-warnings">

                        <strong>
                            Planning Notes
                        </strong>


                        {
                            plantingPlan
                                .warnings
                                .map(
                                    (
                                        warning,
                                        index
                                    ) => (

                                        <p
                                            key={
                                                index
                                            }
                                        >
                                            •{" "}
                                            {
                                                warning
                                            }
                                        </p>

                                    )
                                )
                        }

                    </div>

                )
            }


            <div className="material-assumptions">

                <strong>
                    🌱 Plant Quantity Note
                </strong>


                <p>
                    These quantities are early
                    planning estimates based on
                    available growing area. Final
                    spacing will later account for
                    specific varieties, companion
                    planting, succession planting,
                    local frost dates, and seasonal
                    conditions.
                </p>

            </div>

        </section>

    );

}


export default GardenPlantingPlan;