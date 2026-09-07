import {
    getCropById
} from "../data/cropPlanningData";


import {
    BED_SAFE_UTILIZATION,
    canAddCropToBed,
    createPlantPairingGuide,
    getPairCompatibility
} from "./plantPairingPlanner";


import {
    getCropLayoutSquareFeet,
    getCropPlantSpacingInches
} from "./cropSpacing";


/* =========================
   HELPERS
========================= */

function roundNumber(
    value,
    decimals = 1
) {
    const factor =
        10 ** decimals;


    return (
        Math.round(
            value *
            factor
        ) /
        factor
    );
}


function getCanopyRank(
    canopy
) {
    switch (
        canopy
    ) {
        case "tall":
            return 3;

        case "medium":
            return 2;

        case "low":
        default:
            return 1;
    }
}


/* =========================
   SPATIAL PLANTING HELPERS
========================= */

function getCropSpacingFeet(
    crop
) {
    return (
        getCropPlantSpacingInches(
            crop
        ) /
        12
    );
}


function getCropSpacingInches(
    crop
) {
    return getCropPlantSpacingInches(
        crop
    );
}


function getUniformEdgeBuffer(
    width,
    length
) {
    const safeFraction =
        BED_SAFE_UTILIZATION;


    const sum =
        width +
        length;


    const discriminant =
        Math.max(
            0,
            sum ** 2 -
                4 *
                    (
                        1 -
                        safeFraction
                    ) *
                    width *
                    length
        );


    const buffer =
        (
            sum -
            Math.sqrt(
                discriminant
            )
        ) /
        4;


    return Math.max(
        0,
        Math.min(
            buffer,
            Math.min(
                width,
                length
            ) /
                4
        )
    );
}


function createSliceCandidates({
    rectangle,
    crop,
    forceTrellisEdge = false
}) {
    const area =
        Math.max(
            0,
            Number(
                crop.areaUsed ||
                0
            )
        );


    if (
        area <= 0 ||
        rectangle.width <= 0 ||
        rectangle.length <= 0
    ) {
        return [];
    }


    const spacing =
        getCropSpacingFeet(
            crop
        );


    const candidates =
        [];


    const horizontalLength =
        area /
        rectangle.width;


    if (
        horizontalLength <=
        rectangle.length +
            0.000001
    ) {
        const width =
            rectangle.width;


        const length =
            horizontalLength;


        const minimumDimension =
            Math.min(
                width,
                length
            );


        candidates.push({
            orientation:
                "horizontal",

            x:
                rectangle.x,

            y:
                rectangle.y,

            width,

            length,

            remaining: {
                x:
                    rectangle.x,

                y:
                    rectangle.y +
                    length,

                width:
                    rectangle.width,

                length:
                    Math.max(
                        0,
                        rectangle.length -
                            length
                    )
            },

            score:
                (
                    Math.min(
                        1.25,
                        minimumDimension /
                            Math.max(
                                spacing,
                                0.01
                            )
                    ) *
                    10
                ) +
                (
                    crop.support &&
                    forceTrellisEdge
                        ? 8
                        : 0
                ) +
                (
                    Math.min(
                        width,
                        length
                    ) /
                    Math.max(
                        width,
                        length,
                        0.01
                    )
                )
        });
    }


    const verticalWidth =
        area /
        rectangle.length;


    if (
        !forceTrellisEdge &&
        verticalWidth <=
        rectangle.width +
            0.000001
    ) {
        const width =
            verticalWidth;


        const length =
            rectangle.length;


        const minimumDimension =
            Math.min(
                width,
                length
            );


        candidates.push({
            orientation:
                "vertical",

            x:
                rectangle.x,

            y:
                rectangle.y,

            width,

            length,

            remaining: {
                x:
                    rectangle.x +
                    width,

                y:
                    rectangle.y,

                width:
                    Math.max(
                        0,
                        rectangle.width -
                            width
                    ),

                length:
                    rectangle.length
            },

            score:
                (
                    Math.min(
                        1.25,
                        minimumDimension /
                            Math.max(
                                spacing,
                                0.01
                            )
                    ) *
                    10
                ) +
                (
                    Math.min(
                        width,
                        length
                    ) /
                    Math.max(
                        width,
                        length,
                        0.01
                    )
                )
        });
    }


    return candidates;
}


