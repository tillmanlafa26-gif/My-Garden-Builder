function formatDimension(
    value
) {
    const numeric =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numeric
        )
    ) {
        return "0";
    }


    return numeric % 1 ===
        0
            ? String(
                numeric
            )
            : numeric.toFixed(
                1
            );
}


function IndoorLayoutPreview({
    indoorLayout
}) {
    if (
        !indoorLayout
    ) {
        return null;
    }


    const source =
        indoorLayout
            .sourceDimensions ||
        {};


    const unit =
        indoorLayout.sourceUnit ||
        "ft";


    const levels =
        Array.isArray(
            indoorLayout.levels
        )
            ? indoorLayout.levels
            : [];


    const unplaced =
        Array.isArray(
            indoorLayout.unplacedPlants
        )
            ? indoorLayout.unplacedPlants
            : [];


    const growLights =
        Array.isArray(
            indoorLayout.growLights
        )
            ? indoorLayout.growLights
            : [];


    const stats =
        indoorLayout.stats ||
        {};


    return (
        <section className="designer-card indoor-layout-preview">

            <div className="designer-section-heading">

                <span>
                    {
                        indoorLayout.icon ||
                        "🏠"
                    }
                </span>


                <div>

                    <h2>
                        Indoor Plant Layout
                    </h2>


                    <p>
                        Mature plant size, pot footprint, vertical clearance, and available light are checked before placement.
                    </p>

                </div>

            </div>


            <div className="indoor-layout-summary">

                <div>

                    <strong>
                        {
                            indoorLayout.indoorSpaceName
                        }
                    </strong>

                    <span>
                        Space type
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            formatDimension(
                                source.width
                            )
                        } × {
                            formatDimension(
                                source.length
                            )
                        } × {
                            formatDimension(
                                source.height
                            )
                        } {
                            unit
                        }
                    </strong>

                    <span>
                        W × D × H
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            stats.placedPlantCount ||
                            0
                        } / {
                            stats.selectedPlantCount ||
                            0
                        }
                    </strong>

                    <span>
                        Plants placed
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            stats.growLightZoneCount ||
                            0
                        }
                    </strong>

                    <span>
                        Grow-light zones
                    </span>

                </div>

            </div>


            {
                indoorLayout.mode ===
                "linear"
                    ? (
                        <div className="indoor-rack-preview">

                            {
                                [
                                    ...levels
                                ]
                                    .reverse()
                                    .map(
                                        (level) => {

                                            const light =
                                                growLights.find(
                                                    (item) =>
                                                        item.target ===
                                                        level.id
                                                );


                                            return (
                                                <div
                                                    className="indoor-rack-level"
                                                    key={
                                                        level.id
                                                    }
                                                >

                                                    <div className="indoor-rack-level-label">

                                                        <strong>
                                                            {
                                                                level.label
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                Math.round(
                                                                    level.clearance
                                                                )
                                                            } in vertical clearance
                                                        </small>

                                                    </div>


                                                    {
                                                        light && (

                                                            <div className="indoor-grow-light-bar">

                                                                <span>
                                                                    💡
                                                                </span>

                                                                <strong>
                                                                    Grow Light
                                                                </strong>

                                                                <small>
                                                                    {
                                                                        Math.round(
                                                                            light.coverageWidthInches
                                                                        )
                                                                    } in coverage
                                                                </small>

                                                            </div>

                                                        )
                                                    }


                                                    <div className="indoor-rack-surface">

                                                        {
                                                            level.placements
                                                                .length >
                                                            0
                                                                ? level.placements.map(
                                                                    (placement) => (

                                                                        <div
                                                                            key={
                                                                                placement.id
                                                                            }
                                                                            className="indoor-linear-plant"
                                                                            style={{
                                                                                left:
                                                                                    `${placement.leftPercent}%`,

                                                                                width:
                                                                                    `${Math.max(
                                                                                        8,
                                                                                        placement.widthPercent
                                                                                    )}%`
                                                                            }}
                                                                        >

                                                                            <span>
                                                                                {
                                                                                    placement.icon
                                                                                }
                                                                            </span>


                                                                            <strong>
                                                                                {
                                                                                    placement.name
                                                                                }
                                                                            </strong>


                                                                            <small>
                                                                                {
                                                                                    placement.potDiameterInches
                                                                                } in pot
                                                                            </small>

                                                                        </div>

                                                                    )
                                                                )
                                                                : (
                                                                    <span className="indoor-layout-empty-level">
                                                                        Open growing space
                                                                    </span>
                                                                )
                                                        }

                                                    </div>

                                                </div>
                                            );

                                        }
                                    )
                            }

                        </div>
                    )
                    : (
                        <div
                            className="indoor-floor-preview"
                            style={{
                                aspectRatio:
                                    `${
                                        Math.max(
                                            1,
                                            indoorLayout
                                                .dimensionsInches
                                                ?.width ||
                                            1
                                        )
                                    } / ${
                                        Math.max(
                                            1,
                                            indoorLayout
                                                .dimensionsInches
                                                ?.length ||
                                            1
                                        )
                                    }`
                            }}
                        >

                            {
                                growLights.length >
                                0 && (

                                    <div className="indoor-floor-light-label">
                                        💡 {
                                            growLights.length
                                        } grow-light zone{
                                            growLights.length ===
                                            1
                                                ? ""
                                                : "s"
                                        }
                                    </div>

                                )
                            }


                            {
                                indoorLayout
                                    .placements
                                    .map(
                                        (placement) => (

                                            <div
                                                key={
                                                    placement.id
                                                }
                                                className="indoor-floor-plant"
                                                style={{
                                                    left:
                                                        `${placement.leftPercent}%`,

                                                    top:
                                                        `${placement.topPercent}%`,

                                                    width:
                                                        `${placement.widthPercent}%`,

                                                    height:
                                                        `${placement.depthPercent}%`
                                                }}
                                            >

                                                <span>
                                                    {
                                                        placement.icon
                                                    }
                                                </span>


                                                <strong>
                                                    {
                                                        placement.name
                                                    }
                                                </strong>


                                                <small>
                                                    {
                                                        placement.potDiameterInches
                                                    } in pot
                                                </small>

                                            </div>

                                        )
                                    )
                            }

                        </div>
                    )
            }


            <div className="indoor-layout-detail-list">

                {
                    indoorLayout
                        .placements
                        .map(
                            (placement) => (

                                <div
                                    key={
                                        `detail-${placement.id}`
                                    }
                                >

                                    <span>
                                        {
                                            placement.icon
                                        }
                                    </span>


                                    <div>

                                        <strong>
                                            {
                                                placement.name
                                            }
                                        </strong>


                                        <small>
                                            {
                                                placement.potDiameterInches
                                            } in pot • {
                                                placement.matureWidthInches
                                            } in mature width • {
                                                placement.matureHeightInches
                                            } in mature height
                                        </small>


                                        <small>
                                            {
                                                placement.needsGrowLight
                                                    ? "💡 Grow light recommended"
                                                    : "☀️ Current light setting can support this plant"
                                            }
                                        </small>

                                    </div>

                                </div>

                            )
                        )
                }

            </div>


            {
                unplaced.length >
                0 && (

                    <div className="indoor-layout-warning">

                        <strong>
                            ⚠ Plants That Need More Space
                        </strong>


                        {
                            unplaced.map(
                                (plant) => (

                                    <p
                                        key={
                                            plant.plantId
                                        }
                                    >
                                        {
                                            plant.icon
                                        } {
                                            plant.name
                                        } — {
                                            plant.reason
                                        }
                                    </p>

                                )
                            )
                        }

                    </div>

                )
            }


            <div className="indoor-layout-note">

                <strong>
                    Planning note
                </strong>


                <p>
                    This layout reserves space for mature plant width rather than only the pot diameter. Grow-light zones indicate where supplemental lighting is recommended; fixture wattage and mounting distance will be added during the indoor build-plan step.
                </p>

            </div>

        </section>
    );
}


export default IndoorLayoutPreview;
