import {
    getBackendConfig
} from "../config/env.js";

function getQueryValue(
    value
) {
    if (
        Array.isArray(
            value
        )
    ) {
        return value[0] || "";
    }

    return value ?? "";
}

function cleanSearchTerm(
    value
) {
    return String(
        getQueryValue(
            value
        )
    )
        .trim()
        .slice(
            0,
            100
        );
}

function cleanPage(
    value
) {
    const parsed =
        Number.parseInt(
            getQueryValue(
                value
            ),
            10
        );

    if (
        !Number.isFinite(
            parsed
        ) ||
        parsed < 1
    ) {
        return 1;
    }

    return Math.min(
        parsed,
        1000
    );
}

function cleanHardiness(
    value
) {
    const text =
        String(
            getQueryValue(
                value
            )
        ).trim();

    return /^(?:[1-9]|1[0-3])$/
        .test(
            text
        )
        ? text
        : "";
}

function cleanPlantId(
    value
) {
    const text =
        String(
            getQueryValue(
                value
            )
        ).trim();

    return /^\d{1,12}$/
        .test(
            text
        )
        ? text
        : "";
}

async function fetchJsonWithTimeout(
    url,
    timeoutMs =
        10000
) {
    const controller =
        new AbortController();

    const timer =
        setTimeout(
            () =>
                controller.abort(),
            timeoutMs
        );

    try {
        const upstream =
            await fetch(
                url,
                {
                    headers: {
                        Accept:
                            "application/json"
                    },
                    signal:
                        controller.signal
                }
            );

        const data =
            await upstream.json()
                .catch(
                    () => null
                );

        return {
            upstream,
            data
        };
    } finally {
        clearTimeout(
            timer
        );
    }
}

export default async function plantsHandler(
    request,
    response
) {
    if (
        request.method !== "GET"
    ) {
        response.setHeader(
            "Allow",
            "GET"
        );

        return response
            .status(405)
            .json({
                error:
                    "Method not allowed."
            });
    }

    const config =
        getBackendConfig();

    if (
        !config.perenualApiKey
    ) {
        return response
            .status(503)
            .json({
                error:
                    "The online plant library is not configured."
            });
    }

    const action =
        String(
            getQueryValue(
                request.query
                    ?.action
            )
        )
            .trim()
            .toLowerCase();

    const parameters =
        new URLSearchParams();

    parameters.set(
        "key",
        config.perenualApiKey
    );

    let upstreamUrl;

    if (
        action ===
        "details"
    ) {
        const plantId =
            cleanPlantId(
                request.query
                    ?.id
            );

        if (
            !plantId
        ) {
            return response
                .status(400)
                .json({
                    error:
                        "A valid plant id is required."
                });
        }

        upstreamUrl =
            `${config.perenualBaseUrl}/species/details/${plantId}?${parameters.toString()}`;
    } else {
        const page =
            cleanPage(
                request.query
                    ?.page
            );

        const hardiness =
            cleanHardiness(
                request.query
                    ?.hardiness
            );

        const searchTerm =
            cleanSearchTerm(
                request.query
                    ?.q
            );

        parameters.set(
            "page",
            String(
                page
            )
        );

        parameters.set(
            "edible",
            "1"
        );

        parameters.set(
            "order",
            "asc"
        );

        if (
            hardiness
        ) {
            parameters.set(
                "hardiness",
                hardiness
            );
        }

        if (
            searchTerm
        ) {
            parameters.set(
                "q",
                searchTerm
            );
        }

        upstreamUrl =
            `${config.perenualBaseUrl}/species-list?${parameters.toString()}`;
    }

    try {
        const {
            upstream,
            data
        } =
            await fetchJsonWithTimeout(
                upstreamUrl
            );

        if (
            !upstream.ok
        ) {
            console.error(
                "Perenual request failed:",
                upstream.status
            );

            return response
                .status(502)
                .json({
                    error:
                        "The online plant library is temporarily unavailable."
                });
        }

        response.setHeader(
            "Cache-Control",
            action ===
                "details"
                ? "s-maxage=86400, stale-while-revalidate=604800"
                : "s-maxage=3600, stale-while-revalidate=86400"
        );

        return response
            .status(200)
            .json(
                data
            );
    } catch (
        error
    ) {
        console.error(
            "Plant backend request failed:",
            error
        );

        return response
            .status(502)
            .json({
                error:
                    "The online plant library is temporarily unavailable."
            });
    }
}
