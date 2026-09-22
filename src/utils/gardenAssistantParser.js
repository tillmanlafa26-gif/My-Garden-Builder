import {
    cropPlanningData
} from "../data/cropPlanningData";


import {
    indoorPlantData
} from "../data/indoorPlantData";


const outdoorAliases = {
    tomatoes:
        "tomato",
    tomato:
        "tomato",
    peppers:
        "pepper",
    pepper:
        "pepper",
    cucumbers:
        "cucumber",
    cucumber:
        "cucumber",
    beans:
        "beans",
    bean:
        "beans",
    lettuces:
        "lettuce",
    lettuce:
        "lettuce",
    kale:
        "kale",
    carrots:
        "carrot",
    carrot:
        "carrot",
    radishes:
        "radish",
    radish:
        "radish",
    basil:
        "basil",
    strawberries:
        "strawberry",
    strawberry:
        "strawberry",
    broccoli:
        "broccoli",
    cauliflower:
        "cauliflower",
    cabbage:
        "cabbage",
    spinach:
        "spinach",
    peas:
        "peas",
    pea:
        "peas",
    corn:
        "corn",
    zucchini:
        "zucchini",
    eggplants:
        "eggplant",
    eggplant:
        "eggplant",
    onions:
        "onion",
    onion:
        "onion",
    "sweet potatoes":
        "sweet-potato",
    "sweet potato":
        "sweet-potato",
    potatoes:
        "potato",
    potato:
        "potato",
    beets:
        "beet",
    beet:
        "beet",
    celery:
        "celery",
    "brussels sprouts":
        "brussels-sprouts",
    "brussel sprouts":
        "brussels-sprouts"
};


const indoorAliases = {
    pothos:
        "pothos",
    "snake plant":
        "snake-plant",
    "snake plants":
        "snake-plant",
    "zz plant":
        "zz-plant",
    "zz plants":
        "zz-plant",
    "spider plant":
        "spider-plant",
    "spider plants":
        "spider-plant",
    monstera:
        "monstera",
    monsteras:
        "monstera",
    philodendron:
        "heartleaf-philodendron",
    philodendrons:
        "heartleaf-philodendron",
    "rubber plant":
        "rubber-plant",
    "rubber plants":
        "rubber-plant",
    "chinese evergreen":
        "chinese-evergreen",
    "prayer plant":
        "prayer-plant",
    "parlor palm":
        "parlor-palm",
    "boston fern":
        "boston-fern",
    peperomia:
        "peperomia",
    "peace lily":
        "peace-lily",
    "peace lilies":
        "peace-lily",
    "african violet":
        "african-violet",
    "african violets":
        "african-violet",
    "aloe vera":
        "aloe-vera",
    aloe:
        "aloe-vera",
    "jade plant":
        "jade-plant",
    "jade plants":
        "jade-plant",
    basil:
        "basil",
    mint:
        "mint",
    parsley:
        "parsley",
    chives:
        "chives",
    lettuce:
        "lettuce",
    spinach:
        "spinach",
    "compact pepper":
        "compact-pepper",
    "compact peppers":
        "compact-pepper",
    "indoor pepper":
        "compact-pepper",
    "indoor peppers":
        "compact-pepper",
    "compact tomato":
        "compact-tomato",
    "compact tomatoes":
        "compact-tomato",
    "indoor tomato":
        "compact-tomato",
    "indoor tomatoes":
        "compact-tomato"
};


function unique(
    values
) {
    return [
        ...new Set(
            values.filter(
                Boolean
            )
        )
    ];
}


function normalizeText(
    value
) {
    return String(
        value ||
        ""
    )
        .toLowerCase()
        .replace(
            /[“”]/g,
            '"'
        )
        .replace(
            /[’]/g,
            "'"
        );
}


