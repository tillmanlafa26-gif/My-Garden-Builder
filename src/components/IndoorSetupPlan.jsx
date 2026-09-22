function IndoorSetupPlan({
    setupPlan
}) {
    if (
        !setupPlan ||
        setupPlan.type !==
            "indoor-setup-plan" ||
        !Array.isArray(
            setupPlan.stages
        ) ||
        setupPlan.stages.length ===
            0
    ) {
        return null;
    }


    return (
        <section className="designer-card indoor-setup-plan">

            <div className="designer-section-heading">

                <span>
                    🛠️
                </span>


                <div>

                    <h2>
                        Indoor Setup Plan
                    </h2>


                    <p>
                        {
                            setupPlan.stageCount
                        } setup stages based on the generated indoor layout.
                    </p>

                </div>

            </div>


            {
                setupPlan.stages.map(
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


                            <p className="indoor-setup-stage-description">
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
                    🏠 Indoor Setup Note
                </strong>


                {
                    setupPlan.notes.map(
                        (
                            note,
                            index
                        ) => (

                            <p
                                key={
                                    `indoor-setup-note-${index}`
                                }
                            >
                                {
                                    note
                                }
                            </p>

                        )
                    )
                }

            </div>

        </section>
    );
}


export default IndoorSetupPlan;
