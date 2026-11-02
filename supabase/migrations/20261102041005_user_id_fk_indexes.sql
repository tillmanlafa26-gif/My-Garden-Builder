-- =========================================================
-- My Garden Builder
-- Database Phase 4
-- Covering indexes for user_id foreign keys
-- Requires migrations 0001 and 0002.
-- =========================================================

create index if not exists garden_tasks_user_id_idx
    on public.garden_tasks(user_id);

create index if not exists owned_supplies_user_id_idx
    on public.owned_supplies(user_id);

create index if not exists journal_entries_user_id_idx
    on public.journal_entries(user_id);

create index if not exists garden_features_user_id_idx
    on public.garden_features(user_id);

create index if not exists garden_materials_user_id_idx
    on public.garden_materials(user_id);

create index if not exists garden_build_steps_user_id_idx
    on public.garden_build_steps(user_id);
