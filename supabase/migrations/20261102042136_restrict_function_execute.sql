-- =========================================================
-- My Garden Builder
-- Database Phase 5
-- Restrict EXECUTE on SECURITY DEFINER functions
-- Requires migrations 0001 and 0003.
-- =========================================================

-- Trigger-only function; no role needs to call it through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Supabase grants anon EXECUTE directly, so 0003's revoke from public was not
-- enough. authenticated keeps EXECUTE because the child-table RLS policies call it.
revoke execute on function public.owns_garden(uuid) from anon;
