-- ────────────────────────────────────────────────────────────────
-- Grants for merchants / crm_deals / residuals / contracts
-- ────────────────────────────────────────────────────────────────
-- The 2026-07-29 migrations (merchants_deals, residuals, contracts)
-- created these tables with is_staff() RLS policies but never granted
-- table privileges, so PostgREST returned 403 "permission denied" for
-- every signed-in staff request. One failed query blanks the whole CRM
-- hydration, which made the dashboard show the empty local snapshot.
-- Row access remains gated by the existing is_staff() policies.

grant select, insert, update, delete
  on public.merchants,
     public.crm_deals,
     public.residual_imports,
     public.residual_rows,
     public.contracts
  to authenticated, service_role;
