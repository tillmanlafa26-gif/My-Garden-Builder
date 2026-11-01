-- =========================================================
-- My Garden Builder
-- Database Phase 1
-- Initial Supabase / PostgreSQL schema
--
-- Goals:
-- 1. Keep each user's garden data private with RLS.
-- 2. Preserve the app's current flexible JavaScript data structures
--    using jsonb while still normalizing records that will grow over time.
-- 3. Keep garden photos out of localStorage/base64 database fields.
-- 4. Prepare for multi-device sync without changing the current UI yet.
-- =========================================================


-- =========================================================
-- UPDATED_AT HELPER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- =========================================================
-- USER PROFILE
-- One row per Supabase Auth user.
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    avatar_path text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is
'Private application profile associated with a Supabase Auth user.';


-- =========================================================
-- USER PREFERENCES
-- Maps current local settings such as gardenTheme,
-- gardenScore, and gardenOnboardingSeen.
-- =========================================================

create table if not exists public.user_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    theme text not null default 'light'
        check (theme in ('light', 'dark', 'system')),
    sustainability_score integer not null default 0
        check (
            sustainability_score >= 0
            and sustainability_score <= 100
        ),
    onboarding_seen boolean not null default false,
    preferences jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.user_preferences is
'Per-user application preferences and lightweight settings.';


-- =========================================================
-- GARDENS
--
-- profile_data:
--   High-level garden profile information.
--
-- design_data:
--   Current builder/design state including generated layout,
--   planting plan, materials, build plan, and indoor layout.
--
-- IMPORTANT:
--   Do not store the raw base64 camera image inside design_data.
--   Photo bytes belong in Supabase Storage and garden_photos.
-- =========================================================

create table if not exists public.gardens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,

    name text not null default 'My Garden',

    environment text
        check (
            environment is null
            or environment in ('indoor', 'outdoor')
        ),

    garden_type text,

    is_active boolean not null default false,

    profile_data jsonb not null default '{}'::jsonb,
    design_data jsonb not null default '{}'::jsonb,

    schema_version integer not null default 1
        check (schema_version >= 1),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.gardens is
'Top-level saved garden. Complex builder state remains jsonb for compatibility with the existing React app.';

create index if not exists gardens_user_id_idx
    on public.gardens(user_id);

create index if not exists gardens_user_updated_idx
    on public.gardens(user_id, updated_at desc);


-- =========================================================
-- GARDEN PLANTS
-- Maps current gardenPlants.
--
-- client_key preserves the stable frontend plantKey/id semantics.
-- data stores the complete normalized plant object.
-- =========================================================

create table if not exists public.garden_plants (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    client_key text not null,
    name text not null,
    source text,
    status text,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, client_key)
);

comment on table public.garden_plants is
'Tracked indoor/outdoor plants. data preserves the app plant object while client_key gives stable synchronization identity.';

create index if not exists garden_plants_garden_id_idx
    on public.garden_plants(garden_id);

create index if not exists garden_plants_user_id_idx
    on public.garden_plants(user_id);


-- =========================================================
-- GARDEN TASKS
-- Maps current gardenTasks.
-- =========================================================

create table if not exists public.garden_tasks (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    client_key text not null,
    title text,
    completed boolean not null default false,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, client_key)
);

create index if not exists garden_tasks_garden_id_idx
    on public.garden_tasks(garden_id);


-- =========================================================
-- OWNED SUPPLIES
-- Maps current ownedSupplies.
-- =========================================================

create table if not exists public.owned_supplies (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    client_key text not null,
    quantity numeric,
    unit text,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, client_key)
);

create index if not exists owned_supplies_garden_id_idx
    on public.owned_supplies(garden_id);


-- =========================================================
-- WATERING RECORDS
-- Maps current wateringRecords.
-- One record per plant per garden.
-- =========================================================

create table if not exists public.watering_records (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    plant_key text not null,
    last_watered_on date,
    next_check_on date,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, plant_key)
);

