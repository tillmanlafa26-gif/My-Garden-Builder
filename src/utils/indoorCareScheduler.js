function getLocalDateString(
    date
) {
    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function normalizeDateString(
    value
) {
    if (
        !value
    ) {
        return null;
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(
                value
            )
        )
    ) {
        return String(
            value
        );
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return getLocalDateString(
        date
    );
}


function addDays(
    dateString,
    days
) {
    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    date.setDate(
        date.getDate() +
        Number(
            days || 0
        )
    );


    return getLocalDateString(
        date
    );
}


function resolveAnchorDate(
    plant,
    field,
    fallbackField = null
) {
    return (
        normalizeDateString(
            plant?.[field]
        ) ||
        (
            fallbackField
                ? normalizeDateString(
                    plant?.[
                        fallbackField
                    ]
                )
                : null
        ) ||
        normalizeDateString(
            plant?.addedAt
        ) ||
        getLocalDateString(
            new Date()
        )
    );
}


function resolveGrowLightNeed(
    plant,
    gardenProfile
) {
    const placements =
        Array.isArray(
            gardenProfile
                ?.designSpace
                ?.indoorLayout
                ?.placements
        )
            ? gardenProfile
                .designSpace
                .indoorLayout
                .placements
            : [];


    const placement =
        placements.find(
            (item) =>
                item.plantId ===
                plant?.indoorPlantId
        );


    return Boolean(
        placement?.needsGrowLight
    );
}


function createCareItem({
    plant,
    action,
    interval,
    anchor,
    label,
    icon,
    description,
    today
}) {
    const numericInterval =
        Number(
            interval
        );


    if (
        !Number.isFinite(
            numericInterval
        ) ||
        numericInterval <= 0
    ) {
        return null;
    }


    const dueDate =
        addDays(
            anchor,
            numericInterval
        );


    return {
        action,
        intervalDays:
            numericInterval,
        anchorDate:
            anchor,
        dueDate,
        displayDate:
            dueDate <
            today
                ? today
                : dueDate,
        overdue:
            dueDate <
            today,
        label,
        icon,
        description,
        plantKey:
            plant.plantKey,
        plantId:
            plant.id,
        indoorPlantId:
            plant.indoorPlantId
    };
}


export function getIndoorCareScheduleForPlant(
    plant,
    gardenProfile,
    todayValue = null
) {
    if (
        !plant ||
        plant.source !==
            "indoor"
    ) {
        return null;
    }


    const today =
        normalizeDateString(
            todayValue
        ) ||
        getLocalDateString(
            new Date()
        );


    const needsGrowLight =
        resolveGrowLightNeed(
            plant,
            gardenProfile
        );


    const rotation =
        createCareItem({
            plant,
            action:
                "rotate",
            interval:
                plant.rotateEveryDays ||
                14,
            anchor:
                resolveAnchorDate(
                    plant,
                    "lastRotatedAt"
                ),
            label:
                "Rotate / check orientation",
            icon:
                "🔄",
            description:
                "Turn the plant or review its orientation so growth stays balanced when light comes strongly from one direction.",
            today
        });


    const light =
        createCareItem({
            plant,
            action:
                "light-check",
            interval:
                plant.lightCheckEveryDays ||
                30,
            anchor:
                resolveAnchorDate(
                    plant,
                    "lastLightCheckedAt"
                ),
            label:
                needsGrowLight
                    ? "Check grow-light position"
                    : "Check light exposure",
            icon:
                "💡",
            description:
                needsGrowLight
                    ? "Review fixture height, coverage, and plant response. Follow the fixture manufacturer's distance guidance."
                    : "Review the plant's light exposure and watch for stretching, scorching, or uneven growth.",
            today
        });


    const repotInterval =
        Number(
            plant.repotCheckEveryDays
        );


    const repotCheck =
        repotInterval >
        0
            ? createCareItem({
                plant,
                action:
                    "repot-check",
                interval:
                    repotInterval,
                anchor:
                    resolveAnchorDate(
                        plant,
                        "lastRepotCheckedAt",
                        "lastRepottedAt"
                    ),
                label:
                    "Check root space / repotting",
                icon:
                    "🪴",
                description:
                    "Inspect drainage, root crowding, growth rate, and container stability before deciding whether repotting is needed.",
                today
            })
            : null;


    return {
        today,
        needsGrowLight,
        rotation,
        light,
        repotCheck
    };
}


export function createIndoorCareCalendarEvents({
    plants = [],
    gardenProfile,
    today = null
}) {
    const todayString =
        normalizeDateString(
            today
        ) ||
        getLocalDateString(
            new Date()
        );


    return plants
        .filter(
            (plant) =>
                plant?.source ===
                "indoor"
        )
        .flatMap(
            (plant) => {
                const schedule =
                    getIndoorCareScheduleForPlant(
                        plant,
                        gardenProfile,
                        todayString
                    );


                if (
                    !schedule
                ) {
                    return [];
                }


                return [
                    schedule.rotation,
                    schedule.light,
                    schedule.repotCheck
                ]
                    .filter(
                        Boolean
                    )
                    .map(
                        (careItem) => ({
                            id:
                                `auto-indoor-care-${plant.plantKey}-${careItem.action}-${careItem.dueDate}`,

                            date:
                                careItem.displayDate,

                            originalDueDate:
                                careItem.dueDate,

                            overdue:
                                careItem.overdue,

                            type:
                                "indoor-care",

                            careType:
                                careItem.action,

                            title:
                                `${careItem.label}: ${plant.name}`,

                            description:
                                careItem.description,

                            plantKey:
                                plant.plantKey,

                            plantId:
                                plant.id,

                            indoorPlantId:
                                plant.indoorPlantId,

                            automatic:
                                true,

                            source:
                                "indoor-care-scheduler"
                        })
                    );
            }
        );
}


export function applyIndoorCareActionToPlant(
    plant,
    action,
    completedDateValue = null
) {
    if (
        !plant ||
        plant.source !==
            "indoor"
    ) {
        return plant;
    }


    const completedDate =
        normalizeDateString(
            completedDateValue
        ) ||
        getLocalDateString(
            new Date()
        );


    if (
        action ===
        "rotate"
    ) {
        return {
            ...plant,
            lastRotatedAt:
                completedDate
        };
    }


    if (
        action ===
        "light-check"
    ) {
        return {
            ...plant,
            lastLightCheckedAt:
                completedDate
        };
    }


    if (
        action ===
        "repot-check"
    ) {
        return {
            ...plant,
            lastRepotCheckedAt:
                completedDate
        };
    }


    if (
        action ===
        "repotted"
    ) {
        return {
            ...plant,
            lastRepottedAt:
                completedDate,
            lastRepotCheckedAt:
                completedDate
        };
    }


    return plant;
}
