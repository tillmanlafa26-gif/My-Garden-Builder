import {
    getIndoorPlantById
} from "../data/indoorPlantData";


const INCHES_PER_FOOT =
    12;


const INCHES_PER_METER =
    39.3701;


function clamp(
    value,
    minimum,
    maximum
) {
    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );
}


function roundNumber(
    value,
    decimals = 1
) {
    const factor =
        10 ** decimals;


    return Math.round(
        Number(
            value || 0
        ) *
        factor
    ) /
    factor;
}


function toInches(
    value,
    unit
) {
    const numericValue =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return 0;
    }


    return unit ===
        "m"
            ? numericValue *
              INCHES_PER_METER
            : numericValue *
              INCHES_PER_FOOT;
}


function getLightRank(
    sunlight
) {
    switch (
        sunlight
    ) {
        case "full":
            return 3;

        case "partial":
            return 2;

        case "shade":
        default:
            return 1;
    }
}


function getRequiredLightRank(
    plant
) {
    const level =
        String(
            plant?.lightLevel ||
            ""
        );


    if (
        level.includes(
            "grow-light"
        )
    ) {
        return 4;
    }


    if (
        level.includes(
            "bright"
        )
    ) {
        return 3;
    }


    if (
        level.includes(
            "medium"
        )
    ) {
        return 2;
    }


    return 1;
}


function plantNeedsGrowLight(
    plant,
    sunlight
) {
    const required =
        getRequiredLightRank(
            plant
        );


    const available =
        getLightRank(
            sunlight
        );


    return (
        required >= 4 ||
        available <
            required
    );
}


function getIndoorSpaceDefinition(
    indoorSpaceType,
    dimensions
) {
    const height =
        dimensions.height;


    switch (
        indoorSpaceType
    ) {
        case "windowsill":
            return {
                id:
                    "windowsill",

                name:
                    "Windowsill",

                icon:
                    "🪟",

                mode:
                    "linear",

                levels:
                    1,

                usableDepth:
                    Math.min(
                        dimensions.length,
                        12
                    ),

                levelClearance:
                    height,

                lightMount:
                    "window-or-overhead"
            };


        case "countertop":
            return {
                id:
                    "countertop",

                name:
                    "Countertop",

                icon:
                    "🧱",

                mode:
                    "linear",

                levels:
                    1,

                usableDepth:
                    Math.min(
                        dimensions.length,
                        24
                    ),

                levelClearance:
                    height,

                lightMount:
                    "overhead"
            };


        case "plant-rack": {
            const levels =
                clamp(
                    Math.floor(
                        height /
                        24
                    ),
                    2,
                    5
                );


            return {
                id:
                    "plant-rack",

                name:
                    "Plant Rack",

                icon:
                    "🪴",

                mode:
                    "linear",

                levels,

                usableDepth:
                    Math.min(
                        dimensions.length,
                        24
                    ),

                levelClearance:
                    height /
                    levels,

                lightMount:
                    "under-shelf"
            };
        }


        case "shelf": {
            const levels =
                clamp(
                    Math.floor(
                        height /
                        24
                    ),
                    1,
                    4
                );


            return {
                id:
                    "shelf",

                name:
                    "Shelf",

                icon:
                    "📚",

                mode:
                    "linear",

                levels,

                usableDepth:
                    Math.min(
                        dimensions.length,
                        18
                    ),

                levelClearance:
                    height /
                    levels,

                lightMount:
                    "under-shelf"
            };
        }


        case "grow-tent":
            return {
                id:
                    "grow-tent",

                name:
                    "Grow Tent",

                icon:
                    "⛺",

                mode:
                    "floor",

                levels:
                    1,

                usableDepth:
                    dimensions.length,

                levelClearance:
                    height,

                lightMount:
                    "overhead",
                forceGrowLight:
                    true
            };


        case "floor":
        default:
            return {
                id:
                    "floor",

                name:
                    "Floor / Corner",

                icon:
                    "🏠",

                mode:
                    "floor",

                levels:
                    1,

                usableDepth:
                    dimensions.length,

                levelClearance:
                    height,

                lightMount:
                    "overhead"
            };
    }
}


function getPlacementFootprint(
    plant,
    mode
) {
    const pot =
        Math.max(
            4,
            Number(
                plant.potDiameterInches ||
                0
            )
        );


    const matureWidth =
        Math.max(
            pot,
            Number(
                plant.matureWidthInches ||
                pot
            )
        );


    if (
        mode ===
        "linear"
    ) {
        return {
            width:
                Math.max(
                    pot + 2,
                    matureWidth *
                        0.72
                ),

            depth:
                Math.max(
                    pot + 2,
                    Math.min(
                        24,
                        matureWidth *
                            0.5
                    )
                )
        };
    }


    return {
        width:
            matureWidth,

        depth:
            matureWidth
    };
}


