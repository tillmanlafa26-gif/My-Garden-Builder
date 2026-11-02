export function getBackendConfig() {
    return {
        openAiApiKey:
            process.env.OPENAI_API_KEY?.trim() ||
            "",
        openAiGardenModel:
            process.env.OPENAI_GARDEN_MODEL?.trim() ||
            "gpt-5.6-luna",
        openAiVisionModel:
            process.env.OPENAI_GARDEN_VISION_MODEL?.trim() ||
            process.env.OPENAI_GARDEN_MODEL?.trim() ||
            "gpt-5.6-luna",
        perenualApiKey:
            process.env.PERENUAL_API_KEY?.trim() ||
            "",
        perenualBaseUrl:
            process.env.PERENUAL_API_BASE_URL?.trim() ||
            "https://perenual.com/api/v2",
        port:
            Number(
                process.env.BACKEND_PORT ||
                8787
            )
    };
}

export function getBackendHealth() {
    const config =
        getBackendConfig();

    return {
        openAi:
            Boolean(
                config.openAiApiKey
            ),
        perenual:
            Boolean(
                config.perenualApiKey
            ),
        supabaseClient:
            Boolean(
                process.env.VITE_SUPABASE_URL &&
                (
                    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                    process.env.VITE_SUPABASE_ANON_KEY
                )
            )
    };
}
