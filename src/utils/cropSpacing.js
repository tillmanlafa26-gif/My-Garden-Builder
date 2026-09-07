/* =========================================================
   MY GARDEN BUILDER
   CROP SPACING HELPERS
========================================================= */


export function getCropLayoutSquareFeet(
    crop
) {
    const explicitArea =
        Number(
            crop?.layoutSquareFeetPerPlant
        );


    if (
        Number.isFinite(
            explicitArea
        ) &&
        explicitArea > 0
    ) {
        return explicitArea;
    }


    const width =
        Number(
            crop?.layoutWidthInches
        );


    const depth =
        Number(
            crop?.layoutDepthInches
        );


    if (
        Number.isFinite(width) &&
        width > 0 &&
        Number.isFinite(depth) &&
        depth > 0
    ) {
        return (
            width *
            depth
        ) /
        144;
    }


    const legacyArea =
        Number(
            crop?.squareFeetPerPlant
        );


    return (
        Number.isFinite(
            legacyArea
        ) &&
        legacyArea > 0
    )
        ? legacyArea
        : 0;
}


export function getCropPlantSpacingInches(
    crop
) {
    const explicitSpacing =
        Number(
            crop?.plantSpacingInches
        );


    if (
        Number.isFinite(
            explicitSpacing
        ) &&
        explicitSpacing > 0
    ) {
        return explicitSpacing;
    }


    const area =
        getCropLayoutSquareFeet(
            crop
        );


    return area > 0
        ? Math.max(
            1,
            Math.round(
                Math.sqrt(
                    area
                ) *
                12
            )
        )
        : 0;
}


export function getCropLayoutDimensions(
    crop
) {
    const width =
        Number(
            crop?.layoutWidthInches
        );


    const depth =
        Number(
            crop?.layoutDepthInches
        );


    if (
        Number.isFinite(width) &&
        width > 0 &&
        Number.isFinite(depth) &&
        depth > 0
    ) {
        return {
            widthInches:
                width,

            depthInches:
                depth
        };
    }


    const spacing =
        getCropPlantSpacingInches(
            crop
        );


    return {
        widthInches:
            spacing,

        depthInches:
            spacing
    };
}
