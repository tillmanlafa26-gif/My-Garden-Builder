function findMaterial(
    materialPlan,
    id
) {
    return materialPlan
        ?.materials
        ?.find(
            (material) =>
                material.id === id
        ) || null;
}


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


function getSurfacePreparation(
    surface
) {
    switch (surface) {
        case "grass":
            return [
                "Mow or trim the garden area as low as practical.",
                "Remove large weeds, rocks, branches, and other debris.",
                "Mark the outside boundary of the garden before placing any structures.",
                "Consider placing cardboard beneath raised beds to suppress existing grass."
            ];

        case "soil":
            return [
                "Remove large weeds, rocks, roots, and debris.",
                "Level obvious high and low areas before placing garden structures.",
                "Mark the outside boundary of the garden."
            ];

        case "concrete":
            return [
                "Sweep and clean the entire garden area.",
                "Confirm that water can drain away from the planned garden structures.",
                "Use containers, raised beds, or systems designed to sit above the concrete surface.",
                "Avoid blocking existing drains."
            ];

        case "deck":
            return [
                "Inspect the deck surface before placing heavy garden structures.",
                "Plan for drainage underneath containers and raised beds.",
                "Use protective trays or barriers where needed.",
                "Consider the final weight of wet soil before installing large structures."
            ];

        case "indoor-floor":
            return [
                "Protect the floor with a waterproof garden mat or tray.",
                "Confirm access to water and drainage.",
                "Plan for supplemental grow lighting if natural light is insufficient.",
                "Keep electrical equipment away from standing water."
            ];

        default:
            return [
                "Clear the garden area of debris and obstacles.",
                "Level the working area where practical.",
                "Mark the outside boundary before placing structures."
            ];
    }
}


