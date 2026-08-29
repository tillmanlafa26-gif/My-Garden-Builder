import {
    useState
} from "react";


function AppSettings({
    onResetApp
}) {

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    const [
        confirmingReset,
        setConfirmingReset
    ] = useState(false);


    function openSettings() {

        setIsOpen(true);

    }


    function closeSettings() {

        setIsOpen(false);

        setConfirmingReset(false);

    }


    return (

        <>

            {/* =========================
                SETTINGS BUTTON
            ========================= */}

            <button
                type="button"
                className="settings-fab"
                onClick={
                    openSettings
                }
                aria-label="Open settings"
                title="Settings"
            >

                ⚙️

            </button>


            {/* =========================
                SETTINGS PANEL
            ========================= */}

            {
                isOpen && (

                    <>

                        <button
                            type="button"
                            className="settings-overlay"
                            onClick={
                                closeSettings
                            }
                            aria-label="Close settings"
                        />


                        <aside
                            className="settings-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="settings-title"
                        >

                            <div className="settings-header">

                                <div>

                                    <span>
                                        ⚙️
                                    </span>

                                    <div>

                                        <h2 id="settings-title">
                                            Settings
                                        </h2>

                                        <p>
                                            Manage My Garden Builder
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="settings-close-button"
                                    onClick={
                                        closeSettings
                                    }
                                    aria-label="Close settings"
                                >

                                    ✕

                                </button>

                            </div>


                            {/* =========================
                                RESET SECTION
                            ========================= */}

                            <section className="settings-section">

                                <div className="settings-section-heading">

                                    <span>
                                        ↺
                                    </span>

                                    <div>

                                        <h3>
                                            Reset App
                                        </h3>

                                        <p>
                                            Return My Garden Builder
                                            to its original state.
                                        </p>

                                    </div>

                                </div>


                                {
                                    !confirmingReset
                                        ? (

                                            <button
                                                type="button"
                                                className="settings-reset-button"
                                                onClick={() =>
                                                    setConfirmingReset(
                                                        true
                                                    )
                                                }
                                            >

                                                ↺ Reset to Original State

                                            </button>

                                        )
                                        : (

                                            <div className="settings-reset-confirmation">

                                                <strong>
                                                    Reset everything?
                                                </strong>

                                                <p>
                                                    Your garden design,
                                                    plants, watering
                                                    history, calendar
                                                    events, journal,
                                                    supplies, tasks,
                                                    and preferences will
                                                    be reset.
                                                </p>


                                                <div className="settings-reset-actions">

                                                    <button
                                                        type="button"
                                                        className="settings-cancel-button"
                                                        onClick={() =>
                                                            setConfirmingReset(
                                                                false
                                                            )
                                                        }
                                                    >

                                                        Cancel

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="settings-confirm-reset-button"
                                                        onClick={
                                                            onResetApp
                                                        }
                                                    >

                                                        Yes, Reset Everything

                                                    </button>

                                                </div>

                                            </div>

                                        )
                                }

                            </section>


                            <div className="settings-note">

                                <span>
                                    ℹ️
                                </span>

                                <p>
                                    Resetting only affects data
                                    saved by My Garden Builder in
                                    this browser.
                                </p>

                            </div>

                        </aside>

                    </>

                )
            }

        </>

    );

}


export default AppSettings;