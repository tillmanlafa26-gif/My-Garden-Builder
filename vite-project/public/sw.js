const CACHE_VERSION = "my-garden-builder-v1-rc1";
const APP_CACHE = `${CACHE_VERSION}-app`;

const scopeUrl = new URL("./", self.registration.scope);
const appShell = [
    new URL("./", scopeUrl).href,
    new URL("index.html", scopeUrl).href,
    new URL("manifest.webmanifest", scopeUrl).href
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(APP_CACHE)
            .then((cache) =>
                Promise.all(
                    appShell.map((url) =>
                        cache.add(url).catch(() => null)
                    )
                )
            )
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith("my-garden-builder-") &&
                                key !== APP_CACHE
                        )
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // Cross-origin API calls are handled by the app's runtime cache.
    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches
                        .open(APP_CACHE)
                        .then((cache) =>
                            cache.put(
                                new URL("index.html", scopeUrl).href,
                                copy
                            )
                        )
                        .catch(() => {});
                    return response;
                })
                .catch(async () => {
                    const cache = await caches.open(APP_CACHE);
                    return (
                        (await cache.match(
                            new URL("index.html", scopeUrl).href
                        )) ||
                        (await cache.match(
                            new URL("./", scopeUrl).href
                        )) ||
                        Response.error()
                    );
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (
                        response.ok &&
                        response.type === "basic"
                    ) {
                        const copy = response.clone();
                        caches
                            .open(APP_CACHE)
                            .then((cache) =>
                                cache.put(request, copy)
                            )
                            .catch(() => {});
                    }
                    return response;
                })
                .catch(() => cached || Response.error());

            return cached || network;
        })
    );
});
