import http
    from "node:http";

import fs
    from "node:fs";

import path
    from "node:path";

import {
    fileURLToPath,
    URL
} from "node:url";

import gardenAssistantHandler
    from "./handlers/gardenAssistant.js";

import gardenVisionHandler
    from "./handlers/gardenVision.js";

import plantsHandler
    from "./handlers/plants.js";

import healthHandler
    from "./handlers/health.js";

import {
    getBackendConfig
} from "./config/env.js";


function loadLocalEnvironment() {
    const currentFile =
        fileURLToPath(
            import.meta.url
        );

    const projectRoot =
        path.resolve(
            path.dirname(
                currentFile
            ),
            ".."
        );

    const envPath =
        path.join(
            projectRoot,
            ".env"
        );

    if (
        !fs.existsSync(
            envPath
        )
    ) {
        return;
    }

    const lines =
        fs.readFileSync(
            envPath,
            "utf8"
        )
            .split(
                /\r?\n/
            );

    for (
        const rawLine
        of lines
    ) {
        const line =
            rawLine.trim();

        if (
            !line ||
            line.startsWith(
                "#"
            )
        ) {
            continue;
        }

        const separator =
            line.indexOf(
                "="
            );

        if (
            separator <=
            0
        ) {
            continue;
        }

        const key =
            line
                .slice(
                    0,
                    separator
                )
                .trim();

        let value =
            line
                .slice(
                    separator +
                    1
                )
                .trim();

        if (
            (
                value.startsWith(
                    '"'
                ) &&
                value.endsWith(
                    '"'
                )
            ) ||
            (
                value.startsWith(
                    "'"
                ) &&
                value.endsWith(
                    "'"
                )
            )
        ) {
            value =
                value.slice(
                    1,
                    -1
                );
        }

        if (
            process.env[
                key
            ] ===
            undefined
        ) {
            process.env[
                key
            ] =
                value;
        }
    }
}


loadLocalEnvironment();

const MAX_JSON_BODY_BYTES =
    4 * 1024 * 1024;

const routes =
    new Map([
        [
            "/api/garden-assistant",
            gardenAssistantHandler
        ],
        [
            "/api/garden-vision",
            gardenVisionHandler
        ],
        [
            "/api/plants",
            plantsHandler
        ],
        [
            "/api/health",
            healthHandler
        ]
    ]);

function decorateResponse(
    response
) {
    response.status =
        (statusCode) => {
            response.statusCode =
                statusCode;

            return response;
        };

    response.json =
        (payload) => {
            if (
                !response.headersSent
            ) {
                response.setHeader(
                    "Content-Type",
                    "application/json; charset=utf-8"
                );
            }

            response.end(
                JSON.stringify(
                    payload
                )
            );

            return response;
        };

    return response;
}

async function readJsonBody(
    request
) {
    if (
        request.method ===
        "GET" ||
        request.method ===
        "HEAD"
    ) {
        return {};
    }

    let total =
        0;

    const chunks =
        [];

    for await (
        const chunk
        of request
    ) {
        total +=
            chunk.length;

        if (
            total >
            MAX_JSON_BODY_BYTES
        ) {
            const error =
                new Error(
                    "Request body is too large."
                );

            error.statusCode =
                413;

            throw error;
        }

        chunks.push(
            chunk
        );
    }

    if (
        chunks.length ===
        0
    ) {
        return {};
    }

    const text =
        Buffer.concat(
            chunks
        )
            .toString(
                "utf8"
            )
            .trim();

    if (
        !text
    ) {
        return {};
    }

    try {
        return JSON.parse(
            text
        );
    } catch {
        const error =
            new Error(
                "Request body must be valid JSON."
            );

        error.statusCode =
            400;

        throw error;
    }
}

const {
    port
} =
    getBackendConfig();

const server =
    http.createServer(
        async (
            request,
            nativeResponse
        ) => {
            const response =
                decorateResponse(
                    nativeResponse
                );

            const url =
                new URL(
                    request.url,
                    `http://localhost:${port}`
                );

            const handler =
                routes.get(
                    url.pathname
                );

            if (
                !handler
            ) {
                return response
                    .status(404)
                    .json({
                        error:
                            "API route not found."
                    });
            }

            try {
                request.query =
                    Object.fromEntries(
                        url.searchParams
                            .entries()
                    );

                request.body =
                    await readJsonBody(
                        request
                    );

                await handler(
                    request,
                    response
                );
            } catch (
                error
            ) {
                console.error(
                    "Local backend request failed:",
                    error
                );

                if (
                    !response
                        .headersSent
                ) {
                    response
                        .status(
                            error
                                ?.statusCode ||
                            500
                        )
                        .json({
                            error:
                                error
                                    ?.statusCode ===
                                413
                                    ? "Request body is too large."
                                    : error
                                        ?.statusCode ===
                                      400
                                        ? "Request body must be valid JSON."
                                        : "Backend request failed."
                        });
                } else if (
                    !response
                        .writableEnded
                ) {
                    response.end();
                }
            }
        }
    );

server.listen(
    port,
    "127.0.0.1",
    () => {
        console.log(
            `My Garden Builder backend running at http://127.0.0.1:${port}`
        );
    }
);
