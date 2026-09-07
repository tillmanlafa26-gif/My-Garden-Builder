import {
    getWholeHardinessZone
} from "../data/hardinessZones";

import {
    isOffline,
    loadRuntimeCache,
    saveRuntimeCache,
    withCacheMeta
} from "../utils/runtimeCache";

const API_BASE_URL =
    "https://perenual.com/api/v2";

const API_KEY =
    import.meta.env
        .VITE_PERENUAL_API_KEY;

const PLANT_CACHE_MAX_AGE_MS =
    7 * 24 * 60 * 60 * 1000;

function checkApiKey() {
    if (
        !API_KEY ||
        API_KEY.includes(
            "YOUR_API_KEY"
        )
    ) {
        throw new Error(
            "Perenual API key is missing. Check your .env file and restart Vite."
        );
    }
}

function normalizePlant(
    plant
) {
    return {
        id:
            String(
                plant.id
            ),
        apiId:
            plant.id,
        name:
            plant.common_name ||
            plant.scientific_name?.[0] ||
            "Unknown Plant",
        scientificName:
            Array.isArray(
                plant.scientific_name
            )
                ? plant.scientific_name[0]
                : plant.scientific_name ||
                  "",
        otherNames:
            Array.isArray(
                plant.other_name
            )
                ? plant.other_name
                : [],
        family:
            plant.family ||
            "",
        cycle:
            plant.cycle ||
            "Unknown",
        watering:
            plant.watering ||
            "Unknown",
        sunlight:
            Array.isArray(
                plant.sunlight
            )
                ? plant.sunlight
                : [],
        image:
            plant.default_image?.medium_url ||
            plant.default_image?.regular_url ||
            plant.default_image?.small_url ||
            plant.default_image?.thumbnail ||
            "",
        source:
            "perenual"
    };
}

function createSearchCacheKey(
    searchTerm,
    page,
    wholeZone
) {
    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-") ||
        "all";

    return (
        `plants:search:${normalizedSearch}:` +
        `${page}:${wholeZone || "all-zones"}`
    );
}

function returnCachedOrThrow(
    cached,
    message,
    extra = {}
) {
    if (
        cached
    ) {
        return withCacheMeta(
            cached.data,
            cached,
            extra
        );
    }

    throw new Error(
        message
    );
}

export async function searchPlants(
    searchTerm = "",
    page = 1,
    hardinessZone = ""
) {
    const wholeZone =
        getWholeHardinessZone(
            hardinessZone
        );

    const cacheKey =
        createSearchCacheKey(
            searchTerm,
            page,
            wholeZone
        );

    const cached =
        loadRuntimeCache(
            cacheKey,
            {
                maxAgeMs:
                    PLANT_CACHE_MAX_AGE_MS,
                allowStale:
                    true
            }
        );

    if (
        isOffline()
    ) {
        return returnCachedOrThrow(
            cached,
            "You’re offline and this plant search has not been saved yet. Your built-in crop planner and saved garden still work offline.",
            {
                offline:
                    true
            }
        );
    }

    try {
        checkApiKey();
    } catch (error) {
        if (
            cached
        ) {
            return withCacheMeta(
                cached.data,
                cached,
                {
                    fallbackReason:
                        "api-key"
                }
            );
        }

        throw error;
    }

    const parameters =
        new URLSearchParams();

    parameters.set(
        "key",
        API_KEY
    );

    parameters.set(
        "page",
        String(
            page
        )
    );

    if (
        wholeZone
    ) {
        parameters.set(
            "hardiness",
            String(
                wholeZone
            )
        );
    }

    parameters.set(
        "edible",
        "1"
    );

    parameters.set(
        "order",
        "asc"
    );

    if (
        searchTerm.trim()
    ) {
        parameters.set(
            "q",
            searchTerm.trim()
        );
    }

    let response;

    try {
        response =
            await fetch(
                `${API_BASE_URL}/species-list?${parameters.toString()}`
            );
    } catch (error) {
        console.error(
            "Plant API network request failed:",
            error
        );

        return returnCachedOrThrow(
            cached,
            "The online plant library is temporarily unavailable. Try again when your connection is stable.",
            {
                fallbackReason:
                    "network-error"
            }
        );
    }

    if (
        !response.ok
    ) {
        return returnCachedOrThrow(
            cached,
            `The plant library is temporarily unavailable (${response.status}). Please try again shortly.`,
            {
                fallbackReason:
                    `http-${response.status}`
            }
        );
    }

    const data =
        await response.json();

    const result = {
        plants:
            Array.isArray(
                data.data
            )
                ? data.data.map(
                    normalizePlant
                )
                : [],
        currentPage:
            data.current_page ||
            page,
        lastPage:
            data.last_page ||
            1,
        total:
            data.total ||
            0,
        perPage:
            data.per_page ||
            30
    };

    saveRuntimeCache(
        cacheKey,
        result
    );

    return withCacheMeta(
        result,
        null,
        {
            offline:
                false
        }
    );
}

export async function getPlantDetails(
    plantId
) {
    const cacheKey =
        `plants:details:${plantId}`;

    const cached =
        loadRuntimeCache(
            cacheKey,
            {
                maxAgeMs:
                    PLANT_CACHE_MAX_AGE_MS,
                allowStale:
                    true
            }
        );

    if (
        isOffline()
    ) {
        return returnCachedOrThrow(
            cached,
            "You’re offline and these plant details have not been saved yet.",
            {
                offline:
                    true
            }
        );
    }

    try {
        checkApiKey();
    } catch (error) {
        if (
            cached
        ) {
            return withCacheMeta(
                cached.data,
                cached,
                {
                    fallbackReason:
                        "api-key"
                }
            );
        }

        throw error;
    }

    const parameters =
        new URLSearchParams();

    parameters.set(
        "key",
        API_KEY
    );

    let response;

    try {
        response =
            await fetch(
                `${API_BASE_URL}/species/details/${plantId}?${parameters.toString()}`
            );
    } catch (error) {
        console.error(
            "Plant detail network request failed:",
            error
        );

        return returnCachedOrThrow(
            cached,
            "Plant details are temporarily unavailable. Try again when your connection is stable.",
            {
                fallbackReason:
                    "network-error"
            }
        );
    }

    if (
        !response.ok
    ) {
        return returnCachedOrThrow(
            cached,
            `Plant details are temporarily unavailable (${response.status}).`,
            {
                fallbackReason:
                    `http-${response.status}`
            }
        );
    }

    const result =
        await response.json();

    saveRuntimeCache(
        cacheKey,
        result
    );

    return withCacheMeta(
        result,
        null,
        {
            offline:
                false
        }
    );
}
