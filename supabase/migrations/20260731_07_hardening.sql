-- ============================================================================
-- Hardening pass driven by the Supabase security advisors after the RBAC
-- rollout:
--   - Postgres grants EXECUTE to PUBLIC on new functions by default, which
--     exposed the RBAC helpers and trigger functions via /rest/v1/rpc to the
--     anon role. Revoke everything not meant to be called directly, and keep
--     the session helpers for authenticated users only.
--   - default_org_id() lacked a pinned search_path.
--   - pg_net was registered in the public schema; re-register it in
--     extensions (its objects live in the `net` schema either way, so
--     invoke_job()'s net.http_post reference is unaffected).
-- ============================================================================

alter function public.default_org_id() set search_path = '';

-- Trigger + seeding functions: never callable via RPC.
revoke execute on function public.set_org_id() from public, anon, authenticated;
revoke execute on function public.resolve_agent() from public, anon, authenticated;
revoke execute on function public.seed_default_permissions(uuid) from public, anon, authenticated;
revoke execute on function public.staff_prevent_role_escalation() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Session helpers: authenticated only (anon has no session to resolve).
revoke execute on function public.current_org_id() from public, anon;
revoke execute on function public.current_org_role() from public, anon;
revoke execute on function public.current_agent_id() from public, anon;
revoke execute on function public.is_org_admin() from public, anon;
revoke execute on function public.has_perm(text) from public, anon;
revoke execute on function public.get_me() from public, anon;
revoke execute on function public.default_org_id() from public, anon;
revoke execute on function public.current_staff_role() from public, anon;
-- is_staff() keeps its anon grant: it predates this work, is referenced from
-- RLS policies and legacy clients, and returns false for anonymous callers.

-- Re-register pg_net under the extensions schema.
do $$
begin
  if exists (
    select 1 from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_net' and n.nspname = 'public'
  ) then
    drop extension pg_net;
    create extension pg_net with schema extensions;
  end if;
end $$;
