import {
    getCropById
} from "../data/cropPlanningData";


const sunlightLevels = {
    shade: 1,
    partial: 2,
    full: 3
};


function getAvailableGrowingArea(
    layout
) {
    const raisedBedArea =
        Number(
            layout?.stats?.growingArea
        ) || 0;


    const containerArea =
        layout?.items
            ?.filter(
                (item) =>
                    item.type ===
                    "container"
            )
            .reduce(
                (total, item) =>
                    total +
                    item.width *
                    item.length,
                0
            ) || 0;


    return (
        raisedBedArea +
        containerArea
    );
}


export function generatePlantingPlan({
    layout,
    selectedCrops,
    sunlight,
    features
}) {

    if (
        !layout ||
        !Array.isArray(
            selectedCrops
        ) ||
        selectedCrops.length === 0
    ) {
        return null;
    }


    const crops =
        selectedCrops
            .map(
                getCropById
            )
            .filter(
                Boolean
            );


    if (
        crops.length === 0
    ) {
        return null;
    }


    const growingArea =
        getAvailableGrowingArea(
            layout
        );


    const areaPerCrop =
        growingArea /
        crops.length;


    const selectedSunlightLevel =
        sunlightLevels[
            sunlight
        ] || 1;


    const hasTrellis =
        features.includes(
            "trellis"
        );


    const recommendations =
        crops.map(
            (crop) => {

                const minimumSunlightLevel =
                    sunlightLevels[
                        crop.minimumSunlight
                    ] || 1;


                const suggestedQuantity =
                    growingArea > 0
                        ? Math.max(
                            1,
                            Math.floor(
                                areaPerCrop /
                                crop.squareFeetPerPlant
                            )
                        )
                        : 0;


                const sunlightMatch =
                    selectedSunlightLevel >=
                    minimumSunlightLevel;


                const needsSupport =
                    crop.support;


                return {
                    id:
                        crop.id,

                    name:
                        crop.name,

                    icon:
                        crop.icon,

                    suggestedQuantity,

                    allocatedArea:
                        Number(
                            areaPerCrop.toFixed(
                                1
                            )
                        ),

                    squareFeetPerPlant:
                        crop.squareFeetPerPlant,

                    sunlightMatch,

                    minimumSunlight:
                        crop.minimumSunlight,

                    needsSupport,

                    trellisAvailable:
                        !needsSupport ||
                        hasTrellis,

                    containerFriendly:
                        crop.containerFriendly
                };

            }
        );


    const warnings = [];


    const sunlightWarnings =
        recommendations.filter(
            (crop) =>
                !crop.sunlightMatch
        );


    if (
        sunlightWarnings.length >
        0
    ) {
        warnings.push(
            `${sunlightWarnings
                .map(
                    (crop) =>
                        crop.name
                )
                .join(", ")} may perform better with more direct sunlight.`
        );
    }


    const supportWarnings =
        recommendations.filter(
            (crop) =>
                crop.needsSupport &&
                !crop.trellisAvailable
        );


    if (
        supportWarnings.length >
        0
    ) {
        warnings.push(
            `${supportWarnings
                .map(
                    (crop) =>
                        crop.name
                )
                .join(", ")} benefit from climbing support. Consider adding a trellis.`
        );
    }


    if (
        growingArea <= 0
    ) {
        warnings.push(
            "No raised-bed or container growing area is currently available for these crops."
        );
    }


    return {
        version: 1,

        growingArea:
            Number(
                growingArea.toFixed(
                    1
                )
            ),

        selectedCropCount:
            recommendations.length,

        recommendations,

        warnings
    };
}