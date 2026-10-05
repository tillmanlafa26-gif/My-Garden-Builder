function SustainabilityScore({
    score
}) {
    const safeScore =
        Math.min(
            100,
            Math.max(
                0,
                Number(
                    score ||
                    0
                )
            )
        );


    return (
        <section className="sustainability-section leafy-sustainability-section">

            <div className="leafy-section-heading">

                <div>

                    <span className="leafy-section-icon">
                        🌱
                    </span>


                    <div>

                        <small>
                            GROW GREENER
                        </small>


                        <h2>
                            Sustainability Score
                        </h2>

                    </div>

                </div>


                <span className="leafy-section-more">
                    Garden impact
                </span>

            </div>


            <div className="score-card leafy-score-card">

                <div
                    className="leafy-score-ring"
                    style={{
                        "--score-value":
                            safeScore
                    }}
                    aria-label={`Sustainability score ${safeScore} out of 100`}
                >

                    <div className="leafy-score-ring-inner">

                        <span>
                            🌿
                        </span>


                        <strong>
                            {
                                safeScore
                            }
                        </strong>


                        <small>
                            /100
                        </small>

                    </div>

                </div>


                <div className="leafy-score-copy">

                    <h3>
                        A greener garden for a brighter tomorrow
                    </h3>


                    <div className="leafy-score-benefits">

                        <span>
                            <b>✓</b>
                            Supports efficient growing
                        </span>


                        <span>
                            <b>✓</b>
                            Encourages smarter watering
                        </span>


                        <span>
                            <b>✓</b>
                            Builds with only what you need
                        </span>

                    </div>

                </div>

            </div>

        </section>
    );

}


export default SustainabilityScore;
