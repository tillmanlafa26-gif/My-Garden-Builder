function IndoorMaterials({
    materialPlan
}) {
    if (
        !materialPlan ||
        materialPlan.type !==
            "indoor-materials" ||
        !Array.isArray(
            materialPlan.materials
        ) ||
        materialPlan.materials.length ===
            0
    ) {
        return null;
    }


    return (
        <section className="designer-card indoor-materials-section">

            <div className="designer-section-heading">

                <span>
                    🧰
                </span>


                <div>

                    <h2>
                        Indoor Materials
                    </h2>


                    <p>
                        Containers, growing media, lighting, protection, and care supplies calculated from the indoor layout.
                    </p>

                </div>

            </div>


            <div className="indoor-materials-summary">

                <div>

                    <strong>
                        {
                            materialPlan
                                .assumptions
                                .placedPlantCount
                        }
                    </strong>

                    <span>
                        Plants
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            materialPlan
                                .assumptions
                                .growLightZoneCount
                        }
                    </strong>

                    <span>
                        Light Zones
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            materialPlan
                                .assumptions
                                .estimatedPottingMixCubicFeet
                        }
                    </strong>

                    <span>
                        Est. cu ft Mix
                    </span>

                </div>

            </div>


            {
                materialPlan.categories.map(
                    (category) => {

                        const items =
                            materialPlan.materials.filter(
                                (material) =>
                                    material.category ===
                                    category
                            );


                        return (
                            <div
                                className="material-category"
                                key={
                                    category
                                }
                            >

                                <h3>
                                    {
                                        category
                                    }
                                </h3>


                                <div className="material-list">

                                    {
                                        items.map(
                                            (material) => (

                                                <article
                                                    className="material-item"
                                                    key={
                                                        material.id
                                                    }
                                                >

                                                    <div className="material-item-main">

                                                        <strong>
                                                            {
                                                                material.name
                                                            }
                                                        </strong>


                                                        {
                                                            material.note && (

                                                                <small>
                                                                    {
                                                                        material.note
                                                                    }
                                                                </small>

                                                            )
                                                        }

                                                    </div>


                                                    <div className="material-quantity">

                                                        <strong>
                                                            {
                                                                material.quantity
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                material.unit
                                                            }
                                                        </span>

                                                    </div>

                                                </article>

                                            )
                                        )
                                    }

                                </div>

                            </div>
                        );
                    }
                )
            }


            <div className="material-assumptions">

                <strong>
                    📐 Indoor Planning Estimate
                </strong>


                <p>
                    Potting-mix quantity is an estimate based on the recommended container diameters and an assumed container depth. Actual container shape, root ball volume, drainage layer choices, and repotting practices can change the final amount.
                </p>


                <p>
                    Existing shelves, stands, trays, lights, and containers can be reused when they safely meet the generated layout requirements.
                </p>

            </div>

        </section>
    );
}


export default IndoorMaterials;