create index if not exists watering_records_garden_id_idx
    on public.watering_records(garden_id);

create index if not exists watering_records_next_check_idx
    on public.watering_records(user_id, next_check_on);


-- =========================================================
-- CALENDAR EVENTS
-- Maps current calendarEvents.
-- event_key preserves the existing frontend event id.
-- =========================================================

create table if not exists public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    event_key text not null,
    event_date date not null,
    event_type text not null default 'general',
    title text not null,

    automatic boolean not null default false,
    completed boolean not null default false,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, event_key)
);

create index if not exists calendar_events_garden_date_idx
    on public.calendar_events(garden_id, event_date);

create index if not exists calendar_events_user_date_idx
    on public.calendar_events(user_id, event_date);


-- =========================================================
-- JOURNAL ENTRIES
-- Maps current journalEntries.
-- =========================================================

create table if not exists public.journal_entries (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    entry_key text not null,
    entry_date date not null default current_date,
    title text,
    body text,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, entry_key)
);

create index if not exists journal_entries_garden_date_idx
    on public.journal_entries(garden_id, entry_date desc);


-- =========================================================
-- GARDEN PHOTOS
--
-- Actual image bytes are stored in Supabase Storage.
-- storage_path points to:
--   <user_id>/<garden_id>/<unique-file-name>.jpg
--
-- markup_data stores:
--   usable area, calibration, and manual obstacle marks.
--
-- analysis_data stores:
--   AI vision results such as visible surface, obstacles,
--   structures, and usable-area suggestions.
-- =========================================================

create table if not exists public.garden_photos (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    storage_path text not null,
    source text
        check (
            source is null
            or source in ('camera', 'upload')
        ),

    width integer
        check (
            width is null
            or width > 0
        ),

    height integer
        check (
            height is null
            or height > 0
        ),

    mime_type text not null default 'image/jpeg',

    is_primary boolean not null default true,

    markup_data jsonb not null default '{}'::jsonb,
    analysis_data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, storage_path)
);

create index if not exists garden_photos_garden_id_idx
    on public.garden_photos(garden_id);

create index if not exists garden_photos_user_id_idx
    on public.garden_photos(user_id);


-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists profiles_set_updated_at
    on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists user_preferences_set_updated_at
    on public.user_preferences;

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();


drop trigger if exists gardens_set_updated_at
    on public.gardens;

create trigger gardens_set_updated_at
before update on public.gardens
for each row
execute function public.set_updated_at();


drop trigger if exists garden_plants_set_updated_at
    on public.garden_plants;

create trigger garden_plants_set_updated_at
before update on public.garden_plants
for each row
execute function public.set_updated_at();


drop trigger if exists garden_tasks_set_updated_at
    on public.garden_tasks;

create trigger garden_tasks_set_updated_at
before update on public.garden_tasks
for each row
execute function public.set_updated_at();


drop trigger if exists owned_supplies_set_updated_at
    on public.owned_supplies;

create trigger owned_supplies_set_updated_at
before update on public.owned_supplies
for each row
execute function public.set_updated_at();


drop trigger if exists watering_records_set_updated_at
    on public.watering_records;

create trigger watering_records_set_updated_at
before update on public.watering_records
for each row
execute function public.set_updated_at();


drop trigger if exists calendar_events_set_updated_at
    on public.calendar_events;

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row
execute function public.set_updated_at();


drop trigger if exists journal_entries_set_updated_at
    on public.journal_entries;

create trigger journal_entries_set_updated_at
before update on public.journal_entries
for each row
execute function public.set_updated_at();


drop trigger if exists garden_photos_set_updated_at
    on public.garden_photos;

create trigger garden_photos_set_updated_at
before update on public.garden_photos
for each row
execute function public.set_updated_at();


-- =========================================================
-- AUTO-CREATE PROFILE + PREFERENCES AFTER SIGN-UP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        display_name
    )
    values (
        new.id,
        nullif(
            new.raw_user_meta_data ->> 'display_name',
            ''
        )
    )
    on conflict (id) do nothing;

    insert into public.user_preferences (
        user_id
    )
    values (
        new.id
    )
    on conflict (user_id) do nothing;

    return new;
