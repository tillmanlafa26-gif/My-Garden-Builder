function getStatusLabel(
    status
) {
    switch (
        status
    ) {
        case "excellent":
            return "Excellent";

        case "caution":
            return "Needs Attention";

        case "avoid":
            return "Separate";

        case "good":
        default:
            return "Good";
    }
}


function PlantPairingGuide({
    bedPlantingPlan
}) {
    const guide =
        bedPlantingPlan
            ?.pairingGuide ||
        null;


    if (
        !guide
    ) {
        return null;
    }


    return (
        <section className="designer-card plant-pairing-guide">

            <div className="designer-section-heading">

                <span>
                    🤝
                </span>


                <div>

                    <h2>
                        Plant Pairing & Bed Load
                    </h2>


                    <p>
                        Bed assignments check spacing, canopy competition, growth habit, support needs, and seasonal timing before crops are grouped together.
                    </p>

                </div>

            </div>


            <div className="pairing-guide-summary">

                <div>

                    <strong>
                        {
                            guide.safeUtilizationPercent
                        }

                        {"%"}
                    </strong>

                    <span>
                        Target maximum bed load
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            guide.stats
                                .positivePairings
                        }
                    </strong>

                    <span>
                        Good pairings
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            guide.stats
                                .successionPairings
                        }
                    </strong>

                    <span>
                        Succession pairings
                    </span>

                </div>

            </div>


            <div className="pairing-bed-list">

                {
                    guide.bedGuides.map(
                        (bed) => (

                            <article
                                className="pairing-bed-card"
                                key={
                                    bed.bedId
                                }
                            >

                                <div className="pairing-bed-heading">

                                    <div>

                                        <strong>
                                            {
                                                bed.bedName
                                            }

                                            {
                                                bed.hasTrellis
                                                    ? " — Trellis Bed"
                                                    : ""
                                            }
                                        </strong>


                                        <small>
                                            {
                                                bed.crops
                                                    .map(
                                                        (crop) =>
                                                            `${crop.icon} ${crop.name}`
                                                    )
                                                    .join(" • ") ||
                                                "No crops assigned"
                                            }
                                        </small>

                                    </div>


                                    <span
                                        className={
                                            `pairing-status ${bed.status}`
                                        }
                                    >
                                        {
                                            getStatusLabel(
                                                bed.status
                                            )
                                        }
                                    </span>

                                </div>


                                <div className="pairing-load-row">

                                    <span>
                                        Bed load
                                    </span>

                                    <strong>
                                        {
                                            bed.loadPercent
                                        }

                                        {"%"}
                                    </strong>

                                </div>


                                <div
                                    className="pairing-load-bar"
                                    aria-label={
                                        `${bed.bedName} is ${bed.loadPercent}% allocated`
                                    }
                                >

                                    <div
                                        className={
                                            bed.loadPercent >
                                            guide.safeUtilizationPercent
                                                ? "pairing-load-fill overloaded"
                                                : "pairing-load-fill"
                                        }
                                        style={{
                                            width:
                                                `${Math.min(
                                                    100,
                                                    bed.loadPercent
                                                )}%`
                                        }}
                                    />

                                </div>


                                <small className="pairing-load-note">
                                    {
                                        bed.reservedPercent >
                                        0
                                            ? `${bed.reservedPercent}% of physical bed area is intentionally left as a spacing/airflow reserve.`
                                            : "Plant spacing is based on the crop guide."
                                    }
                                </small>


                                {
                                    bed.pairings.length >
                                    0 && (

                                        <div className="pairing-pair-list">

                                            {
                                                bed.pairings.map(
                                                    (pairing) => (

                                                        <div
                                                            className="pairing-pair-item"
                                                            key={
                                                                pairing.id
                                                            }
                                                        >

                                                            <div className="pairing-pair-heading">

                                                                <strong>

                                                                    {
                                                                        pairing
                                                                            .firstCrop
                                                                            .icon
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        pairing
                                                                            .firstCrop
                                                                            .name
                                                                    }

                                                                    {" + "}

                                                                    {
                                                                        pairing
                                                                            .secondCrop
                                                                            .icon
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        pairing
                                                                            .secondCrop
                                                                            .name
                                                                    }

                                                                </strong>


                                                                <span
                                                                    className={
                                                                        `pairing-status compact ${pairing.status}`
                                                                    }
                                                                >
                                                                    {
                                                                        pairing.seasonRelation ===
                                                                        "succession"
                                                                            ? "Succession"
                                                                            : getStatusLabel(
                                                                                pairing.status
                                                                            )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <p>
                                                                {
                                                                    pairing
                                                                        .reasons[0]
                                                                }
                                                            </p>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </div>

                                    )
                                }

                            </article>

                        )
                    )
                }

            </div>


            {
                guide.warnings.length >
                0 && (

                    <div className="pairing-guide-warnings">

                        <strong>
                            ⚠ Pairing Notes
                        </strong>


                        {
                            guide.warnings.map(
                                (
                                    warning,
                                    index
                                ) => (

                                    <p
                                        key={
                                            `pairing-warning-${index}`
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


            <div className="pairing-guide-method">

                <strong>
                    How this guide protects your beds
                </strong>


                <p>
                    The planner reserves part of each bed instead of filling 100% of the calculated area. It also blocks overlapping combinations of multiple aggressive spreading crops and penalizes plants that compete for the same canopy or support space.
                </p>


                <p>
                    Companion-plant preferences are treated as a bonus, not permission to ignore normal spacing.
                </p>

            </div>

        </section>
    );
}


export default PlantPairingGuide;
