import { getSupabase } from "../lib/supabaseClient";

const LEGACY_SOURCE_KEY = "legacy-browser-v1";

function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value ?? {}, key);
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function stableHash(value) {
    const text = typeof value === "string"
        ? value
        : JSON.stringify(value ?? null);

    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
}

function getStableKey(item, index, candidates = []) {
    for (const candidate of ["_syncKey", ...candidates]) {
        const value = item?.[candidate];

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim()
        ) {
            return String(value);
        }
    }

    return `generated-${stableHash(item)}-${index + 1}`;
}

function withSyncKey(item, key) {
    if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
    ) {
        return item;
    }

    if (item._syncKey) {
        return item;
    }

    return {
        ...item,
        _syncKey: key
    };
}

async function requireUser() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error("Sign in to sync garden data.");
    }

    return data.user;
}

export async function getCurrentSession() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session ?? null;
}

export function subscribeToAuthChanges(callback) {
    const supabase = getSupabase();

    const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback?.({
                event,
                session,
                user: session?.user ?? null
            });
        }
    );

    return () => {
        data.subscription.unsubscribe();
    };
}

export async function signUpWithEmail({
    email,
    password,
    displayName
}) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signUp({
        email: email?.trim(),
        password,
        options: {
            data: {
                display_name: displayName?.trim() || null
            }
        }
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signInWithEmail({
    email,
    password
}) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email?.trim(),
        password
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

const PROFILE_COLUMNS = "id, display_name, avatar_path, updated_at";

export async function getProfile() {
    const supabase = getSupabase();
    const user = await requireUser();

    const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function updateProfile({ displayName }) {
    const supabase = getSupabase();
    const user = await requireUser();

    // Upsert so accounts created before the signup trigger still get a row.
    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: user.id,
                display_name: displayName?.trim() || null
            },
            { onConflict: "id" }
        )
        .select(PROFILE_COLUMNS)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function listGardens() {
    const supabase = getSupabase();
    await requireUser();

    const { data, error } = await supabase
        .from("gardens")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getActiveGarden() {
    const supabase = getSupabase();
    await requireUser();

    const { data, error } = await supabase
        .from("gardens")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data ?? null;
}

export async function findGardenBySourceKey(sourceKey) {
    if (!sourceKey) {
        return null;
    }

    const supabase = getSupabase();
    await requireUser();

    const { data, error } = await supabase
        .from("gardens")
        .select("*")
        .eq("source_key", sourceKey)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data ?? null;
}

export async function setActiveGarden(gardenId) {
    const supabase = getSupabase();
    await requireUser();

    const { data, error } = await supabase.rpc(
        "set_active_garden",
        {
            target_garden_id: gardenId
        }
    );

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data[0]
        : data;
}

export async function createGarden({
    name = "My Garden",
    environment = null,
    gardenType = null,
    profileData = {},
    designData = {},
    sourceKey = null,
    makeActive = true
} = {}) {
    const supabase = getSupabase();
    const user = await requireUser();

    if (sourceKey) {
        const existing = await findGardenBySourceKey(
            sourceKey
        );

        if (existing) {
            return (
                makeActive &&
                !existing.is_active
            )
                ? setActiveGarden(existing.id)
                : existing;
        }
    }

    const { data, error } = await supabase
        .from("gardens")
        .insert({
            user_id: user.id,
            name: name?.trim() || "My Garden",
            environment,
            garden_type: gardenType,
            source_key: sourceKey,
            is_active: false,
            profile_data: profileData ?? {},
            design_data: designData ?? {}
        })
        .select("*")
        .single();

    if (error) {
        if (
            sourceKey &&
            error.code === "23505"
        ) {
            const existing =
                await findGardenBySourceKey(
                    sourceKey
                );

            if (existing) {
                return makeActive
                    ? setActiveGarden(existing.id)
                    : existing;
            }
        }

        throw error;
    }

    return makeActive
        ? setActiveGarden(data.id)
        : data;
}

function mapPlantRows(plants) {
    return asArray(plants).map(
        (plant, index) => {
            const key = getStableKey(
                plant,
                index,
                [
                    "plantKey",
                    "clientKey",
                    "id",
                    "cropId"
                ]
            );

            return {
                client_key: key,
                name:
                    plant?.name ||
                    plant?.common_name ||
                    "Plant",
                source: plant?.source || null,
                status: plant?.status || null,
                data: withSyncKey(
                    plant ?? {},
                    key
                )
            };
        }
    );
}

function mapTaskRows(tasks) {
    return asArray(tasks).map(
        (task, index) => {
            const key = getStableKey(
                task,
                index,
                [
                    "id",
                    "taskId",
                    "key"
                ]
            );

            return {
                client_key: key,
                title:
                    task?.title ||
                    task?.text ||
                    "Garden task",
                completed:
                    Boolean(
                        task?.completed
                    ),
                data: withSyncKey(
                    task ?? {},
                    key
                )
            };
        }
    );
}

function mapSupplyRows(supplies) {
    return asArray(supplies).map(
        (supply, index) => {
            const normalized =
                typeof supply === "string"
                    ? {
                        id: supply,
                        value: supply
                    }
                    : (
                        supply ??
                        {}
                    );

            const key = getStableKey(
                normalized,
                index,
                [
                    "id",
                    "supplyId",
                    "key",
                    "name",
                    "value"
                ]
            );

            return {
                client_key: key,
                quantity:
                    normalized.quantity ??
                    null,
                unit:
                    normalized.unit ??
                    null,
                data:
                    typeof supply ===
                    "string"
                        ? supply
                        : withSyncKey(
                            normalized,
                            key
                        )
            };
        }
    );
}

function mapWateringRows(records) {
    return asArray(records).map(
        (record, index) => {
            const key = getStableKey(
                record,
                index,
                [
                    "plantKey",
                    "plant_key",
                    "id"
                ]
            );

            return {
                plant_key: key,
                last_watered_on:
                    record?.lastWateredOn ||
                    record?.last_watered_on ||
                    record?.lastWatered ||
                    null,
                next_check_on:
                    record?.nextCheckOn ||
                    record?.next_check_on ||
                    record?.nextCheck ||
                    record?.nextWatering ||
                    null,
                data: withSyncKey(
                    record ?? {},
                    key
                )
            };
        }
    );
}

function mapEventRows(events) {
    return asArray(events).map(
        (event, index) => {
            const key = getStableKey(
                event,
                index,
                [
                    "id",
                    "eventKey",
                    "key"
                ]
            );

            return {
                event_key: key,
                event_date:
                    event?.eventDate ||
                    event?.event_date ||
                    event?.date ||
                    new Date()
                        .toISOString()
                        .slice(0, 10),
                event_type:
                    event?.eventType ||
                    event?.event_type ||
                    event?.type ||
                    "general",
                title:
                    event?.title ||
                    event?.name ||
                    "Garden event",
                automatic:
                    Boolean(
                        event?.automatic
                    ),
                completed:
                    Boolean(
                        event?.completed
                    ),
                data: withSyncKey(
                    event ?? {},
                    key
                )
            };
        }
    );
}

function mapJournalRows(entries) {
    return asArray(entries).map(
        (entry, index) => {
            const key = getStableKey(
                entry,
                index,
                [
                    "id",
                    "entryKey",
                    "key"
                ]
            );

            return {
                entry_key: key,
                entry_date:
                    entry?.entryDate ||
                    entry?.entry_date ||
                    entry?.date ||
                    new Date()
                        .toISOString()
                        .slice(0, 10),
                title:
                    entry?.title ||
                    null,
                body:
                    entry?.body ||
                    entry?.notes ||
                    entry?.text ||
                    null,
                data: withSyncKey(
                    entry ?? {},
                    key
                )
            };
        }
    );
}

function mapSpaceRows(spaces) {
    return asArray(spaces).map(
        (space, index) => {
            const key = getStableKey(
                space,
                index,
                [
                    "id",
                    "key",
                    "spaceKey"
                ]
            );

            return {
                client_key: key,
                space_type:
                    space?.spaceType ||
                    space?.type ||
                    null,
                measurement_method:
                    space?.measurementMethod ||
                    space?.measurement_method ||
                    "manual",
                length_ft:
                    space?.lengthFt ??
                    space?.length ??
                    null,
                width_ft:
                    space?.widthFt ??
                    space?.width ??
                    null,
                height_ft:
                    space?.heightFt ??
                    space?.height ??
                    null,
                area_sqft:
                    space?.areaSqft ??
                    space?.area ??
                    null,
                data: withSyncKey(
                    space ?? {},
                    key
                )
            };
        }
    );
}

function mapFeatureRows(features) {
    return asArray(features).map(
        (feature, index) => {
            const normalized =
                typeof feature === "string"
                    ? {
                        type: feature,
                        name: feature
                    }
                    : (
                        feature ??
                        {}
                    );

            const key = getStableKey(
                normalized,
                index,
                [
                    "id",
                    "key",
                    "featureKey",
                    "type",
                    "name"
                ]
            );

            return {
                client_key: key,
                feature_type:
                    normalized.featureType ||
                    normalized.type ||
                    "feature",
                name:
                    normalized.name ||
                    null,
                position_x:
                    normalized.positionX ??
                    normalized.x ??
                    null,
                position_y:
                    normalized.positionY ??
                    normalized.y ??
                    null,
                data:
                    typeof feature ===
                    "string"
                        ? feature
                        : withSyncKey(
                            normalized,
                            key
                        )
            };
        }
    );
}

function mapMaterialRows(materials) {
    return asArray(materials).map(
        (material, index) => {
            const key = getStableKey(
                material,
                index,
                [
                    "id",
                    "key",
                    "materialKey",
                    "name"
                ]
            );

            return {
                material_key: key,
                name:
                    material?.name ||
                    "Material",
                category:
                    material?.category ||
                    null,
                quantity:
                    material?.quantity ??
                    null,
                unit:
                    material?.unit ||
                    null,
                data: withSyncKey(
                    material ?? {},
                    key
                )
            };
        }
    );
}

function mapBuildStepRows(steps) {
    return asArray(steps).map(
        (step, index) => {
            const key = getStableKey(
                step,
                index,
                [
                    "id",
                    "key",
                    "stepKey"
                ]
            );

            return {
                step_key: key,
                step_number:
                    step?.stepNumber ??
                    step?.step_number ??
                    index + 1,
                title:
                    step?.title ||
                    `Step ${index + 1}`,
                instructions:
                    step?.instructions ||
                    step?.description ||
                    null,
                completed:
                    Boolean(
                        step?.completed
                    ),
                data: withSyncKey(
                    step ?? {},
                    key
                )
            };
        }
    );
}

const TABLE_MAPPERS = {
    gardenPlants: [
        "garden_plants",
        mapPlantRows
    ],
    gardenTasks: [
        "garden_tasks",
        mapTaskRows
    ],
    ownedSupplies: [
        "owned_supplies",
        mapSupplyRows
    ],
    wateringRecords: [
        "watering_records",
        mapWateringRows
    ],
    calendarEvents: [
        "calendar_events",
        mapEventRows
    ],
    journalEntries: [
        "journal_entries",
        mapJournalRows
    ],
    gardenSpaces: [
        "garden_spaces",
        mapSpaceRows
    ],
    gardenFeatures: [
        "garden_features",
        mapFeatureRows
    ],
    gardenMaterials: [
        "garden_materials",
        mapMaterialRows
    ],
    buildSteps: [
        "garden_build_steps",
        mapBuildStepRows
    ]
};

export async function loadGardenSnapshot(
    gardenId
) {
    const supabase = getSupabase();
    await requireUser();

    const results =
        await Promise.all([
            supabase
                .from("gardens")
                .select("*")
                .eq("id", gardenId)
                .single(),
            supabase
                .from("garden_plants")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("garden_tasks")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("owned_supplies")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("watering_records")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("calendar_events")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("journal_entries")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("garden_spaces")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("garden_features")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("garden_materials")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                ),
            supabase
                .from("garden_build_steps")
                .select("*")
                .eq(
                    "garden_id",
                    gardenId
                )
                .order(
                    "step_number",
                    {
                        ascending: true
                    }
                )
        ]);

    const failed =
        results.find(
            (result) =>
                result.error
        );

    if (failed?.error) {
        throw failed.error;
    }

    const [
        gardenResult,
        plantsResult,
        tasksResult,
        suppliesResult,
        wateringResult,
        eventsResult,
        journalResult,
        spacesResult,
        featuresResult,
        materialsResult,
        buildStepsResult
    ] = results;

    return {
        garden:
            gardenResult.data,
        gardenProfile:
            gardenResult.data
                ?.profile_data ??
            null,
        designData:
            gardenResult.data
                ?.design_data ??
            {},
        gardenPlants:
            (
                plantsResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        gardenTasks:
            (
                tasksResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        ownedSupplies:
            (
                suppliesResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        wateringRecords:
            (
                wateringResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        calendarEvents:
            (
                eventsResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        journalEntries:
            (
                journalResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        gardenSpaces:
            (
                spacesResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        gardenFeatures:
            (
                featuresResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        gardenMaterials:
            (
                materialsResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            ),
        buildSteps:
            (
                buildStepsResult.data ??
                []
            ).map(
                (row) =>
                    row.data
            )
    };
}

export async function saveGardenSnapshot(
    gardenId,
    snapshot = {}
) {
    const supabase = getSupabase();
    await requireUser();

    const gardenChanges = {};

    if (hasOwn(snapshot, "name")) {
        gardenChanges.name =
            snapshot.name;
    }

    if (
        hasOwn(
            snapshot,
            "environment"
        )
    ) {
        gardenChanges.environment =
            snapshot.environment;
    }

    if (
        hasOwn(
            snapshot,
            "gardenType"
        )
    ) {
        gardenChanges.garden_type =
            snapshot.gardenType;
    }

    if (
        hasOwn(
            snapshot,
            "gardenProfile"
        )
    ) {
        gardenChanges.profile_data =
            snapshot.gardenProfile ??
            {};
    }

    if (
        hasOwn(
            snapshot,
            "designData"
        )
    ) {
        gardenChanges.design_data =
            snapshot.designData ??
            {};
    }

    const childRows = {};

    Object.entries(
        TABLE_MAPPERS
    ).forEach(
        ([
            snapshotKey,
            [
                tableName,
                mapper
            ]
        ]) => {
            if (
                hasOwn(
                    snapshot,
                    snapshotKey
                )
            ) {
                childRows[
                    tableName
                ] =
                    mapper(
                        snapshot[
                            snapshotKey
                        ]
                    );
            }
        }
    );

    const { error } =
        await supabase.rpc(
            "save_garden_snapshot",
            {
                target_garden_id:
                    gardenId,
                garden_changes:
                    gardenChanges,
                child_rows:
                    childRows
            }
        );

    if (error) {
        throw error;
    }

    return loadGardenSnapshot(
        gardenId
    );
}

function readStoredJson(
    key
) {
    if (
        typeof window ===
        "undefined"
    ) {
        return undefined;
    }

    const raw =
        window.localStorage
            .getItem(
                key
            );

    if (!raw) {
        return undefined;
    }

    try {
        return JSON.parse(
            raw
        );
    } catch {
        return raw;
    }
}

export function readLegacyGardenSnapshot() {
    const profile =
        readStoredJson(
            "gardenProfile"
        ) ??
        null;

    const designData =
        readStoredJson(
            "gardenDesign"
        ) ??
        readStoredJson(
            "gardenPlan"
        ) ??
        {};

    return {
        name:
            profile?.name ||
            designData?.name ||
            "My Garden",
        environment:
            profile?.environment ||
            designData?.environment ||
            null,
        gardenType:
            profile?.type ||
            designData?.gardenType ||
            null,
        gardenProfile:
            profile,
        designData,
        gardenPlants:
            readStoredJson(
                "gardenPlants"
            ) ??
            [],
        gardenTasks:
            readStoredJson(
                "gardenTasks"
            ) ??
            [],
        ownedSupplies:
            readStoredJson(
                "ownedSupplies"
            ) ??
            [],
        wateringRecords:
            readStoredJson(
                "wateringRecords"
            ) ??
            [],
        calendarEvents:
            readStoredJson(
                "calendarEvents"
            ) ??
            [],
        journalEntries:
            readStoredJson(
                "journalEntries"
            ) ??
            []
    };
}

export async function migrateLegacyGardenToDatabase(
    snapshotOverride = null
) {
    const existing =
        await findGardenBySourceKey(
            LEGACY_SOURCE_KEY
        );

    if (existing) {
        return existing.is_active
            ? existing
            : setActiveGarden(
                existing.id
            );
    }

    const snapshot =
        snapshotOverride ??
        readLegacyGardenSnapshot();

    const garden =
        await createGarden({
            name:
                snapshot.name,
            environment:
                snapshot.environment,
            gardenType:
                snapshot.gardenType,
            profileData:
                snapshot.gardenProfile ??
                {},
            designData:
                snapshot.designData ??
                {},
            sourceKey:
                LEGACY_SOURCE_KEY,
            makeActive:
                true
        });

    await saveGardenSnapshot(
        garden.id,
        snapshot
    );

    return garden;
}
