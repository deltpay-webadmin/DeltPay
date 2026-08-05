-- ============================================================================
-- plaid_link_requests: join the multi-tenant scheme.
--
-- The table was added after 20260731_03_org_columns.sql and missed the
-- rollout: no org_id, no org-stamp trigger, and a bare is_staff() read
-- policy — so staff in ANY org could read every org's hosted-link invites
-- (hosted_link_url is the live connect URL). Bring it in line with
-- plaid_items: org column + set_org_id() stamp + org-scoped RLS on
-- underwriting.view.
-- ============================================================================

alter table public.plaid_link_requests
  add column if not exists org_id uuid references public.orgs(id)
  default public.default_org_id();

-- Backfill from the linked lead where possible; legacy rows with no lead
-- fall back to org #1 (same as every other table's backfill).
update public.plaid_link_requests r
   set org_id = l.org_id
  from public.pipeline_leads l
 where r.lead_id = l.id and r.org_id is distinct from l.org_id;
update public.plaid_link_requests
   set org_id = public.default_org_id()
 where org_id is null;

alter table public.plaid_link_requests alter column org_id set not null;
alter table public.plaid_link_requests alter column org_id drop default;
create index if not exists plaid_link_requests_org_idx
  on public.plaid_link_requests (org_id);

drop trigger if exists plaid_link_requests_org_stamp on public.plaid_link_requests;
create trigger plaid_link_requests_org_stamp
  before insert on public.plaid_link_requests
  for each row execute function public.set_org_id();

-- Replace the cross-org is_staff() read with the plaid_items pattern.
-- Writes still go through service-role edge functions only.
drop policy if exists plaid_link_requests_staff_read on public.plaid_link_requests;
drop policy if exists plaid_link_requests_select on public.plaid_link_requests;
create policy plaid_link_requests_select on public.plaid_link_requests
  for select to authenticated using (
    org_id = (select public.current_org_id())
    and (select public.has_perm('underwriting.view'))
  );