end;
$$;


drop trigger if exists on_auth_user_created
    on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- =========================================================
-- ROW LEVEL SECURITY
-- Every application table is private by default.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.gardens enable row level security;
alter table public.garden_plants enable row level security;
alter table public.garden_tasks enable row level security;
alter table public.owned_supplies enable row level security;
alter table public.watering_records enable row level security;
alter table public.calendar_events enable row level security;
alter table public.journal_entries enable row level security;
alter table public.garden_photos enable row level security;


-- =========================================================
-- PROFILES RLS
-- =========================================================

drop policy if exists "profiles_select_own"
    on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
    (select auth.uid()) = id
);


drop policy if exists "profiles_insert_own"
    on public.profiles;

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
    (select auth.uid()) = id
);


drop policy if exists "profiles_update_own"
    on public.profiles;

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
    (select auth.uid()) = id
)
with check (
    (select auth.uid()) = id
);


drop policy if exists "profiles_delete_own"
    on public.profiles;

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (
    (select auth.uid()) = id
);


-- =========================================================
-- USER PREFERENCES RLS
-- =========================================================

drop policy if exists "user_preferences_select_own"
    on public.user_preferences;

create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "user_preferences_insert_own"
    on public.user_preferences;

create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "user_preferences_update_own"
    on public.user_preferences;

create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "user_preferences_delete_own"
    on public.user_preferences;

create policy "user_preferences_delete_own"
on public.user_preferences
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- =========================================================
-- REUSABLE USER-OWNED TABLE POLICIES
-- Separate policies are intentionally used for each operation.
-- =========================================================

-- gardens

drop policy if exists "gardens_select_own"
    on public.gardens;

create policy "gardens_select_own"
on public.gardens
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "gardens_insert_own"
    on public.gardens;

create policy "gardens_insert_own"
on public.gardens
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "gardens_update_own"
    on public.gardens;

create policy "gardens_update_own"
on public.gardens
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "gardens_delete_own"
    on public.gardens;

create policy "gardens_delete_own"
on public.gardens
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- garden_plants

drop policy if exists "garden_plants_select_own"
    on public.garden_plants;

create policy "garden_plants_select_own"
on public.garden_plants
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_plants_insert_own"
    on public.garden_plants;

create policy "garden_plants_insert_own"
on public.garden_plants
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_plants_update_own"
    on public.garden_plants;

create policy "garden_plants_update_own"
on public.garden_plants
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_plants_delete_own"
    on public.garden_plants;

create policy "garden_plants_delete_own"
on public.garden_plants
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- garden_tasks

drop policy if exists "garden_tasks_select_own"
    on public.garden_tasks;

create policy "garden_tasks_select_own"
on public.garden_tasks
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_tasks_insert_own"
    on public.garden_tasks;

create policy "garden_tasks_insert_own"
on public.garden_tasks
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_tasks_update_own"
    on public.garden_tasks;

create policy "garden_tasks_update_own"
on public.garden_tasks
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_tasks_delete_own"
    on public.garden_tasks;

create policy "garden_tasks_delete_own"
on public.garden_tasks
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- owned_supplies

drop policy if exists "owned_supplies_select_own"
    on public.owned_supplies;

create policy "owned_supplies_select_own"
on public.owned_supplies
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "owned_supplies_insert_own"
    on public.owned_supplies;

create policy "owned_supplies_insert_own"
on public.owned_supplies
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "owned_supplies_update_own"
    on public.owned_supplies;

create policy "owned_supplies_update_own"
on public.owned_supplies
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "owned_supplies_delete_own"
    on public.owned_supplies;

create policy "owned_supplies_delete_own"
on public.owned_supplies
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- watering_records

drop policy if exists "watering_records_select_own"
    on public.watering_records;

