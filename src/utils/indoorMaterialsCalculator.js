import {
    getIndoorPlantById
} from "../data/indoorPlantData";


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


function roundUpToHalf(
    value
) {
    return (
        Math.ceil(
            Number(
                value || 0
            ) *
            2
        ) /
        2
    );
}


function createMaterial({
    id,
    category,
    name,
    quantity,
    unit,
    note = ""
}) {
    return {
        id,
        category,
        name,
        quantity,
        unit,
        note
    };
}


function estimatePottingMixCubicFeet(
    diameterInches
) {
    const diameter =
        Math.max(
            4,
            Number(
                diameterInches ||
                0
            )
        );


    const radius =
        diameter /
        2;


    /*
        Approximate usable container depth as
        80% of diameter. The 0.9 factor leaves
        some headspace below the rim.
    */

    const depth =
        diameter *
        0.8;


    const cubicInches =
        Math.PI *
        radius *
        radius *
        depth *
        0.9;


    return (
        cubicInches /
        1728
    );
}


function getContainerGroups(
    selectedPlantIds
) {
    const groups =
        new Map();


    selectedPlantIds
        .map(
            (plantId) =>
                getIndoorPlantById(
                    plantId
                )
        )
        .filter(
            Boolean
        )
        .forEach(
            (plant) => {
                const diameter =
                    Number(
                        plant.potDiameterInches ||
                        0
                    );


                if (
                    diameter <= 0
                ) {
                    return;
                }


                const key =
                    String(
                        diameter
                    );


                const current =
                    groups.get(
                        key
                    ) ||
                    {
                        diameter,
                        count:
                            0
                    };


                current.count +=
                    1;


                groups.set(
                    key,
                    current
                );
            }
        );


    return [
        ...groups.values()
    ].sort(
        (
            first,
            second
        ) =>
            first.diameter -
            second.diameter
    );
}


function getSupportPlantCount(
    selectedPlantIds
) {
    return selectedPlantIds
        .map(
            (plantId) =>
                getIndoorPlantById(
                    plantId
                )
        )
        .filter(
            Boolean
        )
        .filter(
            (plant) =>
                [
                    "compact-tomato",
                    "compact-pepper"
                ].includes(
                    plant.id
                ) ||
                (
                    Number(
                        plant.matureHeightInches ||
                        0
                    ) >=
                        48 &&
                    !String(
                        plant.placementStyle ||
                        ""
                    ).includes(
                        "trailing"
                    )
                )
        ).length;
}


