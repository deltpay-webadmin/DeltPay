-- ────────────────────────────────────────────────────────────────
-- Plaid sandbox data purge — run MANUALLY at production cutover.
-- ────────────────────────────────────────────────────────────────
-- This file lives outside supabase/migrations/ on purpose: nothing
-- auto-applies it. Run it in the Supabase SQL editor (or psql) AFTER
-- deploying the production-ready code and BEFORE flipping PLAID_ENV
-- to production.
--
-- Why: sandbox access_tokens are invalid against the production Plaid
-- host. Leftover sandbox items would show as errored connections in the
-- CRM and make the nightly plaid-sync-all cron log per-item failures.
--
-- What it removes:
--   plaid_nodes        — vault folders/documents (path-keyed, no FKs)
--   plaid_items        — connection registry (cascades → plaid_credentials)
--   plaid_credentials  — sandbox access tokens (deleted via cascade)
--
-- pipeline_leads is untouched: plaid_items.lead_id references leads with
-- ON DELETE SET NULL in the other direction; nothing here touches leads.

begin;

select (select count(*) from public.plaid_items)       as items_before,
       (select count(*) from public.plaid_credentials) as creds_before,
       (select count(*) from public.plaid_nodes)       as nodes_before;

delete from public.plaid_nodes;
delete from public.plaid_items;   -- cascades to plaid_credentials

select (select count(*) from public.plaid_items)       as items_after,   -- expect 0
       (select count(*) from public.plaid_credentials) as creds_after,   -- expect 0
       (select count(*) from public.plaid_nodes)       as nodes_after;   -- expect 0

commit;
