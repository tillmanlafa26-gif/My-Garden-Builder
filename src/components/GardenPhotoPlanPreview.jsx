import {
    useState
} from "react";


import {
    boxToAreaPoints,
    getOrderedAreaPoints,
    mapNormalizedRectToQuad,
    mapUnitPointToQuad,
    photoPointsToSvg
} from "../utils/gardenPhotoGeometry";


function fallbackArea() {
    return [
        {
            xPercent: 8,
            yPercent: 12
        },
        {
            xPercent: 92,
            yPercent: 12
        },
        {
            xPercent: 92,
            yPercent: 92
        },
        {
            xPercent: 8,
            yPercent: 92
        }
    ];
}


function resolveArea(
    spacePhoto
) {
    const manual =
        getOrderedAreaPoints(
            spacePhoto?.markup
                ?.areaPoints
        );


    if (
        manual
    ) {
        return {
            points:
                manual,
            source:
                "manual"
        };
    }


    const ai =
        boxToAreaPoints(
            spacePhoto?.analysis
                ?.usableArea
        );


    if (
        ai
    ) {
        return {
            points:
                ai,
            source:
                "ai"
        };
    }


    return {
        points:
            fallbackArea(),
        source:
            "fallback"
    };
}


function outdoorShapes(
    layout,
    areaPoints
) {
    if (
        !layout ||
        !Array.isArray(
            layout.items
        ) ||
        !Number(
            layout.spaceWidth
        ) ||
        !Number(
            layout.spaceLength
        )
    ) {
        return [];
    }


    return layout.items
        .map(
            (item) => {
                const points =
                    mapNormalizedRectToQuad({
                        x:
                            Number(
                                item.x
                            ) /
                            Number(
                                layout.spaceWidth
                            ),

                        y:
                            Number(
                                item.y
                            ) /
                            Number(
                                layout.spaceLength
                            ),

                        width:
                            Number(
                                item.width
                            ) /
                            Number(
                                layout.spaceWidth
                            ),

                        height:
                            Number(
                                item.length
                            ) /
                            Number(
                                layout.spaceLength
                            ),

                        areaPoints
                    });


                const center =
                    mapUnitPointToQuad(
                        (
                            Number(
                                item.x
                            ) +
                            (
                                Number(
                                    item.width
                                ) /
                                2
                            )
                        ) /
                        Number(
                            layout.spaceWidth
                        ),

                        (
                            Number(
                                item.y
                            ) +
                            (
                                Number(
                                    item.length
                                ) /
                                2
                            )
                        ) /
                        Number(
                            layout.spaceLength
                        ),

                        areaPoints
                    );


                if (
                    !points ||
                    !center
                ) {
                    return null;
                }


                return {
                    id:
                        item.id,
                    name:
                        item.name,
                    type:
                        item.type,
                    icon:
                        item.icon ||
                        "🌱",
                    points,
                    center
                };
            }
        )
        .filter(
            Boolean
        );
}


