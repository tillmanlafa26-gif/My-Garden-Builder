/* =========================
   UNIT CONVERSION
========================= */

function toFeet(
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


    if (
        unit === "m"
    ) {

        return numericValue *
            3.28084;

    }


    return numericValue;

}


/* =========================
   COLLISION CHECK
========================= */

function rectanglesOverlap(
    first,
    second,
    padding = 0
) {

    return !(
        first.x +
            first.width +
            padding <=
            second.x ||

        second.x +
            second.width +
            padding <=
            first.x ||

        first.y +
            first.length +
            padding <=
            second.y ||

        second.y +
            second.length +
            padding <=
            first.y
    );

}


/* =========================
   CAN PLACE ITEM
========================= */

function canPlaceItem(
    candidate,
    existingItems,
    spaceWidth,
    spaceLength,
    padding = 0.5
) {

    if (
        candidate.x < 0 ||
        candidate.y < 0 ||
        candidate.x +
            candidate.width >
            spaceWidth ||
        candidate.y +
            candidate.length >
            spaceLength
    ) {

        return false;

    }


    return !existingItems.some(
        (item) => {

            if (
                item.ignoreCollision
            ) {

                return false;

            }


            return rectanglesOverlap(
                candidate,
                item,
                padding
            );

        }
    );

}


/* =========================
   CREATE LAYOUT ITEM
========================= */

function createItem({
    id,
    type,
    name,
    icon,
    x,
    y,
    width,
    length,
    ignoreCollision = false
}) {

    return {

        id,

        type,

        name,

        icon,

        x:
            Number(
                x.toFixed(
                    2
                )
            ),

        y:
            Number(
                y.toFixed(
                    2
                )
            ),

        width:
            Number(
                width.toFixed(
                    2
                )
            ),

        length:
            Number(
                length.toFixed(
                    2
                )
            ),

        ignoreCollision

    };

}


/* =========================
   AUTOMATIC BED TARGET
========================= */

function getAutomaticBedTarget(
    totalArea
) {

    if (
        totalArea <
        60
    ) {

        return 1;

    }


    if (
        totalArea <
        120
    ) {

        return 2;

    }


    if (
        totalArea <
        220
    ) {

        return 3;

    }


    return 4;

}


/* =========================
   DESIGN STRATEGY
========================= */

function getDesignStrategy({
    designGoal,
    walkwayWidth,
    totalArea,
    maxRaisedBeds
}) {

    const automaticTarget =
        getAutomaticBedTarget(
            totalArea
        );


    let margin;


    let walkway;


    let desiredBeds;


    switch (
        designGoal
    ) {

        case "maximum-growing":

            margin =
                0.35;


            walkway =
                Math.min(
                    walkwayWidth,
                    2
                );


            desiredBeds =
                Math.min(
                    automaticTarget +
                        1,
                    6
                );

            break;


        case "easy-access":

            margin =
                0.75;


            walkway =
                Math.max(
                    walkwayWidth,
                    4
                );


            desiredBeds =
                automaticTarget;

            break;


        case "simple-build":

            margin =
                0.5;


            walkway =
                Math.max(
                    walkwayWidth,
                    3
                );


            desiredBeds =
                Math.min(
                    automaticTarget,
                    2
                );

            break;


        case "balanced":
        default:

            margin =
                0.5;


            walkway =
                walkwayWidth;


            desiredBeds =
                automaticTarget;

            break;

    }


    if (
        Number(
            maxRaisedBeds
        ) >
        0
    ) {

        desiredBeds =
            Math.min(
                desiredBeds,
                Number(
                    maxRaisedBeds
                )
            );

    }


    return {

        margin,

        walkway,

        desiredBeds

    };

}


/* =========================
   PLACE COMPOST
========================= */

