function normalizeBox(box) {
    if (!box || typeof box !== "object") {
        return null;
    }

    const x = Math.min(100, Math.max(0, Number(box.x || 0)));
    const y = Math.min(100, Math.max(0, Number(box.y || 0)));

    return {
        ...box,
        x,
        y,
        width: Math.min(
            100 - x,
            Math.max(0, Number(box.width || 0))
        ),
        height: Math.min(
            100 - y,
            Math.max(0, Number(box.height || 0))
        ),
        confidence: Math.min(
            1,
            Math.max(0, Number(box.confidence || 0))
        )
    };
}


function normalizeAnalysis(raw) {
    return {
        sceneType:
            ["indoor", "outdoor", "unknown"].includes(raw?.sceneType)
                ? raw.sceneType
                : "unknown",

        surfaceType:
            [
                "grass",
                "soil",
                "concrete",
                "deck",
                "indoor-floor",
                "mixed",
                "unknown"
            ].includes(raw?.surfaceType)
                ? raw.surfaceType
                : "unknown",

        summary: String(raw?.summary || "").trim(),

        usableArea: normalizeBox(raw?.usableArea),

        obstacles:
            (Array.isArray(raw?.obstacles) ? raw.obstacles : [])
                .map(normalizeBox)
                .filter(Boolean)
                .slice(0, 12),

        structures:
            (Array.isArray(raw?.structures) ? raw.structures : [])
                .map(normalizeBox)
                .filter(Boolean)
                .slice(0, 10),

        lightObservations:
            (Array.isArray(raw?.lightObservations)
                ? raw.lightObservations
                : []
            )
                .filter((item) => typeof item === "string" && item.trim())
                .slice(0, 6),

        notes:
            (Array.isArray(raw?.notes) ? raw.notes : [])
                .filter((item) => typeof item === "string" && item.trim())
                .slice(0, 5),

        analyzedAt: new Date().toISOString()
    };
}


export async function analyzeGardenSpacePhoto({
    imageDataUrl,
    spaceType,
    dimensions,
    markup
}) {
    if (!imageDataUrl) {
        throw new Error(
            "Add a garden-space photo before running visual analysis."
        );
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
        () => controller.abort(),
        30000
    );

    try {
        const response = await fetch(
            "/api/garden-vision",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imageDataUrl,
                    spaceType: spaceType || null,
                    dimensions: dimensions || null,
                    markup: markup || null
                }),
                signal: controller.signal
            }
        );

        const payload = await response.json();

        if (!response.ok) {
            throw new Error(
                payload?.error ||
                "Garden-space analysis could not be completed."
            );
        }

        return {
            analysis: normalizeAnalysis(payload.analysis),
            model: payload.model || null
        };
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error(
                "Photo analysis timed out. Your manual markings are still saved."
            );
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}