function indoorShapes(
    indoorLayout,
    areaPoints
) {
    if (
        !indoorLayout
    ) {
        return [];
    }


    if (
        indoorLayout.mode ===
        "floor"
    ) {
        return (
            indoorLayout.placements ||
            []
        )
            .map(
                (placement) => {
                    const left =
                        Number(
                            placement.leftPercent ||
                            0
                        ) /
                        100;


                    const top =
                        Number(
                            placement.topPercent ||
                            0
                        ) /
                        100;


                    const width =
                        Number(
                            placement.widthPercent ||
                            10
                        ) /
                        100;


                    const height =
                        Number(
                            placement.depthPercent ||
                            10
                        ) /
                        100;


                    const points =
                        mapNormalizedRectToQuad({
                            x:
                                left,
                            y:
                                top,
                            width,
                            height,
                            areaPoints
                        });


                    const center =
                        mapUnitPointToQuad(
                            left +
                            (
                                width /
                                2
                            ),
                            top +
                            (
                                height /
                                2
                            ),
                            areaPoints
                        );


                    if (
                        !points ||
                        !center
                    ) {
                        return null;
                    }


                    return {
                        id:
                            placement.id,
                        name:
                            placement.name,
                        type:
                            "indoor-plant",
                        icon:
                            placement.icon ||
                            "🪴",
                        points,
                        center
                    };
                }
            )
            .filter(
                Boolean
            );
    }


    const levels =
        Array.isArray(
            indoorLayout.levels
        )
            ? indoorLayout.levels
            : [];


    const levelCount =
        Math.max(
            1,
            levels.length
        );


    return levels.flatMap(
        (
            level,
            arrayIndex
        ) => {
            const levelIndex =
                Number.isFinite(
                    Number(
                        level.index
                    )
                )
                    ? Number(
                        level.index
                    )
                    : arrayIndex;


            const rowTop =
                1 -
                (
                    (
                        levelIndex +
                        1
                    ) /
                    levelCount
                );


            const rowHeight =
                1 /
                levelCount;


            return (
                level.placements ||
                []
            )
                .map(
                    (placement) => {
                        const left =
                            Number(
                                placement.leftPercent ||
                                0
                            ) /
                            100;


                        const width =
                            Math.max(
                                0.07,
                                Number(
                                    placement.widthPercent ||
                                    10
                                ) /
                                100
                            );


                        const top =
                            rowTop +
                            (
                                rowHeight *
                                0.18
                            );


                        const height =
                            rowHeight *
                            0.64;


                        const points =
                            mapNormalizedRectToQuad({
                                x:
                                    left,
                                y:
                                    top,
                                width:
                                    Math.min(
                                        width,
                                        1 -
                                        left
                                    ),
                                height,
                                areaPoints
                            });


                        const center =
                            mapUnitPointToQuad(
                                Math.min(
                                    1,
                                    left +
                                    (
                                        width /
                                        2
                                    )
                                ),
                                top +
                                (
                                    height /
                                    2
                                ),
                                areaPoints
                            );


                        if (
                            !points ||
                            !center
                        ) {
                            return null;
                        }


                        return {
                            id:
                                placement.id,
                            name:
                                placement.name,
                            type:
                                "indoor-plant",
                            icon:
                                placement.icon ||
                                "🪴",
                            points,
                            center
                        };
                    }
                )
                .filter(
                    Boolean
                );
        }
    );
}


