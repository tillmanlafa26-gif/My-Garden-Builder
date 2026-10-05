const OUTDOOR_SELECTION_IDS =
    new Set([
    "tomato",
    "pepper",
    "cucumber",
    "beans",
    "lettuce",
    "kale",
    "carrot",
    "radish",
    "basil",
    "strawberry",
    "broccoli",
    "cauliflower",
    "cabbage",
    "spinach",
    "peas",
    "corn",
    "zucchini",
    "eggplant",
    "onion",
    "sweet-potato",
    "potato",
    "beet",
    "celery",
    "brussels-sprouts"
]);


const INDOOR_SELECTION_IDS =
    new Set([
    "pothos",
    "snake-plant",
    "zz-plant",
    "spider-plant",
    "monstera",
    "heartleaf-philodendron",
    "rubber-plant",
    "chinese-evergreen",
    "prayer-plant",
    "parlor-palm",
    "boston-fern",
    "peperomia",
    "peace-lily",
    "african-violet",
    "aloe-vera",
    "jade-plant",
    "basil",
    "mint",
    "parsley",
    "chives",
    "lettuce",
    "spinach",
    "compact-pepper",
    "compact-tomato"
]);


const ALL_SELECTION_IDS =
    [
    "tomato",
    "pepper",
    "cucumber",
    "beans",
    "lettuce",
    "kale",
    "carrot",
    "radish",
    "basil",
    "strawberry",
    "broccoli",
    "cauliflower",
    "cabbage",
    "spinach",
    "peas",
    "corn",
    "zucchini",
    "eggplant",
    "onion",
    "sweet-potato",
    "potato",
    "beet",
    "celery",
    "brussels-sprouts",
    "pothos",
    "snake-plant",
    "zz-plant",
    "spider-plant",
    "monstera",
    "heartleaf-philodendron",
    "rubber-plant",
    "chinese-evergreen",
    "prayer-plant",
    "parlor-palm",
    "boston-fern",
    "peperomia",
    "peace-lily",
    "african-violet",
    "aloe-vera",
    "jade-plant",
    "mint",
    "parsley",
    "chives",
    "compact-pepper",
    "compact-tomato"
];


const ALLOWED_FEATURES = [
    "raised-beds",
    "containers",
    "vertical-growing",
    "trellis",
    "compost",
    "irrigation",
    "hydroponics"
];


const RESPONSE_SCHEMA = {
    type:
        "object",

    additionalProperties:
        false,

    required: [
        "environment",
        "spaceType",
        "indoorSpaceType",
        "dimensions",
        "sunlight",
        "gardenType",
        "features",
        "selections",
        "notes"
    ],

    properties: {
        environment: {
            type:
                "string",

            enum: [
                "indoor",
                "outdoor",
                "unknown"
            ]
        },

        spaceType: {
            type:
                "string",

            enum: [
                "indoor",
                "backyard",
                "patio",
                "balcony",
                "other",
                "unknown"
            ]
        },

        indoorSpaceType: {
            type:
                "string",

            enum: [
                "windowsill",
                "countertop",
                "shelf",
                "plant-rack",
                "floor",
                "grow-tent",
                "unknown"
            ]
        },

        dimensions: {
            type:
                "object",

            additionalProperties:
                false,

            required: [
                "width",
                "length",
                "height",
                "unit"
            ],

            properties: {
                width: {
                    anyOf: [
                        {
                            type:
                                "number"
                        },
                        {
                            type:
                                "null"
                        }
                    ]
                },

                length: {
                    anyOf: [
                        {
                            type:
                                "number"
                        },
                        {
                            type:
                                "null"
                        }
                    ]
                },

                height: {
                    anyOf: [
                        {
                            type:
                                "number"
                        },
                        {
                            type:
                                "null"
                        }
                    ]
                },

                unit: {
                    type:
                        "string",

                    enum: [
                        "ft",
                        "m"
                    ]
                }
            }
        },

        sunlight: {
            type:
                "string",

            enum: [
                "full",
                "partial",
                "shade",
                "unknown"
            ]
        },

        gardenType: {
            type:
                "string",

            enum: [
                "container",
                "raised",
                "backyard",
                "balcony",
                "hydroponic",
                "unknown"
            ]
        },

        features: {
            type:
                "array",

            items: {
                type:
                    "string",

                enum:
                    ALLOWED_FEATURES
            }
        },

        selections: {
            type:
                "array",

            items: {
                type:
                    "string",

                enum:
                    ALL_SELECTION_IDS
            }
        },

        notes: {
            type:
                "array",

            maxItems:
                4,

            items: {
                type:
                    "string"
            }
        }
    }
};


