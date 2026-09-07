import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import Icon from "./Icon";

import {
    readText,
    writeText
} from "../utils/safeStorage";

const APP_VERSION = "1.0.0-rc1";

function isStandaloneMode() {
    return (
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true
    );
}

function isIosDevice() {
    return /iphone|ipad|ipod/i.test(
        window.navigator.userAgent
    );
}

function AppSettings({
    onResetApp
}) {
    const navigate =
        useNavigate();

    const panelRef =
        useRef(null);

    const closeButtonRef =
        useRef(null);

    const [
        isOpen,
        setIsOpen
    ] = useState(false);

    const [
        confirmReset,
        setConfirmReset
    ] = useState(false);

    const [
        installPrompt,
        setInstallPrompt
    ] = useState(null);

    const [
        installMessage,
        setInstallMessage
    ] = useState("");

    const [
        installed,
        setInstalled
    ] = useState(
        () => isStandaloneMode()
    );

    const [
        darkMode,
        setDarkMode
    ] = useState(() => {
        const savedTheme =
            readText(
                "gardenTheme",
                null
            );

        if (savedTheme === "dark") {
            return true;
        }

        if (savedTheme === "light") {
            return false;
        }

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
    });

    useEffect(
        () => {
            document.documentElement
                .classList
                .toggle(
                    "dark-mode",
                    darkMode
                );

            writeText(
                "gardenTheme",
                darkMode
                    ? "dark"
                    : "light"
            );

            const themeMeta =
                document.querySelector(
                    'meta[name="theme-color"]'
                );

            if (themeMeta) {
                themeMeta.setAttribute(
                    "content",
                    darkMode
                        ? "#151d15"
                        : "#3f704d"
                );
            }
        },
        [darkMode]
    );

    useEffect(
        () => {
            function handleOpenSettings() {
                openSettings();
            }

            window.addEventListener(
                "garden-open-settings",
                handleOpenSettings
            );

            return () => {
                window.removeEventListener(
                    "garden-open-settings",
                    handleOpenSettings
                );
            };
        },
        []
    );


    useEffect(() => {
        function handleInstallPrompt(event) {
            event.preventDefault();
            setInstallPrompt(event);
        }

        function handleInstalled() {
            setInstalled(true);
            setInstallPrompt(null);
            setInstallMessage(
                "My Garden Builder is installed."
            );
        }

        window.addEventListener(
            "beforeinstallprompt",
            handleInstallPrompt
        );

        window.addEventListener(
            "appinstalled",
            handleInstalled
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleInstallPrompt
            );

            window.removeEventListener(
                "appinstalled",
                handleInstalled
            );
        };
    }, []);

    useEffect(
        () => {
            if (!isOpen) {
                return undefined;
            }

            const focusTimer =
                window.setTimeout(
                    () =>
                        closeButtonRef.current
                            ?.focus(),
                    0
                );

            function handleKeyDown(event) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeSettings();
                    return;
                }

                if (
                    event.key !== "Tab" ||
                    !panelRef.current
                ) {
                    return;
                }

                const focusable =
                    panelRef.current.querySelectorAll(
                        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );

                if (!focusable.length) {
                    return;
                }

                const first = focusable[0];
                const last =
                    focusable[
                        focusable.length - 1
                    ];

                if (
                    event.shiftKey &&
                    document.activeElement === first
                ) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }

            window.addEventListener(
                "keydown",
                handleKeyDown
            );

            return () => {
                window.clearTimeout(
                    focusTimer
                );

                window.removeEventListener(
                    "keydown",
                    handleKeyDown
                );
            };
        },
        [isOpen]
    );

    function openSettings() {
        setConfirmReset(false);
        setInstallMessage("");
        setIsOpen(true);
    }

    function closeSettings() {
        setConfirmReset(false);
        setIsOpen(false);

        window.setTimeout(
            () => {
                window.dispatchEvent(
                    new CustomEvent(
                        "garden-focus-app-menu"
                    )
                );
            },
            0
        );
    }

    function toggleTheme() {
        setDarkMode(
            (currentMode) =>
                !currentMode
        );
    }

    function openHowToUse() {
        closeSettings();

        window.setTimeout(
            () => {
                window.dispatchEvent(
                    new CustomEvent(
                        "garden-open-onboarding"
                    )
                );
            },
            0
        );
    }

    function openPrivacy() {
        closeSettings();
        navigate("/privacy");
    }

    function openTerms() {
        closeSettings();
        navigate("/terms");
    }

    async function installApp() {
        if (installed) {
            setInstallMessage(
                "My Garden Builder is already installed."
            );
            return;
        }

        if (installPrompt) {
            try {
                await installPrompt.prompt();
                const choice =
                    await installPrompt.userChoice;

                setInstallPrompt(null);

                setInstallMessage(
                    choice.outcome === "accepted"
                        ? "Install accepted. Your browser will finish adding the app."
                        : "Install cancelled. You can try again later."
                );
            } catch (error) {
                console.warn(
                    "Unable to open install prompt:",
                    error
                );

                setInstallMessage(
                    "The install prompt is unavailable right now."
                );
            }

            return;
        }

        if (isIosDevice()) {
            setInstallMessage(
                "On iPhone or iPad, open the browser Share menu and choose Add to Home Screen."
            );
            return;
        }

        setInstallMessage(
            "Use your browser’s Install App or Add to Home Screen option when it becomes available."
        );
    }

    function confirmResetApp() {
        if (
            typeof onResetApp !==
            "function"
        ) {
            console.error(
                "App reset handler is unavailable."
            );
            return;
        }

        onResetApp();
    }

    return (
        <>
            {isOpen && (
                <div
                    className="app-settings-overlay"
                    onMouseDown={
                        (event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeSettings();
                            }
                        }
                    }
                >
                    <section
                        ref={panelRef}
                        className="app-settings-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="app-settings-title"
                    >
                        <div className="app-settings-header">
                            <div className="app-settings-header-info">
                                <span className="app-settings-header-icon">
                                    <Icon
                                        name="settings"
                                        size={19}
                                    />
                                </span>

                                <div>
                                    <h2 id="app-settings-title">
                                        Settings
                                    </h2>

                                    <p>
                                        Manage My Garden Builder.
                                    </p>
                                </div>
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                className="app-settings-close"
                                aria-label="Close settings"
                                onClick={closeSettings}
                            >
                                <Icon
                                    name="close"
                                    size={18}
                                />
                            </button>
                        </div>

                        <section className="app-settings-section">
                            <div className="app-settings-section-heading">
                                <span>
                                    <Icon
                                        name={
                                            darkMode
                                                ? "moon"
                                                : "sun"
                                        }
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Appearance</strong>
                                    <small>
                                        Choose how My Garden Builder looks.
                                    </small>
                                </div>
                            </div>

                            <div className="app-settings-theme-row">
                                <span className="app-settings-theme-icon">
                                    <Icon
                                        name={
                                            darkMode
                                                ? "moon"
                                                : "sun"
                                        }
                                        size={18}
                                    />
                                </span>

                                <div className="app-settings-theme-copy">
                                    <strong>Dark Mode</strong>
                                    <small>
                                        {darkMode
                                            ? "Dark theme is on."
                                            : "Light theme is on."}
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        darkMode
                                            ? "app-settings-theme-toggle active"
                                            : "app-settings-theme-toggle"
                                    }
                                    aria-label={
                                        darkMode
                                            ? "Turn dark mode off"
                                            : "Turn dark mode on"
                                    }
                                    aria-pressed={darkMode}
                                    onClick={toggleTheme}
                                >
                                    <span className="app-settings-theme-toggle-knob" />
                                </button>
                            </div>
                        </section>

                        <section className="app-settings-section">
                            <div className="app-settings-section-heading">
                                <span>
                                    <Icon
                                        name="device"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Install App</strong>
                                    <small>
                                        Add My Garden Builder to this device.
                                    </small>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="app-settings-action"
                                onClick={installApp}
                                disabled={installed}
                            >
                                <span className="app-settings-action-icon">
                                    <Icon
                                        name={
                                            installed
                                                ? "check"
                                                : "download"
                                        }
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {installed
                                            ? "App Installed"
                                            : "Install My Garden Builder"}
                                    </strong>

                                    <small>
                                        Launch it like an app from your phone, tablet, or desktop.
                                    </small>
                                </div>

                                {!installed && (
                                    <span className="app-settings-action-arrow">
                                        <Icon
                                            name="chevronRight"
                                            size={16}
                                        />
                                    </span>
                                )}
                            </button>

                            {installMessage && (
                                <p
                                    className="app-settings-inline-message"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {installMessage}
                                </p>
                            )}
                        </section>

                        <section className="app-settings-section">
                            <div className="app-settings-section-heading">
                                <span>
                                    <Icon
                                        name="sprout"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Getting Started</strong>
                                    <small>
                                        Learn how to use the Garden Builder.
                                    </small>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="app-settings-action"
                                onClick={openHowToUse}
                            >
                                <span className="app-settings-action-icon">
                                    <Icon
                                        name="book"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>How to Use</strong>
                                    <small>
                                        Replay the Garden Builder walkthrough.
                                    </small>
                                </div>

                                <span className="app-settings-action-arrow">
                                    <Icon
                                        name="chevronRight"
                                        size={16}
                                    />
                                </span>
                            </button>
                        </section>

                        <section className="app-settings-section">
                            <div className="app-settings-section-heading">
                                <span>
                                    <Icon
                                        name="shield"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Privacy & Terms</strong>
                                    <small>
                                        Review data handling and garden-use limits.
                                    </small>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="app-settings-action"
                                onClick={openPrivacy}
                            >
                                <span className="app-settings-action-icon">
                                    <Icon
                                        name="shield"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Privacy</strong>
                                    <small>
                                        See what stays on your device and what live services receive.
                                    </small>
                                </div>

                                <span className="app-settings-action-arrow">
                                    <Icon
                                        name="chevronRight"
                                        size={16}
                                    />
                                </span>
                            </button>

                            <button
                                type="button"
                                className="app-settings-action"
                                onClick={openTerms}
                            >
                                <span className="app-settings-action-icon">
                                    <Icon
                                        name="document"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>Terms & Disclaimer</strong>
                                    <small>
                                        Review planning, building, and gardening limitations.
                                    </small>
                                </div>

                                <span className="app-settings-action-arrow">
                                    <Icon
                                        name="chevronRight"
                                        size={16}
                                    />
                                </span>
                            </button>
                        </section>

                        <section className="app-settings-section">
                            <div className="app-settings-section-heading">
                                <span>
                                    <Icon
                                        name="database"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>App Data</strong>
                                    <small>
                                        Manage garden information stored in this browser.
                                    </small>
                                </div>
                            </div>

                            {!confirmReset ? (
                                <button
                                    type="button"
                                    className="app-settings-action danger"
                                    onClick={() =>
                                        setConfirmReset(true)
                                    }
                                >
                                    <span className="app-settings-action-icon">
                                        <Icon
                                            name="rotate"
                                            size={18}
                                        />
                                    </span>

                                    <div>
                                        <strong>
                                            Reset to Original State
                                        </strong>
                                        <small>
                                            Remove saved garden data and start over.
                                        </small>
                                    </div>

                                    <span className="app-settings-action-arrow">
                                        <Icon
                                            name="chevronRight"
                                            size={16}
                                        />
                                    </span>
                                </button>
                            ) : (
                                <div className="app-settings-reset-confirmation">
                                    <span className="app-settings-warning-icon">
                                        <Icon
                                            name="warning"
                                            size={20}
                                        />
                                    </span>

                                    <div>
                                        <strong>
                                            Reset Everything?
                                        </strong>
                                        <p>
                                            This removes your saved garden profile, plants, tasks, calendar events, watering history, journal entries, supplies, theme, and onboarding status from this browser.
                                        </p>
                                    </div>

                                    <div className="app-settings-reset-actions">
                                        <button
                                            type="button"
                                            className="app-settings-cancel-button"
                                            onClick={() =>
                                                setConfirmReset(false)
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="app-settings-reset-button"
                                            onClick={confirmResetApp}
                                        >
                                            Yes, Reset Everything
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="app-settings-storage-note">
                            <span>
                                <Icon
                                    name="lock"
                                    size={16}
                                />
                            </span>

                            <p>
                                Garden data is currently stored locally in this browser. Version {APP_VERSION}.
                            </p>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

export default AppSettings;
