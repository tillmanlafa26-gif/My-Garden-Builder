function GardenBedPlantingMap({
    bedPlantingPlan
}) {

    if (
        !bedPlantingPlan ||
        !Array.isArray(
            bedPlantingPlan.beds
        )
    ) {
        return null;
    }


    return (

        <section className="designer-card">


            <div className="designer-section-heading">

                <span>
                    🥕
                </span>


                <div>

                    <h2>
                        Bed-by-Bed Planting Map
                    </h2>


                    <p>

                        {
                            bedPlantingPlan
                                .stats
                                .totalPlants
                        }

                        {" plants assigned across "}

                        {
                            bedPlantingPlan
                                .bedCount
                        }

                        {" raised bed"}

                        {
                            bedPlantingPlan
                                .bedCount ===
                            1
                                ? ""
                                : "s"
                        }

                        {"."}

                    </p>

                </div>

            </div>


            {/* =========================
                SUMMARY
            ========================= */}

            <div className="design-foundation-stats">

                <div>

                    <strong>
                        Bed Area
                    </strong>

                    <span>

                        {
                            bedPlantingPlan
                                .stats
                                .totalBedArea
                        }

                        {" sq ft"}

                    </span>

                </div>


                <div>

                    <strong>
                        Used Area
                    </strong>

                    <span>

                        {
                            bedPlantingPlan
                                .stats
                                .usedArea
                        }

                        {" sq ft"}

                    </span>

                </div>


                <div>

                    <strong>
                        Available
                    </strong>

                    <span>

                        {
                            bedPlantingPlan
                                .stats
                                .remainingArea
                        }

                        {" sq ft"}

                    </span>

                </div>


                <div>

                    <strong>
                        Utilization
                    </strong>

                    <span>

                        {
                            bedPlantingPlan
                                .stats
                                .utilization
                        }

                        %

                    </span>

                </div>

            </div>


            {/* =========================
                EACH BED
            ========================= */}

            {
                bedPlantingPlan
                    .beds
                    .map(
                        (bed) => (

                            <div
                                className="material-category"

                                key={
                                    bed.id
                                }
                            >

                                <h3>

                                    🪴{" "}

                                    {
                                        bed.name
                                    }

                                    {
                                        bed.hasTrellis
                                            ? " — Trellis Bed"
                                            : ""
                                    }

                                </h3>


                                <div className="material-build-summary">

                                    <div>

                                        <strong>
                                            Size
                                        </strong>

                                        <span>

                                            {
                                                bed.width
                                            }

                                            {" × "}

                                            {
                                                bed.length
                                            }

                                            {" ft"}

                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            Remaining
                                        </strong>

                                        <span>

                                            {
                                                bed.remainingArea
                                            }

                                            {" sq ft"}

                                        </span>

                                    </div>

                                </div>


                                {
                                    bed.spatialLayout
                                        ?.zones
                                        ?.length >
                                    0 && (

                                    <div className="bed-scaled-plan-section">

                                        <div className="bed-scaled-plan-heading">

                                            <strong>
                                                Scaled Pairing Space
                                            </strong>


                                            <small>
                                                Crop blocks are proportional to the physical bed area assigned by the planner.
                                            </small>

                                        </div>


                                        <div
                                            className="bed-scaled-plan"
                                            style={{
                                                aspectRatio:
                                                    `${bed.width} / ${bed.length}`
                                            }}
                                            aria-label={
                                                `${bed.name} scaled planting plan`
                                            }
                                        >

                                            {
                                                bed.hasTrellis && (

                                                    <div className="bed-scaled-trellis-edge">
                                                        Trellis
                                                    </div>

                                                )
                                            }


                                            {
                                                bed.spatialLayout
                                                    .zones
                                                    .map(
                                                        (zone) => (

                                                            <div
                                                                key={
                                                                    zone.id
                                                                }
                                                                className={
                                                                    `bed-scaled-zone crop-zone-${zone.zoneIndex % 4}`
                                                                }
                                                                style={{
                                                                    left:
                                                                        `${zone.xPercent}%`,

                                                                    top:
                                                                        `${zone.yPercent}%`,

                                                                    width:
                                                                        `${zone.widthPercent}%`,

                                                                    height:
                                                                        `${zone.lengthPercent}%`
                                                                }}
                                                            >

                                                                <strong>
                                                                    {
                                                                        zone.icon
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        zone.name
                                                                    }
                                                                </strong>


                                                                <small>
                                                                    {
                                                                        zone.quantity
                                                                    }

                                                                    {" plant"}

                                                                    {
                                                                        zone.quantity ===
                                                                        1
                                                                            ? ""
                                                                            : "s"
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        zone.spacingInches
                                                                    }

                                                                    {" in spacing"}
                                                                </small>

                                                            </div>

                                                        )
                                                    )
                                            }

                                        </div>


                                        <div className="bed-scaled-plan-meta">

                                            <span>
                                                {
                                                    bed.spatialLayout
                                                        .edgeBufferInches
                                                }

                                                {" in perimeter reserve"}
                                            </span>


                                            <span>
                                                {
                                                    bed.spatialLayout
                                                        .internalOpenArea
                                                }

                                                {" sq ft open inside"}
                                            </span>

                                        </div>

                                    </div>

                                )
                                }


                                {
                                    bed.crops.length >
                                    0
                                        ? (

                                            <div className="material-list">

                                                {
                                                    bed.crops.map(
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

                                                                        {
                                                                            crop.areaUsed
                                                                        }

                                                                        {" sq ft used"}

                                                                    </small>


                                                                    <small>

                                                                        {
                                                                            crop.squareFeetPerPlant
                                                                                ? `${Math.max(
                                                                                    1,
                                                                                    Math.round(
                                                                                        Math.sqrt(
                                                                                            crop.squareFeetPerPlant
                                                                                        ) *
                                                                                            12
                                                                                    )
                                                                                )} in planning spacing`
                                                                                : "Spacing varies"
                                                                        }

                                                                    </small>


                                                                    <small>

                                                                        {
                                                                            crop.canopy ===
                                                                            "tall"
                                                                                ? "↥ Tall growing"
                                                                                : crop.canopy ===
                                                                                  "medium"
                                                                                    ? "↕ Medium height"
                                                                                    : "↧ Low growing"
                                                                        }

                                                                    </small>


                                                                    {
                                                                        crop.support && (

                                                                            <small>

                                                                                {
                                                                                    bed.hasTrellis
                                                                                        ? "✓ Trellis access"
                                                                                        : "⚠ Support recommended"
                                                                                }

                                                                            </small>

                                                                        )
                                                                    }

                                                                </div>


                                                                <div className="material-quantity">

                                                                    <strong>

                                                                        {
                                                                            crop.quantity
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

                                        )
                                        : (

                                            <div className="material-assumptions">

                                                <strong>
                                                    Available Bed
                                                </strong>

                                                <p>
                                                    No crops are currently
                                                    assigned to this bed.
                                                </p>

                                            </div>

                                        )
                                }


                                {/* =========================
                                    WHY THIS PLACEMENT
                                ========================= */}

                                {
                                    bed.placementNotes
                                        ?.length >
                                        0 && (

                                        <div className="material-assumptions">

                                            <strong>
                                                🧠 Placement Logic
                                            </strong>


                                            {
                                                bed
                                                    .placementNotes
                                                    .map(
                                                        (
                                                            note,
                                                            index
                                                        ) => (

                                                            <p
                                                                key={
                                                                    `${bed.id}-note-${index}`
                                                                }
                                                            >

                                                                •{" "}

                                                                {
                                                                    note
                                                                }

                                                            </p>

                                                        )
                                                    )
                                            }

                                        </div>

                                    )
                                }

                            </div>

                        )
                    )
            }


            {/* =========================
                UNPLACED CROPS
            ========================= */}

            {
                bedPlantingPlan
                    .unplacedCrops
                    .length >
                    0 && (

                    <div className="layout-warnings">

                        <strong>
                            Crops Still Needing Space
                        </strong>


                        {
                            bedPlantingPlan
                                .unplacedCrops
                                .map(
                                    (crop) => (

                                        <p
                                            key={
                                                crop.id
                                            }
                                        >

                                            •{" "}

                                            {
                                                crop.icon
                                            }

                                            {" "}

                                            {
                                                crop.name
                                            }

                                            {": "}

                                            {
                                                crop.quantity
                                            }

                                            {" remaining"}

                                        </p>

                                    )
                                )
                        }

                    </div>

                )
            }


            {/* =========================
                WARNINGS
            ========================= */}

            {
                bedPlantingPlan
                    .warnings
                    .length >
                    0 && (

                    <div className="layout-warnings">

                        <strong>
                            Planting Notes
                        </strong>


                        {
                            bedPlantingPlan
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
                    🌱 About Crop Pairings
                </strong>

                <p>
                    The scaled blocks represent the physical area reserved by the planner for each crop group. The spacing number is derived from the crop's existing square-foot requirement, while pairing logic also considers plant height, growth habit, trellis access, and seasonal overlap. Pairing does not override normal plant spacing.
                </p>

            </div>


        </section>

    );

}


export default GardenBedPlantingMap;