function chooseSpatialSlices({
    crops,
    rectangle,
    bedHasTrellis,
    index = 0
}) {
    if (
        index >=
        crops.length
    ) {
        return {
            score:
                0,

            zones:
                [],

            remaining:
                rectangle
        };
    }


    const crop =
        crops[index];


    const forceTrellisEdge =
        Boolean(
            bedHasTrellis &&
            crop.support &&
            index === 0
        );


    const candidates =
        createSliceCandidates({
            rectangle,
            crop,
            forceTrellisEdge
        });


    if (
        candidates.length ===
        0
    ) {
        return {
            score:
                -1000,

            zones:
                [],

            remaining:
                rectangle
        };
    }


    let best =
        null;


    candidates.forEach(
        (candidate) => {
            const rest =
                chooseSpatialSlices({
                    crops,
                    rectangle:
                        candidate.remaining,
                    bedHasTrellis,
                    index:
                        index + 1
                });


            const totalScore =
                candidate.score +
                rest.score;


            if (
                !best ||
                totalScore >
                    best.score
            ) {
                best = {
                    score:
                        totalScore,

                    zones: [
                        {
                            crop,
                            candidate
                        },
                        ...rest.zones
                    ],

                    remaining:
                        rest.remaining
                };
            }
        }
    );


    return best;
}


function createZoneMarkers({
    crop,
    width,
    length
}) {
    const quantity =
        Math.max(
            0,
            Number(
                crop.quantity ||
                0
            )
        );


    if (
        quantity <= 0
    ) {
        return [];
    }


    const markerLimit =
        24;


    const markerCount =
        Math.min(
            quantity,
            markerLimit
        );


    const aspect =
        width /
        Math.max(
            length,
            0.01
        );


    const columns =
        Math.max(
            1,
            Math.ceil(
                Math.sqrt(
                    markerCount *
                    Math.max(
                        aspect,
                        0.1
                    )
                )
            )
        );


    const rows =
        Math.max(
            1,
            Math.ceil(
                markerCount /
                    columns
            )
        );


    return Array.from(
        {
            length:
                markerCount
        },
        (
            _,
            index
        ) => {
            const column =
                index %
                columns;


            const row =
                Math.floor(
                    index /
                    columns
                );


            return {
                id:
                    `${crop.id}-marker-${index}`,

                xPercent:
                    roundNumber(
                        (
                            (
                                column +
                                0.5
                            ) /
                            columns
                        ) *
                            100,
                        2
                    ),

                yPercent:
                    roundNumber(
                        (
                            (
                                row +
                                0.5
                            ) /
                            rows
                        ) *
                            100,
                        2
                    )
            };
        }
    );
}