function GardenPhotoPlanPreview({
    spacePhoto,
    layout,
    indoorLayout,
    isIndoorSpace
}) {
    const [
        showPlan,
        setShowPlan
    ] = useState(
        true
    );


    const [
        showAiObjects,
        setShowAiObjects
    ] = useState(
        true
    );


    const [
        opacity,
        setOpacity
    ] = useState(
        72
    );


    if (
        !spacePhoto?.dataUrl
    ) {
        return null;
    }


    const area =
        resolveArea(
            spacePhoto
        );


    const shapes =
        isIndoorSpace
            ? indoorShapes(
                indoorLayout,
                area.points
            )
            : outdoorShapes(
                layout,
                area.points
            );


    if (
        shapes.length ===
        0
    ) {
        return null;
    }


    const obstacles =
        spacePhoto?.analysis
            ?.obstacles ||
        [];


    const structures =
        spacePhoto?.analysis
            ?.structures ||
        [];


    const calibration =
        spacePhoto?.markup
            ?.calibration ||
        null;


    return (
        <section className="designer-card garden-photo-plan-preview">

            <div className="designer-section-heading">

                <span>
                    🪄
                </span>


                <div>

                    <h2>
                        Garden in Your Photo
                    </h2>


                    <p>
                        Your generated layout is projected into the usable area marked on your actual garden-space photo.
                    </p>

                </div>

            </div>


            <div className="garden-photo-plan-controls">

                <label>

                    <input
                        type="checkbox"
                        checked={
                            showPlan
                        }
                        onChange={
                            (event) =>
                                setShowPlan(
                                    event.target.checked
                                )
                        }
                    />

                    <span>
                        Garden plan
                    </span>

                </label>


                {
                    (
                        obstacles.length >
                            0 ||
                        structures.length >
                            0
                    ) && (

                        <label>

                            <input
                                type="checkbox"
                                checked={
                                    showAiObjects
                                }
                                onChange={
                                    (event) =>
                                        setShowAiObjects(
                                            event.target.checked
                                        )
                                }
                            />

                            <span>
                                AI objects
                            </span>

                        </label>

                    )
                }


                <label className="garden-photo-opacity-control">

                    <span>
                        Opacity
                    </span>


                    <input
                        type="range"
                        min="35"
                        max="100"
                        step="5"
                        value={
                            opacity
                        }
                        onChange={
                            (event) =>
                                setOpacity(
                                    Number(
                                        event.target.value
                                    )
                                )
                        }
                    />

                </label>

            </div>


            <div className="garden-photo-plan-stage">

                <img
                    src={
                        spacePhoto.dataUrl
                    }
                    alt="Garden space with planned garden overlay"
                />


                <svg
                    className="garden-photo-plan-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-label="Garden plan projected onto the garden-space photo"
                >

                    <polygon
                        className={
                            `garden-photo-area-outline ${area.source}`
                        }
                        points={
                            photoPointsToSvg(
                                area.points
                            )
                        }
                    />


                    {
                        showAiObjects &&
                        structures.map(
                            (
                                item,
                                index
                            ) => (

                                <rect
                                    key={
                                        `structure-${index}`
                                    }
                                    className="garden-photo-preview-structure"
                                    x={
                                        item.x
                                    }
                                    y={
                                        item.y
                                    }
                                    width={
                                        item.width
                                    }
                                    height={
                                        item.height
                                    }
                                >
                                    <title>
                                        {
                                            item.label
                                        }
                                    </title>
                                </rect>

                            )
                        )
                    }


                    {
                        showAiObjects &&
                        obstacles.map(
                            (
                                item,
                                index
                            ) => (

                                <rect
                                    key={
                                        `obstacle-${index}`
                                    }
                                    className="garden-photo-preview-obstacle"
                                    x={
                                        item.x
                                    }
                                    y={
                                        item.y
                                    }
                                    width={
                                        item.width
                                    }
                                    height={
                                        item.height
                                    }
                                >
                                    <title>
                                        {
                                            item.label
                                        }
                                    </title>
                                </rect>

                            )
                        )
                    }


                    <g
                        style={{
                            opacity:
                                showPlan
                                    ? opacity /
                                      100
                                    : 0
                        }}
                    >

                        {
                            shapes.map(
                                (shape) => (

                                    <g
                                        key={
                                            shape.id
                                        }
                                    >

                                        <polygon
                                            className={
                                                `garden-photo-plan-shape shape-${shape.type}`
                                            }
                                            points={
                                                photoPointsToSvg(
                                                    shape.points
                                                )
                                            }
                                        >
                                            <title>
                                                {
                                                    shape.name
                                                }
                                            </title>
                                        </polygon>


                                        <text
                                            className="garden-photo-plan-shape-icon"
                                            x={
                                                shape.center.xPercent
                                            }
                                            y={
                                                shape.center.yPercent
                                            }
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {
                                                shape.icon
                                            }
                                        </text>

                                    </g>

                                )
                            )
                        }

                    </g>

                </svg>

            </div>


            <div className="garden-photo-plan-legend">

                <span>
                    <i className="legend-plan" />
                    Garden plan
                </span>


                <span>
                    <i className="legend-area" />
                    {
                        area.source ===
                        "manual"
                            ? "Your usable area"
                            : area.source ===
                              "ai"
                                ? "AI suggested area"
                                : "Default photo area"
                    }
                </span>


                {
                    obstacles.length >
                    0 && (

                        <span>
                            <i className="legend-obstacle" />
                            AI obstacle
                        </span>

                    )
                }

            </div>


            {
                calibration && (

                    <div className="garden-photo-plan-calibration">

                        <strong>
                            📏 Calibration reference
                        </strong>


                        <span>
                            {
                                calibration.distance
                            } {
                                calibration.unit
                            } marked edge • {
                                calibration.pixelsPerUnit
                            } px / {
                                calibration.unit
                            }
                        </span>

                    </div>

                )
            }


            <div className="garden-photo-plan-note">

                <strong>
                    Use the build plan for real measurements
                </strong>


                <p>
                    Perspective changes apparent size in a photo. This overlay is for visualization; the measured dimensions, material quantities, and construction layout remain authoritative.
                </p>

            </div>

        </section>
    );
}


export default GardenPhotoPlanPreview;
