function GardenBuildPlan({
    buildPlan
}) {

    if (
        !buildPlan ||
        !Array.isArray(
            buildPlan.stages
        ) ||
        buildPlan.stages.length ===
            0
    ) {

        return null;

    }


    return (

        <section className="designer-card">


            <div className="designer-section-heading">

                <span>
                    🛠️
                </span>


                <div>

                    <h2>
                        Build Plan
                    </h2>


                    <p>

                        {
                            buildPlan.stageCount
                        }

                        {" recommended construction stages based on your design."}

                    </p>

                </div>

            </div>


            {
                buildPlan.stages.map(
                    (stage) => (

                        <div
                            className="material-category"
                            key={
                                stage.id
                            }
                        >

                            <h3>

                                {
                                    stage.number
                                }

                                {". "}

                                {
                                    stage.icon
                                }

                                {" "}

                                {
                                    stage.title
                                }

                            </h3>


                            <p
                                style={{
                                    margin:
                                        "0 0 8px",

                                    color:
                                        "var(--text-muted, #667566)",

                                    fontSize:
                                        "0.68rem"
                                }}
                            >

                                {
                                    stage.description
                                }

                            </p>


                            <div className="material-list">

                                {
                                    stage.steps.map(
                                        (
                                            step,
                                            index
                                        ) => (

                                            <div
                                                className="material-item"
                                                key={
                                                    `${stage.id}-${index}`
                                                }
                                            >

                                                <div className="material-item-main">

                                                    <strong>

                                                        {
                                                            index +
                                                            1
                                                        }

                                                        {". "}

                                                        {
                                                            step
                                                        }

                                                    </strong>

                                                </div>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        </div>

                    )
                )
            }


            <div className="material-assumptions">

                <strong>
                    📋 Build Planning Note
                </strong>


                <p>
                    These instructions are intended
                    as a project-planning guide.
                    Final construction methods should
                    account for your exact site,
                    selected materials, drainage,
                    manufacturer instructions, and
                    local requirements.
                </p>

            </div>


        </section>

    );

}


export default GardenBuildPlan;