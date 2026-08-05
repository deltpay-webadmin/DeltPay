-- ────────────────────────────────────────────────────────────────
-- Demo/test data purge — RUN MANUALLY in the Supabase SQL editor.
-- ────────────────────────────────────────────────────────────────
-- Removes the seeded/demo rows identified in the Aug 2026 fake-data
-- audit. Real prospects (Meta Ads leads `lead-meta-…` and Capital Site
-- applicants `crm-…`) are NOT touched.
--
-- Review each block before running; comment out anything you want to
-- keep. Deletes cascade sensibly (plaid_link_requests cascade on lead
-- delete; plaid_items detach via ON DELETE SET NULL).

begin;

-- 1) The three seeded demo pipeline leads (created 2026-07-28 as samples)
delete from public.pipeline_leads
where id in ('lead-010', 'lead-011', 'lead-012');

-- 2) Internal test leads from the deltcapital.com calculator/apply flow
--    (owner's own test submissions; keeps real applicants)
delete from delt_capital.apply_progress
where lead_id in (
  select id from delt_capital.leads
  where email ilike any (array['%hazday%', '%test@meta.com%'])
     or business_name ilike '%test%'
);
delete from delt_capital.leads
where email ilike any (array['%hazday%', '%test@meta.com%'])
   or business_name ilike '%test%';

-- 3) Test outreach events
delete from public.outreach_events
where lead_email ilike '%test%' or lead_name ilike '%test%';

-- 4) Legacy crm_leads rows (superseded by pipeline_leads)
delete from public.crm_leads;

-- 5) Test statement analyses + the test contract — REVIEW FIRST:
--    uncomment only if you don't need them as references.
-- delete from public.statement_analyses;
-- delete from public.contracts;

commit;

-- After running: the CRM Leads page also has a built-in dummy-lead
-- detector (flags names matching test/demo/sample) with a cleanup
-- action for anything that slips through later.
