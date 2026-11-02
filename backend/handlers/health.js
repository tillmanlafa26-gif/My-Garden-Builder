import {
    getBackendHealth
} from "../config/env.js";

export default async function healthHandler(
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

    return response
        .status(200)
        .json({
            status:
                "ok",
            service:
                "my-garden-builder-backend",
            integrations:
                getBackendHealth(),
            timestamp:
                new Date()
                    .toISOString()
        });
}
