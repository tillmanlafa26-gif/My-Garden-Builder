import {
    readJson,
    writeJson
} from "./safeStorage";

export const RUNTIME_CACHE_PREFIX = "gardenRuntimeCache:";

function fullKey(key) {
    return `${RUNTIME_CACHE_PREFIX}${key}`;
}

export function isOffline() {
    return (
        typeof navigator !== "undefined" &&
        navigator.onLine === false
    );
}

export function createCoordinateCacheKey(prefix, latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return `${prefix}:unknown`;
    }

    return `${prefix}:${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

export function loadRuntimeCache(
    key,
    {
        maxAgeMs = Infinity,
        allowStale = true
    } = {}
) {
    const record = readJson(fullKey(key), null);

    if (
        !record ||
        typeof record !== "object" ||
        !("data" in record) ||
        !Number.isFinite(Number(record.savedAt))
    ) {
        return null;
    }

    const savedAt = Number(record.savedAt);
    const ageMs = Math.max(0, Date.now() - savedAt);
    const isFresh = ageMs <= maxAgeMs;

    if (!isFresh && !allowStale) {
        return null;
    }

    return {
        data: record.data,
        savedAt,
        cachedAt: new Date(savedAt).toISOString(),
        ageMs,
        isFresh
    };
}

export function saveRuntimeCache(key, data) {
    return writeJson(fullKey(key), {
        savedAt: Date.now(),
        data
    });
}

export function withCacheMeta(data, cacheRecord, extra = {}) {
    return {
        ...data,
        cacheMeta: {
            fromCache: Boolean(cacheRecord),
            cachedAt: cacheRecord?.cachedAt || null,
            stale: cacheRecord ? !cacheRecord.isFresh : false,
            offline: isOffline(),
            ...extra
        }
    };
}
