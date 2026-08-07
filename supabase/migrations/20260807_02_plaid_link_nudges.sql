-- ────────────────────────────────────────────────────────────────
-- Connect-link reminders
-- ────────────────────────────────────────────────────────────────
-- Tracks the automated follow-up emails sent for pending hosted-link
-- invites (reminder 1 at ~24h, reminder 2 at ~72h) and schedules the
-- hourly job that sends them. The job itself is quiet-hours aware
-- (8am–9pm ET, weekdays) — the hourly cadence just means reminders
-- land shortly after their threshold instead of at a fixed nightly hour.

alter table public.plaid_link_requests
  add column if not exists reminder_count integer not null default 0,
  add column if not exists last_reminder_at timestamptz;

-- cron.schedule() upserts by job name, so re-applying is safe.
select cron.schedule('plaid-link-nudges-hourly', '0 * * * *', $$select public.invoke_job('plaid-link-nudges')$$);
