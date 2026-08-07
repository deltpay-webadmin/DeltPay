-- ────────────────────────────────────────────────────────────────
-- cron_secret() RPC — single source of truth for the /jobs gate
-- ────────────────────────────────────────────────────────────────
-- The edge functions' CRON_SECRET env secret and the vault's cron_secret
-- drifted apart, so every pg_cron POST to /jobs answered 403 while
-- cron.job_run_details reported "succeeded" (the SQL ran; the HTTP call
-- was rejected). verifyCronSecret now reads the SAME vault entry that
-- public.invoke_job() sends, via this service-role-only RPC, so the two
-- sides can never drift again.

create or replace function public.cron_secret()
returns text
language sql security definer
set search_path to ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'
$$;

revoke execute on function public.cron_secret() from public, anon, authenticated;
grant execute on function public.cron_secret() to service_role;
