-- ────────────────────────────────────────────────────────────────
-- Permanently keep Meta test-tool dummy leads out of the CRM
-- ────────────────────────────────────────────────────────────────
-- Meta's Lead Ads testing tool submits placeholder leads ("<test lead:
-- dummy data for ...>", email test@fb.com). The nightly meta-leads job
-- pulls them into ad_leads; each time staff deleted the imported copies
-- from pipeline_leads, the on-delete-set-null FK cleared the match and
-- the same submissions reappeared as "missing paid leads" in the
-- Marketing Hub, where they kept being re-imported.
--
-- Three layers make the removal stick:
--   1. ad_leads.dismissed_at — a tombstone. Dismissed submissions never
--      count as missing and can never be imported again.
--   2. Backfill: every test-tool submission already in ad_leads is
--      dismissed, and surviving imported copies in pipeline_leads are
--      deleted.
--   3. A BEFORE INSERT trigger on pipeline_leads rejects Meta test-tool
--      signatures on every path (Zapier hop, edge-function import, UI,
--      CSV upload).

alter table public.ad_leads
  add column if not exists dismissed_at timestamptz,
  add column if not exists dismiss_reason text;

-- Deliberately narrow: only the exact placeholders Meta's testing tool
-- generates, not a broad "looks fake" heuristic, so a real merchant can
-- never be rejected silently. Mirrored by isMetaTestSubmission in
-- supabase/functions/_shared/meta.ts — keep the two in sync.
create or replace function public.is_meta_test_lead(nm text, em text)
returns boolean
language sql immutable parallel safe
as $$
  select coalesce(lower(trim(em)) in ('test@fb.com', 'test@meta.com'), false)
      or coalesce(lower(trim(nm)) like '<%', false)
      or coalesce(lower(nm) like 'test lead:%', false)
      or coalesce(lower(nm) like '%dummy data%', false)
$$;

-- Tombstone every test submission already synced from Meta.
update public.ad_leads
set dismissed_at = now(), dismiss_reason = 'meta_test'
where dismissed_at is null
  and public.is_meta_test_lead(full_name, email);

-- Purge imported copies still sitting in the pipeline — the sweep staff
-- kept having to run by hand. FKs from ad_leads / plaid tables /
-- statement analyses are on delete set null (or cascade), so this is a
-- clean delete.
delete from public.pipeline_leads
where public.is_meta_test_lead(business_name, contact_email)
   or public.is_meta_test_lead(contact_name, contact_email);

-- And keep them out for good, whichever door they come through. Raising
-- (rather than silently dropping) keeps the rejection visible in the
-- inserting system's logs, e.g. a Zapier run history.
create or replace function public.reject_meta_test_lead()
returns trigger
language plpgsql
as $$
begin
  if public.is_meta_test_lead(new.business_name, new.contact_email)
     or public.is_meta_test_lead(new.contact_name, new.contact_email) then
    raise exception 'Blocked Meta test lead (dummy data): %',
      coalesce(new.business_name, new.contact_name, new.id)
      using hint = 'Submissions from Meta''s Lead Ads testing tool are not allowed in pipeline_leads.';
  end if;
  return new;
end;
$$;

drop trigger if exists pipeline_leads_reject_test on public.pipeline_leads;
create trigger pipeline_leads_reject_test
  before insert on public.pipeline_leads
  for each row execute function public.reject_meta_test_lead();