function createPlantingZones(
    bed
) {
    if (
        !bed ||
        !Array.isArray(
            bed.crops
        ) ||
        bed.crops.length ===
            0
    ) {
        return {
            edgeBufferFeet:
                0,

            usableWidth:
                bed?.width ||
                0,

            usableLength:
                bed?.length ||
                0,

            zones:
                [],

            internalOpenArea:
                bed?.totalArea ||
                0
        };
    }


    const edgeBuffer =
        getUniformEdgeBuffer(
            bed.width,
            bed.length
        );


    const usableRectangle = {
        x:
            edgeBuffer,

        y:
            edgeBuffer,

        width:
            Math.max(
                0,
                bed.width -
                    edgeBuffer *
                        2
            ),

        length:
            Math.max(
                0,
                bed.length -
                    edgeBuffer *
                        2
            )
    };


    const orderedCrops =
        [
            ...bed.crops
        ].sort(
            (
                first,
                second
            ) => {
                if (
                    first.support !==
                    second.support
                ) {
                    return first.support
                        ? -1
                        : 1;
                }


                const canopyDifference =
                    getCanopyRank(
                        second.canopy
                    ) -
                    getCanopyRank(
                        first.canopy
                    );


                if (
                    canopyDifference !==
                    0
                ) {
                    return canopyDifference;
                }


                return (
                    second.areaUsed -
                    first.areaUsed
                );
            }
        );


    const result =
        chooseSpatialSlices({
            crops:
                orderedCrops,

            rectangle:
                usableRectangle,

            bedHasTrellis:
                Boolean(
                    bed.hasTrellis
                )
        });


    const zones =
        result.zones.map(
            (
                zone,
                index
            ) => {
                const crop =
                    zone.crop;


                const candidate =
                    zone.candidate;


                const spacingFeet =
                    getCropSpacingFeet(
                        crop
                    );


                const spacingInches =
                    getCropSpacingInches(
                        crop
                    );


                const minimumZoneDimension =
                    Math.min(
                        candidate.width,
                        candidate.length
                    );


                return {
                    id:
                        `${bed.id}-${crop.id}-zone`,

                    cropId:
                        crop.id,

                    name:
                        crop.name,

                    icon:
                        crop.icon,

                    quantity:
                        crop.quantity,

                    areaUsed:
                        crop.areaUsed,

                    squareFeetPerPlant:
                        crop.squareFeetPerPlant,

                    layoutSquareFeetPerPlant:
                        crop.layoutSquareFeetPerPlant ??
                        crop.squareFeetPerPlant,

                    layoutWidthInches:
                        crop.layoutWidthInches,

                    layoutDepthInches:
                        crop.layoutDepthInches,

                    matureWidthInches:
                        crop.matureWidthInches,

                    matureHeightInches:
                        crop.matureHeightInches,

                    spacingBasis:
                        crop.spacingBasis,

                    spacingFeet:
                        roundNumber(
                            spacingFeet,
                            2
                        ),

                    spacingInches,

                    support:
                        crop.support,

                    canopy:
                        crop.canopy,

                    placementGroup:
                        crop.placementGroup,

                    zoneIndex:
                        index,

                    orientation:
                        candidate.orientation,

                    x:
                        roundNumber(
                            candidate.x,
                            3
                        ),

                    y:
                        roundNumber(
                            candidate.y,
                            3
                        ),

                    width:
                        roundNumber(
                            candidate.width,
                            3
                        ),

                    length:
                        roundNumber(
                            candidate.length,
                            3
                        ),

                    xPercent:
                        roundNumber(
                            (
                                candidate.x /
                                bed.width
                            ) *
                                100,
                            2
                        ),

                    yPercent:
                        roundNumber(
                            (
                                candidate.y /
                                bed.length
                            ) *
                                100,
                            2
                        ),

                    widthPercent:
                        roundNumber(
                            (
                                candidate.width /
                                bed.width
                            ) *
                                100,
                            2
                        ),

                    lengthPercent:
                        roundNumber(
                            (
                                candidate.length /
                                bed.length
                            ) *
                                100,
                            2
                        ),

                    geometryNote:
                        minimumZoneDimension <
                        spacingFeet *
                            0.75
                            ? "This crop block is narrow. Keep the full recommended plant spacing when placing individual plants."
                            : null,

                    markers:
                        createZoneMarkers({
                            crop,
                            width:
                                candidate.width,

                            length:
                                candidate.length
                        })
                };
            }
        );


    const usableArea =
        usableRectangle.width *
        usableRectangle.length;


    const cropArea =
        zones.reduce(
            (
                total,
                zone
            ) =>
                total +
                zone.areaUsed,
            0
        );


    return {
        edgeBufferFeet:
            roundNumber(
                edgeBuffer,
                3
            ),

        edgeBufferInches:
            Math.max(
                0,
                Math.round(
                    edgeBuffer *
                    12
                )
            ),

        usableWidth:
            roundNumber(
                usableRectangle.width,
                3
            ),

        usableLength:
            roundNumber(
                usableRectangle.length,
                3
            ),

        zones,

        internalOpenArea:
            roundNumber(
                Math.max(
                    0,
                    usableArea -
                        cropArea
                ),
                3
            )
    };
}


/* =========================
   CREATE BED
========================= */

