import {
    enrichGardenAssistantProposal,
    parseGardenAssistantRequest
} from "./gardenAssistantParser";


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


function mergeAssistantProposals(
    aiProposal,
    localProposal,
    requestText,
    baseProposal = null
) {
    const ai =
        enrichGardenAssistantProposal(
            aiProposal,
            requestText
        );


    const base =
        baseProposal
            ? enrichGardenAssistantProposal(
                baseProposal,
                requestText
            )
            : null;


    const finalEnvironment =
        ai.environment ||
        localProposal.environment ||
        base?.environment ||
        null;


    const sameLocalEnvironment =
        localProposal.environment ===
        finalEnvironment;


    const sameBaseEnvironment =
        base?.environment ===
        finalEnvironment;


    const mergedSelections =
        unique([
            ...(
                sameBaseEnvironment
                    ? (
                        base?.selections ||
                        []
                    )
                    : []
            ),

            ...(
                sameLocalEnvironment
                    ? (
                        localProposal.selections ||
                        []
                    )
                    : []
            ),

            ...(
                ai.selections ||
                []
            )
        ]);


    const mergedFeatures =
        unique([
            ...(
                base?.features ||
                []
            ),

            ...(
                localProposal.features ||
                []
            ),

            ...(
                ai.features ||
                []
            )
        ]);


    return enrichGardenAssistantProposal(
        {
            ...(base || {}),
            ...localProposal,
            ...ai,

            environment:
                finalEnvironment,

            spaceType:
                ai.spaceType ||
                (
                    sameLocalEnvironment
                        ? localProposal.spaceType
                        : null
                ) ||
                (
                    sameBaseEnvironment
                        ? base?.spaceType
                        : null
                ),

            indoorSpaceType:
                ai.indoorSpaceType ||
                (
                    sameLocalEnvironment
                        ? localProposal.indoorSpaceType
                        : null
                ) ||
                (
                    sameBaseEnvironment
                        ? base?.indoorSpaceType
                        : null
                ),

            dimensions:
                ai.dimensions ||
                localProposal.dimensions ||
                base?.dimensions ||
                null,

            sunlight:
                ai.sunlight ||
                localProposal.sunlight ||
                base?.sunlight ||
                null,

            gardenType:
                ai.gardenType ||
                localProposal.gardenType ||
                base?.gardenType ||
                null,

            features:
                mergedFeatures,

            selections:
                mergedSelections,

            notes:
                unique([
                    ...(
                        base?.notes ||
                        []
                    ),

                    ...(
                        ai.notes ||
                        []
                    )
                ]).slice(
                    0,
                    4
                )
        },
        requestText
    );
}


