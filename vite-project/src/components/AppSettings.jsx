import {
    useState
} from "react";


import {
    useNavigate
} from "react-router";


function AppSettings({
    onResetApp
}) {

    const navigate =
        useNavigate();


    const [
        isOpen,
        setIsOpen
    ] = useState(
        false
    );


    const [
        confirmReset,
        setConfirmReset
    ] = useState(
        false
    );


    /* =====================================================
       OPEN SETTINGS
    ===================================================== */

    function openSettings() {

        setConfirmReset(
            false
        );


        setIsOpen(
            true
        );

    }


    /* =====================================================
       CLOSE SETTINGS
    ===================================================== */

    function closeSettings() {

        setConfirmReset(
            false
        );


        setIsOpen(
            false
        );

    }


    /* =====================================================
       HOW TO USE
    ===================================================== */

    function openHowToUse() {

        closeSettings();


        navigate(
            "/"
        );


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


    /* =====================================================
       RESET
    ===================================================== */

    function requestReset() {

        setConfirmReset(
            true
        );

    }


    function cancelReset() {

        setConfirmReset(
            false
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


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <>


            {/* =========================
                SETTINGS BUTTON
            ========================= */}

            <button
                type="button"

                className="app-settings-button"

                aria-label="Open settings"

                onClick={
                    openSettings
                }
            >

                ⚙️

            </button>


            {/* =========================
                SETTINGS PANEL
            ========================= */}

            {
                isOpen && (

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

                            {/* =========================
                                HEADER
                            ========================= */}

                            <div className="app-settings-header">

                                <div className="app-settings-header-info">

                                    <span className="app-settings-header-icon">
                                        ⚙️
                                    </span>


                                    <div>

                                        <h2
                                            id="app-settings-title"
                                        >

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

                                    onClick={
                                        closeSettings
                                    }
                                >

                                    ✕

                                </button>

                            </div>


                            {/* =========================
                                GETTING STARTED
                            ========================= */}

                            <section className="app-settings-section">

                                <div className="app-settings-section-heading">

                                    <span>
                                        🌱
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

                                    onClick={
                                        openHowToUse
                                    }
                                >

                                    <span className="app-settings-action-icon">
                                        📖
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
                                        →
                                    </span>

                                </button>

                            </section>


                            {/* =========================
                                APP DATA
                            ========================= */}

                            <section className="app-settings-section">

                                <div className="app-settings-section-heading">

                                    <span>
                                        💾
                                    </span>


                                    <div>

                                        <strong>
                                            App Data
                                        </strong>


                                        <small>
                                            Manage the garden information stored in this browser.
                                        </small>

                                    </div>

                                </div>


                                {
                                    !confirmReset
                                        ? (

                                            <button
                                                type="button"

                                                className="app-settings-action danger"

                                                onClick={
                                                    requestReset
                                                }
                                            >

                                                <span className="app-settings-action-icon">
                                                    ♻️
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
                                                    →
                                                </span>

                                            </button>

                                        )
                                        : (

                                            <div className="app-settings-reset-confirmation">

                                                <span className="app-settings-warning-icon">
                                                    ⚠️
                                                </span>


                                                <div>

                                                    <strong>
                                                        Reset Everything?
                                                    </strong>


                                                    <p>
                                                        This removes your saved
                                                        garden profile, plants,
                                                        tasks, calendar events,
                                                        watering history,
                                                        journal entries,
                                                        supplies, theme, and
                                                        onboarding status from
                                                        this browser.
                                                    </p>

                                                </div>


                                                <div className="app-settings-reset-actions">

                                                    <button
                                                        type="button"

                                                        className="app-settings-cancel-button"

                                                        onClick={
                                                            cancelReset
                                                        }
                                                    >

                                                        Cancel

                                                    </button>


                                                    <button
                                                        type="button"

                                                        className="app-settings-reset-button"

                                                        onClick={
                                                            confirmResetApp
                                                        }
                                                    >

                                                        Yes, Reset Everything

                                                    </button>

                                                </div>

                                            </div>

                                        )
                                }

                            </section>


                            {/* =========================
                                STORAGE NOTE
                            ========================= */}

                            <div className="app-settings-storage-note">

                                <span>
                                    🔒
                                </span>


                                <p>
                                    My Garden Builder data is
                                    currently stored locally
                                    in this browser.
                                </p>

                            </div>

                        </section>

                    </div>

                )
            }

        </>

    );

}


export default AppSettings;