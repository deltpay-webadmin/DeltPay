-- ============================================================================
-- Scheduled jobs: pg_cron + pg_net → the jobs dispatcher route on the
-- make-server-940653c6 edge function (POST /jobs, gated by x-cron-secret).
--
-- Nothing ran unattended before this: every Plaid sync, Meta sync, and
-- DocuSign status check was a human clicking a button. Nightly (UTC):
--   07:00 plaid-sync-all  — refresh every connected Plaid item
--   07:30 meta-insights   — trailing 90 days of Meta campaign insights
--   07:45 meta-leads      — Meta lead-form pulls + CRM reconciliation
--   08:00 docusign-sweep  — poll in-flight envelopes (safety net behind the
--                           docusign-connect webhook)
--
-- Secrets are NEVER hardcoded here — invoke_job() reads them from Supabase
-- Vault at call time. One-time manual setup (SQL editor + dashboard):
--   1. select vault.create_secret('<random 32+ bytes>', 'cron_secret');
--   2. select vault.create_secret('<the project anon key>', 'supabase_anon_key');
--      (the anon key is public — it only satisfies platform JWT verification;
--       the cron_secret is the real gate)
--   3. Edge Functions → Secrets: set CRON_SECRET to the same value as
--      vault 'cron_secret'.
-- cron.schedule() upserts by job name, so re-applying is safe.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.invoke_job(p_task text)
returns bigint
language sql security definer
set search_path to ''
as $$
  select net.http_post(
    url := 'https://ytemrmpnwmzqeradbeoa.supabase.co/functions/v1/make-server-940653c6/jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := jsonb_build_object('task', p_task),
    timeout_milliseconds := 10000
  );
$$;

revoke execute on function public.invoke_job(text) from public, anon, authenticated;

select cron.schedule('plaid-sync-all-nightly', '0 7 * * *',  $$select public.invoke_job('plaid-sync-all')$$);
select cron.schedule('meta-insights-nightly',  '30 7 * * *', $$select public.invoke_job('meta-insights')$$);
select cron.schedule('meta-leads-nightly',     '45 7 * * *', $$select public.invoke_job('meta-leads')$$);
select cron.schedule('docusign-sweep-nightly', '0 8 * * *',  $$select public.invoke_job('docusign-sweep')$$);