function includesPhrase(
    text,
    phrase
) {
    const escaped =
        phrase.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    return new RegExp(
        `(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,
        "i"
    ).test(
        text
    );
}


function parseMeasurementUnit(
    text
) {
    if (
        /\b(?:meters?|metres?|m)\b/i.test(
            text
        )
    ) {
        return "m";
    }


    if (
        /\b(?:inches?|inch|in)\b/i.test(
            text
        )
    ) {
        return "in";
    }


    return "ft";
}


function convertDimension(
    value,
    detectedUnit
) {
    const numeric =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numeric
        )
    ) {
        return null;
    }


    if (
        detectedUnit ===
        "in"
    ) {
        return {
            value:
                Number(
                    (
                        numeric /
                        12
                    ).toFixed(
                        2
                    )
                ),

            unit:
                "ft"
        };
    }


    return {
        value:
            numeric,

        unit:
            detectedUnit
    };
}


function parseDimensions(
    text
) {
    const measurementMatch =
        text.match(
            /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter|meters|metre|metres|in|inch|inches|")?\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter|meters|metre|metres|in|inch|inches|")?(?:\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter|meters|metre|metres|in|inch|inches|")?)?/i
        );


    if (
        !measurementMatch
    ) {
        return null;
    }


    const detectedUnit =
        parseMeasurementUnit(
            text
        );


    const width =
        convertDimension(
            measurementMatch[1],
            detectedUnit
        );


    const length =
        convertDimension(
            measurementMatch[2],
            detectedUnit
        );


    const height =
        measurementMatch[3]
            ? convertDimension(
                measurementMatch[3],
                detectedUnit
            )
            : null;


    return {
        width:
            width?.value ||
            null,

        length:
            length?.value ||
            null,

        height:
            height?.value ||
            null,

        unit:
            width?.unit ||
            "ft",

        sourceUnit:
            detectedUnit
    };
}


function detectEnvironment(
    text
) {
    const indoorSignals = [
        "indoor",
        "inside",
        "windowsill",
        "window sill",
        "countertop",
        "counter top",
        "plant rack",
        "shelf",
        "grow tent",
        "living room",
        "bedroom",
        "kitchen"
    ];


    const outdoorSignals = [
        "backyard",
        "yard",
        "patio",
        "balcony",
        "outside",
        "outdoor",
        "garden bed",
        "raised bed"
    ];


    const indoorScore =
        indoorSignals.filter(
            (signal) =>
                includesPhrase(
                    text,
                    signal
                )
        ).length;


    const outdoorScore =
        outdoorSignals.filter(
            (signal) =>
                includesPhrase(
                    text,
                    signal
                )
        ).length;


    if (
        indoorScore >
        outdoorScore
    ) {
        return "indoor";
    }


    if (
        outdoorScore >
        indoorScore
    ) {
        return "outdoor";
    }


    return null;
}


function detectOutdoorSpaceType(
    text
) {
    if (
        includesPhrase(
            text,
            "balcony"
        )
    ) {
        return "balcony";
    }


    if (
        includesPhrase(
            text,
            "patio"
        )
    ) {
        return "patio";
    }


    if (
        includesPhrase(
            text,
            "backyard"
        ) ||
        includesPhrase(
            text,
            "yard"
        )
    ) {
        return "backyard";
    }


    return "other";
}


function detectIndoorSpaceType(
    text
) {
    if (
        includesPhrase(
            text,
            "windowsill"
        ) ||
        includesPhrase(
            text,
            "window sill"
        )
    ) {
        return "windowsill";
    }


    if (
        includesPhrase(
            text,
            "countertop"
        ) ||
        includesPhrase(
            text,
            "counter top"
        )
    ) {
        return "countertop";
    }


    if (
        includesPhrase(
            text,
            "plant rack"
        ) ||
        includesPhrase(
            text,
            "rack"
        )
    ) {
        return "plant-rack";
    }


    if (
        includesPhrase(
            text,
            "grow tent"
        ) ||
        includesPhrase(
            text,
            "tent"
        )
    ) {
        return "grow-tent";
    }


    if (
        includesPhrase(
            text,
            "shelf"
        ) ||
        includesPhrase(
            text,
            "shelving"
        )
    ) {
        return "shelf";
    }


    if (
        includesPhrase(
            text,
            "floor"
        ) ||
        includesPhrase(
            text,
            "corner"
        )
    ) {
        return "floor";
    }


    return "shelf";
}


function detectSunlight(
    text,
    environment
) {
    if (
        includesPhrase(
            text,
            "full sun"
        ) ||
        includesPhrase(
            text,
            "bright light"
        ) ||
        includesPhrase(
            text,
            "bright window"
        ) ||
        includesPhrase(
            text,
            "south facing"
        ) ||
        includesPhrase(
            text,
            "south-facing"
        )
    ) {
        return "full";
    }


    if (
        includesPhrase(
            text,
            "partial sun"
        ) ||
        includesPhrase(
            text,
            "part sun"
        ) ||
        includesPhrase(
            text,
            "partial shade"
        ) ||
        includesPhrase(
            text,
            "medium light"
        ) ||
        includesPhrase(
            text,
            "indirect light"
        ) ||
        includesPhrase(
            text,
            "east facing"
        ) ||
        includesPhrase(
            text,
            "east-facing"
        ) ||
        includesPhrase(
            text,
            "west facing"
        ) ||
        includesPhrase(
            text,
            "west-facing"
        )
    ) {
        return "partial";
    }


    if (
        includesPhrase(
            text,
            "shade"
        ) ||
        includesPhrase(
            text,
            "low light"
        ) ||
        includesPhrase(
            text,
            "north facing"
        ) ||
        includesPhrase(
            text,
            "north-facing"
        )
    ) {
        return "shade";
    }


    return environment ===
        "indoor"
            ? "partial"
            : null;
}


function detectFeatures(
    text
) {
    const features =
        [];


    if (
        includesPhrase(
            text,
            "raised bed"
        ) ||
        includesPhrase(
            text,
            "raised beds"
        )
    ) {
        features.push(
            "raised-beds"
        );
    }


    if (
        includesPhrase(
            text,
            "container"
        ) ||
        includesPhrase(
            text,
            "containers"
        ) ||
        includesPhrase(
            text,
            "pots"
        )
    ) {
        features.push(
            "containers"
        );
    }


    if (
        includesPhrase(
            text,
            "vertical"
        ) ||
        includesPhrase(
            text,
            "vertical garden"
        )
    ) {
        features.push(
            "vertical-growing"
        );
    }


    if (
        includesPhrase(
            text,
            "trellis"
        )
    ) {
        features.push(
            "trellis"
        );
    }


    if (
        includesPhrase(
            text,
            "compost"
        )
    ) {
        features.push(
            "compost"
        );
    }


    if (
        includesPhrase(
            text,
            "irrigation"
        ) ||
        includesPhrase(
            text,
            "drip"
        )
    ) {
        features.push(
            "irrigation"
        );
    }


    if (
        includesPhrase(
            text,
            "hydroponic"
        ) ||
        includesPhrase(
            text,
            "hydroponics"
        )
    ) {
        features.push(
            "hydroponics"
        );
    }


    return unique(
        features
    );
}


function detectGardenType(
    text,
    environment,
    spaceType,
    features
) {
    if (
        features.includes(
            "hydroponics"
        )
    ) {
        return "hydroponic";
    }


    if (
        environment ===
        "indoor"
    ) {
        return "container";
    }


    if (
        features.includes(
            "raised-beds"
        )
    ) {
        return "raised";
    }


    if (
        spaceType ===
        "balcony"
    ) {
        return "balcony";
    }


    if (
        spaceType ===
        "patio"
    ) {
        return "container";
    }


    if (
        spaceType ===
        "backyard"
    ) {
        return "backyard";
    }


    return null;
}


function findNamedSelections(
    text,
    aliases,
    catalog
) {
    const catalogIds =
        new Set(
            catalog.map(
                (item) =>
                    item.id
            )
        );


    return unique(
        Object.entries(
            aliases
        )
            .filter(
                ([
                    phrase
                ]) =>
                    includesPhrase(
                        text,
                        phrase
                    )
            )
            .map(
                ([
                    ,
                    id
                ]) =>
                    catalogIds.has(
                        id
                    )
                        ? id
                        : null
            )
    );
}


function getSelectionNames(
    ids,
    catalog
) {
    return ids
        .map(
            (id) =>
                catalog.find(
                    (item) =>
                        item.id ===
                        id
                )
        )
        .filter(
            Boolean
        )
        .map(
            (item) =>
                item.name
        );
}


function buildMissingFields(
    proposal
) {
    const missing =
        [];


    if (
        !proposal.environment
    ) {
        missing.push(
            "Indoor or outdoor space"
        );
    }


    if (
        !proposal.dimensions?.width ||
        !proposal.dimensions?.length
    ) {
        missing.push(
            "Width × depth/length"
        );
    }


    if (
        proposal.environment ===
            "indoor" &&
        !proposal.dimensions?.height
    ) {
        missing.push(
            "Usable indoor height"
        );
    }


    if (
        !proposal.sunlight
    ) {
        missing.push(
            proposal.environment ===
                "indoor"
                ? "Available light"
                : "Daily sunlight"
        );
    }


    if (
        proposal.selections.length ===
        0
    ) {
        missing.push(
            proposal.environment ===
                "indoor"
                ? "Indoor plant selections"
                : "Crop selections"
        );
    }


    return missing;
}


export function parseGardenAssistantRequest(
    requestText
) {
    const text =
        normalizeText(
            requestText
        );


    const dimensions =
        parseDimensions(
            text
        );


    const environment =
        detectEnvironment(
            text
        );


    const spaceType =
        environment ===
        "indoor"
            ? "indoor"
            : (
                environment ===
                    "outdoor"
                    ? detectOutdoorSpaceType(
                        text
                    )
                    : null
            );


    const indoorSpaceType =
        environment ===
        "indoor"
            ? detectIndoorSpaceType(
                text
            )
            : null;


    const sunlight =
        detectSunlight(
            text,
            environment
        );


    const features =
        detectFeatures(
            text
        );


    const gardenType =
        detectGardenType(
            text,
            environment,
            spaceType,
            features
        );


    const selections =
        environment ===
        "indoor"
            ? findNamedSelections(
                text,
                indoorAliases,
                indoorPlantData
            )
            : findNamedSelections(
                text,
                outdoorAliases,
                cropPlanningData
            );


    const selectionNames =
        getSelectionNames(
            selections,
            environment ===
                "indoor"
                ? indoorPlantData
                : cropPlanningData
        );


    const proposal = {
        environment,
        spaceType,
        indoorSpaceType,
        dimensions,
        sunlight,
        gardenType,
        features,
        selections,
        selectionNames,
        sourceText:
            requestText.trim()
    };


    return {
        ...proposal,

        missingFields:
            buildMissingFields(
                proposal
            ),

        detectedFieldCount:
            [
                environment,
                dimensions?.width,
                dimensions?.length,
                sunlight,
                gardenType,
                selections.length >
                    0
            ].filter(
                Boolean
            ).length
    };
}

const allowedAssistantFeatures =
    new Set([
        "raised-beds",
        "containers",
        "vertical-growing",
        "trellis",
        "compost",
        "irrigation",
        "hydroponics"
    ]);


function normalizeAssistantDimensions(
    dimensions
) {
    if (
        !dimensions ||
        typeof dimensions !==
            "object"
    ) {
        return null;
    }


    const width =
        Number(
            dimensions.width
        );


    const length =
        Number(
            dimensions.length
        );


    const height =
        dimensions.height ===
            null ||
        dimensions.height ===
            undefined ||
        dimensions.height ===
            ""
            ? null
            : Number(
                dimensions.height
            );


    const validWidth =
        Number.isFinite(
            width
        ) &&
        width > 0
            ? width
            : null;


    const validLength =
        Number.isFinite(
            length
        ) &&
        length > 0
            ? length
            : null;


    const validHeight =
        height ===
            null
            ? null
            : (
                Number.isFinite(
                    height
                ) &&
                height > 0
                    ? height
                    : null
            );


    if (
        !validWidth &&
        !validLength &&
        !validHeight
    ) {
        return null;
    }


    return {
        width:
            validWidth,

        length:
            validLength,

        height:
            validHeight,

        unit:
            dimensions.unit ===
            "m"
                ? "m"
                : "ft",

        sourceUnit:
            dimensions.sourceUnit ||
            dimensions.unit ||
            "ft"
    };
}


export function enrichGardenAssistantProposal(
    rawProposal,
    requestText = ""
) {
    const raw =
        rawProposal &&
        typeof rawProposal ===
            "object"
            ? rawProposal
            : {};


    const environment =
        [
            "indoor",
            "outdoor"
        ].includes(
            raw.environment
        )
            ? raw.environment
            : null;


    const dimensions =
        normalizeAssistantDimensions(
            raw.dimensions
        );


    const spaceType =
        environment ===
        "indoor"
            ? "indoor"
            : (
                [
                    "backyard",
                    "patio",
                    "balcony",
                    "other"
                ].includes(
                    raw.spaceType
                )
                    ? raw.spaceType
                    : null
            );


    const indoorSpaceType =
        environment ===
        "indoor" &&
        [
            "windowsill",
            "countertop",
            "shelf",
            "plant-rack",
            "floor",
            "grow-tent"
        ].includes(
            raw.indoorSpaceType
        )
            ? raw.indoorSpaceType
            : null;


    const sunlight =
        [
            "full",
            "partial",
            "shade"
        ].includes(
            raw.sunlight
        )
            ? raw.sunlight
            : null;


    const gardenType =
        [
            "container",
            "raised",
            "backyard",
            "balcony",
            "hydroponic"
        ].includes(
            raw.gardenType
        )
            ? raw.gardenType
            : null;


    const features =
        unique(
            (
                Array.isArray(
                    raw.features
                )
                    ? raw.features
                    : []
            ).filter(
                (feature) =>
                    allowedAssistantFeatures.has(
                        feature
                    )
            )
        );


    const catalog =
        environment ===
        "indoor"
            ? indoorPlantData
            : cropPlanningData;


    const allowedSelectionIds =
        new Set(
            catalog.map(
                (item) =>
                    item.id
            )
        );


    const selections =
        unique(
            (
                Array.isArray(
                    raw.selections
                )
                    ? raw.selections
                    : []
            ).filter(
                (selectionId) =>
                    allowedSelectionIds.has(
                        selectionId
                    )
            )
        );


    const selectionNames =
        getSelectionNames(
            selections,
            catalog
        );


    const proposal = {
        environment,
        spaceType,
        indoorSpaceType,
        dimensions,
        sunlight,
        gardenType,
        features,
        selections,
        selectionNames,
        sourceText:
            String(
                requestText ||
                raw.sourceText ||
                ""
            ).trim(),

        notes:
            Array.isArray(
                raw.notes
            )
                ? raw.notes
                    .filter(
                        (note) =>
                            typeof note ===
                            "string" &&
                            note.trim()
                    )
                    .slice(
                        0,
                        4
                    )
                : []
    };


    return {
        ...proposal,

        missingFields:
            buildMissingFields(
                proposal
            ),

        detectedFieldCount:
            [
                environment,
                dimensions?.width,
                dimensions?.length,
                sunlight,
                gardenType,
                selections.length >
                    0
            ].filter(
                Boolean
            ).length
    };
}