function placeCompost({
    items,
    warnings,
    spaceWidth,
    spaceLength,
    margin
}) {

    if (
        spaceWidth <
        4 ||
        spaceLength <
        4
    ) {

        warnings.push(
            "The space is too small for a dedicated 3 × 3 ft compost area."
        );

        return;

    }


    const compostSize =
        3;


    const candidates = [

        {
            x:
                spaceWidth -
                margin -
                compostSize,

            y:
                spaceLength -
                margin -
                compostSize
        },

        {
            x:
                margin,

            y:
                spaceLength -
                margin -
                compostSize
        },

        {
            x:
                spaceWidth -
                margin -
                compostSize,

            y:
                margin
        },

        {
            x:
                margin,

            y:
                margin
        }

    ];


    for (
        const position
        of candidates
    ) {

        const compost =
            createItem({

                id:
                    "compost-1",

                type:
                    "compost",

                name:
                    "Compost",

                icon:
                    "♻️",

                x:
                    position.x,

                y:
                    position.y,

                width:
                    compostSize,

                length:
                    compostSize

            });


        if (
            canPlaceItem(
                compost,
                items,
                spaceWidth,
                spaceLength,
                0.4
            )
        ) {

            items.push(
                compost
            );

            return;

        }

    }


    warnings.push(
        "A compost area could not be placed without interfering with the current growing layout."
    );

}


/* =========================
   GENERATE GARDEN LAYOUT
========================= */