export function calculateIndoorMaterials({
    indoorLayout,
    selectedPlantIds = []
}) {
    if (
        !indoorLayout ||
        indoorLayout.type !==
            "indoor"
    ) {
        return null;
    }


    const placements =
        Array.isArray(
            indoorLayout.placements
        )
            ? indoorLayout.placements
            : [];


    const placedPlantIds =
        placements.map(
            (placement) =>
                placement.plantId
        );


    const effectivePlantIds =
        placedPlantIds.length >
        0
            ? placedPlantIds
            : selectedPlantIds;


    const containerGroups =
        getContainerGroups(
            effectivePlantIds
        );


    const materials =
        [];


    /* =========================
       CONTAINERS + DRAINAGE
    ========================= */

    containerGroups.forEach(
        (group) => {
            materials.push(
                createMaterial({
                    id:
                        `pot-${group.diameter}`,

                    category:
                        "Containers & Drainage",

                    name:
                        `${group.diameter} in planting containers`,

                    quantity:
                        group.count,

                    unit:
                        group.count ===
                        1
                            ? "container"
                            : "containers",

                    note:
                        "Use containers with drainage holes and enough depth for the selected plant."
                })
            );
        }
    );


    if (
        effectivePlantIds.length >
        0
    ) {
        materials.push(
            createMaterial({
                id:
                    "saucers",

                category:
                    "Containers & Drainage",

                name:
                    "Waterproof saucers or drip trays",

                quantity:
                    effectivePlantIds.length,

                unit:
                    effectivePlantIds.length ===
                    1
                        ? "piece"
                        : "pieces",

                note:
                    "Protect shelves, floors, counters, and windowsills from drainage."
            })
        );
    }


    /* =========================
       POTTING MIX
    ========================= */

    let totalPottingMix =
        0;


    effectivePlantIds
        .map(
            (plantId) =>
                getIndoorPlantById(
                    plantId
                )
        )
        .filter(
            Boolean
        )
        .forEach(
            (plant) => {
                totalPottingMix +=
                    estimatePottingMixCubicFeet(
                        plant.potDiameterInches
                    );
            }
        );


    if (
        totalPottingMix >
        0
    ) {
        materials.push(
            createMaterial({
                id:
                    "indoor-potting-mix",

                category:
                    "Growing Media",

                name:
                    "Indoor potting mix",

                quantity:
                    roundUpToHalf(
                        totalPottingMix *
                        1.1
                    ),

                unit:
                    "cu ft",

                note:
                    "Includes an approximate 10% allowance for settling and repotting loss."
            })
        );
    }


    /* =========================
       STRUCTURE
    ========================= */

    const spaceType =
        indoorLayout.indoorSpaceType;


    if (
        [
            "shelf",
            "plant-rack"
        ].includes(
            spaceType
        )
    ) {
        materials.push(
            createMaterial({
                id:
                    "indoor-structure",

                category:
                    "Structure & Protection",

                name:
                    spaceType ===
                        "plant-rack"
                        ? "Plant rack or shelving unit"
                        : "Indoor shelf or plant stand",

                quantity:
                    1,

                unit:
                    "unit",

                note:
                    `Minimum usable footprint: ${indoorLayout.sourceDimensions.width} × ${indoorLayout.sourceDimensions.length} ${indoorLayout.sourceUnit}. Existing furniture can be used if it safely supports the plants and water trays.`
            })
        );


        materials.push(
            createMaterial({
                id:
                    "shelf-liners",

                category:
                    "Structure & Protection",

                name:
                    "Waterproof shelf liners or trays",

                quantity:
                    Math.max(
                        1,
                        Number(
                            indoorLayout.stats
                                ?.levelCount ||
                            1
                        )
                    ),

                unit:
                    "pieces",

                note:
                    "Use one protected surface for each occupied shelf level."
            })
        );
    }


    if (
        spaceType ===
        "grow-tent"
    ) {
        materials.push(
            createMaterial({
                id:
                    "grow-tent-structure",

                category:
                    "Structure & Protection",

                name:
                    "Indoor grow tent or enclosed growing structure",

                quantity:
                    1,

                unit:
                    "unit",

                note:
                    `Plan around approximately ${indoorLayout.sourceDimensions.width} × ${indoorLayout.sourceDimensions.length} × ${indoorLayout.sourceDimensions.height} ${indoorLayout.sourceUnit}.`
            })
        );
    }


    /* =========================
       LIGHTING
    ========================= */

    const growLights =
        Array.isArray(
            indoorLayout.growLights
        )
            ? indoorLayout.growLights
            : [];


    if (
        growLights.length >
        0
    ) {
        materials.push(
            createMaterial({
                id:
                    "grow-lights",

                category:
                    "Lighting",

                name:
                    "Full-spectrum LED grow-light fixtures",

                quantity:
                    growLights.length,

                unit:
                    growLights.length ===
                    1
                        ? "fixture"
                        : "fixtures",

                note:
                    "Match fixture coverage to the layout's light zones and follow the manufacturer's hanging-distance guidance."
            })
        );


        materials.push(
            createMaterial({
                id:
                    "light-timer",

                category:
                    "Lighting",

                name:
                    "Programmable light timer",

                quantity:
                    1,

                unit:
                    "timer",

                note:
                    "Use a timer so supplemental lighting follows a consistent daily schedule."
            })
        );


        materials.push(
            createMaterial({
                id:
                    "light-mounting",

                category:
                    "Lighting",

                name:
                    "Adjustable grow-light mounting hardware",

                quantity:
                    growLights.length,

                unit:
                    growLights.length ===
                    1
                        ? "set"
                        : "sets",

                note:
                    "Use height-adjustable mounting so light distance can change as plants grow."
            })
        );
    }


    /* =========================
       SUPPORT
    ========================= */

    const supportCount =
        getSupportPlantCount(
            effectivePlantIds
        );


    if (
        supportCount >
        0
    ) {
        materials.push(
            createMaterial({
                id:
                    "indoor-supports",

                category:
                    "Plant Support",

                name:
                    "Plant stakes or compact supports",

                quantity:
                    supportCount,

                unit:
                    supportCount ===
                    1
                        ? "support"
                        : "supports",

                note:
                    "Use for taller or fruiting indoor plants that may become top-heavy."
            })
        );
    }


    /* =========================
       BASIC CARE
    ========================= */

    if (
        effectivePlantIds.length >
        0
    ) {
        materials.push(
            createMaterial({
                id:
                    "watering-tool",

                category:
                    "Basic Care",

                name:
                    "Small watering can or narrow-spout watering bottle",

                quantity:
                    1,

                unit:
                    "tool",

                note:
                    "Choose a size that is easy to use around shelves and indoor furniture."
            })
        );


        materials.push(
            createMaterial({
                id:
                    "moisture-check",

                category:
                    "Basic Care",

                name:
                    "Moisture-check tool",

                quantity:
                    1,

                unit:
                    "tool",

                note:
                    "A finger check, wooden skewer, or moisture meter can help prevent routine overwatering."
            })
        );
    }


    const categories =
        [
            ...new Set(
                materials.map(
                    (material) =>
                        material.category
                )
            )
        ];


    return {
        version:
            1,

        type:
            "indoor-materials",

        generatedAt:
            new Date()
                .toISOString(),

        categories,

        materials,

        assumptions: {
            indoorSpaceType:
                indoorLayout.indoorSpaceType,

            indoorSpaceName:
                indoorLayout.indoorSpaceName,

            sourceDimensions:
                indoorLayout.sourceDimensions,

            sourceUnit:
                indoorLayout.sourceUnit,

            placedPlantCount:
                effectivePlantIds.length,

            growLightZoneCount:
                growLights.length,

            estimatedPottingMixCubicFeet:
                roundNumber(
                    totalPottingMix
                )
        }
    };
}
