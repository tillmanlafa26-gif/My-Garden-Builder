import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    hasSupabaseConfig
} from "../lib/supabaseClient";

import {
    createGarden,
    getActiveGarden,
    getCurrentSession,
    listGardens,
    loadGardenSnapshot,
    migrateLegacyGardenToDatabase,
    saveGardenSnapshot,
    setActiveGarden,
    signInWithEmail,
    signOut as signOutFromSupabase,
    signUpWithEmail,
    subscribeToAuthChanges
} from "../services/cloudGardenRepository";

const AUTOSAVE_DELAY_MS = 1600;

function stripImageDataUrls(
    value
) {
    if (
        Array.isArray(
            value
        )
    ) {
        return value.map(
            stripImageDataUrls
        );
    }

    if (
        !value ||
        typeof value !==
            "object"
    ) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(
            value
        )
            .filter(
                ([
                    key,
                    childValue
                ]) => {
                    if (
                        key ===
                            "dataUrl" &&
                        typeof childValue ===
                            "string"
                    ) {
                        return false;
                    }

                    if (
                        typeof childValue ===
                            "string" &&
                        childValue.startsWith(
                            "data:image/"
                        )
                    ) {
                        return false;
                    }

                    return true;
                }
            )
            .map(
                ([
                    key,
                    childValue
                ]) => [
                    key,
                    stripImageDataUrls(
                        childValue
                    )
                ]
            )
    );
}

function deriveDesignCollections(
    gardenProfile
) {
    const designSpace =
        gardenProfile
            ?.designSpace ??
        {};

    const defaultSpace =
        gardenProfile
            ? [
                {
                    id:
                        "primary-space",
                    spaceType:
                        designSpace
                            .spaceType ||
                        gardenProfile
                            .type ||
                        null,
                    measurementMethod:
                        designSpace
                            .spacePhoto
                            ? "camera"
                            : "manual",
                    length:
                        designSpace
                            .length ??
                        null,
                    width:
                        designSpace
                            .width ??
                        null,
                    height:
                        designSpace
                            .height ??
                        null,
                    area:
                        Number(
                            designSpace
                                .length
                        ) >
                            0 &&
                        Number(
                            designSpace
                                .width
                        ) >
                            0
                            ? Number(
                                designSpace
                                    .length
                            ) *
                              Number(
                                  designSpace
                                      .width
                              )
                            : null,
                    unit:
                        designSpace
                            .unit ||
                        "ft"
                }
            ]
            : [];

    return {
        gardenSpaces:
            Array.isArray(
                designSpace
                    .spaces
            ) &&
            designSpace
                .spaces
                .length
                ? designSpace
                    .spaces
                : defaultSpace,
        gardenFeatures:
            Array.isArray(
                designSpace
                    .features
            )
                ? designSpace
                    .features
                : [],
        gardenMaterials:
            Array.isArray(
                designSpace
                    .materials
            )
                ? designSpace
                    .materials
                : (
                    designSpace
                        .materials
                        ?.materials ||
                    designSpace
                        .indoorMaterials
                        ?.materials ||
                    []
                ),
        buildSteps:
            Array.isArray(
                designSpace
                    .buildSteps
            )
                ? designSpace
                    .buildSteps
                : (
                    designSpace
                        .buildPlan
                        ?.stages ||
                    designSpace
                        .indoorBuildPlan
                        ?.stages ||
                    []
                )
    };
}

function preserveLocalPhoto(
    cloudProfile,
    localProfile
) {
    const localPhoto =
        localProfile
            ?.designSpace
            ?.spacePhoto;

    if (
        !localPhoto
            ?.dataUrl ||
        cloudProfile
            ?.designSpace
            ?.spacePhoto
            ?.dataUrl
    ) {
        return cloudProfile;
    }

    return {
        ...cloudProfile,
        designSpace: {
            ...(
                cloudProfile
                    ?.designSpace ??
                {}
            ),
            spacePhoto: {
                ...(
                    cloudProfile
                        ?.designSpace
                        ?.spacePhoto ??
                    {}
                ),
                ...localPhoto
            }
        }
    };
}