export function generateGardenLayout(
    designSpace
) {

    if (
        !designSpace
    ) {

        return null;

    }


    const spaceWidth =
        toFeet(
            designSpace.width,
            designSpace.unit
        );


    const spaceLength =
        toFeet(
            designSpace.length,
            designSpace.unit
        );


    if (
        spaceWidth <= 0 ||
        spaceLength <= 0
    ) {

        return null;

    }


    const totalArea =
        spaceWidth *
        spaceLength;


    const features =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : [];


    const buildOptions =
        designSpace.buildOptions ||
        {};


    const designGoal =
        designSpace.designGoal ||
        "balanced";


    const preferredBedLength =
        Number(
            buildOptions.bedLength
        ) >
        0
            ? Number(
                buildOptions.bedLength
            )
            : 8;


    const preferredBedWidth =
        Number(
            buildOptions.bedWidth
        ) >
        0
            ? Number(
                buildOptions.bedWidth
            )
            : 4;


    const selectedWalkwayWidth =
        Number(
            buildOptions.walkwayWidth
        ) >
        0
            ? Number(
                buildOptions.walkwayWidth
            )
            : 3;


    const strategy =
        getDesignStrategy({

            designGoal,

            walkwayWidth:
                selectedWalkwayWidth,

            totalArea,

            maxRaisedBeds:
                buildOptions.maxRaisedBeds

        });


    const margin =
        strategy.margin;


    const walkway =
        strategy.walkway;


    const desiredBeds =
        strategy.desiredBeds;


    const items = [];


    const warnings = [];


    /* =========================
       RAISED BEDS
    ========================= */

    if (
        features.includes(
            "raised-beds"
        )
    ) {

        const usableWidth =
            spaceWidth -
            margin *
                2;


        const usableLength =
            spaceLength -
            margin *
                2;


        let bedHorizontal =
            preferredBedLength;


        let bedVertical =
            preferredBedWidth;


        /*
            Rotate the bed if the long
            side cannot fit horizontally
            but can fit vertically.
        */

        if (
            bedHorizontal >
                usableWidth &&
            preferredBedLength <=
                usableLength
        ) {

            bedHorizontal =
                preferredBedWidth;


            bedVertical =
                preferredBedLength;

        }


        if (
            bedHorizontal >
                usableWidth ||
            bedVertical >
                usableLength
        ) {

            warnings.push(
                "The selected raised-bed dimensions are too large for this space."
            );

        } else {

            let bedNumber =
                1;


            let y =
                margin;


            while (
                y +
                    bedVertical <=
                    spaceLength -
                        margin &&
                bedNumber <=
                    desiredBeds
            ) {

                let x =
                    margin;


                while (
                    x +
                        bedHorizontal <=
                        spaceWidth -
                            margin &&
                    bedNumber <=
                        desiredBeds
                ) {

                    const bed =
                        createItem({

                            id:
                                `raised-bed-${bedNumber}`,

                            type:
                                "raised-bed",

                            name:
                                `Raised Bed ${bedNumber}`,

                            icon:
                                "🥕",

                            x,

                            y,

                            width:
                                bedHorizontal,

                            length:
                                bedVertical

                        });


                    if (
                        canPlaceItem(
                            bed,
                            items,
                            spaceWidth,
                            spaceLength,
                            0.35
                        )
                    ) {

                        items.push(
                            bed
                        );


                        bedNumber +=
                            1;

                    }


                    x +=
                        bedHorizontal +
                        walkway;

                }


                y +=
                    bedVertical +
                    walkway;

            }


            const placedBeds =
                items.filter(
                    (item) =>
                        item.type ===
                        "raised-bed"
                );


            if (
                placedBeds.length ===
                0
            ) {

                warnings.push(
                    "No raised beds could be placed with the current measurements."
                );

            }


            if (
                placedBeds.length <
                desiredBeds
            ) {

                warnings.push(
                    `The current space fit ${placedBeds.length} of the ${desiredBeds} raised beds targeted by the selected design goal.`
                );

            }

        }

    }


    /* =========================
       COMPOST
    ========================= */

    if (
        features.includes(
            "compost"
        )
    ) {

        placeCompost({

            items,

            warnings,

            spaceWidth,

            spaceLength,

            margin

        });

    }


    /* =========================
       CONTAINERS
    ========================= */

    if (
        features.includes(
            "containers"
        )
    ) {

        const containerSize =
            Math.min(
                2,
                spaceWidth /
                    4,
                spaceLength /
                    4
            );


        let containerCount =
            0;


        for (
            let y = margin;
            y <=
                spaceLength -
                    margin -
                    containerSize;
            y +=
                containerSize +
                0.75
        ) {

            if (
                containerCount >=
                3
            ) {

                break;

            }


            const container =
                createItem({

                    id:
                        `container-${containerCount + 1}`,

                    type:
                        "container",

                    name:
                        `Container ${containerCount + 1}`,

                    icon:
                        "🌱",

                    x:
                        margin,

                    y,

                    width:
                        containerSize,

                    length:
                        containerSize

                });


            if (
                canPlaceItem(
                    container,
                    items,
                    spaceWidth,
                    spaceLength,
                    0.25
                )
            ) {

                items.push(
                    container
                );


                containerCount +=
                    1;

            }

        }


        if (
            containerCount ===
            0
        ) {

            warnings.push(
                "Containers were selected but no additional container space was available."
            );

        }

    }


    /* =========================
       VERTICAL GROWING
    ========================= */

    if (
        features.includes(
            "vertical-growing"
        )
    ) {

        const verticalWidth =
            Math.min(
                6,
                Math.max(
                    1,
                    spaceWidth -
                        margin *
                        2
                )
            );


        const verticalUnit =
            createItem({

                id:
                    "vertical-1",

                type:
                    "vertical",

                name:
                    "Vertical Garden",

                icon:
                    "🌿",

                x:
                    margin,

                y:
                    Math.max(
                        margin,
                        spaceLength -
                            margin -
                            1
                    ),

                width:
                    verticalWidth,

                length:
                    1

            });


        if (
            canPlaceItem(
                verticalUnit,
                items,
                spaceWidth,
                spaceLength,
                0.25
            )
        ) {

            items.push(
                verticalUnit
            );

        } else {

            warnings.push(
                "Vertical growing was selected but the current layout does not have a clear placement area."
            );

        }

    }


    /* =========================
       HYDROPONICS
    ========================= */

    if (
        features.includes(
            "hydroponics"
        )
    ) {

        const hydroWidth =
            Math.min(
                4,
                Math.max(
                    1,
                    spaceWidth -
                        margin *
                        2
                )
            );


        const hydroLength =
            Math.min(
                2,
                Math.max(
                    1,
                    spaceLength -
                        margin *
                        2
                )
            );


        const candidates = [

            {
                x:
                    spaceWidth -
                    margin -
                    hydroWidth,

                y:
                    margin
            },

            {
                x:
                    margin,

                y:
                    spaceLength -
                    margin -
                    hydroLength
            }

        ];


        let placed =
            false;


        for (
            const position
            of candidates
        ) {

            const hydroUnit =
                createItem({

                    id:
                        "hydroponic-1",

                    type:
                        "hydroponic",

                    name:
                        "Hydroponic Unit",

                    icon:
                        "💧",

                    x:
                        position.x,

                    y:
                        position.y,

                    width:
                        hydroWidth,

                    length:
                        hydroLength

                });


            if (
                canPlaceItem(
                    hydroUnit,
                    items,
                    spaceWidth,
                    spaceLength,
                    0.3
                )
            ) {

                items.push(
                    hydroUnit
                );


                placed =
                    true;


                break;

            }

        }


        if (
            !placed
        ) {

            warnings.push(
                "The hydroponic unit could not be placed without overlapping another structure."
            );

        }

    }


    /* =========================
       TRELLIS
    ========================= */

    if (
        features.includes(
            "trellis"
        )
    ) {

        const firstBed =
            items.find(
                (item) =>
                    item.type ===
                    "raised-bed"
            );


        if (
            firstBed
        ) {

            items.push(

                createItem({

                    id:
                        "trellis-1",

                    type:
                        "trellis",

                    name:
                        "Trellis",

                    icon:
                        "🫘",

                    x:
                        firstBed.x,

                    y:
                        Math.max(
                            0.05,
                            firstBed.y -
                                0.3
                        ),

                    width:
                        firstBed.width,

                    length:
                        0.25,

                    ignoreCollision:
                        true

                })

            );

        } else {

            warnings.push(
                "A trellis was selected, but no raised bed is available to attach it to."
            );

        }

    }


    /* =========================
       IRRIGATION
    ========================= */

    if (
        features.includes(
            "irrigation"
        )
    ) {

        items.push(

            createItem({

                id:
                    "irrigation-main",

                type:
                    "irrigation",

                name:
                    "Main Irrigation Line",

                icon:
                    "💧",

                x:
                    margin,

                y:
                    Math.max(
                        0.05,
                        spaceLength -
                            0.25
                    ),

                width:
                    Math.max(
                        1,
                        spaceWidth -
                            margin *
                            2
                    ),

                length:
                    0.15,

                ignoreCollision:
                    true

            })

        );

    }


    /* =========================
       STATS
    ========================= */

    const raisedBeds =
        items.filter(
            (item) =>
                item.type ===
                "raised-bed"
        );


    const growingArea =
        raisedBeds.reduce(
            (
                total,
                bed
            ) =>
                total +
                bed.width *
                    bed.length,
            0
        );


    const growingPercent =
        totalArea >
        0
            ? (
                growingArea /
                totalArea
            ) *
            100
            : 0;


    return {

        version:
            4,

        units:
            "ft",

        designGoal,

        strategy: {

            margin,

            walkway,

            desiredBeds

        },

        spaceWidth:
            Number(
                spaceWidth.toFixed(
                    2
                )
            ),

        spaceLength:
            Number(
                spaceLength.toFixed(
                    2
                )
            ),

        totalArea:
            Number(
                totalArea.toFixed(
                    2
                )
            ),

        buildOptions,

        items,

        warnings,

        stats: {

            raisedBedCount:
                raisedBeds.length,

            targetRaisedBedCount:
                desiredBeds,

            growingArea:
                Number(
                    growingArea.toFixed(
                        2
                    )
                ),

            growingPercent:
                Number(
                    growingPercent.toFixed(
                        1
                    )
                ),

            walkwayWidth:
                walkway,

            perimeterClearance:
                margin

        }

    };

}