function getLinearPlacementPriority(
    plant
) {
    const style =
        String(
            plant?.placementStyle ||
            ""
        );


    if (
        style.includes(
            "hanging"
        ) ||
        style.includes(
            "trailing"
        )
    ) {
        return 0;
    }


    if (
        style.includes(
            "shelf"
        ) ||
        style.includes(
            "windowsill"
        )
    ) {
        return 1;
    }


    if (
        style.includes(
            "stand"
        )
    ) {
        return 2;
    }


    return 3;
}


function buildLinearLevels({
    definition,
    dimensions
}) {
    return Array.from(
        {
            length:
                definition.levels
        },
        (
            _,
            index
        ) => ({
            id:
                `level-${index + 1}`,

            index,

            label:
                definition.levels ===
                1
                    ? definition.name
                    : `Level ${index + 1}`,

            width:
                dimensions.width,

            depth:
                definition.usableDepth,

            clearance:
                definition.levelClearance,

            usedWidth:
                0,

            placements:
                []
        })
    );
}


function placeLinearPlants({
    plants,
    levels,
    definition,
    sunlight
}) {
    const unplaced =
        [];


    const ordered =
        [
            ...plants
        ].sort(
            (
                first,
                second
            ) =>
                getLinearPlacementPriority(
                    first
                ) -
                    getLinearPlacementPriority(
                        second
                    ) ||
                Number(
                    second.matureHeightInches ||
                    0
                ) -
                    Number(
                        first.matureHeightInches ||
                        0
                    )
        );


    ordered.forEach(
        (plant) => {
            const footprint =
                getPlacementFootprint(
                    plant,
                    "linear"
                );


            const matureHeight =
                Number(
                    plant.matureHeightInches ||
                    0
                );


            const style =
                String(
                    plant.placementStyle ||
                    ""
                );


            const preferredLevelIndexes =
                (
                    style.includes(
                        "hanging"
                    ) ||
                    style.includes(
                        "trailing"
                    )
                )
                    ? [
                        levels.length -
                            1,
                        ...levels
                            .map(
                                (
                                    _,
                                    index
                                ) =>
                                    index
                            )
                            .filter(
                                (index) =>
                                    index !==
                                    levels.length -
                                        1
                            )
                    ]
                    : levels.map(
                        (
                            _,
                            index
                        ) =>
                            index
                    );


            const level =
                preferredLevelIndexes
                    .map(
                        (index) =>
                            levels[
                                index
                            ]
                    )
                    .find(
                        (candidate) =>
                            footprint.depth <=
                                candidate.depth +
                                    0.01 &&
                            footprint.width <=
                                (
                                    candidate.width -
                                    candidate.usedWidth
                                ) +
                                    0.01 &&
                            matureHeight <=
                                candidate.clearance -
                                    4
                    );


            if (
                !level
            ) {
                unplaced.push({
                    plantId:
                        plant.id,

                    name:
                        plant.name,

                    icon:
                        plant.icon,

                    reason:
                        matureHeight >
                        definition.levelClearance -
                            4
                            ? "Not enough vertical clearance for this plant at mature height."
                            : "Not enough usable shelf width or depth for this plant's mature footprint."
                });


                return;
            }


            const left =
                level.usedWidth;


            const placement = {
                id:
                    `${level.id}-${plant.id}`,

                plantId:
                    plant.id,

                name:
                    plant.name,

                icon:
                    plant.icon,

                potDiameterInches:
                    plant.potDiameterInches,

                matureWidthInches:
                    plant.matureWidthInches,

                matureHeightInches:
                    plant.matureHeightInches,

                placementStyle:
                    plant.placementStyle,

                lightLabel:
                    plant.lightLabel,

                needsGrowLight:
                    plantNeedsGrowLight(
                        plant,
                        sunlight
                    ) ||
                    Boolean(
                        definition.forceGrowLight
                    ),

                x:
                    roundNumber(
                        left
                    ),

                y:
                    0,

                width:
                    roundNumber(
                        footprint.width
                    ),

                depth:
                    roundNumber(
                        footprint.depth
                    ),

                leftPercent:
                    roundNumber(
                        (
                            left /
                            level.width
                        ) *
                            100,
                        2
                    ),

                widthPercent:
                    roundNumber(
                        (
                            footprint.width /
                            level.width
                        ) *
                            100,
                        2
                    )
            };


            level.placements.push(
                placement
            );


            level.usedWidth +=
                footprint.width;
        }
    );


    return {
        levels,
        unplaced
    };
}


