-- ============================================================================
-- Migration 4: security hardening for the portal functions (advisor fixes)
-- ----------------------------------------------------------------------------
-- Resolves the two security-advisor WARNs raised by migration 1's functions.
-- Idempotent.
-- ============================================================================

-- Pin search_path so the trigger fn can't be hijacked via a mutable path
-- (advisor 0011 function_search_path_mutable).
alter function public.set_updated_at() set search_path = public;

-- handle_new_user only ever fires from the auth.users AFTER INSERT trigger; it
-- should not be directly callable via PostgREST RPC (advisors 0028/0029). The
-- trigger continues to fire after these revokes.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