function extractOutputText(
    responseData
) {
    const output =
        Array.isArray(
            responseData?.output
        )
            ? responseData.output
            : [];


    for (
        const item of output
    ) {
        const content =
            Array.isArray(
                item?.content
            )
                ? item.content
                : [];


        for (
            const part of content
        ) {
            if (
                part?.type ===
                    "output_text" &&
                typeof part.text ===
                    "string"
            ) {
                return part.text;
            }
        }
    }


    return null;
}


function cleanNullableEnum(
    value,
    allowed
) {
    return allowed.includes(
        value
    )
        ? value
        : null;
}


function normalizeModelProposal(
    proposal
) {
    const environment =
        cleanNullableEnum(
            proposal?.environment,
            [
                "indoor",
                "outdoor"
            ]
        );


    const allowedSelections =
        environment ===
        "indoor"
            ? INDOOR_SELECTION_IDS
            : OUTDOOR_SELECTION_IDS;


    const dimensions =
        proposal?.dimensions &&
        typeof proposal.dimensions ===
            "object"
            ? {
                width:
                    Number.isFinite(
                        proposal.dimensions.width
                    ) &&
                    proposal.dimensions.width >
                        0
                        ? proposal.dimensions.width
                        : null,

                length:
                    Number.isFinite(
                        proposal.dimensions.length
                    ) &&
                    proposal.dimensions.length >
                        0
                        ? proposal.dimensions.length
                        : null,

                height:
                    Number.isFinite(
                        proposal.dimensions.height
                    ) &&
                    proposal.dimensions.height >
                        0
                        ? proposal.dimensions.height
                        : null,

                unit:
                    proposal.dimensions.unit ===
                    "m"
                        ? "m"
                        : "ft"
            }
            : null;


    return {
        environment,

        spaceType:
            environment ===
            "indoor"
                ? "indoor"
                : cleanNullableEnum(
                    proposal?.spaceType,
                    [
                        "backyard",
                        "patio",
                        "balcony",
                        "other"
                    ]
                ),

        indoorSpaceType:
            environment ===
            "indoor"
                ? cleanNullableEnum(
                    proposal?.indoorSpaceType,
                    [
                        "windowsill",
                        "countertop",
                        "shelf",
                        "plant-rack",
                        "floor",
                        "grow-tent"
                    ]
                )
                : null,

        dimensions,

        sunlight:
            cleanNullableEnum(
                proposal?.sunlight,
                [
                    "full",
                    "partial",
                    "shade"
                ]
            ),

        gardenType:
            cleanNullableEnum(
                proposal?.gardenType,
                [
                    "container",
                    "raised",
                    "backyard",
                    "balcony",
                    "hydroponic"
                ]
            ),

        features:
            [
                ...new Set(
                    (
                        Array.isArray(
                            proposal?.features
                        )
                            ? proposal.features
                            : []
                    ).filter(
                        (feature) =>
                            ALLOWED_FEATURES.includes(
                                feature
                            )
                    )
                )
            ],

        selections:
            [
                ...new Set(
                    (
                        Array.isArray(
                            proposal?.selections
                        )
                            ? proposal.selections
                            : []
                    ).filter(
                        (selectionId) =>
                            allowedSelections.has(
                                selectionId
                            )
                    )
                )
            ],

        notes:
            (
                Array.isArray(
                    proposal?.notes
                )
                    ? proposal.notes
                    : []
            )
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
    };
}


