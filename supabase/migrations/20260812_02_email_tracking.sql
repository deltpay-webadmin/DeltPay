-- ============================================================================
-- Email tracking + opt-out.
--
-- Builds on 20260812_01_email_health.sql (email_events + email_suppressions),
-- which only recorded things going *wrong*. This adds the other half:
--
--   1. Engagement.   email_events now carries `sent`, `delivered`, `opened`,
--                    `clicked` and `unsubscribed` rows alongside the failures,
--                    tagged with the campaign code (DP-4, DC-15, …) so every
--                    sequence has a real sent → opened → clicked funnel.
--                    Correlation is by Resend's email_id: the sender writes the
--                    `sent` row with the id + campaign, and the webhook joins
--                    later events back to it.
--
--   2. Opt-out.      email_suppressions gains a scope. 'all' (bounce/complaint)
--                    blocks everything; 'marketing' (unsubscribe) blocks only
--                    promotional sends so transactional mail — application
--                    reminders, approval notices — still flows. Required by
--                    CAN-SPAM for the cross-sell/referral/renewal sends, and
--                    an opt-out is far cheaper than a spam complaint, which
--                    kills the address for every sequence at once.
--
--   3. History.      Successful sends are logged, not just failures, so the
--                    CRM can show a per-lead communication timeline.
-- ============================================================================

-- ── 1. Engagement columns on email_events ───────────────────────────────────
alter table public.email_events add column if not exists campaign text;
alter table public.email_events add column if not exists variant text;
alter table public.email_events add column if not exists link_url text;
alter table public.email_events add column if not exists kind text;

comment on column public.email_events.campaign is
  'Blueprint template code (DP-4, DP-14, DC-15, PLAID-1, …). Set on the `sent` row by the sender; backfilled onto later events by the resend-webhook via email_id.';
comment on column public.email_events.variant is
  'Subject/body variant key for A/B tests. Null when the template has one version.';
comment on column public.email_events.link_url is
  'Clicked URL — only on `clicked` events.';
comment on column public.email_events.kind is
  'marketing | transactional. Drives which sends carry an unsubscribe link and which respect a marketing opt-out.';

-- Funnel rollups per campaign, and email_id joins from the webhook.
create index if not exists email_events_campaign_idx
  on public.email_events (campaign, event, created_at desc);
create index if not exists email_events_email_id_idx
  on public.email_events (email_id) where email_id is not null;

-- ── 2. Scoped suppressions ──────────────────────────────────────────────────
alter table public.email_suppressions
  add column if not exists scope text not null default 'all';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'email_suppressions_scope_check'
  ) then
    alter table public.email_suppressions
      add constraint email_suppressions_scope_check check (scope in ('all', 'marketing'));
  end if;
end$$;

comment on column public.email_suppressions.scope is
  'all = never auto-email again (hard bounce, spam complaint). marketing = opted out of promotional mail only; transactional sends still go through.';

-- Existing rows are bounces/complaints written before this column existed —
-- the 'all' default is already correct for them.

-- ── 3. Per-campaign engagement rollup ───────────────────────────────────────
-- Unique-recipient counts (not raw event counts): one person opening five
-- times is one open. Read by the email-health-digest job and the CRM.
-- security_invoker so the caller's RLS applies — staff read, nobody else.
create or replace view public.email_campaign_stats
with (security_invoker = true) as
select
  campaign,
  min(kind)                                                          as kind,
  count(distinct recipient) filter (where event = 'sent')            as sent,
  count(distinct recipient) filter (where event = 'opened')          as opened,
  count(distinct recipient) filter (where event = 'clicked')         as clicked,
  count(distinct recipient) filter (where event = 'unsubscribed')    as unsubscribed,
  count(distinct recipient) filter (where event in ('bounced', 'complained')) as failed,
  max(created_at)                                                    as last_activity
from public.email_events
where campaign is not null
group by campaign;

comment on view public.email_campaign_stats is
  'Unique-recipient funnel per campaign code. Opens are pixel-based and undercount (image blocking) — clicks are the honest signal.';

grant select on public.email_campaign_stats to authenticated;
grant select on public.email_campaign_stats to service_role;
