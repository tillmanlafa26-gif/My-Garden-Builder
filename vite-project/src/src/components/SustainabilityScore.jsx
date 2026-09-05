function SustainabilityScore({
    score
}) {

    return (
        <section className="sustainability-section">

            <h2>
                Sustainability Score
            </h2>


            <div className="score-card">

                <p className="score">
                    {score}
                </p>

                <p>
                    out of 100
                </p>


                <div className="score-progress">

                    <div
                        className="score-progress-fill"
                        style={{
                            width: `${score}%`
                        }}
                    />

                </div>

            </div>

        </section>
    );

}


export default SustainabilityScore;