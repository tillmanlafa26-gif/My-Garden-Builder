import {
    getWholeHardinessZone
} from "../data/hardinessZones";

import {
    isOffline,
    loadRuntimeCache,
    saveRuntimeCache,
    withCacheMeta
} from "../utils/runtimeCache";

const PLANT_CACHE_MAX_AGE_MS =
    7 * 24 * 60 * 60 * 1000;

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

async function requestBackend(
    parameters
) {
    let response;

    try {
        response =
            await fetch(
                `/api/plants?${parameters.toString()}`,
                {
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );
    } catch (
        error
    ) {
        console.error(
            "Plant backend network request failed:",
            error
        );

        throw new Error(
            "network-error"
        );
    }

    const data =
        await response.json()
            .catch(
                () => null
            );

    if (
        !response.ok
    ) {
        const error =
            new Error(
                data?.error ||
                `Plant backend returned ${response.status}.`
            );

        error.status =
            response.status;

        throw error;
    }

    return data;
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

    const parameters =
        new URLSearchParams();

    parameters.set(
        "action",
        "search"
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

    if (
        searchTerm.trim()
    ) {
        parameters.set(
            "q",
            searchTerm.trim()
        );
    }

    let data;

    try {
        data =
            await requestBackend(
                parameters
            );
    } catch (
        error
    ) {
        console.error(
            "Plant search failed:",
            error
        );

        return returnCachedOrThrow(
            cached,
            error?.status ===
                503
                ? "The online plant library is not configured yet. Your built-in crop planner and saved garden still work."
                : "The online plant library is temporarily unavailable. Try again when your connection is stable.",
            {
                fallbackReason:
                    error?.status
                        ? `http-${error.status}`
                        : "network-error"
            }
        );
    }

    const result = {
        plants:
            Array.isArray(
                data?.data
            )
                ? data.data.map(
                    normalizePlant
                )
                : [],
        currentPage:
            data?.current_page ||
            page,
        lastPage:
            data?.last_page ||
            1,
        total:
            data?.total ||
            0,
        perPage:
            data?.per_page ||
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

    const parameters =
        new URLSearchParams();

    parameters.set(
        "action",
        "details"
    );

    parameters.set(
        "id",
        String(
            plantId
        )
    );

    let result;

    try {
        result =
            await requestBackend(
                parameters
            );
    } catch (
        error
    ) {
        console.error(
            "Plant detail request failed:",
            error
        );

        return returnCachedOrThrow(
            cached,
            error?.status ===
                503
                ? "The online plant library is not configured yet."
                : "Plant details are temporarily unavailable. Try again when your connection is stable.",
            {
                fallbackReason:
                    error?.status
                        ? `http-${error.status}`
                        : "network-error"
            }
        );
    }

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
