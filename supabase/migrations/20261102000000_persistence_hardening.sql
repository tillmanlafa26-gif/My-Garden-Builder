-- =========================================================
-- My Garden Builder
-- Database Phase 3
-- Persistence hardening + atomic snapshot sync
-- Requires migrations 0001 and 0002.
-- =========================================================

alter table public.gardens
    add column if not exists source_key text;

create unique index if not exists gardens_user_source_key_unique_idx
    on public.gardens(user_id, source_key)
    where source_key is not null;

with ranked as (
    select
        id,
        row_number() over (
            partition by user_id
            order by updated_at desc, created_at desc, id
        ) as rn
    from public.gardens
    where is_active = true
)
update public.gardens as gardens
set is_active = false
from ranked
where gardens.id = ranked.id
  and ranked.rn > 1;

create unique index if not exists gardens_one_active_per_user_idx
    on public.gardens(user_id)
    where is_active = true;

create or replace function public.owns_garden(
    target_garden_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.gardens
        where id = target_garden_id
          and user_id = (select auth.uid())
    );
$$;

revoke all on function public.owns_garden(uuid) from public;
grant execute on function public.owns_garden(uuid) to authenticated;

create or replace function public.set_active_garden(
    target_garden_id uuid
)
returns public.gardens
language plpgsql
security invoker
set search_path = ''
as $$
declare
    selected_garden public.gardens;
begin
    if (select auth.uid()) is null then
        raise exception 'Authentication required';
    end if;

    if not public.owns_garden(target_garden_id) then
        raise exception 'Garden not found or not owned by current user';
    end if;

    update public.gardens
    set is_active = false
    where user_id = (select auth.uid())
      and is_active = true
      and id <> target_garden_id;

    update public.gardens
    set is_active = true
    where id = target_garden_id
      and user_id = (select auth.uid())
    returning *
    into selected_garden;

    return selected_garden;
end;
$$;

revoke all on function public.set_active_garden(uuid) from public;
grant execute on function public.set_active_garden(uuid) to authenticated;

do $$
declare
    target_table text;
    policy_name text;
begin
    foreach target_table in array array[
        'garden_plants',
        'garden_tasks',
        'owned_supplies',
        'watering_records',
        'calendar_events',
        'journal_entries',
        'garden_photos',
        'garden_spaces',
        'garden_features',
        'garden_materials',
        'garden_build_steps'
    ] loop
        foreach policy_name in array array[
            target_table || '_select_own',
            target_table || '_insert_own',
            target_table || '_update_own',
            target_table || '_delete_own'
        ] loop
            execute format(
                'drop policy if exists %I on public.%I',
                policy_name,
                target_table
            );
        end loop;

        execute format(
            'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id and public.owns_garden(garden_id))',
            target_table || '_select_own',
            target_table
        );

        execute format(
            'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id and public.owns_garden(garden_id))',
            target_table || '_insert_own',
            target_table
        );

        execute format(
            'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id and public.owns_garden(garden_id)) with check ((select auth.uid()) = user_id and public.owns_garden(garden_id))',
            target_table || '_update_own',
            target_table
        );

        execute format(
            'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id and public.owns_garden(garden_id))',
            target_table || '_delete_own',
            target_table
        );
    end loop;
end;
$$;

create or replace function public.save_garden_snapshot(
    target_garden_id uuid,
    garden_changes jsonb default '{}'::jsonb,
    child_rows jsonb default '{}'::jsonb
)
returns public.gardens
language plpgsql
security invoker
set search_path = ''
as $$
declare
    owner_id uuid := (select auth.uid());
    saved_garden public.gardens;
