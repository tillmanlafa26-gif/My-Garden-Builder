const BOX_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
        "label",
        "type",
        "x",
        "y",
        "width",
        "height",
        "confidence"
    ],
    properties: {
        label: {
            type: "string"
        },
        type: {
            type: "string",
            enum: [
                "tree",
                "furniture",
                "door",
                "utility",
                "structure",
                "plant",
                "fence",
                "wall",
                "window",
                "railing",
                "shelf",
                "counter",
                "other"
            ]
        },
        x: {
            type: "number",
            minimum: 0,
            maximum: 100
        },
        y: {
            type: "number",
            minimum: 0,
            maximum: 100
        },
        width: {
            type: "number",
            minimum: 0,
            maximum: 100
        },
        height: {
            type: "number",
            minimum: 0,
            maximum: 100
        },
        confidence: {
            type: "number",
            minimum: 0,
            maximum: 1
        }
    }
};


const VISION_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
        "sceneType",
        "surfaceType",
        "summary",
        "usableArea",
        "obstacles",
        "structures",
        "lightObservations",
        "notes"
    ],
    properties: {
        sceneType: {
            type: "string",
            enum: [
                "indoor",
                "outdoor",
                "unknown"
            ]
        },
        surfaceType: {
            type: "string",
            enum: [
                "grass",
                "soil",
                "concrete",
                "deck",
                "indoor-floor",
                "mixed",
                "unknown"
            ]
        },
        summary: {
            type: "string"
        },
        usableArea: {
            type: "object",
            additionalProperties: false,
            required: [
                "x",
                "y",
                "width",
                "height",
                "confidence",
                "reason"
            ],
            properties: {
                x: {
                    type: "number",
                    minimum: 0,
                    maximum: 100
                },
                y: {
                    type: "number",
                    minimum: 0,
                    maximum: 100
                },
                width: {
                    type: "number",
                    minimum: 0,
                    maximum: 100
                },
                height: {
                    type: "number",
                    minimum: 0,
                    maximum: 100
                },
                confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1
                },
                reason: {
                    type: "string"
                }
            }
        },
        obstacles: {
            type: "array",
            maxItems: 12,
            items: BOX_SCHEMA
        },
        structures: {
            type: "array",
            maxItems: 10,
            items: BOX_SCHEMA
        },
        lightObservations: {
            type: "array",
            maxItems: 6,
            items: {
                type: "string"
            }
        },
        notes: {
            type: "array",
            maxItems: 5,
            items: {
                type: "string"
            }
        }
    }
};


function outputText(responseData) {
    for (const item of responseData?.output || []) {
        for (const part of item?.content || []) {
            if (
                part?.type === "output_text" &&
                typeof part.text === "string"
            ) {
                return part.text;
            }
        }
    }

    return null;
}


function validImageDataUrl(value) {
    const text = String(value || "").trim();

    if (
        !/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(text)
    ) {
        return null;
    }

    if (text.length > 2500000) {
        return null;
    }

    return text;
}


export default async function handler(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");

        return response
            .status(405)
            .json({
                error: "Method not allowed."
            });
    }

    const imageDataUrl = validImageDataUrl(
        request.body?.imageDataUrl
    );

    if (!imageDataUrl) {
        return response
            .status(400)
            .json({
                error:
                    "A supported compressed garden photo is required."
            });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return response
            .status(503)
            .json({
                error:
                    "AI photo analysis is not configured. Manual photo mapping still works."
            });
    }

    const model =
        process.env.OPENAI_GARDEN_VISION_MODEL ||
        process.env.OPENAI_GARDEN_MODEL ||
        "gpt-5.6-luna";

    const context = {
        spaceType:
            ["backyard", "patio", "balcony", "indoor", "other"]
                .includes(request.body?.spaceType)
                ? request.body.spaceType
                : null,

        dimensions:
            request.body?.dimensions &&
            typeof request.body.dimensions === "object"
                ? {
                    width:
                        Number(request.body.dimensions.width) ||
                        null,
                    length:
                        Number(request.body.dimensions.length) ||
                        null,
                    height:
                        Number(request.body.dimensions.height) ||
                        null,
                    unit:
                        request.body.dimensions.unit === "m"
                            ? "m"
                            : "ft"
                }
                : null,

        manualAreaPointCount:
            Array.isArray(request.body?.markup?.areaPoints)
                ? request.body.markup.areaPoints.length
                : 0
    };

    const instructions = `
Analyze one photo for My Garden Builder.

You perform visual interpretation only. Do not calculate real-world dimensions
from perspective and do not design the final garden.

Coordinates must be percentages of the full image:
x = left, y = top, width/height = percent of full image.

Identify:
- indoor/outdoor/unknown scene,
- dominant visible surface,
- one conservative rectangular area that appears potentially usable,
- obvious visible obstacles,
- visible structures such as fences, walls, windows, doors, railings, shelves,
  or counters,
- visual light/shade clues supported by the image.

Do not identify people or infer private/sensitive information.

A single image cannot prove exact dimensions, sun hours, soil quality, drainage,
structural capacity, property boundaries, or hidden hazards. Lower confidence
and add a note when uncertain.
`;

    try {
        const openAiResponse = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model,
                    store: false,
                    reasoning: {
                        effort: "low"
                    },
                    instructions,
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text:
                                        `Known project context:\n${JSON.stringify(
                                            context,
                                            null,
                                            2
                                        )}\n\nAnalyze the attached garden-space photo.`
                                },
                                {
                                    type: "input_image",
                                    image_url: imageDataUrl,
                                    detail: "high"
                                }
                            ]
                        }
                    ],
                    max_output_tokens: 1800,
                    text: {
                        format: {
                            type: "json_schema",
                            name:
                                "garden_space_visual_analysis",
                            strict: true,
                            schema: VISION_SCHEMA
                        }
                    }
                })
            }
        );

        const responseData = await openAiResponse.json();

        if (!openAiResponse.ok) {
            console.error(
                "Garden vision error:",
                responseData?.error?.message ||
                openAiResponse.status
            );

            return response
                .status(502)
                .json({
                    error:
                        "AI garden-space analysis failed."
                });
        }

        const text = outputText(responseData);

        if (!text) {
            return response
                .status(502)
                .json({
                    error:
                        "AI garden-space analysis returned no structured result."
                });
        }

        let analysis;

        try {
            analysis = JSON.parse(text);
        } catch (error) {
            console.error(
                "Garden vision parse error:",
                error
            );

            return response
                .status(502)
                .json({
                    error:
                        "AI garden-space analysis returned invalid data."
                });
        }

        return response
            .status(200)
            .json({
                analysis,
                model
            });
    } catch (error) {
        console.error(
            "Garden vision request failed:",
            error
        );

        return response
            .status(502)
            .json({
                error:
                    "AI garden-space analysis is temporarily unavailable."
            });
    }
}
