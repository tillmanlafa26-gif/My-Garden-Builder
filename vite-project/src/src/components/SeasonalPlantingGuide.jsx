/* =========================================================
   FORMAT DATE
========================================================= */

function formatPlantingDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "Not available";

    }


    return new Date(
        `${dateString}T12:00:00`
    ).toLocaleDateString(
        undefined,
        {
            month:
                "short",

            day:
                "numeric"
        }
    );

}


/* =========================================================
   SEASONAL PLANTING GUIDE
========================================================= */

function SeasonalPlantingGuide({
    seasonalGuide
}) {

    if (
        !seasonalGuide
    ) {

        return null;

    }


    const crops =
        Array.isArray(
            seasonalGuide.crops
        )
            ? seasonalGuide.crops
            : [];


    const springSchedule =
        Array.isArray(
            seasonalGuide.springSchedule
        )
            ? seasonalGuide.springSchedule
            : [];


    const fallSchedule =
        Array.isArray(
            seasonalGuide.fallSchedule
        )
            ? seasonalGuide.fallSchedule
            : [];


    if (
        crops.length === 0
    ) {

        return null;

    }


    return (

        <section className="seasonal-planting-guide">


            {/* =========================
                HEADING
            ========================= */}

            <div className="seasonal-guide-heading">

                <span>
                    📅
                </span>


                <div>

                    <h2>
                        Local Planting Schedule
                    </h2>


                    <p>
                        Recommended planting windows
                        based on your garden's
                        average frost dates.
                    </p>

                </div>

            </div>


            {/* =========================
                FROST SUMMARY
            ========================= */}

            <div className="seasonal-frost-summary">


                <div>

                    <span>
                        🌱
                    </span>


                    <strong>
                        Last Spring Frost
                    </strong>


                    <small>

                        {
                            formatPlantingDate(
                                seasonalGuide
                                    .lastSpringFrost
                            )
                        }

                    </small>

                </div>


                <div>

                    <span>
                        🍂
                    </span>


                    <strong>
                        First Fall Frost
                    </strong>


                    <small>

                        {
                            formatPlantingDate(
                                seasonalGuide
                                    .firstFallFrost
                            )
                        }

                    </small>

                </div>

            </div>


            {/* =========================
                SPRING
            ========================= */}

            {
                springSchedule.length > 0 && (

                    <div className="seasonal-guide-section">


                        <div className="seasonal-guide-subheading">

                            <span>
                                🌷
                            </span>


                            <div>

                                <strong>
                                    Spring Planting
                                </strong>


                                <small>
                                    Indoor starts and
                                    outdoor planting dates.
                                </small>

                            </div>

                        </div>


                        <div className="seasonal-guide-list">

                            {
                                springSchedule.map(
                                    (crop) => (

                                        <article
                                            key={
                                                crop.cropId
                                            }

                                            className="seasonal-crop-card"
                                        >

                                            <div className="seasonal-crop-header">

                                                <span>
                                                    {
                                                        crop.icon
                                                    }
                                                </span>


                                                <div>

                                                    <strong>
                                                        {
                                                            crop.name
                                                        }
                                                    </strong>


                                                    <small>
                                                        {
                                                            crop.preferredStartMethodLabel
                                                        }
                                                    </small>

                                                </div>

                                            </div>


                                            <div className="seasonal-crop-dates">


                                                {
                                                    crop.indoorStartDate && (

                                                        <div>

                                                            <span>
                                                                🏠
                                                            </span>


                                                            <div>

                                                                <small>
                                                                    Start indoors
                                                                </small>


                                                                <strong>

                                                                    {
                                                                        formatPlantingDate(
                                                                            crop.indoorStartDate
                                                                        )
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    )
                                                }


                                                {
                                                    crop.springPlantDate && (

                                                        <div>

                                                            <span>
                                                                🌱
                                                            </span>


                                                            <div>

                                                                <small>
                                                                    {
                                                                        crop.springAction
                                                                    }
                                                                </small>


                                                                <strong>

                                                                    {
                                                                        formatPlantingDate(
                                                                            crop.springPlantDate
                                                                        )
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    )
                                                }

                                            </div>


                                            <p>
                                                {
                                                    crop.notes
                                                }
                                            </p>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    </div>

                )
            }


            {/* =========================
                FALL
            ========================= */}

            {
                fallSchedule.length > 0 && (

                    <div className="seasonal-guide-section">


                        <div className="seasonal-guide-subheading">

                            <span>
                                🍂
                            </span>


                            <div>

                                <strong>
                                    Fall Planting
                                </strong>


                                <small>
                                    Suggested dates before
                                    the first average fall frost.
                                </small>

                            </div>

                        </div>


                        <div className="seasonal-guide-list">

                            {
                                fallSchedule.map(
                                    (crop) => (

                                        <article
                                            key={
                                                `fall-${crop.cropId}`
                                            }

                                            className="seasonal-crop-card fall"
                                        >

                                            <div className="seasonal-crop-header">

                                                <span>
                                                    {
                                                        crop.icon
                                                    }
                                                </span>


                                                <div>

                                                    <strong>
                                                        {
                                                            crop.name
                                                        }
                                                    </strong>


                                                    <small>
                                                        Fall planting
                                                    </small>

                                                </div>

                                            </div>


                                            <div className="seasonal-fall-date">

                                                <span>
                                                    🍂
                                                </span>


                                                <div>

                                                    <small>
                                                        Plant around
                                                    </small>


                                                    <strong>

                                                        {
                                                            formatPlantingDate(
                                                                crop.fallPlantDate
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            </div>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    </div>

                )
            }


            <div className="seasonal-guide-note">

                <span>
                    ℹ️
                </span>


                <p>
                    These dates are planning estimates
                    based on average frost dates.
                    Weather, soil temperature, variety,
                    and local microclimates can shift
                    the best planting date.
                </p>

            </div>

        </section>

    );

}


export default SeasonalPlantingGuide;