function createBedRecord(
    bed,
    index,
    hasTrellis
) {
    const area =
        bed.width *
        bed.length;


    const plantableArea =
        area *
        BED_SAFE_UTILIZATION;


    return {
        id:
            bed.id,

        name:
            `Bed ${index + 1}`,

        width:
            bed.width,

        length:
            bed.length,

        totalArea:
            roundNumber(
                area,
                3
            ),

        plantableArea:
            roundNumber(
                plantableArea,
                3
            ),

        reservedArea:
            roundNumber(
                Math.max(
                    0,
                    area -
                        plantableArea
                ),
                3
            ),

        usedArea:
            0,

        remainingArea:
            roundNumber(
                plantableArea,
                3
            ),

        hasTrellis:
            hasTrellis &&
            index === 0,

        crops:
            [],

        visualMarkers:
            [],

        placementNotes:
            []
    };
}


/* =========================
   FIND EXISTING CROP
========================= */

function findCropInBed(
    bed,
    cropId
) {
    return (
        bed.crops.find(
            (crop) =>
                crop.id === cropId
        ) ||
        null
    );
}


/* =========================
   ADD CROP
========================= */

function addCropToBed(
    bed,
    crop,
    quantity
) {
    if (
        quantity <= 0
    ) {
        return 0;
    }


    const capacity =
        Math.floor(
            (
                bed.remainingArea +
                0.000001
            ) /
            getCropLayoutSquareFeet(
                crop
            )
        );


    const actualQuantity =
        Math.min(
            quantity,
            capacity
        );


    if (
        actualQuantity <= 0
    ) {
        return 0;
    }


    const layoutSquareFeetPerPlant =
        getCropLayoutSquareFeet(
            crop
        );


    const areaUsed =
        actualQuantity *
        layoutSquareFeetPerPlant;


    const existingCrop =
        findCropInBed(
            bed,
            crop.id
        );


    if (
        existingCrop
    ) {
        existingCrop.quantity +=
            actualQuantity;


        existingCrop.areaUsed =
            roundNumber(
                existingCrop.areaUsed +
                areaUsed,
                3
            );
    } else {
        bed.crops.push({
            id:
                crop.id,

            name:
                crop.name,

            icon:
                crop.icon,

            quantity:
                actualQuantity,

            squareFeetPerPlant:
                crop.squareFeetPerPlant,

            layoutSquareFeetPerPlant,

            plantSpacingInches:
                crop.plantSpacingInches,

            rowSpacingInches:
                crop.rowSpacingInches,

            layoutWidthInches:
                crop.layoutWidthInches,

            layoutDepthInches:
                crop.layoutDepthInches,

            matureWidthInches:
                crop.matureWidthInches,

            matureHeightInches:
                crop.matureHeightInches,

            supportStyle:
                crop.supportStyle,

            spacingBasis:
                crop.spacingBasis,

            areaUsed:
                roundNumber(
                    areaUsed,
                    3
                ),

            support:
                crop.support,

            containerFriendly:
                crop.containerFriendly,

            placementGroup:
                crop.placementGroup,

            canopy:
                crop.canopy,

            growthStyle:
                crop.growthStyle,

            preferredNeighbors:
                crop.preferredNeighbors ||
                []
        });
    }


    bed.usedArea =
        roundNumber(
            bed.usedArea +
            areaUsed,
            3
        );


    bed.remainingArea =
        roundNumber(
            Math.max(
                0,
                (
                    bed.plantableArea ??
                    bed.totalArea
                ) -
                bed.usedArea
            ),
            3
        );


    return actualQuantity;
}


/* =========================
   CAN CROP FIT?
========================= */

function getBedCropCapacity(
    bed,
    crop
) {
    const layoutSquareFeetPerPlant =
        getCropLayoutSquareFeet(
            crop
        );


    if (
        layoutSquareFeetPerPlant <= 0
    ) {
        return 0;
    }


    return Math.floor(
        (
            bed.remainingArea +
            0.000001
        ) /
        layoutSquareFeetPerPlant
    );
}


/* =========================
   PAIRING SCORE
========================= */

function getPairingScore(
    crop,
    existingCrop,
    bed,
    seasonalGuide
) {
    return getPairCompatibility(
        crop,
        existingCrop,
        {
            bedHasTrellis:
                Boolean(
                    bed?.hasTrellis
                ),

            seasonalGuide
        }
    ).score;
}


