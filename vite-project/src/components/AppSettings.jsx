import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import Icon from "./Icon";


function AppSettings({
    onResetApp
}) {

    const navigate =
        useNavigate();

    const [
        isOpen,
        setIsOpen
    ] = useState(false);

    const [
        confirmReset,
        setConfirmReset
    ] = useState(false);

    const [
        darkMode,
        setDarkMode
    ] = useState(() => {

        const savedTheme =
            localStorage.getItem(
                "gardenTheme"
            );

        if (
            savedTheme === "dark"
        ) {
            return true;
        }

        if (
            savedTheme === "light"
        ) {
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

            localStorage.setItem(
                "gardenTheme",
                darkMode
                    ? "dark"
                    : "light"
            );

        },
        [darkMode]
    );


    function openSettings() {
        setConfirmReset(false);
        setIsOpen(true);
    }


    function closeSettings() {
        setConfirmReset(false);
        setIsOpen(false);
    }


    function toggleTheme() {

        setDarkMode(
            (currentMode) =>
                !currentMode
        );

    }


    function openHowToUse() {
        closeSettings();
        navigate("/");

        window.setTimeout(
            () => {
                window.dispatchEvent(
                    new CustomEvent(
                        "garden-open-onboarding"
                    )
                );
            },
            250
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
            <button
                type="button"
                className="app-settings-button"
                aria-label="Open settings"
                onClick={openSettings}
            >
                <Icon
                    name="settings"
                    size={20}
                    className="app-settings-button-icon"
                />
            </button>


            {isOpen && (
                <div
                    className="app-settings-overlay"
                    onClick={
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
                        className="app-settings-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="app-settings-title"
                        onClick={
                            (event) =>
                                event.stopPropagation()
                        }
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
                                    <strong>
                                        Appearance
                                    </strong>

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
                                    <strong>
                                        Dark Mode
                                    </strong>

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
                                        name="sprout"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Getting Started
                                    </strong>

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
                                    <strong>
                                        How to Use
                                    </strong>

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
                                        name="database"
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>
                                        App Data
                                    </strong>

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
                                            This removes your saved garden profile,
                                            plants, tasks, calendar events, watering
                                            history, journal entries, supplies, theme,
                                            and onboarding status from this browser.
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
                                My Garden Builder data is currently stored locally
                                in this browser.
                            </p>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}


export default AppSettings;
