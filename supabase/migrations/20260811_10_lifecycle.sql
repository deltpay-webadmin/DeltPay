-- ============================================================================
-- Lifecycle emails (Tier 1 + Tier 2 + growth) — tracking columns + schedules.
--
-- Column conventions mirror plaid_link_requests: a small counter + timestamp
-- per automated sequence, and one-shot *_notified_at / *_invited_at flags so
-- every job is idempotent and re-runs are safe.
--
-- Cron times are UTC (pg_cron). Quiet hours (8am–9pm ET, weekdays) are
-- enforced in code — the schedules below just set the polling cadence.
-- ============================================================================

-- MPA saved-application reminders (DP-4/5/6). link_url is the tokenized
-- wizard link, stored at create-link time (same convention as
-- plaid_link_requests.hosted_link_url) so reminders can carry the link.
alter table public.merchant_applications
  add column if not exists link_url text,
  add column if not exists link_sent_at timestamptz,
  add column if not exists reminder_count integer not null default 0,
  add column if not exists last_reminder_at timestamptz,
  add column if not exists submit_notified_at timestamptz;

-- Underwriting decision notifications (DP-8/10): remembers the last status
-- the merchant was emailed about, so status flips notify exactly once.
alter table public.deal_submissions
  add column if not exists status_notified text,
  add column if not exists status_notified_at timestamptz,
  add column if not exists crosssell_notified_at timestamptz,
  add column if not exists referral_invited_at timestamptz;

-- Speed-to-lead SLA (P-INT): one alert per lead, ever.
alter table public.pipeline_leads
  add column if not exists sla_alerted_at timestamptz;

-- Capital renewals (DC-15): merchant email when we have one (fill
-- contact_email in the CRM), internal alert otherwise. One-shot.
alter table public.capital_deals
  add column if not exists contact_email text,
  add column if not exists renewal_notified_at timestamptz;

-- DeltCapital website leads (DC-3/4 stall emails + DC-8 in-review) — the
-- deltcapital.com Vercel functions read/write these on the shared database.
alter table public.leads
  add column if not exists email_nudge_count integer not null default 0,
  add column if not exists email_nudged_at timestamptz,
  add column if not exists review_emailed_at timestamptz;

-- ── Schedules ───────────────────────────────────────────────────────────
-- cron.schedule() upserts by job name, so re-applying is safe.
select cron.schedule('mpa-stall-reminders-hourly', '20 * * * *',  $$select public.invoke_job('mpa-stall-reminders')$$);
select cron.schedule('deal-status-notify-15m',     '*/15 * * * *', $$select public.invoke_job('deal-status-notify')$$);
select cron.schedule('sla-watch-15m',              '*/15 * * * *', $$select public.invoke_job('sla-watch')$$);
-- 13:05 UTC = 9:05am ET during DST (10:05am in winter — acceptable drift).
select cron.schedule('stale-lead-digest-daily',    '5 13 * * 1-5', $$select public.invoke_job('stale-lead-digest')$$);
select cron.schedule('capital-renewal-daily',      '0 14 * * 1-5', $$select public.invoke_job('capital-renewal-sweep')$$);
-- Tuesdays 15:00 UTC (11am ET) — growth mail lands mid-morning, mid-week.
select cron.schedule('growth-sweep-weekly',        '0 15 * * 2',   $$select public.invoke_job('growth-sweep')$$);