/* =========================
   BED SCORE
========================= */

function scoreBedForCrop(
    bed,
    crop,
    hasTrellis,
    seasonalGuide
) {
    const capacity =
        getBedCropCapacity(
            bed,
            crop
        );


    if (
        capacity <= 0
    ) {
        return -Infinity;
    }


    if (
        !canAddCropToBed({
            bed,
            crop,
            seasonalGuide
        })
    ) {
        return -Infinity;
    }


    let score =
        0;


    /*
        Empty beds get a small
        bonus to encourage useful
        distribution.
    */

    if (
        bed.crops.length ===
        0
    ) {
        score +=
            3;
    }


    /*
        Trellis crops strongly
        prefer the trellis bed.
    */

    if (
        crop.support
    ) {
        if (
            bed.hasTrellis
        ) {
            score +=
                50;
        } else if (
            hasTrellis
        ) {
            score -=
                20;
        }
    }


    /*
        Lower crops can share a
        bed more naturally with
        taller crops.
    */

    bed.crops.forEach(
        (existingCrop) => {
            score +=
                getPairingScore(
                    crop,
                    existingCrop,
                    bed,
                    seasonalGuide
                );
        }
    );


    /*
        Avoid too many crop types
        inside one bed when another
        suitable bed exists.
    */

    score -=
        Math.max(
            0,
            bed.crops.length -
                2
        ) *
        2;


    /*
        Prefer beds with usable
        remaining area.
    */

    score +=
        Math.min(
            8,
            bed.remainingArea /
                Math.max(
                    crop.squareFeetPerPlant,
                    0.1
                )
        ) *
        0.1;


    return score;
}


/* =========================
   BEST BED
========================= */

function findBestBed(
    beds,
    crop,
    hasTrellis,
    seasonalGuide
) {
    const candidates =
        beds
            .map(
                (bed) => ({
                    bed,

                    score:
                        scoreBedForCrop(
                            bed,
                            crop,
                            hasTrellis,
                            seasonalGuide
                        )
                })
            )
            .filter(
                (candidate) =>
                    Number.isFinite(
                        candidate.score
                    )
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );


    return (
        candidates[0]
            ?.bed ||
        null
    );
}


/* =========================
   DISTRIBUTE CROP
========================= */

function distributeCrop({
    crop,
    beds,
    hasTrellis,
    seasonalGuide
}) {
    let safetyCounter =
        0;


    while (
        crop.remainingQuantity >
            0 &&
        safetyCounter <
            100
    ) {
        safetyCounter +=
            1;


        const bestBed =
            findBestBed(
                beds,
                crop,
                hasTrellis,
                seasonalGuide
            );


        if (
            !bestBed
        ) {
            break;
        }


        const capacity =
            getBedCropCapacity(
                bestBed,
                crop
            );


        if (
            capacity <= 0
        ) {
            break;
        }


        const availableBeds =
            beds.filter(
                (bed) =>
                    getBedCropCapacity(
                        bed,
                        crop
                    ) >
                    0
            );


        /*
            Split a crop across
            multiple beds when useful
            instead of immediately
            filling one entire bed.
        */

        const suggestedChunk =
            Math.max(
                1,
                Math.ceil(
                    crop.remainingQuantity /
                    Math.max(
                        1,
                        availableBeds.length
                    )
                )
            );


        const quantityToPlant =
            Math.min(
                capacity,
                suggestedChunk,
                crop.remainingQuantity
            );


        const planted =
            addCropToBed(
                bestBed,
                crop,
                quantityToPlant
            );


        if (
            planted <= 0
        ) {
            break;
        }


        crop.remainingQuantity -=
            planted;
    }
}


/* =========================
   VISUAL MARKERS
========================= */