function placeFloorPlants({
    plants,
    dimensions,
    definition,
    sunlight
}) {
    const placements =
        [];


    const unplaced =
        [];


    let cursorX =
        0;


    let cursorY =
        0;


    let currentRowDepth =
        0;


    const ordered =
        [
            ...plants
        ].sort(
            (
                first,
                second
            ) =>
                Number(
                    second.matureWidthInches ||
                    0
                ) -
                Number(
                    first.matureWidthInches ||
                    0
                )
        );


    ordered.forEach(
        (plant) => {
            const footprint =
                getPlacementFootprint(
                    plant,
                    "floor"
                );


            const matureHeight =
                Number(
                    plant.matureHeightInches ||
                    0
                );


            if (
                matureHeight >
                dimensions.height -
                    6
            ) {
                unplaced.push({
                    plantId:
                        plant.id,

                    name:
                        plant.name,

                    icon:
                        plant.icon,

                    reason:
                        "The plant's mature height exceeds the available indoor height."
                });


                return;
            }


            if (
                footprint.width >
                    dimensions.width ||
                footprint.depth >
                    dimensions.length
            ) {
                unplaced.push({
                    plantId:
                        plant.id,

                    name:
                        plant.name,

                    icon:
                        plant.icon,

                    reason:
                        "The plant's mature footprint is larger than the available floor area."
                });


                return;
            }


            if (
                cursorX +
                    footprint.width >
                dimensions.width
            ) {
                cursorX =
                    0;


                cursorY +=
                    currentRowDepth;


                currentRowDepth =
                    0;
            }


            if (
                cursorY +
                    footprint.depth >
                dimensions.length
            ) {
                unplaced.push({
                    plantId:
                        plant.id,

                    name:
                        plant.name,

                    icon:
                        plant.icon,

                    reason:
                        "The remaining floor area is too small for this plant's mature footprint."
                });


                return;
            }


            placements.push({
                id:
                    `floor-${plant.id}`,

                plantId:
                    plant.id,

                name:
                    plant.name,

                icon:
                    plant.icon,

                potDiameterInches:
                    plant.potDiameterInches,

                matureWidthInches:
                    plant.matureWidthInches,

                matureHeightInches:
                    plant.matureHeightInches,

                placementStyle:
                    plant.placementStyle,

                lightLabel:
                    plant.lightLabel,

                needsGrowLight:
                    plantNeedsGrowLight(
                        plant,
                        sunlight
                    ) ||
                    Boolean(
                        definition.forceGrowLight
                    ),

                x:
                    roundNumber(
                        cursorX
                    ),

                y:
                    roundNumber(
                        cursorY
                    ),

                width:
                    roundNumber(
                        footprint.width
                    ),

                depth:
                    roundNumber(
                        footprint.depth
                    ),

                leftPercent:
                    roundNumber(
                        (
                            cursorX /
                            dimensions.width
                        ) *
                            100,
                        2
                    ),

                topPercent:
                    roundNumber(
                        (
                            cursorY /
                            dimensions.length
                        ) *
                            100,
                        2
                    ),

                widthPercent:
                    roundNumber(
                        (
                            footprint.width /
                            dimensions.width
                        ) *
                            100,
                        2
                    ),

                depthPercent:
                    roundNumber(
                        (
                            footprint.depth /
                            dimensions.length
                        ) *
                            100,
                        2
                    )
            });


            cursorX +=
                footprint.width;


            currentRowDepth =
                Math.max(
                    currentRowDepth,
                    footprint.depth
                );
        }
    );


    return {
        placements,
        unplaced
    };
}


function buildGrowLightPlan({
    mode,
    levels,
    placements,
    definition
}) {
    if (
        mode ===
        "linear"
    ) {
        return levels
            .filter(
                (level) =>
                    level.placements.some(
                        (placement) =>
                            placement.needsGrowLight
                    )
            )
            .map(
                (level) => ({
                    id:
                        `light-${level.id}`,

                    target:
                        level.id,

                    label:
                        `${level.label} grow light`,

                    mount:
                        definition.lightMount,

                    coverageWidthInches:
                        roundNumber(
                            Math.min(
                                level.width,
                                Math.max(
                                    24,
                                    level.usedWidth
                                )
                            )
                        )
                })
            );
    }


    const lightPlants =
        placements.filter(
            (placement) =>
                placement.needsGrowLight
        );


    if (
        lightPlants.length ===
        0
    ) {
        return [];
    }


    const totalFootprintArea =
        lightPlants.reduce(
            (
                total,
                placement
            ) =>
                total +
                placement.width *
                    placement.depth,
            0
        );


    const coveragePerLight =
        48 *
        24;


    const lightCount =
        Math.max(
            1,
            Math.ceil(
                totalFootprintArea /
                coveragePerLight
            )
        );


    return Array.from(
        {
            length:
                lightCount
        },
        (
            _,
            index
        ) => ({
            id:
                `light-floor-${index + 1}`,

            target:
                "floor",

            label:
                `Overhead grow-light zone ${index + 1}`,

            mount:
                definition.lightMount,

            coverageWidthInches:
                48,

            coverageDepthInches:
                24
        })
    );
}


