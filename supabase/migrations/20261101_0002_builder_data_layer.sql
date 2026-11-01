-- =========================================================
-- My Garden Builder
-- Database Phase 2
-- Build-first data layer + private photo storage
--
-- Requires Phase 1 tables:
--   gardens, garden_plants, garden_tasks, owned_supplies,
--   watering_records, calendar_events, journal_entries,
--   garden_photos, profiles, user_preferences
-- =========================================================

-- =========================================================
-- GARDEN SPACES
-- Normalized space measurements from manual entry or camera scan.
-- =========================================================

create table if not exists public.garden_spaces (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    client_key text not null,
    space_type text,
    measurement_method text not null default 'manual'
        check (measurement_method in ('manual', 'camera', 'scan', 'imported')),

    length_ft numeric check (length_ft is null or length_ft >= 0),
    width_ft numeric check (width_ft is null or width_ft >= 0),
    height_ft numeric check (height_ft is null or height_ft >= 0),
    area_sqft numeric check (area_sqft is null or area_sqft >= 0),

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, client_key)
);

create index if not exists garden_spaces_garden_id_idx
    on public.garden_spaces(garden_id);

create index if not exists garden_spaces_user_id_idx
    on public.garden_spaces(user_id);

-- =========================================================
-- GARDEN FEATURES
-- Raised beds, paths, irrigation, compost, structures, etc.
-- =========================================================

create table if not exists public.garden_features (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    client_key text not null,
    feature_type text not null default 'feature',
    name text,
    position_x numeric,
    position_y numeric,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, client_key)
);

create index if not exists garden_features_garden_id_idx
    on public.garden_features(garden_id);

-- =========================================================
-- GARDEN MATERIALS
-- Quantities only. No price/budget fields by design.
-- =========================================================

create table if not exists public.garden_materials (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    material_key text not null,
    name text not null,
    category text,
    quantity numeric check (quantity is null or quantity >= 0),
    unit text,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, material_key)
);

create index if not exists garden_materials_garden_id_idx
    on public.garden_materials(garden_id);

-- =========================================================
-- BUILD STEPS
-- Final build instructions generated from the saved design.
-- =========================================================

create table if not exists public.garden_build_steps (
    id uuid primary key default gen_random_uuid(),
    garden_id uuid not null references public.gardens(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,

    step_key text not null,
    step_number integer not null check (step_number >= 1),
    title text not null,
    instructions text,
    completed boolean not null default false,

    data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (garden_id, step_key)
);

create index if not exists garden_build_steps_garden_order_idx
    on public.garden_build_steps(garden_id, step_number);

-- =========================================================
-- UPDATED_AT TRIGGERS
-- Phase 1 already defines public.set_updated_at().
-- =========================================================

drop trigger if exists garden_spaces_set_updated_at on public.garden_spaces;
create trigger garden_spaces_set_updated_at
before update on public.garden_spaces
for each row execute function public.set_updated_at();

drop trigger if exists garden_features_set_updated_at on public.garden_features;
create trigger garden_features_set_updated_at
before update on public.garden_features
for each row execute function public.set_updated_at();

drop trigger if exists garden_materials_set_updated_at on public.garden_materials;
create trigger garden_materials_set_updated_at
before update on public.garden_materials
for each row execute function public.set_updated_at();

drop trigger if exists garden_build_steps_set_updated_at on public.garden_build_steps;
create trigger garden_build_steps_set_updated_at
before update on public.garden_build_steps
for each row execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.garden_spaces enable row level security;
alter table public.garden_features enable row level security;
alter table public.garden_materials enable row level security;
alter table public.garden_build_steps enable row level security;

-- garden_spaces

drop policy if exists "garden_spaces_select_own" on public.garden_spaces;
create policy "garden_spaces_select_own"
on public.garden_spaces for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "garden_spaces_insert_own" on public.garden_spaces;
create policy "garden_spaces_insert_own"
on public.garden_spaces for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_spaces_update_own" on public.garden_spaces;
create policy "garden_spaces_update_own"
on public.garden_spaces for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_spaces_delete_own" on public.garden_spaces;
create policy "garden_spaces_delete_own"
on public.garden_spaces for delete to authenticated
using ((select auth.uid()) = user_id);

-- garden_features

drop policy if exists "garden_features_select_own" on public.garden_features;
create policy "garden_features_select_own"
on public.garden_features for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "garden_features_insert_own" on public.garden_features;
create policy "garden_features_insert_own"
on public.garden_features for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_features_update_own" on public.garden_features;
create policy "garden_features_update_own"
on public.garden_features for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_features_delete_own" on public.garden_features;
create policy "garden_features_delete_own"
on public.garden_features for delete to authenticated
using ((select auth.uid()) = user_id);

-- garden_materials

drop policy if exists "garden_materials_select_own" on public.garden_materials;
create policy "garden_materials_select_own"
on public.garden_materials for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "garden_materials_insert_own" on public.garden_materials;
create policy "garden_materials_insert_own"
on public.garden_materials for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_materials_update_own" on public.garden_materials;
create policy "garden_materials_update_own"
on public.garden_materials for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_materials_delete_own" on public.garden_materials;
create policy "garden_materials_delete_own"
on public.garden_materials for delete to authenticated
using ((select auth.uid()) = user_id);

-- garden_build_steps

drop policy if exists "garden_build_steps_select_own" on public.garden_build_steps;
create policy "garden_build_steps_select_own"
on public.garden_build_steps for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "garden_build_steps_insert_own" on public.garden_build_steps;
create policy "garden_build_steps_insert_own"
on public.garden_build_steps for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_build_steps_update_own" on public.garden_build_steps;
create policy "garden_build_steps_update_own"
on public.garden_build_steps for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "garden_build_steps_delete_own" on public.garden_build_steps;
create policy "garden_build_steps_delete_own"
on public.garden_build_steps for delete to authenticated
using ((select auth.uid()) = user_id);

-- =========================================================
-- PRIVATE GARDEN PHOTO STORAGE
-- Keeps camera/upload image bytes out of localStorage and jsonb.
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
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object path format:
-- <auth-user-id>/<garden-id>/<filename>

drop policy if exists "garden_photo_objects_select_own" on storage.objects;
create policy "garden_photo_objects_select_own"
on storage.objects for select to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "garden_photo_objects_insert_own" on storage.objects;
create policy "garden_photo_objects_insert_own"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "garden_photo_objects_update_own" on storage.objects;
create policy "garden_photo_objects_update_own"
on storage.objects for update to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "garden_photo_objects_delete_own" on storage.objects;
create policy "garden_photo_objects_delete_own"
on storage.objects for delete to authenticated
using (
    bucket_id = 'garden-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);