function createVisualMarkers(
    bed
) {
    if (
        !bed ||
        bed.crops.length ===
            0
    ) {
        return [];
    }


    const maximumMarkers =
        18;


    const totalPlants =
        bed.crops.reduce(
            (
                total,
                crop
            ) =>
                total +
                crop.quantity,
            0
        );


    const markers =
        [];


    bed.crops.forEach(
        (
            crop,
            cropIndex
        ) => {
            let markerCount =
                Math.round(
                    (
                        crop.quantity /
                        totalPlants
                    ) *
                    maximumMarkers
                );


            markerCount =
                Math.max(
                    1,
                    markerCount
                );


            markerCount =
                Math.min(
                    markerCount,
                    crop.quantity,
                    maximumMarkers
                );


            for (
                let index = 0;
                index < markerCount;
                index += 1
            ) {
                markers.push({
                    id:
                        `${bed.id}-${crop.id}-${index}`,

                    cropId:
                        crop.id,

                    name:
                        crop.name,

                    icon:
                        crop.icon,

                    cropIndex,

                    support:
                        crop.support,

                    canopy:
                        crop.canopy
                });
            }
        }
    );


    /*
        Tall and supported crops are
        rendered toward the top/back
        of the bed preview.

        This is only visual structure,
        not a true compass direction.
    */

    markers.sort(
        (
            first,
            second
        ) => {
            if (
                first.support !==
                second.support
            ) {
                return first.support
                    ? -1
                    : 1;
            }


            return (
                getCanopyRank(
                    second.canopy
                ) -
                getCanopyRank(
                    first.canopy
                )
            );
        }
    );


    const limitedMarkers =
        markers.slice(
            0,
            maximumMarkers
        );


    const markerCount =
        limitedMarkers.length;


    const columns =
        Math.max(
            1,
            Math.ceil(
                Math.sqrt(
                    markerCount *
                    (
                        bed.width /
                        Math.max(
                            bed.length,
                            1
                        )
                    )
                )
            )
        );


    const rows =
        Math.max(
            1,
            Math.ceil(
                markerCount /
                columns
            )
        );


    return limitedMarkers.map(
        (
            marker,
            index
        ) => {
            const column =
                index %
                columns;


            const row =
                Math.floor(
                    index /
                    columns
                );


            return {
                ...marker,

                xPercent:
                    roundNumber(
                        (
                            (
                                column +
                                0.5
                            ) /
                            columns
                        ) *
                            100,
                        2
                    ),

                yPercent:
                    roundNumber(
                        (
                            (
                                row +
                                0.5
                            ) /
                            rows
                        ) *
                            100,
                        2
                    )
            };
        }
    );
}


/* =========================
   PLACEMENT NOTES
========================= */

function createPlacementNotes(
    bed
) {
    const notes =
        [];


    const supportCrops =
        bed.crops.filter(
            (crop) =>
                crop.support
        );


    if (
        bed.hasTrellis &&
        supportCrops.length >
            0
    ) {
        notes.push(
            `Climbing crops (${supportCrops
                .map(
                    (crop) =>
                        crop.name
                )
                .join(", ")}) are grouped near the trellis.`
        );
    }


    const hasTallCrop =
        bed.crops.some(
            (crop) =>
                crop.canopy ===
                "tall"
        );


    const hasLowCrop =
        bed.crops.some(
            (crop) =>
                crop.canopy ===
                "low"
        );


    if (
        hasTallCrop &&
        hasLowCrop
    ) {
        notes.push(
            "Tall and low-growing crops share this bed to make better use of vertical growing space."
        );
    }


    const rootCrops =
        bed.crops.filter(
            (crop) =>
                crop.placementGroup ===
                "root"
        );


    const aboveGroundCrops =
        bed.crops.filter(
            (crop) =>
                crop.placementGroup !==
                "root"
        );


    if (
        rootCrops.length >
            0 &&
        aboveGroundCrops.length >
            0
    ) {
        notes.push(
            "Root crops are mixed with above-ground crops to diversify how the bed space is used."
        );
    }


    const pairingNames =
        [];


    for (
        let firstIndex = 0;
        firstIndex <
        bed.crops.length;
        firstIndex += 1
    ) {
        for (
            let secondIndex =
                firstIndex + 1;
            secondIndex <
            bed.crops.length;
            secondIndex += 1
        ) {
            const first =
                bed.crops[
                    firstIndex
                ];


            const second =
                bed.crops[
                    secondIndex
                ];


            const preferred =
                first.preferredNeighbors
                    ?.includes(
                        second.id
                    ) ||
                second.preferredNeighbors
                    ?.includes(
                        first.id
                    );


            if (
                preferred
            ) {
                pairingNames.push(
                    `${first.name} + ${second.name}`
                );
            }
        }
    }


    if (
        pairingNames.length >
        0
    ) {
        notes.push(
            `Useful layout pairing${pairingNames.length === 1 ? "" : "s"}: ${pairingNames
                .slice(
                    0,
                    3
                )
                .join(", ")}.`
        );
    }


    return notes;
}


