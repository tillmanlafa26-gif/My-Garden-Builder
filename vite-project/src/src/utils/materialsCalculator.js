function roundNumber(
    value,
    decimals = 1
) {

    const multiplier =
        10 ** decimals;


    return (
        Math.round(
            value *
            multiplier
        ) /
        multiplier
    );

}


function roundUp(
    value
) {

    return Math.ceil(
        value
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


/* =========================
   SOIL MIXES
========================= */

const soilStrategies = {

    balanced: {

        soil:
            60,

        compost:
            30,

        aeration:
            10

    },

    "compost-rich": {

        soil:
            45,

        compost:
            45,

        aeration:
            10

    },

    basic: {

        soil:
            70,

        compost:
            20,

        aeration:
            10

    }

};


function normalizeSoilStrategy(
    value
) {
    if (
        value ===
        "budget"
    ) {
        return "basic";
    }


    return (
        value ||
        "balanced"
    );
}


/* =========================
   LUMBER NAME
========================= */

function getLumberName(
    material
) {

    if (
        material ===
        "pressure-treated"
    ) {

        return "2×6×8 pressure-treated boards";

    }


    if (
        material ===
        "composite"
    ) {

        return "8 ft composite garden boards";

    }


    return "2×6×8 cedar boards";

}


/* =========================
   RAISED BEDS
========================= */

function calculateRaisedBedMaterials(
    raisedBeds,
    buildOptions
) {

    if (
        raisedBeds.length ===
        0
    ) {

        return [];

    }


    const heightInches =
        Number(
            buildOptions.bedHeight
        ) ||
        12;


    const material =
        buildOptions.bedMaterial ||
        "cedar";


    const soilStrategy =
        normalizeSoilStrategy(
            buildOptions.soilStrategy
        );


    const soilMix =
        soilStrategies[
            soilStrategy
        ] ||
        soilStrategies.balanced;


    const bedHeightFeet =
        heightInches /
        12;


    let totalPerimeter =
        0;


    let totalGrowingArea =
        0;


    raisedBeds.forEach(
        (bed) => {

            totalPerimeter +=
                2 *
                (
                    bed.width +
                    bed.length
                );


            totalGrowingArea +=
                bed.width *
                bed.length;

        }
    );


    const materials = [];


    /* =========================
       BED STRUCTURE
    ========================= */

    if (
        material ===
        "metal"
    ) {

        materials.push(

            createMaterial({

                id:
                    "metal-bed-kits",

                category:
                    "Raised Beds",

                name:
                    "Metal raised-bed kits",

                quantity:
                    raisedBeds.length,

                unit:
                    raisedBeds.length ===
                    1
                        ? "kit"
                        : "kits",

                note:
                    `Sized approximately ${buildOptions.bedLength || 8} × ${buildOptions.bedWidth || 4} ft and ${heightInches} in high.`

            })

        );

    } else {

        /*
            Approximate nominal 6-inch
            board courses.
        */

        const courses =
            Math.max(
                1,
                Math.ceil(
                    heightInches /
                    6
                )
            );


        const lumberLinearFeet =
            totalPerimeter *
            courses;


        const lumberWithWaste =
            lumberLinearFeet *
            1.1;


        const boardsNeeded =
            roundUp(
                lumberWithWaste /
                8
            );


        materials.push(

            createMaterial({

                id:
                    "raised-bed-lumber",

                category:
                    "Lumber",

                name:
                    getLumberName(
                        material
                    ),

                quantity:
                    boardsNeeded,

                unit:
                    boardsNeeded ===
                    1
                        ? "board"
                        : "boards",

                note:
                    `${courses} board course${courses === 1 ? "" : "s"} for approximately ${heightInches} in bed height, including 10% waste allowance.`

            })

        );


        const postBoards =
            raisedBeds.length;


        materials.push(

            createMaterial({

                id:
                    "raised-bed-posts",

                category:
                    "Lumber",

                name:
                    "4×4×8 corner-post boards",

                quantity:
                    postBoards,

                unit:
                    postBoards ===
                    1
                        ? "board"
                        : "boards",

                note:
                    "Cut into short corner supports."

            })

        );


        const estimatedScrews =
            raisedBeds.length *
            16 *
            courses;


        const screwBoxes =
            Math.max(
                1,
                roundUp(
                    estimatedScrews /
                    100
                )
            );


        materials.push(

            createMaterial({

                id:
                    "raised-bed-screws",

                category:
                    "Hardware",

                name:
                    "3 in exterior deck screws",

                quantity:
                    screwBoxes,

                unit:
                    screwBoxes ===
                    1
                        ? "100-count box"
                        : "100-count boxes",

                note:
                    `Approximately ${estimatedScrews} screws estimated.`

            })

        );

    }


    /* =========================
       SOIL
    ========================= */

    const totalFillVolume =
        totalGrowingArea *
        bedHeightFeet;


    const gardenSoil =
        totalFillVolume *
        (
            soilMix.soil /
            100
        );


    const compost =
        totalFillVolume *
        (
            soilMix.compost /
            100
        );


    const aeration =
        totalFillVolume *
        (
            soilMix.aeration /
            100
        );


    materials.push(

        createMaterial({

            id:
                "total-bed-fill",

            category:
                "Growing Medium",

            name:
                "Total raised-bed fill",

            quantity:
                roundNumber(
                    totalFillVolume
                ),

            unit:
                "cu ft",

            note:
                `${roundNumber(
                    totalFillVolume /
                    27,
                    2
                )} cubic yards total.`

        }),

        createMaterial({

            id:
                "garden-soil",

            category:
                "Growing Medium",

            name:
                "Garden soil",

            quantity:
                roundNumber(
                    gardenSoil
                ),

            unit:
                "cu ft",

            note:
                `${soilMix.soil}% of selected soil mix.`

        }),

        createMaterial({

            id:
                "compost-fill",

            category:
                "Growing Medium",

            name:
                "Compost",

            quantity:
                roundNumber(
                    compost
                ),

            unit:
                "cu ft",

            note:
                `${soilMix.compost}% of selected soil mix.`

        }),

        createMaterial({

            id:
                "aeration-fill",

            category:
                "Growing Medium",

            name:
                "Aeration material",

            quantity:
                roundNumber(
                    aeration
                ),

            unit:
                "cu ft",

            note:
                `${soilMix.aeration}% of selected soil mix.`

        })

    );


    return materials;

}


/* =========================
   TRELLIS
========================= */

function calculateTrellisMaterials(
    trellises
) {

    if (
        trellises.length ===
        0
    ) {

        return [];

    }


    const width =
        trellises.reduce(
            (
                total,
                item
            ) =>
                total +
                item.width,
            0
        );


    return [

        createMaterial({

            id:
                "trellis-mesh",

            category:
                "Trellis",

            name:
                "Garden trellis mesh or panel",

            quantity:
                roundUp(
                    width
                ),

            unit:
                "linear ft",

            note:
                "Wire panel, garden netting, or another climbing support."

        }),

        createMaterial({

            id:
                "trellis-posts",

            category:
                "Trellis",

            name:
                "Trellis support posts",

            quantity:
                trellises.length *
                2,

            unit:
                "posts",

            note:
                "One support at each end."

        })

    ];

}


/* =========================
   IRRIGATION
========================= */

function calculateIrrigationMaterials(
    layout,
    raisedBeds
) {

    const irrigationItems =
        layout.items.filter(
            (item) =>
                item.type ===
                "irrigation"
        );


    if (
        irrigationItems.length ===
        0
    ) {

        return [];

    }


    const mainLine =
        irrigationItems.reduce(
            (
                total,
                item
            ) =>
                total +
                item.width,
            0
        );


    const dripLayout =
        raisedBeds.reduce(
            (
                totals,
                bed
            ) => {

                const longSide =
                    Math.max(
                        bed.width,
                        bed.length
                    );


                const shortSide =
                    Math.min(
                        bed.width,
                        bed.length
                    );


                /*
                    Approximate one drip run every
                    18 inches across the short side,
                    with each run following the long
                    side of the bed.
                */

                const lineCount =
                    Math.max(
                        1,
                        Math.ceil(
                            shortSide /
                            1.5
                        )
                    );


                totals.linearFeet +=
                    longSide *
                    lineCount;


                totals.lineCount +=
                    lineCount;


                return totals;

            },
            {
                linearFeet: 0,
                lineCount: 0
            }
        );


    const tubing =
        (
            mainLine +
            dripLayout.linearFeet
        ) *
        1.1;


    return [

        createMaterial({

            id:
                "irrigation-tubing",

            category:
                "Irrigation",

            name:
                "Irrigation / drip tubing",

            quantity:
                roundUp(
                    tubing
                ),

            unit:
                "linear ft",

            note:
                "Includes approximately 10% extra."

        }),

        createMaterial({

            id:
                "irrigation-connectors",

            category:
                "Irrigation",

            name:
                "Drip fittings / connectors",

            quantity:
                Math.max(
                    2,
                    dripLayout.lineCount *
                        2
                ),

            unit:
                "fittings",

            note:
                "Starter estimate for drip-line starts and ends at approximately 18 in spacing."

        }),

        createMaterial({

            id:
                "irrigation-timer",

            category:
                "Irrigation",

            name:
                "Hose timer",

            quantity:
                1,

            unit:
                "timer"

        }),

        createMaterial({

            id:
                "pressure-regulator",

            category:
                "Irrigation",

            name:
                "Drip pressure regulator",

            quantity:
                1,

            unit:
                "regulator"

        })

    ];

}


/* =========================
   OTHER FEATURES
========================= */

function calculateOtherMaterials(
    layout
) {

    const materials = [];


    const compost =
        layout.items.filter(
            (item) =>
                item.type ===
                "compost"
        );


    const containers =
        layout.items.filter(
            (item) =>
                item.type ===
                "container"
        );


    const vertical =
        layout.items.filter(
            (item) =>
                item.type ===
                "vertical"
        );


    const hydro =
        layout.items.filter(
            (item) =>
                item.type ===
                "hydroponic"
        );


    if (
        compost.length >
        0
    ) {

        materials.push(

            createMaterial({

                id:
                    "compost-bin",

                category:
                    "Compost",

                name:
                    "3×3 compost enclosure",

                quantity:
                    compost.length,

                unit:
                    compost.length ===
                    1
                        ? "bin"
                        : "bins"

            })

        );

    }


    if (
        containers.length >
        0
    ) {

        materials.push(

            createMaterial({

                id:
                    "containers",

                category:
                    "Containers",

                name:
                    "Plant containers with drainage",

                quantity:
                    containers.length,

                unit:
                    "containers"

            }),

            createMaterial({

                id:
                    "container-mix",

                category:
                    "Growing Medium",

                name:
                    "Potting mix",

                quantity:
                    containers.length *
                    2,

                unit:
                    "cu ft"

            })

        );

    }


    if (
        vertical.length >
        0
    ) {

        const width =
            vertical.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.width,
                0
            );


        materials.push(

            createMaterial({

                id:
                    "vertical-frame",

                category:
                    "Vertical Growing",

                name:
                    "Vertical support/frame",

                quantity:
                    roundUp(
                        width
                    ),

                unit:
                    "linear ft"

            })

        );

    }


    if (
        hydro.length >
        0
    ) {

        materials.push(

            createMaterial({

                id:
                    "hydro-reservoir",

                category:
                    "Hydroponics",

                name:
                    "Growing reservoir",

                quantity:
                    hydro.length,

                unit:
                    "reservoir"

            }),

            createMaterial({

                id:
                    "hydro-water-pump",

                category:
                    "Hydroponics",

                name:
                    "Water pump",

                quantity:
                    hydro.length,

                unit:
                    "pump"

            }),

            createMaterial({

                id:
                    "hydro-air-pump",

                category:
                    "Hydroponics",

                name:
                    "Air pump",

                quantity:
                    hydro.length,

                unit:
                    "pump"

            })

        );

    }


    return materials;

}


/* =========================
   MAIN CALCULATOR
========================= */

export function calculateGardenMaterials(
    layout,
    buildOptions = {}
) {

    if (
        !layout ||
        !Array.isArray(
            layout.items
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


    const trellises =
        layout.items.filter(
            (item) =>
                item.type ===
                "trellis"
        );


    const materials = [

        ...calculateRaisedBedMaterials(
            raisedBeds,
            buildOptions
        ),

        ...calculateTrellisMaterials(
            trellises
        ),

        ...calculateIrrigationMaterials(
            layout,
            raisedBeds
        ),

        ...calculateOtherMaterials(
            layout
        )

    ];


    const categories =
        [
            ...new Set(
                materials.map(
                    (item) =>
                        item.category
                )
            )
        ];


    return {

        version:
            2,

        buildOptions,

        assumptions: {

            raisedBedHeightInches:
                Number(
                    buildOptions.bedHeight
                ) ||
                12,

            raisedBedMaterial:
                buildOptions.bedMaterial ||
                "cedar",

            bedLength:
                Number(
                    buildOptions.bedLength
                ) ||
                8,

            bedWidth:
                Number(
                    buildOptions.bedWidth
                ) ||
                4,

            walkwayWidth:
                Number(
                    buildOptions.walkwayWidth
                ) ||
                3,

            soilStrategy:
                normalizeSoilStrategy(
                    buildOptions.soilStrategy
                ),

            wasteAllowancePercent:
                10

        },

        categories,

        materials

    };

}