function parseSingleHeight(
    value
) {
    const text =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();


    const match =
        text.match(
            /(\d+(?:\.\d+)?)\s*(feet|foot|ft|'|meters?|metres?|m|inches?|inch|in|")?/i
        );


    if (
        !match
    ) {
        return null;
    }


    const numeric =
        Number(
            match[1]
        );


    if (
        !Number.isFinite(
            numeric
        ) ||
        numeric <= 0
    ) {
        return null;
    }


    const unitText =
        match[2] ||
        "ft";


    if (
        /^(?:m|meter|meters|metre|metres)$/i.test(
            unitText
        )
    ) {
        return {
            value:
                numeric,
            unit:
                "m"
        };
    }


    if (
        /^(?:in|inch|inches|")$/i.test(
            unitText
        )
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
            "ft"
    };
}


function parseLightAnswer(
    answer
) {
    const text =
        String(
            answer ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        /\b(full|bright|direct|south)\b/.test(
            text
        )
    ) {
        return "full";
    }


    if (
        /\b(partial|part|medium|indirect|east|west)\b/.test(
            text
        )
    ) {
        return "partial";
    }


    if (
        /\b(shade|low|north|dim)\b/.test(
            text
        )
    ) {
        return "shade";
    }


    return null;
}


function buildLocalFollowUpProposal({
    currentProposal,
    missingField,
    answer,
    originalRequest
}) {
    const current =
        enrichGardenAssistantProposal(
            currentProposal,
            originalRequest
        );


    const contextualText =
        `${
            current.environment ||
            ""
        } ${answer}`.trim();


    const parsed =
        parseGardenAssistantRequest(
            contextualText
        );


    const next = {
        ...current
    };


    if (
        missingField ===
        "Indoor or outdoor space"
    ) {
        next.environment =
            parsed.environment ||
            current.environment;


        next.spaceType =
            next.environment ===
            "indoor"
                ? "indoor"
                : (
                    parsed.spaceType ||
                    current.spaceType
                );


        next.indoorSpaceType =
            next.environment ===
            "indoor"
                ? (
                    parsed.indoorSpaceType ||
                    current.indoorSpaceType
                )
                : null;


        next.gardenType =
            parsed.gardenType ||
            current.gardenType;
    }


    if (
        missingField ===
        "Width × depth/length"
    ) {
        if (
            parsed.dimensions
        ) {
            next.dimensions = {
                ...(current.dimensions || {}),
                ...parsed.dimensions
            };
        }
    }


    if (
        missingField ===
        "Usable indoor height"
    ) {
        const height =
            parseSingleHeight(
                answer
            );


        if (
            height
        ) {
            next.dimensions = {
                ...(current.dimensions || {}),
                height:
                    height.value,
                unit:
                    current.dimensions?.unit ||
                    height.unit
            };
        }
    }


    if (
        missingField ===
            "Available light" ||
        missingField ===
            "Daily sunlight"
    ) {
        next.sunlight =
            parsed.sunlight ||
            parseLightAnswer(
                answer
            ) ||
            current.sunlight;
    }


    if (
        missingField ===
            "Indoor plant selections" ||
        missingField ===
            "Crop selections"
    ) {
        next.selections =
            unique([
                ...(
                    current.selections ||
                    []
                ),
                ...(
                    parsed.selections ||
                    []
                )
            ]);
    }


    if (
        parsed.features?.length >
        0
    ) {
        next.features =
            unique([
                ...(
                    current.features ||
                    []
                ),
                ...parsed.features
            ]);
    }


    if (
        parsed.gardenType
    ) {
        next.gardenType =
            parsed.gardenType;
    }


    return enrichGardenAssistantProposal(
        next,
        originalRequest
    );
}


async function postAssistantRequest(
    body
) {
    const controller =
        new AbortController();


    const timeoutId =
        window.setTimeout(
            () =>
                controller.abort(),
            15000
        );


    try {
        const response =
            await fetch(
                "/api/garden-assistant",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            body
                        ),

                    signal:
                        controller.signal
                }
            );


        if (
            !response.ok
        ) {
            throw new Error(
                `Assistant API returned ${response.status}.`
            );
        }


        return await response.json();
    } finally {
        window.clearTimeout(
            timeoutId
        );
    }
}


export async function analyzeGardenAssistantRequest(
    requestText
) {
    const trimmed =
        String(
            requestText ||
            ""
        ).trim();


    const localProposal =
        parseGardenAssistantRequest(
            trimmed
        );


    if (
        !trimmed
    ) {
        return {
            ...localProposal,
            analysisSource:
                "local"
        };
    }


    try {
        const data =
            await postAssistantRequest({
                requestText:
                    trimmed
            });


        const merged =
            mergeAssistantProposals(
                data?.proposal,
                localProposal,
                trimmed
            );


        return {
            ...merged,

            analysisSource:
                "ai",

            model:
                data?.model ||
                null
        };
    } catch (
        error
    ) {
        return {
            ...localProposal,

            analysisSource:
                "local",

            analysisNotice:
                error?.name ===
                "AbortError"
                    ? "AI analysis timed out, so the built-in parser was used."
                    : "AI analysis is unavailable right now, so the built-in parser was used."
        };
    }
}


export async function analyzeGardenAssistantFollowUp({
    originalRequest,
    currentProposal,
    missingField,
    answer
}) {
    const trimmedAnswer =
        String(
            answer ||
            ""
        ).trim();


    if (
        !trimmedAnswer
    ) {
        return currentProposal;
    }


    const localUpdated =
        buildLocalFollowUpProposal({
            currentProposal,
            missingField,
            answer:
                trimmedAnswer,
            originalRequest
        });


    try {
        const data =
            await postAssistantRequest({
                requestText:
                    String(
                        originalRequest ||
                        ""
                    ).trim(),

                currentProposal,

                followUp: {
                    missingField,
                    answer:
                        trimmedAnswer
                }
            });


        const merged =
            mergeAssistantProposals(
                data?.proposal,
                localUpdated,
                originalRequest,
                currentProposal
            );


        return {
            ...merged,

            analysisSource:
                "ai",

            model:
                data?.model ||
                null
        };
    } catch (
        error
    ) {
        return {
            ...localUpdated,

            analysisSource:
                "local",

            analysisNotice:
                error?.name ===
                "AbortError"
                    ? "AI follow-up timed out, so the built-in parser used your answer."
                    : "AI follow-up is unavailable right now, so the built-in parser used your answer."
        };
    }
}
