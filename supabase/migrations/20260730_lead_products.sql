-- Product-line tags on pipeline leads: Capital, Processing, or both.
-- Backfill from the legacy single-select type as a starting point —
-- MCA leads sell Capital, Processing leads sell Processing; staff can
-- adjust per-lead from the CRM.

alter table public.pipeline_leads
  add column if not exists products text[] not null default '{}';

update public.pipeline_leads
set products = case
  when type = 'MCA' then array['Capital']
  when type = 'Processing' then array['Processing']
  else '{}'::text[]
end
where products = '{}';