/* =========================
   MAIN PLANNER
========================= */

export function generateBedPlantingPlan({
    layout,
    plantingPlan,
    selectedCrops,
    features,
    seasonalGuide = null
}) {
    if (
        !layout ||
        !plantingPlan ||
        !Array.isArray(
            selectedCrops
        )
    ) {
        return null;
    }


    const raisedBeds =
        layout.items.filter(
            (item) =>
                item.type ===
                "raised-bed"
        );


    if (
        raisedBeds.length ===
        0
    ) {
        return null;
    }


    const hasTrellis =
        Array.isArray(
            features
        ) &&
        features.includes(
            "trellis"
        );


    const beds =
        raisedBeds.map(
            (
                bed,
                index
            ) =>
                createBedRecord(
                    bed,
                    index,
                    hasTrellis
                )
        );


    /* =========================
       CROP TARGETS

       plantingPlan.growingArea can include containers.
       This planner renders raised beds only, so its target
       quantities must be based on raised-bed area rather
       than trying to force container capacity into beds.
    ========================= */

    const totalRaisedBedArea =
        raisedBeds.reduce(
            (total, bed) =>
                total +
                bed.width *
                    bed.length,
            0
        );


    const recommendationCount =
        plantingPlan.recommendations.length;


    const raisedBedAreaPerCrop =
        recommendationCount > 0
            ? totalRaisedBedArea /
                recommendationCount
            : 0;


    const cropTargets =
        plantingPlan
            .recommendations
            .map(
                (
                    recommendation
                ) => {
                    const crop =
                        getCropById(
                            recommendation.id
                        );


                    if (
                        !crop
                    ) {
                        return null;
                    }


                    const raisedBedQuantity =
                        raisedBedAreaPerCrop > 0
                            ? Math.max(
                                1,
                                Math.floor(
                                    raisedBedAreaPerCrop /
                                    getCropLayoutSquareFeet(
                                        crop
                                    )
                                )
                            )
                            : 0;


                    const targetQuantity =
                        Math.min(
                            Number(
                                recommendation
                                    .suggestedQuantity
                            ) || 0,
                            raisedBedQuantity
                        );


                    return {
                        ...crop,

                        targetQuantity,

                        remainingQuantity:
                            targetQuantity
                    };
                }
            )
            .filter(
                Boolean
            );


    /*
        Structural priority:

        1. supported/tall crops
        2. medium crops
        3. low crops
        4. dense roots/leafy crops
    */

    cropTargets.sort(
        (
            first,
            second
        ) => {
            if (
                first.support !==
                second.support
            ) {
                return first.support
                    ? -1
                    : 1;
            }


            const canopyDifference =
                getCanopyRank(
                    second.canopy
                ) -
                getCanopyRank(
                    first.canopy
                );


            if (
                canopyDifference !==
                0
            ) {
                return canopyDifference;
            }


            return (
                getCropLayoutSquareFeet(
                    second
                ) -
                getCropLayoutSquareFeet(
                    first
                )
            );
        }
    );


    /* =========================
       DISTRIBUTE CROPS
    ========================= */

    cropTargets.forEach(
        (crop) => {
            distributeCrop({
                crop,
                beds,
                hasTrellis,
                seasonalGuide
            });
        }
    );


    /* =========================
       BED DETAILS
    ========================= */

    beds.forEach(
        (bed) => {
            bed.spatialLayout =
                createPlantingZones(
                    bed
                );


            /*
                Keep visualMarkers for backward
                compatibility. New layout views use
                spatialLayout.zones instead.
            */

            bed.visualMarkers =
                createVisualMarkers(
                    bed
                );


            bed.placementNotes =
                createPlacementNotes(
                    bed
                );


            if (
                bed.spatialLayout
                    .edgeBufferInches >
                0
            ) {
                bed.placementNotes.push(
                    `${bed.spatialLayout.edgeBufferInches} in perimeter spacing is reserved around the scaled planting area.`
                );
            }


            bed.spatialLayout
                .zones
                .filter(
                    (zone) =>
                        zone.geometryNote
                )
                .forEach(
                    (zone) => {
                        bed.placementNotes.push(
                            `${zone.name}: ${zone.geometryNote}`
                        );
                    }
                );
        }
    );


    /* =========================
       PAIRING + BED LOAD GUIDE
    ========================= */

    const pairingGuide =
        createPlantPairingGuide({
            beds,
            seasonalGuide
        });


    /* =========================
       WARNINGS
    ========================= */

    const warnings =
        [
            ...pairingGuide.warnings
        ];


    const unplacedCrops =
        cropTargets.filter(
            (crop) =>
                crop.remainingQuantity >
                    0
        );


    if (
        unplacedCrops.length >
        0
    ) {
        warnings.push(
            `The current raised beds do not have enough room for the full suggested quantity of ${unplacedCrops
                .map(
                    (crop) =>
                        crop.name
                )
                .join(", ")}.`
        );
    }


    const supportOutsideTrellis =
        beds.some(
            (bed) =>
                !bed.hasTrellis &&
                bed.crops.some(
                    (crop) =>
                        crop.support
                )
        );


    if (
        supportOutsideTrellis
    ) {
        warnings.push(
            "Some climbing crops need space outside the main trellis bed. Additional cages, stakes, or climbing supports may be needed."
        );
    }


    beds.forEach(
        (bed) => {
            const spreadingCrops =
                bed.crops.filter(
                    (crop) =>
                        crop.growthStyle ===
                        "spreading"
                );


            if (
                spreadingCrops.length >
                    1
            ) {
                warnings.push(
                    `${bed.name} contains multiple spreading crops (${spreadingCrops
                        .map(
                            (crop) =>
                                crop.name
                        )
                        .join(", ")}). Monitor their growth so they do not crowd neighboring plants.`
                );
            }
        }
    );


    const emptyBeds =
        beds.filter(
            (bed) =>
                bed.crops.length ===
                0
        );


    if (
        emptyBeds.length >
        0
    ) {
        warnings.push(
            `${emptyBeds.length} raised bed${emptyBeds.length === 1 ? " remains" : "s remain"} available for additional crops.`
        );
    }


    /* =========================
       STATISTICS
    ========================= */

    const totalBedArea =
        beds.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.totalArea,
            0
        );


    const totalUsedArea =
        beds.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.usedArea,
            0
        );


    const totalPlants =
        beds.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.crops.reduce(
                    (
                        cropTotal,
                        crop
                    ) =>
                        cropTotal +
                        crop.quantity,
                    0
                ),
            0
        );


    const utilization =
        totalBedArea >
        0
            ? (
                totalUsedArea /
                totalBedArea
            ) *
                100
            : 0;


    const pairingCount =
        pairingGuide.stats
            .positivePairings;


    return {
        version:
            5,

        pairingGuide,

        bedCount:
            beds.length,

        beds,

        warnings,

        unplacedCrops:
            unplacedCrops.map(
                (crop) => ({
                    id:
                        crop.id,

                    name:
                        crop.name,

                    icon:
                        crop.icon,

                    quantity:
                        crop.remainingQuantity
                })
            ),

        stats: {
            totalBedArea:
                roundNumber(
                    totalBedArea
                ),

            safeUtilizationTarget:
                Math.round(
                    BED_SAFE_UTILIZATION *
                        100
                ),

            usedArea:
                roundNumber(
                    totalUsedArea
                ),

            remainingArea:
                roundNumber(
                    Math.max(
                        0,
                        totalBedArea -
                            totalUsedArea
                    )
                ),

            utilization:
                roundNumber(
                    utilization
                ),

            totalPlants,

            pairingCount
        }
    };
}