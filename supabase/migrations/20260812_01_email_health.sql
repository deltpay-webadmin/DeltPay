-- ============================================================================
-- Email health: delivery-event log + suppression list + daily digest.
--
-- email_events        — bounces/complaints/failures from the resend-webhook
--                       function, plus send_error rows written by senders
--                       when the Resend API call itself fails.
-- email_suppressions  — addresses that hard-bounced or complained. Every
--                       automated sender checks this before sending.
--
-- Service-role only (RLS on, staff can read from the CRM). The
-- email-health-digest job (weekday mornings ET) emails the operator any
-- events since the last business day; silent when clean.
-- ============================================================================

create table if not exists public.email_events (
  id bigint generated always as identity primary key,
  email_id text,
  recipient text not null,
  event text not null,          -- bounced | complained | failed | delivery_delayed | send_error
  reason text,
  subject text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists email_events_created_idx on public.email_events (created_at desc);
create index if not exists email_events_recipient_idx on public.email_events (recipient);

create table if not exists public.email_suppressions (
  email text primary key,
  reason text not null,
  source_event text,
  created_at timestamptz not null default now()
);

alter table public.email_events enable row level security;
alter table public.email_suppressions enable row level security;

-- Staff visibility in the CRM; writes stay service-role only.
drop policy if exists email_events_select on public.email_events;
create policy email_events_select on public.email_events
  for select to authenticated using (true);
drop policy if exists email_suppressions_select on public.email_suppressions;
create policy email_suppressions_select on public.email_suppressions
  for select to authenticated using (true);

-- Weekday 13:10 UTC (9:10am ET in summer) — right after the stale-lead digest.
select cron.schedule('email-health-digest-daily', '10 13 * * 1-5', $$select public.invoke_job('email-health-digest')$$);