export function generateIndoorLayout({
    width,
    length,
    height,
    unit = "ft",
    indoorSpaceType = "shelf",
    selectedPlants = [],
    sunlight = "partial"
}) {
    const dimensions = {
        width:
            toInches(
                width,
                unit
            ),

        length:
            toInches(
                length,
                unit
            ),

        height:
            toInches(
                height,
                unit
            )
    };


    if (
        dimensions.width <= 0 ||
        dimensions.length <= 0 ||
        dimensions.height <= 0
    ) {
        return null;
    }


    const plants =
        selectedPlants
            .map(
                (plantId) =>
                    getIndoorPlantById(
                        plantId
                    )
            )
            .filter(
                Boolean
            );


    if (
        plants.length ===
        0
    ) {
        return null;
    }


    const definition =
        getIndoorSpaceDefinition(
            indoorSpaceType,
            dimensions
        );


    let levels =
        [];


    let placements =
        [];


    let unplacedPlants =
        [];


    if (
        definition.mode ===
        "linear"
    ) {
        levels =
            buildLinearLevels({
                definition,
                dimensions
            });


        const result =
            placeLinearPlants({
                plants,
                levels,
                definition,
                sunlight
            });


        levels =
            result.levels;


        unplacedPlants =
            result.unplaced;


        placements =
            levels.flatMap(
                (level) =>
                    level.placements.map(
                        (placement) => ({
                            ...placement,
                            levelId:
                                level.id,
                            levelLabel:
                                level.label
                        })
                    )
            );
    } else {
        const result =
            placeFloorPlants({
                plants,
                dimensions,
                definition,
                sunlight
            });


        placements =
            result.placements;


        unplacedPlants =
            result.unplaced;


        levels = [
            {
                id:
                    "floor",

                index:
                    0,

                label:
                    definition.name,

                width:
                    dimensions.width,

                depth:
                    dimensions.length,

                clearance:
                    dimensions.height,

                placements
            }
        ];
    }


    const growLights =
        buildGrowLightPlan({
            mode:
                definition.mode,

            levels,

            placements,

            definition
        });


    const warnings =
        [];


    if (
        unplacedPlants.length >
        0
    ) {
        warnings.push(
            `${unplacedPlants.length} selected plant${unplacedPlants.length === 1 ? "" : "s"} did not fit with mature-size clearance.`
        );
    }


    if (
        growLights.length >
        0
    ) {
        warnings.push(
            `${growLights.length} grow-light zone${growLights.length === 1 ? " is" : "s are"} recommended for the selected plants and available light.`
        );
    }


    const totalSurfaceArea =
        definition.mode ===
        "linear"
            ? levels.reduce(
                (
                    total,
                    level
                ) =>
                    total +
                    level.width *
                        level.depth,
                0
            )
            : dimensions.width *
                dimensions.length;


    const usedSurfaceArea =
        placements.reduce(
            (
                total,
                placement
            ) =>
                total +
                placement.width *
                    placement.depth,
            0
        );


    return {
        version:
            1,

        type:
            "indoor",

        generatedAt:
            new Date()
                .toISOString(),

        indoorSpaceType:
            definition.id,

        indoorSpaceName:
            definition.name,

        icon:
            definition.icon,

        mode:
            definition.mode,

        sourceUnit:
            unit,

        sourceDimensions: {
            width:
                Number(
                    width
                ),

            length:
                Number(
                    length
                ),

            height:
                Number(
                    height
                )
        },

        dimensionsInches: {
            width:
                roundNumber(
                    dimensions.width
                ),

            length:
                roundNumber(
                    dimensions.length
                ),

            height:
                roundNumber(
                    dimensions.height
                )
        },

        lightLevel:
            sunlight,

        levels,

        placements,

        growLights,

        unplacedPlants,

        warnings,

        stats: {
            selectedPlantCount:
                plants.length,

            placedPlantCount:
                placements.length,

            unplacedPlantCount:
                unplacedPlants.length,

            levelCount:
                levels.length,

            growLightZoneCount:
                growLights.length,

            estimatedSurfaceUsePercent:
                totalSurfaceArea >
                0
                    ? Math.round(
                        Math.min(
                            100,
                            (
                                usedSurfaceArea /
                                totalSurfaceArea
                            ) *
                                100
                        )
                    )
                    : 0
        }
    };
}
