export function registerServiceWorker() {
    if (
        !import.meta.env.PROD ||
        !("serviceWorker" in navigator)
    ) {
        return;
    }

    window.addEventListener(
        "load",
        async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        "/sw.js",
                        { scope: "/" }
                    );

                // Ask for an update when the app is opened.
                registration.update().catch(() => {});
            } catch (error) {
                console.warn(
                    "Service worker registration failed:",
                    error
                );
            }
        },
        { once: true }
    );
}