export function generateBuildPlan({
    layout,
    materialPlan,
    buildOptions,
    surface,
    features
}) {
    if (
        !layout ||
        !Array.isArray(
            layout.items
        )
    ) {
        return null;
    }


    const selectedFeatures =
        Array.isArray(features)
            ? features
            : [];


    const stages = [];


    let stageNumber = 1;


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


    const compostAreas =
        layout.items.filter(
            (item) =>
                item.type ===
                "compost"
        );


    const irrigationLines =
        layout.items.filter(
            (item) =>
                item.type ===
                "irrigation"
        );


    const containers =
        layout.items.filter(
            (item) =>
                item.type ===
                "container"
        );


    const verticalItems =
        layout.items.filter(
            (item) =>
                item.type ===
                "vertical"
        );


    const hydroponicItems =
        layout.items.filter(
            (item) =>
                item.type ===
                "hydroponic"
        );


    /* =========================
       SITE PREPARATION
    ========================= */

    stages.push(
        createStage({
            id:
                "prepare-site",

            number:
                stageNumber,

            icon:
                "🧹",

            title:
                "Prepare the Site",

            description:
                "Prepare the real garden space before placing any structures.",

            steps:
                getSurfacePreparation(
                    surface
                )
        })
    );


    /* =========================
       MARK LAYOUT
    ========================= */

    stages.push(
        createStage({
            id:
                "mark-layout",

            number:
                stageNumber,

            icon:
                "📐",

            title:
                "Mark the Garden Layout",

            description:
                "Transfer the generated design onto the actual garden space.",

            steps: [
                `Confirm the full usable space is approximately ${layout.spaceWidth} × ${layout.spaceLength} ft.`,
                `Maintain approximately ${layout.stats.perimeterClearance} ft of perimeter clearance where possible.`,
                `Use approximately ${layout.stats.walkwayWidth} ft between major growing areas.`,
                "Use stakes, marking paint, string, or temporary objects to outline each structure before construction.",
                "Walk through the marked layout before building anything to confirm access feels comfortable."
            ]
        })
    );


    /* =========================
       RAISED BEDS
    ========================= */

    if (
        raisedBeds.length >
        0
    ) {
        const lumber =
            findMaterial(
                materialPlan,
                "raised-bed-lumber"
            );


        const posts =
            findMaterial(
                materialPlan,
                "raised-bed-posts"
            );


        const screws =
            findMaterial(
                materialPlan,
                "raised-bed-screws"
            );


        const bedMaterial =
            buildOptions
                ?.bedMaterial ||
            "cedar";


        const bedLength =
            buildOptions
                ?.bedLength ||
            8;


        const bedWidth =
            buildOptions
                ?.bedWidth ||
            4;


        const bedHeight =
            buildOptions
                ?.bedHeight ||
            12;


        const steps = [
            `Build ${raisedBeds.length} raised bed${raisedBeds.length === 1 ? "" : "s"}.`,
            `Target each bed at approximately ${bedLength} × ${bedWidth} ft and ${bedHeight} in high.`,
            `Use the selected bed material: ${String(
                bedMaterial
            ).replaceAll("-", " ")}.`,
            "Assemble each bed on a flat surface before completing the final soil fill.",
            "Check each bed for square by measuring both diagonals before fully tightening the fasteners."
        ];


        if (
            lumber
        ) {
            steps.push(
                `Prepare approximately ${lumber.quantity} ${lumber.unit} of ${lumber.name}.`
            );
        }


        if (
            posts
        ) {
            steps.push(
                `Prepare approximately ${posts.quantity} ${posts.unit} of ${posts.name}.`
            );
        }


        if (
            screws
        ) {
            steps.push(
                `Use approximately ${screws.quantity} ${screws.unit} of ${screws.name}.`
            );
        }


        stages.push(
            createStage({
                id:
                    "build-raised-beds",

                number:
                    stageNumber++,

                icon:
                    "🪵",

                title:
                    "Build the Raised Beds",

                description:
                    "Construct and position the main growing structures.",

                steps
            })
        );
    }


    /* =========================
       CONTAINERS
    ========================= */

    if (
        containers.length >
        0
    ) {
        stages.push(
            createStage({
                id:
                    "place-containers",

                number:
                    stageNumber++,

                icon:
                    "🌱",

                title:
                    "Place the Containers",

                description:
                    "Position container growing areas according to the generated layout.",

                steps: [
                    `Place ${containers.length} container${containers.length === 1 ? "" : "s"} in the designated locations.`,
                    "Confirm that every container has adequate drainage.",
                    "Leave enough room around containers for watering and plant maintenance.",
                    "Do not permanently secure containers until the complete layout has been checked."
                ]
            })
        );
    }


    /* =========================
       VERTICAL GARDEN
    ========================= */

    if (
        verticalItems.length >
        0
    ) {
        stages.push(
            createStage({
                id:
                    "vertical-growing",

                number:
                    stageNumber++,

                icon:
                    "🌿",

                title:
                    "Install Vertical Growing Supports",

                description:
                    "Install vertical-growing structures before plants are added.",

                steps: [
                    "Position the vertical garden in the location shown on the layout.",
                    "Confirm that the structure will not shade shorter plants more than intended.",
                    "Secure the frame or support so that wind and plant weight will not easily move it.",
                    "Confirm that plants will remain reachable for harvesting and maintenance."
                ]
            })
        );
    }


    /* =========================
       TRELLIS
    ========================= */

    if (
        trellises.length >
        0
    ) {
        const trellisMesh =
            findMaterial(
                materialPlan,
                "trellis-mesh"
            );


        const trellisPosts =
            findMaterial(
                materialPlan,
                "trellis-posts"
            );


        const steps = [
            "Install the trellis along the designated raised bed.",
            "Place supports securely at both ends.",
            "Keep the trellis upright and tension the mesh or climbing support.",
            "Position climbing plants where they can be trained directly onto the trellis."
        ];


        if (
            trellisMesh
        ) {
            steps.push(
                `Prepare approximately ${trellisMesh.quantity} ${trellisMesh.unit} of ${trellisMesh.name}.`
            );
        }


        if (
            trellisPosts
        ) {
            steps.push(
                `Prepare approximately ${trellisPosts.quantity} ${trellisPosts.unit} of ${trellisPosts.name}.`
            );
        }


        stages.push(
            createStage({
                id:
                    "install-trellis",

                number:
                    stageNumber++,

                icon:
                    "🫘",

                title:
                    "Install the Trellis",

                description:
                    "Add climbing support before filling the garden with mature plants.",

                steps
            })
        );
    }


    /* =========================
       COMPOST
    ========================= */

    if (
        compostAreas.length >
        0
    ) {
        stages.push(
            createStage({
                id:
                    "compost-area",

                number:
                    stageNumber++,

                icon:
                    "♻️",

                title:
                    "Build the Compost Area",

                description:
                    "Set up the dedicated composting space shown in the layout.",

                steps: [
                    "Confirm the compost area remains accessible without blocking walkways.",
                    "Set up the approximately 3 × 3 ft compost enclosure.",
                    "Keep enough open space around the enclosure to turn or remove compost.",
                    "Avoid positioning the compost area where runoff will flow directly into structures or buildings."
                ]
            })
        );
    }


    /* =========================
       HYDROPONICS
    ========================= */

    if (
        hydroponicItems.length >
        0
    ) {
        stages.push(
            createStage({
                id:
                    "hydroponics",

                number:
                    stageNumber++,

                icon:
                    "🧪",

                title:
                    "Install the Hydroponic System",

                description:
                    "Set up the hydroponic growing area separately from soil-filled structures.",

                steps: [
                    "Place the reservoir and growing structure in the designated location.",
                    "Confirm that the system is level.",
                    "Install the water pump and air pump according to the equipment requirements.",
                    "Test the complete water circuit for leaks before adding plants.",
                    "Keep electrical connections protected from water."
                ]
            })
        );
    }


    /* =========================
       IRRIGATION
    ========================= */

    if (
        irrigationLines.length >
        0
    ) {
        const tubing =
            findMaterial(
                materialPlan,
                "irrigation-tubing"
            );


        const fittings =
            findMaterial(
                materialPlan,
                "irrigation-connectors"
            );


        const steps = [
            "Lay out the main irrigation line before burying, fastening, or covering any tubing.",
            "Route branch lines to each growing structure.",
            "Use separate drip runs where practical so water is distributed throughout each raised bed.",
            "Flush the lines before installing final emitters or closing the ends.",
            "Run a complete leak test before planting."
        ];


        if (
            tubing
        ) {
            steps.push(
                `Prepare approximately ${tubing.quantity} ${tubing.unit} of ${tubing.name}.`
            );
        }


        if (
            fittings
        ) {
            steps.push(
                `Prepare approximately ${fittings.quantity} ${fittings.unit} of ${fittings.name}.`
            );
        }


        stages.push(
            createStage({
                id:
                    "irrigation",

                number:
                    stageNumber++,

                icon:
                    "💧",

                title:
                    "Install Irrigation",

                description:
                    "Install and test watering infrastructure before final planting.",

                steps
            })
        );
    }


    /* =========================
       GROWING MEDIUM
    ========================= */

    if (
        raisedBeds.length >
        0 ||
        containers.length >
        0
    ) {
        const totalFill =
            findMaterial(
                materialPlan,
                "total-bed-fill"
            );


        const soil =
            findMaterial(
                materialPlan,
                "garden-soil"
            );


        const compost =
            findMaterial(
                materialPlan,
                "compost-fill"
            );


        const aeration =
            findMaterial(
                materialPlan,
                "aeration-fill"
            );


        const steps = [
            "Confirm all bed frames and irrigation lines are positioned correctly before adding soil.",
            "Mix the growing-medium components as evenly as practical.",
            "Fill raised beds gradually instead of dumping all material into one location.",
            "Lightly water the growing mix as the beds are filled to help settle the material.",
            "Leave some space below the top edge of each raised bed to reduce soil loss during watering."
        ];


        if (
            totalFill
        ) {
            steps.push(
                `Plan for approximately ${totalFill.quantity} ${totalFill.unit} of total raised-bed fill.`
            );
        }


        if (
            soil
        ) {
            steps.push(
                `Garden soil: approximately ${soil.quantity} ${soil.unit}.`
            );
        }


        if (
            compost
        ) {
            steps.push(
                `Compost: approximately ${compost.quantity} ${compost.unit}.`
            );
        }


        if (
            aeration
        ) {
            steps.push(
                `Aeration material: approximately ${aeration.quantity} ${aeration.unit}.`
            );
        }


        stages.push(
            createStage({
                id:
                    "growing-medium",

                number:
                    stageNumber++,

                icon:
                    "🌱",

                title:
                    "Add the Growing Medium",

                description:
                    "Fill the growing structures using the recommended soil quantities.",

                steps
            })
        );
    }


    /* =========================
       FINAL INSPECTION
    ========================= */

    stages.push(
        createStage({
            id:
                "final-check",

            number:
                stageNumber,

            icon:
                "✅",

            title:
                "Final Garden Check",

            description:
                "Inspect the completed build before adding plants.",

            steps: [
                "Walk every planned pathway and confirm that all growing areas are reachable.",
                "Check raised beds, trellises, and vertical structures for stability.",
                "Confirm that excess water has a safe drainage path.",
                "Test irrigation and hydroponic equipment if installed.",
                "Confirm the layout still matches the available sunlight conditions.",
                "Once everything is working correctly, the garden is ready for planting."
            ]
        })
    );


    return {
        version:
            1,

        stageCount:
            stages.length,

        features:
            selectedFeatures,

        stages
    };
}