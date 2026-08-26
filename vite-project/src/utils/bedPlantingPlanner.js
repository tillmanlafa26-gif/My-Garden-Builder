import {
    getCropById
} from "../data/cropPlanningData";


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
                area
            ),

        usedArea:
            0,

        remainingArea:
            roundNumber(
                area
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
            bed.remainingArea /
            crop.squareFeetPerPlant
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


    const areaUsed =
        actualQuantity *
        crop.squareFeetPerPlant;


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
                areaUsed
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

            areaUsed:
                roundNumber(
                    areaUsed
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
            areaUsed
        );


    bed.remainingArea =
        roundNumber(
            Math.max(
                0,
                bed.totalArea -
                bed.usedArea
            )
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
    if (
        !crop.squareFeetPerPlant
    ) {
        return 0;
    }


    return Math.floor(
        bed.remainingArea /
        crop.squareFeetPerPlant
    );
}


/* =========================
   PAIRING SCORE
========================= */

function getPairingScore(
    crop,
    existingCrop
) {
    let score =
        0;


    if (
        crop.preferredNeighbors
            ?.includes(
                existingCrop.id
            )
    ) {
        score +=
            5;
    }


    if (
        existingCrop.preferredNeighbors
            ?.includes(
                crop.id
            )
    ) {
        score +=
            5;
    }


    /*
        Mixing vertical structure
        can make better use of bed
        space than identical canopy
        heights.
    */

    if (
        crop.canopy !==
        existingCrop.canopy
    ) {
        score +=
            2;
    }


    /*
        Root + leafy/fruiting crops
        occupy somewhat different
        physical zones.
    */

    if (
        crop.placementGroup ===
            "root" &&
        existingCrop.placementGroup !==
            "root"
    ) {
        score +=
            2;
    }


    if (
        existingCrop.placementGroup ===
            "root" &&
        crop.placementGroup !==
            "root"
    ) {
        score +=
            2;
    }


    /*
        Avoid putting several
        spreading crops together
        when another bed is available.
    */

    if (
        crop.growthStyle ===
            "spreading" &&
        existingCrop.growthStyle ===
            "spreading"
    ) {
        score -=
            5;
    }


    return score;
}


/* =========================
   BED SCORE
========================= */

function scoreBedForCrop(
    bed,
    crop,
    hasTrellis
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
                    existingCrop
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
    hasTrellis
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
                            hasTrellis
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
    hasTrellis
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
                hasTrellis
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
    features
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
    ========================= */

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


                    return {
                        ...crop,

                        targetQuantity:
                            recommendation
                                .suggestedQuantity,

                        remainingQuantity:
                            recommendation
                                .suggestedQuantity
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
                second.squareFeetPerPlant -
                first.squareFeetPerPlant
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
                hasTrellis
            });
        }
    );


    /* =========================
       BED DETAILS
    ========================= */

    beds.forEach(
        (bed) => {
            bed.visualMarkers =
                createVisualMarkers(
                    bed
                );


            bed.placementNotes =
                createPlacementNotes(
                    bed
                );
        }
    );


    /* =========================
       WARNINGS
    ========================= */

    const warnings =
        [];


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
        beds.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.placementNotes.filter(
                    (note) =>
                        note.startsWith(
                            "Useful layout pairing"
                        )
                ).length,
            0
        );


    return {
        version:
            3,

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