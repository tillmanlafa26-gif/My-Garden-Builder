function GardenMaterials({
    materialPlan
}) {

    if (
        !materialPlan ||
        materialPlan.materials.length ===
        0
    ) {

        return null;

    }


    const assumptions =
        materialPlan.assumptions;


    return (

        <section className="garden-materials-section">


            <div className="designer-section-heading">

                <span>
                    🔨
                </span>


                <div>

                    <h2>
                        Build Materials
                    </h2>


                    <p>
                        Calculated from your
                        selected build options.
                    </p>

                </div>

            </div>


            <div className="material-build-summary">

                <div>
                    <strong>
                        Bed Size
                    </strong>

                    <span>
                        {
                            assumptions.bedLength
                        }

                        {" × "}

                        {
                            assumptions.bedWidth
                        }

                        {" ft"}
                    </span>
                </div>


                <div>
                    <strong>
                        Height
                    </strong>

                    <span>
                        {
                            assumptions
                                .raisedBedHeightInches
                        }

                        {" in"}
                    </span>
                </div>


                <div>
                    <strong>
                        Material
                    </strong>

                    <span className="capitalize-text">

                        {
                            assumptions
                                .raisedBedMaterial
                                .replaceAll(
                                    "-",
                                    " "
                                )
                        }

                    </span>
                </div>


                <div>
                    <strong>
                        Walkway
                    </strong>

                    <span>
                        {
                            assumptions
                                .walkwayWidth
                        }

                        {" ft"}
                    </span>
                </div>

            </div>


            {
                materialPlan.categories.map(
                    (category) => {

                        const categoryItems =
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
                                        categoryItems.map(
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
                    📐 Planning Estimate
                </strong>


                <p>
                    Material quantities are early
                    planning estimates. Actual board
                    dimensions, soil settling, cuts,
                    hardware, and site conditions can
                    change final quantities.
                </p>


                <p>

                    Current soil strategy:{" "}

                    <strong className="capitalize-text">

                        {
                            assumptions
                                .soilStrategy
                                .replaceAll(
                                    "-",
                                    " "
                                )
                        }

                    </strong>

                </p>


                <p>

                    A{" "}

                    {
                        assumptions
                            .wasteAllowancePercent
                    }

                    % waste allowance is included
                    where applicable.

                </p>

            </div>


        </section>

    );

}


export default GardenMaterials;