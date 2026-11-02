import {
    useState
} from "react";

import Icon from "./Icon";
import "./CloudAccountPanel.css";

function formatLastSynced(
    value
) {
    if (!value) {
        return "Not synced yet";
    }

    try {
        return `Last synced ${value.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        })}`;
    } catch {
        return "Recently synced";
    }
}

function CloudAccountPanel({
    cloudSync
}) {
    const [
        mode,
        setMode
    ] = useState(
        "signin"
    );

    const [
        displayName,
        setDisplayName
    ] = useState(
        ""
    );

    const [
        email,
        setEmail
    ] = useState(
        ""
    );

    const [
        password,
        setPassword
    ] = useState(
        ""
    );

    const [
        message,
        setMessage
    ] = useState(
        ""
    );

    const [
        busy,
        setBusy
    ] = useState(
        false
    );

    const [
        editingName,
        setEditingName
    ] = useState(
        false
    );

    const [
        nameDraft,
        setNameDraft
    ] = useState(
        ""
    );

    if (
        !cloudSync
    ) {
        return null;
    }

    const profileName =
        cloudSync
            .profile
            ?.display_name ||
        "";

    function handleStartEditName() {
        setNameDraft(
            profileName
        );

        setMessage(
            ""
        );

        setEditingName(
            true
        );
    }

    async function handleSaveName(
        event
    ) {
        event.preventDefault();

        setBusy(
            true
        );

        setMessage(
            ""
        );

        try {
            await cloudSync
                .updateProfile({
                    displayName:
                        nameDraft
                });

            setEditingName(
                false
            );

            setMessage(
                "Display name saved."
            );
        } catch (
            error
        ) {
            setMessage(
                error?.message ||
                "Unable to save your display name."
            );
        } finally {
            setBusy(
                false
            );
        }
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        setBusy(
            true
        );

        setMessage(
            ""
        );

        try {
            if (
                mode ===
                "signup"
            ) {
                const result =
                    await cloudSync
                        .signUp({
                            displayName,
                            email,
                            password
                        });

                setMessage(
                    result
                        ?.session
                        ? "Account created and signed in."
                        : "Account created. Check your email to confirm it, then sign in."
                );
            } else {
                await cloudSync
                    .signIn({
                        email,
                        password
                    });

                setMessage(
                    "Signed in. Loading your garden…"
                );
            }

            setPassword(
                ""
            );
        } catch (
            error
        ) {
            setMessage(
                error?.message ||
                "Unable to complete that account request."
            );
        } finally {
            setBusy(
                false
            );
        }
    }

    async function handleSignOut() {
        setBusy(
            true
        );

        setMessage(
            ""
        );

        try {
            await cloudSync
                .signOut();

            setEditingName(
                false
            );

            setMessage(
                "Signed out. Local garden data remains on this device."
            );
        } catch (
            error
        ) {
            setMessage(
                error?.message ||
                "Unable to sign out right now."
            );
        } finally {
            setBusy(
                false
            );
        }
    }

    async function handleSyncNow() {
        setBusy(
            true
        );

        setMessage(
            ""
        );

        try {
            const saved =
                await cloudSync
                    .saveNow();

            if (saved) {
                setMessage(
                    "Garden synced."
                );
            }
        } finally {
            setBusy(
                false
            );
        }
    }

    return (
        <section
            className="app-settings-section cloud-account-section"
        >
            <div
                className="app-settings-section-heading"
            >
                <span>
                    <Icon
                        name="database"
                        size={18}
                    />
                </span>

                <div>
                    <strong>
                        Account & Cloud Sync
                    </strong>

                    <small>
                        Keep your garden available across devices while local saving stays active.
                    </small>
                </div>
            </div>

            {
                !cloudSync
                    .configured
                    ? (
                        <div
                            className="app-settings-reset-confirmation"
                        >
                            <span
                                className="app-settings-warning-icon"
                            >
                                <Icon
                                    name="warning"
                                    size={20}
                                />
                            </span>

                            <div>
                                <strong>
                                    Cloud sync not configured
                                </strong>

                                <p>
                                    This deployment will continue saving locally until the Supabase environment variables are added.
                                </p>
                            </div>
                        </div>
                    )
                    : cloudSync
                        .user
                        ? (
                            <>
                                <div
                                    className="app-settings-action cloud-account-status"
                                    role="status"
                                >
                                    <span
                                        className="app-settings-action-icon"
                                    >
                                        <Icon
                                            name="check"
                                            size={18}
                                        />
                                    </span>

                                    <div>
                                        <strong>
                                            {
                                                profileName ||
                                                cloudSync
                                                    .user
                                                    .email
                                            }
                                        </strong>

                                        <small>
                                            {
                                                profileName &&
                                                `${cloudSync.user.email} · `
                                            }
                                            {
                                                cloudSync
                                                    .syncMessage
                                            }
                                            {" "}
                                            {
                                                formatLastSynced(
                                                    cloudSync
                                                        .lastSyncedAt
                                                )
                                            }.
                                        </small>
                                    </div>
                                </div>

                                {
                                    editingName &&
                                    (
                                        <form
                                            onSubmit={
                                                handleSaveName
                                            }
                                            className="cloud-account-form"
                                        >
                                            <label>
                                                <span>
                                                    Display name
                                                </span>

                                                <input
                                                    type="text"
                                                    value={
                                                        nameDraft
                                                    }
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            setNameDraft(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                    }
                                                    autoComplete="name"
                                                    maxLength={60}
                                                    autoFocus
                                                />
                                            </label>

                                            <div
                                                className="app-settings-reset-actions"
                                            >
                                                <button
                                                    type="submit"
                                                    className="app-settings-cancel-button"
                                                    disabled={
                                                        busy
                                                    }
                                                >
                                                    {
                                                        busy
                                                            ? "Saving…"
                                                            : "Save Name"
                                                    }
                                                </button>

                                                <button
                                                    type="button"
                                                    className="app-settings-cancel-button"
                                                    onClick={
                                                        () =>
                                                            setEditingName(
                                                                false
                                                            )
                                                    }
                                                    disabled={
                                                        busy
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )
                                }

                                <div
                                    className="app-settings-reset-actions"
                                >
                                    {
                                        !editingName &&
                                        (
                                            <button
                                                type="button"
                                                className="app-settings-cancel-button"
                                                onClick={
                                                    handleStartEditName
                                                }
                                                disabled={
                                                    busy
                                                }
                                            >
                                                {
                                                    profileName
                                                        ? "Edit Name"
                                                        : "Add Name"
                                                }
                                            </button>
                                        )
                                    }

                                    <button
                                        type="button"
                                        className="app-settings-cancel-button"
                                        onClick={
                                            handleSyncNow
                                        }
                                        disabled={
                                            busy
                                        }
                                    >
                                        {
                                            cloudSync
                                                .syncStatus ===
                                            "saving"
                                                ? "Saving…"
                                                : "Sync Now"
                                        }
                                    </button>

                                    <button
                                        type="button"
                                        className="app-settings-cancel-button"
                                        onClick={
                                            handleSignOut
                                        }
                                        disabled={
                                            busy
                                        }
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )
                        : (
                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="cloud-account-form"
                            >
                                <div>
                                    <strong>
                                        {
                                            mode ===
                                            "signup"
                                                ? "Create an account"
                                                : "Sign in"
                                        }
                                    </strong>

                                    <p>
                                        {
                                            cloudSync
                                                .syncMessage
                                        }
                                    </p>
                                </div>

                                {
                                    mode ===
                                        "signup" &&
                                    (
                                        <label>
                                            <span>
                                                Display name
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    displayName
                                                }
                                                onChange={
                                                    (
                                                        event
                                                    ) =>
                                                        setDisplayName(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                }
                                                autoComplete="name"
                                            />
                                        </label>
                                    )
                                }

                                <label>
                                    <span>
                                        Email
                                    </span>

                                    <input
                                        type="email"
                                        value={
                                            email
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        autoComplete="email"
                                        required
                                    />
                                </label>

                                <label>
                                    <span>
                                        Password
                                    </span>

                                    <input
                                        type="password"
                                        value={
                                            password
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        autoComplete={
                                            mode ===
                                            "signup"
                                                ? "new-password"
                                                : "current-password"
                                        }
                                        minLength={6}
                                        required
                                    />
                                </label>

                                <div
                                    className="app-settings-reset-actions"
                                >
                                    <button
                                        type="submit"
                                        className="app-settings-cancel-button"
                                        disabled={
                                            busy
                                        }
                                    >
                                        {
                                            busy
                                                ? "Working…"
                                                : mode ===
                                                    "signup"
                                                    ? "Create Account"
                                                    : "Sign In"
                                        }
                                    </button>

                                    <button
                                        type="button"
                                        className="app-settings-cancel-button"
                                        onClick={
                                            () => {
                                                setMode(
                                                    (
                                                        current
                                                    ) =>
                                                        current ===
                                                        "signin"
                                                            ? "signup"
                                                            : "signin"
                                                );

                                                setMessage(
                                                    ""
                                                );
                                            }
                                        }
                                        disabled={
                                            busy
                                        }
                                    >
                                        {
                                            mode ===
                                            "signin"
                                                ? "Create Account"
                                                : "Use Sign In"
                                        }
                                    </button>
                                </div>
                            </form>
                        )
            }

            {
                message &&
                (
                    <p
                        className="app-settings-inline-message"
                        role="status"
                        aria-live="polite"
                    >
                        {
                            message
                        }
                    </p>
                )
            }
        </section>
    );
}

export default CloudAccountPanel;
