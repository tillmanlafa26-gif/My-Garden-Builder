function SeasonalPlantingGuide({ seasonalGuide }) {
    if (!seasonalGuide) {
        return null;
    }

    return (
        <section className="designer-card">
            <div className="designer-section-heading">
                <span>📅</span>

                <div>
                    <h2>Seasonal Planting Guide</h2>

                    <p>Timing guidance based on your frost dates and selected crops.</p>
                </div>
            </div>

            {!seasonalGuide.ready ? (
                <div className="material-assumptions">
                    <strong>🌡️ Frost Date Needed</strong>

                    <p>{seasonalGuide.message}</p>
                </div>
            ) : (
                <>
                    <div className="material-list">
                        {seasonalGuide.recommendations.map((crop) => (
                            <div className="material-item" key={crop.id}>
                                <div className="material-item-main">
                                    <strong>
                                        {crop.icon} {crop.name}
                                    </strong>

                                    <small>
                                        {crop.seasonType === "warm"
                                            ? "Warm-season crop"
                                            : "Cool-season crop"}
                                    </small>

                                    <small>{crop.message}</small>
                                </div>

                                <div className="material-quantity">
                                    <strong>
                                        {crop.status === "plant-now"
                                            ? "✅"
                                            : crop.status === "start-indoors"
                                              ? "🌱"
                                              : crop.status === "fall-window"
                                                ? "�"
                                                : "⏳"}
                                    </strong>

                                    <span>{crop.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="material-assumptions">
                        <strong>🌦️ Timing Note</strong>

                        <p>{seasonalGuide.disclaimer}</p>
                    </div>
                </>
            )}
        </section>
    );
}

export default SeasonalPlantingGuide;