export default async function handler(
    request,
    response
) {
    if (
        request.method !==
        "POST"
    ) {
        response.setHeader(
            "Allow",
            "POST"
        );


        return response
            .status(
                405
            )
            .json({
                error:
                    "Method not allowed."
            });
    }


    const requestText =
        String(
            request.body?.requestText ||
            ""
        ).trim();


    const followUp =
        request.body?.followUp &&
        typeof request.body.followUp ===
            "object"
            ? request.body.followUp
            : null;


    const followUpAnswer =
        String(
            followUp?.answer ||
            ""
        ).trim();


    const followUpMissingField =
        String(
            followUp?.missingField ||
            ""
        ).trim();


    if (
        !requestText
    ) {
        return response
            .status(
                400
            )
            .json({
                error:
                    "Garden description is required."
            });
    }


    if (
        followUpAnswer.length >
        1000
    ) {
        return response
            .status(
                400
            )
            .json({
                error:
                    "Follow-up answer is too long."
            });
    }


    if (
        requestText.length >
        2500
    ) {
        return response
            .status(
                400
            )
            .json({
                error:
                    "Garden description is too long."
            });
    }


    const apiKey =
        process.env
            .OPENAI_API_KEY;


    if (
        !apiKey
    ) {
        return response
            .status(
                503
            )
            .json({
                error:
                    "AI garden analysis is not configured."
            });
    }


    const model =
        process.env
            .OPENAI_GARDEN_MODEL ||
        "gpt-5.6-luna";


    const instructions = `
You extract structured inputs for My Garden Builder.

Do not design the garden and do not calculate bed layouts, plant spacing,
material quantities, harvest dates, or grow-light wattage. Those are handled
by deterministic application code.

Rules:
- Extract only facts stated or strongly implied by the user's description.
- Never invent a location, USDA zone, frost date, dimensions, or plant.
- environment must be indoor, outdoor, or unknown.
- For indoor spaces, spaceType must be indoor.
- For outdoor spaces, indoorSpaceType must be unknown.
- Normalize feet/inches to decimal feet. Preserve metric dimensions in meters.
- sunlight mapping:
  full = full sun / bright direct or strong bright light
  partial = partial sun / medium / indirect light
  shade = mostly shade / low light
  unknown = not provided
- Return only supported plant/crop IDs from the supplied schema.
- If the user asks for a plant that is not supported, leave it out and mention
  it briefly in notes.
- notes should be short and only mention ambiguity, unsupported requests, or
  assumptions that the user should review.
- When a previous structured draft and a follow-up answer are provided, update
  the draft using the new answer while preserving earlier confirmed details
  unless the follow-up clearly corrects them.
`;


    const currentDraft =
        request.body?.currentProposal &&
        typeof request.body.currentProposal ===
            "object"
            ? normalizeModelProposal(
                request.body.currentProposal
            )
            : null;


    const modelInput =
        followUpAnswer
            ? [
                "ORIGINAL GARDEN DESCRIPTION:",
                requestText,
                "",
                "CURRENT STRUCTURED DRAFT:",
                JSON.stringify(
                    currentDraft,
                    null,
                    2
                ),
                "",
                "MISSING DETAIL BEING ANSWERED:",
                followUpMissingField ||
                    "Unspecified",
                "",
                "USER FOLLOW-UP ANSWER:",
                followUpAnswer,
                "",
                "Return the updated complete structured draft."
            ].join(
                "\n"
            )
            : requestText;


    try {
        const openAiResponse =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method:
                        "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${apiKey}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            model,

                            store:
                                false,

                            reasoning: {
                                effort:
                                    "low"
                            },

                            instructions,

                            input:
                                modelInput,

                            max_output_tokens:
                                1200,

                            text: {
                                format: {
                                    type:
                                        "json_schema",

                                    name:
                                        "garden_builder_request",

                                    strict:
                                        true,

                                    schema:
                                        RESPONSE_SCHEMA
                                }
                            }
                        })
                }
            );


        const responseData =
            await openAiResponse.json();


        if (
            !openAiResponse.ok
        ) {
            console.error(
                "Garden assistant OpenAI error:",
                responseData?.error?.message ||
                openAiResponse.status
            );


            return response
                .status(
                    502
                )
                .json({
                    error:
                        "AI garden analysis failed."
                });
        }


        const outputText =
            extractOutputText(
                responseData
            );


        if (
            !outputText
        ) {
            return response
                .status(
                    502
                )
                .json({
                    error:
                        "AI garden analysis returned no structured result."
                });
        }


        let parsed;


        try {
            parsed =
                JSON.parse(
                    outputText
                );
        } catch (
            error
        ) {
            console.error(
                "Garden assistant JSON parse error:",
                error
            );


            return response
                .status(
                    502
                )
                .json({
                    error:
                        "AI garden analysis returned invalid structured data."
                });
        }


        return response
            .status(
                200
            )
            .json({
                proposal:
                    normalizeModelProposal(
                        parsed
                    ),

                model
            });
    } catch (
        error
    ) {
        console.error(
            "Garden assistant request failed:",
            error
        );


        return response
            .status(
                502
            )
            .json({
                error:
                    "AI garden analysis is temporarily unavailable."
            });
    }
}
