const STORAGE_WARNING_EVENT = "garden-storage-warning";

function emitStorageWarning(message, level = "warning") {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(STORAGE_WARNING_EVENT, {
            detail: {
                message,
                level
            }
        })
    );
}

function getStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.localStorage;
    } catch (error) {
        console.error("Browser storage is unavailable:", error);
        return null;
    }
}

export function readText(key, fallback = null) {
    const storage = getStorage();

    if (!storage) {
        return fallback;
    }

    try {
        const value = storage.getItem(key);
        return value === null ? fallback : value;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

export function writeText(key, value) {
    const storage = getStorage();

    if (!storage) {
        emitStorageWarning(
            "Browser storage is unavailable. Changes may not persist after you leave this page."
        );
        return false;
    }

    try {
        storage.setItem(key, String(value));
        return true;
    } catch (error) {
        console.error(`Unable to save ${key}:`, error);
        emitStorageWarning(
            "My Garden Builder could not save a change. Your browser may be blocking storage or running low on space."
        );
        return false;
    }
}

export function readJson(key, fallback = null, validator = null) {
    const storage = getStorage();

    if (!storage) {
        return fallback;
    }

    let rawValue = null;

    try {
        rawValue = storage.getItem(key);

        if (rawValue === null) {
            return fallback;
        }

        const parsedValue = JSON.parse(rawValue);

        if (
            typeof validator === "function" &&
            !validator(parsedValue)
        ) {
            throw new Error("Saved value failed validation.");
        }

        return parsedValue;
    } catch (error) {
        console.warn(`Saved data for ${key} was invalid and has been reset:`, error);

        try {
            storage.removeItem(key);
        } catch {
            // Nothing else to do if storage removal is also blocked.
        }

        emitStorageWarning(
            "A damaged saved-data entry was repaired automatically. Other garden data was left unchanged.",
            "repaired"
        );

        return fallback;
    }
}

export function writeJson(key, value) {
    const storage = getStorage();

    if (!storage) {
        emitStorageWarning(
            "Browser storage is unavailable. Changes may not persist after you leave this page."
        );
        return false;
    }

    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Unable to save ${key}:`, error);
        emitStorageWarning(
            "My Garden Builder could not save a change. Your browser may be blocking storage or running low on space."
        );
        return false;
    }
}

export function removeStorageKey(key) {
    const storage = getStorage();

    if (!storage) {
        return false;
    }

    try {
        storage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Unable to remove ${key}:`, error);
        return false;
    }
}

export function clearStoragePrefix(prefix) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    try {
        const keysToRemove = [];

        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);

            if (key?.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => storage.removeItem(key));
    } catch (error) {
        console.error(`Unable to clear storage prefix ${prefix}:`, error);
    }
}

export function isStorageAvailable() {
    const storage = getStorage();

    if (!storage) {
        return false;
    }

    const testKey = "__garden_storage_test__";

    try {
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

export { STORAGE_WARNING_EVENT };
