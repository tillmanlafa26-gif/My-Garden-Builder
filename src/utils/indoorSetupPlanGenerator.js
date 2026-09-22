function createStage({
    id,
    number,
    icon,
    title,
    description,
    steps
}) {
    return {
        id,
        number,
        icon,
        title,
        description,
        steps
    };
}


export function generateIndoorSetupPlan({
    indoorLayout,
    materialPlan
}) {
    if (
        !indoorLayout ||
        indoorLayout.type !==
            "indoor" ||
        !materialPlan
    ) {
        return null;
    }


    const stages =
        [];


    let stageNumber =
        1;


    stages.push(
        createStage({
            id:
                "prepare-space",

            number:
                stageNumber++,

            icon:
                "📐",

            title:
                "Prepare the Indoor Growing Area",

            description:
                "Clear and protect the measured space before containers, shelving, or lights are installed.",

            steps: [
                `Confirm the usable area is approximately ${indoorLayout.sourceDimensions.width} × ${indoorLayout.sourceDimensions.length} × ${indoorLayout.sourceDimensions.height} ${indoorLayout.sourceUnit} (width × depth × height).`,
                "Remove objects that block the planned plant footprint or vertical clearance.",
                "Protect moisture-sensitive flooring, furniture, walls, and windowsills.",
                "Confirm the area has safe access for watering and routine plant care."
            ]
        })
    );


    if (
        [
            "shelf",
            "plant-rack",
            "grow-tent"
        ].includes(
            indoorLayout.indoorSpaceType
        )
    ) {
        stages.push(
            createStage({
                id:
                    "install-structure",

                number:
                    stageNumber++,

                icon:
                    "🧱",

                title:
                    "Set Up the Growing Structure",

                description:
                    "Position the shelf, rack, or grow enclosure before plants are potted and arranged.",

                steps: [
                    "Place the structure on a stable, level surface.",
                    "Confirm every occupied level can safely support the combined weight of containers, wet potting mix, plants, trays, and lighting.",
                    "Install waterproof liners or trays before adding plants.",
                    "Keep ventilation openings and access paths unobstructed."
                ]
            })
        );
    }


    stages.push(
        createStage({
            id:
                "prepare-containers",

            number:
                stageNumber++,

            icon:
                "🪴",

            title:
                "Prepare Containers and Potting Mix",

            description:
                "Use appropriately sized containers with drainage before the plants are placed into the layout.",

            steps: [
                "Match each plant to the container diameter listed in the materials plan.",
                "Use containers with drainage holes unless the growing system specifically requires another method.",
                "Place a waterproof saucer or tray under each draining container.",
                "Fill with indoor potting mix while leaving enough room below the rim for watering."
            ]
        })
    );


    stages.push(
        createStage({
            id:
                "place-plants",

            number:
                stageNumber++,

            icon:
                "🌿",

            title:
                "Place Plants Using the Generated Layout",

            description:
                "Arrange plants by their mature footprint rather than only by the current pot size.",

            steps: [
                "Use the Step 5 layout as the starting position for every plant.",
                "Keep the mature-width clearance shown by the layout open around larger plants.",
                "Do not permanently fill unused gaps; they provide room for canopy growth and access.",
                "Move any plant flagged as not fitting to a larger shelf, floor area, or separate location."
            ]
        })
    );


    if (
        Array.isArray(
            indoorLayout.growLights
        ) &&
        indoorLayout.growLights.length >
            0
    ) {
        stages.push(
            createStage({
                id:
                    "install-lighting",

                number:
                    stageNumber++,

                icon:
                    "💡",

                title:
                    "Install Supplemental Lighting",

                description:
                    "Add grow-light fixtures only where the layout identifies insufficient natural or room light.",

                steps: [
                    `Install ${indoorLayout.growLights.length} grow-light zone${indoorLayout.growLights.length === 1 ? "" : "s"} based on the generated layout.`,
                    "Mount fixtures so their coverage reaches the intended plants without touching foliage.",
                    "Follow the light manufacturer's minimum hanging-distance and electrical-safety guidance.",
                    "Use the programmable timer for a consistent schedule and adjust duration based on the plants' response.",
                    "Raise adjustable fixtures as plants grow so the canopy does not outgrow the safe light distance."
                ]
            })
        );
    }


    stages.push(
        createStage({
            id:
                "water-and-drain",

            number:
                stageNumber++,

            icon:
                "💧",

            title:
                "Set Up Watering and Drainage",

            description:
                "Indoor gardens need controlled watering because excess drainage cannot safely disappear into the ground.",

            steps: [
                "Water each container according to the plant and potting mix rather than on a fixed universal schedule.",
                "Allow excess water to drain fully into the saucer or tray.",
                "Empty standing drainage water when needed so containers are not left sitting in water.",
                "Check the potting mix before watering again to reduce overwatering risk."
            ]
        })
    );


    stages.push(
        createStage({
            id:
                "final-clearance",

            number:
                stageNumber++,

            icon:
                "✅",

            title:
                "Verify Mature-Size Clearance",

            description:
                "Finish the setup by checking the space the plants will need after they grow.",

            steps: [
                "Confirm taller plants have enough vertical clearance above their mature-height estimate.",
                "Make sure leaves will not be forced against hot fixtures, walls, vents, or windows.",
                "Keep electrical connections away from watering and drainage areas.",
                "Recheck the layout as plants mature and relocate plants if their actual growth exceeds the planning estimate."
            ]
        })
    );


    return {
        version:
            1,

        type:
            "indoor-setup-plan",

        generatedAt:
            new Date()
                .toISOString(),

        stageCount:
            stages.length,

        stages,

        notes: [
            "Indoor layout dimensions and plant sizes are planning estimates.",
            "Always follow container, shelving, electrical, and grow-light manufacturer instructions.",
            "Actual light intensity, humidity, temperature, cultivar size, and plant health may require adjustments."
        ]
    };
}