export default function useGardenPersistence({
    tasks,
    setTasks,
    gardenProfile,
    setGardenProfile,
    ownedSupplies,
    setOwnedSupplies,
    gardenPlants,
    setGardenPlants,
    calendarEvents,
    setCalendarEvents,
    wateringRecords,
    setWateringRecords,
    journalEntries,
    setJournalEntries
}) {
    const [
        session,
        setSession
    ] = useState(
        null
    );

    const [
        activeGardenId,
        setActiveGardenId
    ] = useState(
        null
    );

    const [
        syncStatus,
        setSyncStatus
    ] = useState(
        hasSupabaseConfig
            ? "checking"
            : "local-only"
    );

    const [
        syncMessage,
        setSyncMessage
    ] = useState(
        hasSupabaseConfig
            ? "Checking cloud account…"
            : "Cloud sync is not configured. Your garden is still saved in this browser."
    );

    const [
        lastSyncedAt,
        setLastSyncedAt
    ] = useState(
        null
    );

    const hydrationRef =
        useRef(
            false
        );

    const readyForAutosaveRef =
        useRef(
            false
        );

    const snapshotRef =
        useRef(
            null
        );

    const profileRef =
        useRef(
            gardenProfile
        );

    const autosaveTimerRef =
        useRef(
            null
        );

    const loadSequenceRef =
        useRef(
            0
        );

    const currentSnapshot =
        useMemo(
            () => {
                const cleanProfile =
                    stripImageDataUrls(
                        gardenProfile
                    );

                const collections =
                    deriveDesignCollections(
                        cleanProfile
                    );

                return {
                    name:
                        cleanProfile
                            ?.name ||
                        "My Garden",
                    environment:
                        cleanProfile
                            ?.environment ||
                        null,
                    gardenType:
                        cleanProfile
                            ?.type ||
                        null,
                    gardenProfile:
                        cleanProfile,
                    designData:
                        cleanProfile
                            ?.designSpace ??
                        {},
                    gardenPlants,
                    gardenTasks:
                        tasks,
                    ownedSupplies,
                    wateringRecords,
                    calendarEvents,
                    journalEntries,
                    ...collections
                };
            },
            [
                calendarEvents,
                gardenPlants,
                gardenProfile,
                journalEntries,
                ownedSupplies,
                tasks,
                wateringRecords
            ]
        );

    useEffect(
        () => {
            snapshotRef
                .current =
                currentSnapshot;

            profileRef
                .current =
                gardenProfile;
        },
        [
            currentSnapshot,
            gardenProfile
        ]
    );

    const hydrateFromSnapshot =
        useCallback(
            (
                snapshot
            ) => {
                if (
                    !snapshot
                ) {
                    return;
                }

                hydrationRef
                    .current =
                    true;

                readyForAutosaveRef
                    .current =
                    false;

                const nextProfile =
                    preserveLocalPhoto(
                        snapshot
                            .gardenProfile ??
                        snapshot
                            .garden
                            ?.profile_data ??
                        null,
                        profileRef
                            .current
                    );

                setGardenProfile(
                    nextProfile
                );

                setGardenPlants(
                    snapshot
                        .gardenPlants ??
                    []
                );

                setTasks(
                    snapshot
                        .gardenTasks ??
                    []
                );

                setOwnedSupplies(
                    snapshot
                        .ownedSupplies ??
                    []
                );

                setWateringRecords(
                    snapshot
                        .wateringRecords ??
                    []
                );

                setCalendarEvents(
                    snapshot
                        .calendarEvents ??
                    []
                );

                setJournalEntries(
                    snapshot
                        .journalEntries ??
                    []
                );

                window.setTimeout(
                    () => {
                        hydrationRef
                            .current =
                            false;

                        readyForAutosaveRef
                            .current =
                            true;
                    },
                    0
                );
            },
            [
                setCalendarEvents,
                setGardenPlants,
                setGardenProfile,
                setJournalEntries,
                setOwnedSupplies,
                setTasks,
                setWateringRecords
            ]
        );

    const loadForSession =
        useCallback(
            async (
                nextSession
            ) => {
                const sequence =
                    loadSequenceRef
                        .current +
                    1;

                loadSequenceRef
                    .current =
                    sequence;

                if (
                    !nextSession
                        ?.user
                ) {
                    setActiveGardenId(
                        null
                    );

                    readyForAutosaveRef
                        .current =
                        false;

                    setSyncStatus(
                        "local-only"
                    );

                    setSyncMessage(
                        "Signed out. Garden changes continue saving in this browser."
                    );

                    return;
                }

                setSyncStatus(
                    "loading"
                );

                setSyncMessage(
                    "Loading your saved garden…"
                );

                try {
                    let garden =
                        await getActiveGarden();

                    if (
                        !garden
                    ) {
                        const gardens =
                            await listGardens();

                        if (
                            gardens
                                .length
                        ) {
                            garden =
                                await setActiveGarden(
                                    gardens[
                                        0
                                    ].id
                                );
                        } else {
                            garden =
                                await migrateLegacyGardenToDatabase(
                                    snapshotRef
                                        .current
                                );
                        }
                    }

                    if (
                        sequence !==
                        loadSequenceRef
                            .current
                    ) {
                        return;
                    }

                    setActiveGardenId(
                        garden.id
                    );

                    const snapshot =
                        await loadGardenSnapshot(
                            garden.id
                        );

                    if (
                        sequence !==
                        loadSequenceRef
                            .current
                    ) {
                        return;
                    }

                    hydrateFromSnapshot(
                        snapshot
                    );

                    setSyncStatus(
                        "saved"
                    );

                    setSyncMessage(
                        "Cloud garden loaded and ready to sync."
                    );

                    setLastSyncedAt(
                        new Date()
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "Unable to load cloud garden:",
                        error
                    );

                    readyForAutosaveRef
                        .current =
                        false;

                    setSyncStatus(
                        "error"
                    );

                    setSyncMessage(
                        "Cloud sync is unavailable right now. Your browser copy remains safe."
                    );
                }
            },
            [
                hydrateFromSnapshot
            ]
        );

    useEffect(
        () => {
            if (
                !hasSupabaseConfig
            ) {
                return undefined;
            }

            let cancelled =
                false;

            getCurrentSession()
                .then(
                    (
                        initialSession
                    ) => {
                        if (
                            cancelled
                        ) {
                            return;
                        }

                        setSession(
                            initialSession
                        );

                        return loadForSession(
                            initialSession
                        );
                    }
                )
                .catch(
                    (
                        error
                    ) => {
                        console.error(
                            "Unable to restore Supabase session:",
                            error
                        );

                        setSyncStatus(
                            "error"
                        );

                        setSyncMessage(
                            "Cloud sign-in could not be restored. Local saving is still active."
                        );
                    }
                );

            const unsubscribe =
                subscribeToAuthChanges(
                    ({
                        session:
                            nextSession
                    }) => {
                        if (
                            cancelled
                        ) {
                            return;
                        }

                        setSession(
                            nextSession
                        );

                        loadForSession(
                            nextSession
                        );
                    }
                );

            return () => {
                cancelled =
                    true;

                unsubscribe();
            };
        },
        [
            loadForSession
        ]
    );

    const saveNow =
        useCallback(
            async () => {
                if (
                    !hasSupabaseConfig
                ) {
                    setSyncStatus(
                        "local-only"
                    );

                    setSyncMessage(
                        "Cloud sync is not configured. This garden is saved locally."
                    );

                    return null;
                }

                if (
                    !session
                        ?.user
                ) {
                    setSyncStatus(
                        "local-only"
                    );

                    setSyncMessage(
                        "Sign in to sync this garden across devices."
                    );

                    return null;
                }

                setSyncStatus(
                    "saving"
                );

                setSyncMessage(
                    "Saving garden to the cloud…"
                );

                try {
                    let gardenId =
                        activeGardenId;

                    if (
                        !gardenId
                    ) {
                        const garden =
                            await createGarden({
                                name:
                                    currentSnapshot
                                        .name,
                                environment:
                                    currentSnapshot
                                        .environment,
                                gardenType:
                                    currentSnapshot
                                        .gardenType,
                                profileData:
                                    currentSnapshot
                                        .gardenProfile ??
                                    {},
                                designData:
                                    currentSnapshot
                                        .designData ??
                                    {},
                                makeActive:
                                    true
                            });

                        gardenId =
                            garden.id;

                        setActiveGardenId(
                            gardenId
                        );
                    }

                    const saved =
                        await saveGardenSnapshot(
                            gardenId,
                            currentSnapshot
                        );

                    setSyncStatus(
                        "saved"
                    );

                    setSyncMessage(
                        "Garden saved to the cloud."
                    );

                    setLastSyncedAt(
                        new Date()
                    );

                    return saved;
                } catch (
                    error
                ) {
                    console.error(
                        "Unable to save cloud garden:",
                        error
                    );

                    setSyncStatus(
                        "error"
                    );

                    setSyncMessage(
                        "Cloud save failed. Your latest changes are still saved in this browser."
                    );

                    return null;
                }
            },
            [
                activeGardenId,
                currentSnapshot,
                session
            ]
        );

    useEffect(
        () => {
            if (
                !hasSupabaseConfig ||
                !session?.user ||
                !activeGardenId ||
                hydrationRef
                    .current ||
                !readyForAutosaveRef
                    .current
            ) {
                return undefined;
            }

            window.clearTimeout(
                autosaveTimerRef
                    .current
            );

            setSyncStatus(
                "pending"
            );

            setSyncMessage(
                "Changes saved locally. Cloud sync pending…"
            );

            autosaveTimerRef
                .current =
                window.setTimeout(
                    () => {
                        saveNow();
                    },
                    AUTOSAVE_DELAY_MS
                );

            return () => {
                window.clearTimeout(
                    autosaveTimerRef
                        .current
                );
            };
        },
        [
            activeGardenId,
            currentSnapshot,
            saveNow,
            session
        ]
    );

    const signIn =
        useCallback(
            async (
                credentials
            ) => {
                setSyncStatus(
                    "loading"
                );

                setSyncMessage(
                    "Signing in…"
                );

                return signInWithEmail(
                    credentials
                );
            },
            []
        );

    const signUp =
        useCallback(
            async (
                details
            ) => {
                setSyncStatus(
                    "loading"
                );

                setSyncMessage(
                    "Creating your account…"
                );

                const result =
                    await signUpWithEmail(
                        details
                    );

                if (
                    !result
                        .session
                ) {
                    setSyncStatus(
                        "local-only"
                    );

                    setSyncMessage(
                        "Account created. Check your email to confirm it, then sign in to sync."
                    );
                }

                return result;
            },
            []
        );

    const signOut =
        useCallback(
            async () => {
                await signOutFromSupabase();

                setSession(
                    null
                );

                setActiveGardenId(
                    null
                );

                readyForAutosaveRef
                    .current =
                    false;

                setSyncStatus(
                    "local-only"
                );

                setSyncMessage(
                    "Signed out. Your local garden remains on this device."
                );
            },
            []
        );

    return {
        configured:
            hasSupabaseConfig,
        session,
        user:
            session?.user ??
            null,
        activeGardenId,
        syncStatus,
        syncMessage,
        lastSyncedAt,
        saveNow,
        signIn,
        signUp,
        signOut
    };
}
