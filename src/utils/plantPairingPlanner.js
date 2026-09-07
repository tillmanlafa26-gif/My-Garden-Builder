import {
    getCropById
} from "../data/cropPlanningData";


import {
    getCropLayoutSquareFeet
} from "./cropSpacing";


export const BED_SAFE_UTILIZATION =
    0.85;


const MAX_DISTINCT_CROPS_PER_BED =
    4;


/* =========================================================
   DATE HELPERS
========================================================= */

function parseLocalDate(
    dateString
) {
    if (
        !dateString ||
        typeof dateString !==
            "string"
    ) {
        return null;
    }


    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    if (
        !year ||
        !month ||
        !day
    ) {
        return null;
    }


    const date =
        new Date(
            year,
            month - 1,
            day,
            12,
            0,
            0,
            0
        );


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}


function addDays(
    date,
    days
) {
    if (
        !(date instanceof Date) ||
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    const next =
        new Date(
            date.getTime()
        );


    next.setDate(
        next.getDate() +
        Number(
            days || 0
        )
    );


    return next;
}


/* =========================================================
   SEASON WINDOW
========================================================= */

function getCropSeasonWindow(
    cropId,
    seasonalGuide
) {
    const schedule =
        seasonalGuide
            ?.crops
            ?.find(
                (item) =>
                    item.cropId ===
                    cropId
            ) ||
        null;


    const crop =
        getCropById(
            cropId
        );


    if (
        !schedule ||
        !crop
    ) {
        return null;
    }


    const start =
        parseLocalDate(
            schedule.springPlantDate
        );


    if (
        !start
    ) {
        return null;
    }


    const maturityDays =
        Math.max(
            1,
            Number(
                crop.daysToMaturity ||
                schedule.daysToMaturity ||
                0
            )
        );


    const harvestWindowDays =
        Math.max(
            0,
            Number(
                crop.harvestWindowDays ||
                0
            )
        );


    const end =
        addDays(
            start,
            maturityDays +
                harvestWindowDays
        );


    if (!end) {
        return null;
    }


    return {
        start,
        end
    };
}


/* =========================================================
   SEASON RELATIONSHIP
========================================================= */

function getSeasonRelationship(
    firstCrop,
    secondCrop,
    seasonalGuide
) {
    const firstWindow =
        getCropSeasonWindow(
            firstCrop.id,
            seasonalGuide
        );


    const secondWindow =
        getCropSeasonWindow(
            secondCrop.id,
            seasonalGuide
        );


    if (
        !firstWindow ||
        !secondWindow
    ) {
        return {
            type: "unknown",
            overlaps: true
        };
    }


    const firstEndsBeforeSecond =
        firstWindow.end <
        secondWindow.start;


    const secondEndsBeforeFirst =
        secondWindow.end <
        firstWindow.start;


    if (
        firstEndsBeforeSecond ||
        secondEndsBeforeFirst
    ) {
        return {
            type: "succession",
            overlaps: false
        };
    }


    return {
        type: "overlap",
        overlaps: true
    };
}


/* =========================================================
   PAIR COMPATIBILITY

   This intentionally prioritizes physical growing
   compatibility over folklore:
   - plant spacing / bed load
   - canopy height
   - root-vs-above-ground structure
   - spreading / climbing habits
   - support requirements
   - seasonal overlap

   preferredNeighbors remains a secondary bonus signal.
========================================================= */

export function getPairCompatibility(
    firstCrop,
    secondCrop,
    {
        bedHasTrellis = false,
        seasonalGuide = null
    } = {}
) {
    if (
        !firstCrop ||
        !secondCrop
    ) {
        return {
            score: 0,
            status: "unknown",
            hardConflict: false,
            reasons: [],
            seasonRelation:
                "unknown"
        };
    }


    let score =
        0;


    const reasons =
        [];


    const relationship =
        getSeasonRelationship(
            firstCrop,
            secondCrop,
            seasonalGuide
        );


    const overlaps =
        relationship.overlaps;


    /* =========================
       SEASONAL SUCCESSION
    ========================= */

    if (
        relationship.type ===
        "succession"
    ) {
        score +=
            6;


        reasons.push(
            "Their main outdoor growing windows are separated, so this bed can be used in succession."
        );
    }


    /* =========================
       SAVED COMPANION SIGNALS
    ========================= */

    const firstPrefersSecond =
        firstCrop.preferredNeighbors
            ?.includes(
                secondCrop.id
            );


    const secondPrefersFirst =
        secondCrop.preferredNeighbors
            ?.includes(
                firstCrop.id
            );


    if (
        firstPrefersSecond
    ) {
        score +=
            3;
    }


    if (
        secondPrefersFirst
    ) {
        score +=
            3;
    }


    if (
        firstPrefersSecond ||
        secondPrefersFirst
    ) {
        reasons.push(
            "This pairing is already marked as a useful companion combination in the crop guide."
        );
    }


    /* =========================
       VERTICAL SPACE
    ========================= */

    if (
        overlaps &&
        firstCrop.canopy !==
            secondCrop.canopy
    ) {
        score +=
            2;


        reasons.push(
            "Different canopy heights can use the bed's vertical space more efficiently."
        );
    }


    /* =========================
       ROOT / ABOVE-GROUND MIX
    ========================= */

    const firstIsRoot =
        firstCrop.placementGroup ===
        "root";


    const secondIsRoot =
        secondCrop.placementGroup ===
        "root";


    if (
        overlaps &&
        firstIsRoot !==
            secondIsRoot
    ) {
        score +=
            2;


        reasons.push(
            "Root and above-ground crops use different parts of the growing space."
        );
    }


    /* =========================
       SPREADING CROPS
    ========================= */

    const bothSpreading =
        firstCrop.growthStyle ===
            "spreading" &&
        secondCrop.growthStyle ===
            "spreading";


    if (
        overlaps &&
        bothSpreading
    ) {
        score -=
            12;


        reasons.push(
            "Both crops spread aggressively at the same time and can crowd each other."
        );
    }


    /* =========================
       CLIMBING / SUPPORT
    ========================= */

    const bothNeedSupport =
        Boolean(
            firstCrop.support
        ) &&
        Boolean(
            secondCrop.support
        );


    if (
        overlaps &&
        bothNeedSupport
    ) {
        if (
            bedHasTrellis
        ) {
            score +=
                1;


            reasons.push(
                "Both crops need support, and this bed has trellis access."
            );
        } else {
            score -=
                6;


            reasons.push(
                "Both crops need climbing or staking support, but this bed does not have the main trellis."
            );
        }
    }


    /* =========================
       LARGE / TALL COMPETITION
    ========================= */

    const firstLarge =
        getCropLayoutSquareFeet(
            firstCrop
        ) >=
        2;


    const secondLarge =
        getCropLayoutSquareFeet(
            secondCrop
        ) >=
        2;


    const bothTall =
        firstCrop.canopy ===
            "tall" &&
        secondCrop.canopy ===
            "tall";


    if (
        overlaps &&
        firstLarge &&
        secondLarge &&
        bothTall
    ) {
        score -=
            5;


        reasons.push(
            "Both crops are large, tall growers, so they compete for canopy space and light."
        );
    }


    /* =========================
       SAME SPATIAL NICHE
    ========================= */

    if (
        overlaps &&
        firstCrop.placementGroup ===
            secondCrop.placementGroup &&
        firstCrop.canopy ===
            secondCrop.canopy &&
        firstLarge &&
        secondLarge
    ) {
        score -=
            3;


        reasons.push(
            "These crops occupy a similar physical niche, so spacing them across different beds is safer."
        );
    }


    /* =========================
       HARD CONFLICTS
    ========================= */

    const bothVining =
        firstCrop.placementGroup ===
            "vining" &&
        secondCrop.placementGroup ===
            "vining";


    const hardConflict =
        overlaps &&
        (
            bothSpreading ||
            (
                bothVining &&
                !bedHasTrellis
            )
        );


    let status =
        "good";


    if (
        hardConflict ||
        score <= -6
    ) {
        status =
            "avoid";
    } else if (
        score < 1
    ) {
        status =
            "caution";
    } else if (
        score >= 7
    ) {
        status =
            "excellent";
    }


    if (
        reasons.length ===
        0
    ) {
        reasons.push(
            "No major structural conflict was detected, but normal plant spacing still applies."
        );
    }


    return {
        score,

        status,

        hardConflict,

        reasons,

        seasonRelation:
            relationship.type
    };
}


/* =========================================================
   BED ACCEPTANCE
========================================================= */

export function canAddCropToBed({
    bed,
    crop,
    seasonalGuide = null
}) {
    if (
        !bed ||
        !crop
    ) {
        return false;
    }


    const existingSameCrop =
        bed.crops?.some(
            (existingCrop) =>
                existingCrop.id ===
                crop.id
        );


    if (
        !existingSameCrop &&
        (
            bed.crops?.length ||
            0
        ) >=
            MAX_DISTINCT_CROPS_PER_BED
    ) {
        return false;
    }


    return !(
        bed.crops ||
        []
    ).some(
        (existingCrop) =>
            getPairCompatibility(
                crop,
                existingCrop,
                {
                    bedHasTrellis:
                        Boolean(
                            bed.hasTrellis
                        ),

                    seasonalGuide
                }
            ).hardConflict
    );
}


/* =========================================================
   BED PAIRING SUMMARY
========================================================= */

function getStatusRank(
    status
) {
    switch (
        status
    ) {
        case "avoid":
            return 0;

        case "caution":
            return 1;

        case "good":
            return 2;

        case "excellent":
            return 3;

        default:
            return 2;
    }
}


function getOverallBedStatus(
    pairings
) {
    if (
        pairings.length ===
        0
    ) {
        return "good";
    }


    const worst =
        pairings.reduce(
            (
                current,
                pairing
            ) =>
                getStatusRank(
                    pairing.status
                ) <
                getStatusRank(
                    current.status
                )
                    ? pairing
                    : current,
            pairings[0]
        );


    if (
        worst.status ===
            "avoid"
    ) {
        return "avoid";
    }


    if (
        worst.status ===
            "caution"
    ) {
        return "caution";
    }


    const averageScore =
        pairings.reduce(
            (
                total,
                pairing
            ) =>
                total +
                pairing.score,
            0
        ) /
        pairings.length;


    return averageScore >=
        5
            ? "excellent"
            : "good";
}


/* =========================================================
   COMPLETE PAIRING GUIDE
========================================================= */

export function createPlantPairingGuide({
    beds = [],
    seasonalGuide = null
}) {
    const bedGuides =
        beds.map(
            (bed) => {
                const pairings =
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


                        const compatibility =
                            getPairCompatibility(
                                first,
                                second,
                                {
                                    bedHasTrellis:
                                        Boolean(
                                            bed.hasTrellis
                                        ),

                                    seasonalGuide
                                }
                            );


                        pairings.push({
                            id:
                                `${bed.id}-${first.id}-${second.id}`,

                            firstCrop: {
                                id:
                                    first.id,

                                name:
                                    first.name,

                                icon:
                                    first.icon
                            },

                            secondCrop: {
                                id:
                                    second.id,

                                name:
                                    second.name,

                                icon:
                                    second.icon
                            },

                            ...compatibility
                        });
                    }
                }


                const loadPercent =
                    bed.totalArea >
                    0
                        ? Math.round(
                            (
                                bed.usedArea /
                                bed.totalArea
                            ) *
                                100
                        )
                        : 0;


                const reservedPercent =
                    Math.max(
                        0,
                        Math.round(
                            (
                                (
                                    bed.totalArea -
                                    (
                                        bed.plantableArea ??
                                        bed.totalArea
                                    )
                                ) /
                                Math.max(
                                    bed.totalArea,
                                    0.001
                                )
                            ) *
                                100
                        )
                    );


                return {
                    bedId:
                        bed.id,

                    bedName:
                        bed.name,

                    hasTrellis:
                        Boolean(
                            bed.hasTrellis
                        ),

                    loadPercent,

                    reservedPercent,

                    status:
                        getOverallBedStatus(
                            pairings
                        ),

                    cropCount:
                        bed.crops.length,

                    crops:
                        bed.crops.map(
                            (crop) => ({
                                id:
                                    crop.id,

                                name:
                                    crop.name,

                                icon:
                                    crop.icon,

                                quantity:
                                    crop.quantity
                            })
                        ),

                    pairings
                };
            }
        );


    const warnings =
        [];


    const avoidBeds =
        bedGuides.filter(
            (bed) =>
                bed.status ===
                "avoid"
        );


    const cautionBeds =
        bedGuides.filter(
            (bed) =>
                bed.status ===
                "caution"
        );


    if (
        avoidBeds.length >
        0
    ) {
        warnings.push(
            `${avoidBeds
                .map(
                    (bed) =>
                        bed.bedName
                )
                .join(", ")} contain a crop combination that should be separated or grown in succession.`
        );
    }


    if (
        cautionBeds.length >
        0
    ) {
        warnings.push(
            `${cautionBeds
                .map(
                    (bed) =>
                        bed.bedName
                )
                .join(", ")} have pairings that need extra spacing, support, or canopy management.`
        );
    }


    const totalPairings =
        bedGuides.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.pairings.length,
            0
        );


    const successionPairings =
        bedGuides.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.pairings.filter(
                    (pairing) =>
                        pairing.seasonRelation ===
                        "succession"
                ).length,
            0
        );


    const positivePairings =
        bedGuides.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.pairings.filter(
                    (pairing) =>
                        pairing.status ===
                            "excellent" ||
                        pairing.status ===
                            "good"
                ).length,
            0
        );


    const overallStatus =
        avoidBeds.length >
        0
            ? "avoid"
            : cautionBeds.length >
                0
                ? "caution"
                : bedGuides.some(
                    (bed) =>
                        bed.status ===
                        "excellent"
                )
                    ? "excellent"
                    : "good";


    return {
        version:
            1,

        safeUtilizationPercent:
            Math.round(
                BED_SAFE_UTILIZATION *
                    100
            ),

        maxDistinctCropsPerBed:
            MAX_DISTINCT_CROPS_PER_BED,

        overallStatus,

        bedGuides,

        warnings,

        stats: {
            bedCount:
                bedGuides.length,

            totalPairings,

            positivePairings,

            successionPairings,

            cautionBedCount:
                cautionBeds.length,

            avoidBedCount:
                avoidBeds.length
        }
    };
}