begin
    if owner_id is null then
        raise exception 'Authentication required';
    end if;

    if not public.owns_garden(target_garden_id) then
        raise exception 'Garden not found or not owned by current user';
    end if;

    update public.gardens
    set
        name = case
            when garden_changes ? 'name'
                then coalesce(
                    nullif(
                        trim(
                            garden_changes ->> 'name'
                        ),
                        ''
                    ),
                    'My Garden'
                )
            else name
        end,
        environment = case
            when garden_changes ? 'environment'
                then nullif(
                    garden_changes ->> 'environment',
                    ''
                )
            else environment
        end,
        garden_type = case
            when garden_changes ? 'garden_type'
                then nullif(
                    garden_changes ->> 'garden_type',
                    ''
                )
            else garden_type
        end,
        profile_data = case
            when garden_changes ? 'profile_data'
                then coalesce(
                    garden_changes -> 'profile_data',
                    '{}'::jsonb
                )
            else profile_data
        end,
        design_data = case
            when garden_changes ? 'design_data'
                then coalesce(
                    garden_changes -> 'design_data',
                    '{}'::jsonb
                )
            else design_data
        end
    where id = target_garden_id
      and user_id = owner_id
    returning *
    into saved_garden;

    if child_rows ? 'garden_plants' then
        delete from public.garden_plants
        where garden_id = target_garden_id;

        insert into public.garden_plants (
            garden_id,
            user_id,
            client_key,
            name,
            source,
            status,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'client_key',
            coalesce(
                item ->> 'name',
                'Plant'
            ),
            item ->> 'source',
            item ->> 'status',
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_plants',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'garden_tasks' then
        delete from public.garden_tasks
        where garden_id = target_garden_id;

        insert into public.garden_tasks (
            garden_id,
            user_id,
            client_key,
            title,
            completed,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'client_key',
            item ->> 'title',
            coalesce(
                (item ->> 'completed')::boolean,
                false
            ),
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_tasks',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'owned_supplies' then
        delete from public.owned_supplies
        where garden_id = target_garden_id;

        insert into public.owned_supplies (
            garden_id,
            user_id,
            client_key,
            quantity,
            unit,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'client_key',
            nullif(
                item ->> 'quantity',
                ''
            )::numeric,
            item ->> 'unit',
            coalesce(
                item -> 'data',
                'null'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'owned_supplies',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'watering_records' then
        delete from public.watering_records
        where garden_id = target_garden_id;

        insert into public.watering_records (
            garden_id,
            user_id,
            plant_key,
            last_watered_on,
            next_check_on,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'plant_key',
            nullif(
                item ->> 'last_watered_on',
                ''
            )::date,
            nullif(
                item ->> 'next_check_on',
                ''
            )::date,
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'watering_records',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'calendar_events' then
        delete from public.calendar_events
        where garden_id = target_garden_id;

        insert into public.calendar_events (
            garden_id,
            user_id,
            event_key,
            event_date,
            event_type,
            title,
            automatic,
            completed,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'event_key',
            (item ->> 'event_date')::date,
            coalesce(
                item ->> 'event_type',
                'general'
            ),
            coalesce(
                item ->> 'title',
                'Garden event'
            ),
            coalesce(
                (item ->> 'automatic')::boolean,
                false
            ),
            coalesce(
                (item ->> 'completed')::boolean,
                false
            ),
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'calendar_events',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'journal_entries' then
        delete from public.journal_entries
        where garden_id = target_garden_id;

        insert into public.journal_entries (
            garden_id,
            user_id,
            entry_key,
            entry_date,
            title,
            body,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'entry_key',
            (item ->> 'entry_date')::date,
            item ->> 'title',
            item ->> 'body',
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'journal_entries',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'garden_spaces' then
        delete from public.garden_spaces
        where garden_id = target_garden_id;

        insert into public.garden_spaces (
            garden_id,
            user_id,
            client_key,
            space_type,
            measurement_method,
            length_ft,
            width_ft,
            height_ft,
            area_sqft,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'client_key',
            item ->> 'space_type',
            coalesce(
                item ->> 'measurement_method',
                'manual'
            ),
            nullif(
                item ->> 'length_ft',
                ''
            )::numeric,
            nullif(
                item ->> 'width_ft',
                ''
            )::numeric,
            nullif(
                item ->> 'height_ft',
                ''
            )::numeric,
            nullif(
                item ->> 'area_sqft',
                ''
            )::numeric,
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_spaces',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'garden_features' then
        delete from public.garden_features
        where garden_id = target_garden_id;

        insert into public.garden_features (
            garden_id,
            user_id,
            client_key,
            feature_type,
            name,
            position_x,
            position_y,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'client_key',
            coalesce(
                item ->> 'feature_type',
                'feature'
            ),
            item ->> 'name',
            nullif(
                item ->> 'position_x',
                ''
            )::numeric,
            nullif(
                item ->> 'position_y',
                ''
            )::numeric,
            coalesce(
                item -> 'data',
                'null'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_features',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'garden_materials' then
        delete from public.garden_materials
        where garden_id = target_garden_id;

        insert into public.garden_materials (
            garden_id,
            user_id,
            material_key,
            name,
            category,
            quantity,
            unit,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'material_key',
            coalesce(
                item ->> 'name',
                'Material'
            ),
            item ->> 'category',
            nullif(
                item ->> 'quantity',
                ''
            )::numeric,
            item ->> 'unit',
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_materials',
                '[]'::jsonb
            )
        ) item;
    end if;

    if child_rows ? 'garden_build_steps' then
        delete from public.garden_build_steps
        where garden_id = target_garden_id;

        insert into public.garden_build_steps (
            garden_id,
            user_id,
            step_key,
            step_number,
            title,
            instructions,
            completed,
            data
        )
        select
            target_garden_id,
            owner_id,
            item ->> 'step_key',
            coalesce(
                (item ->> 'step_number')::integer,
                1
            ),
            coalesce(
                item ->> 'title',
                'Build step'
            ),
            item ->> 'instructions',
            coalesce(
                (item ->> 'completed')::boolean,
                false
            ),
            coalesce(
                item -> 'data',
                '{}'::jsonb
            )
        from jsonb_array_elements(
            coalesce(
                child_rows -> 'garden_build_steps',
                '[]'::jsonb
            )
        ) item;
    end if;

    return saved_garden;
end;
$$;

revoke all on function public.save_garden_snapshot(uuid, jsonb, jsonb) from public;
grant execute on function public.save_garden_snapshot(uuid, jsonb, jsonb) to authenticated;

create unique index if not exists garden_photos_one_primary_per_garden_idx
    on public.garden_photos(garden_id)
    where is_primary = true;
