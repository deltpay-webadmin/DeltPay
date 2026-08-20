-- ── Call activity + e-sign spine repair ──────────────────────────────
-- 1. Lead-scoped lookups on the call tables (the CRM now reads
--    call_sessions / rep_meetings per lead for next-actions and call
--    history). These tables were created directly in the hosted project
--    (no committed migration), so everything is guarded: a fresh
--    environment without them must not fail db push.
do $$ begin
  if to_regclass('public.call_sessions') is not null then
    create index if not exists call_sessions_lead_idx
      on public.call_sessions (lead_id);
  end if;
  if to_regclass('public.rep_meetings') is not null then
    create index if not exists rep_meetings_lead_idx
      on public.rep_meetings (lead_id);
  end if;
end $$;

-- 2. Backfill: envelopes staged from the Leads page used to carry lead_id
--    but no submission_id, so signed docs never counted toward
--    packet_status(). Attach them to the lead's open submission.
--    (deterministic: the lead's oldest open submission wins)
update public.contracts c
set submission_id = s.id
from (
  select distinct on (lead_id) id, lead_id
  from public.deal_submissions
  where status <> 'Declined' and lead_id is not null
  order by lead_id, created_at asc
) s
where c.submission_id is null
  and c.lead_id = s.lead_id;