create policy "watering_records_select_own"
on public.watering_records
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "watering_records_insert_own"
    on public.watering_records;

create policy "watering_records_insert_own"
on public.watering_records
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "watering_records_update_own"
    on public.watering_records;

create policy "watering_records_update_own"
on public.watering_records
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "watering_records_delete_own"
    on public.watering_records;

create policy "watering_records_delete_own"
on public.watering_records
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- calendar_events

drop policy if exists "calendar_events_select_own"
    on public.calendar_events;

create policy "calendar_events_select_own"
on public.calendar_events
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "calendar_events_insert_own"
    on public.calendar_events;

create policy "calendar_events_insert_own"
on public.calendar_events
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "calendar_events_update_own"
    on public.calendar_events;

create policy "calendar_events_update_own"
on public.calendar_events
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "calendar_events_delete_own"
    on public.calendar_events;

create policy "calendar_events_delete_own"
on public.calendar_events
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- journal_entries

drop policy if exists "journal_entries_select_own"
    on public.journal_entries;

create policy "journal_entries_select_own"
on public.journal_entries
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "journal_entries_insert_own"
    on public.journal_entries;

create policy "journal_entries_insert_own"
on public.journal_entries
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "journal_entries_update_own"
    on public.journal_entries;

create policy "journal_entries_update_own"
on public.journal_entries
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "journal_entries_delete_own"
    on public.journal_entries;

create policy "journal_entries_delete_own"
on public.journal_entries
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- garden_photos

drop policy if exists "garden_photos_select_own"
    on public.garden_photos;

create policy "garden_photos_select_own"
on public.garden_photos
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_photos_insert_own"
    on public.garden_photos;

create policy "garden_photos_insert_own"
on public.garden_photos
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_photos_update_own"
    on public.garden_photos;

create policy "garden_photos_update_own"
on public.garden_photos
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


drop policy if exists "garden_photos_delete_own"
    on public.garden_photos;

create policy "garden_photos_delete_own"
on public.garden_photos
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- =========================================================
-- DATA API GRANTS
--
-- New Supabase projects no longer automatically expose newly
-- created tables to API roles, so grants are explicit.
-- No anon access is granted to private garden data.
-- =========================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.user_preferences
to authenticated;

grant select, insert, update, delete
on table public.gardens
to authenticated;

grant select, insert, update, delete
on table public.garden_plants
to authenticated;

grant select, insert, update, delete
on table public.garden_tasks
to authenticated;

grant select, insert, update, delete
on table public.owned_supplies
to authenticated;

grant select, insert, update, delete
on table public.watering_records
to authenticated;

grant select, insert, update, delete
on table public.calendar_events
to authenticated;

grant select, insert, update, delete
on table public.journal_entries
to authenticated;

grant select, insert, update, delete
on table public.garden_photos
to authenticated;


-- =========================================================
-- PRIVATE STORAGE BUCKET FOR GARDEN PHOTOS
-- Standard uploads are appropriate because the app already
-- compresses photos well below Supabase's recommended threshold
-- for standard uploads.
-- =========================================================

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'garden-photos',
    'garden-photos',
    false,
    6291456,
    array[
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;


-- =========================================================
-- STORAGE RLS
--
-- Required storage path format:
--   <auth.uid()>/<garden_id>/<filename>
--
-- Using the user's UUID as the first folder keeps storage
-- ownership easy to enforce with RLS.
-- =========================================================

drop policy if exists "garden_photos_storage_select_own"
    on storage.objects;

create policy "garden_photos_storage_select_own"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);


drop policy if exists "garden_photos_storage_insert_own"
    on storage.objects;

create policy "garden_photos_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);


drop policy if exists "garden_photos_storage_update_own"
    on storage.objects;

create policy "garden_photos_storage_update_own"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);


drop policy if exists "garden_photos_storage_delete_own"
    on storage.objects;

create policy "garden_photos_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);


-- =========================================================
-- END DATABASE PHASE 1
-- =========================================================
