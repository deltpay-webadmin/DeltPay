-- ────────────────────────────────────────────────────────────────
-- Meta lead-form reconciliation
-- ────────────────────────────────────────────────────────────────
-- ad_leads holds the raw lead-form submissions pulled from Meta's
-- Lead Ads API (Graph /{form}/leads). Each row is matched against
-- pipeline_leads so the Marketing Hub can show exactly which paid
-- leads never made it into the CRM, and import them.
--
-- Contains lead PII (name/email/phone) → staff-only, same policy
-- pattern as ad_insights_daily.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.ad_leads (
  provider text not null default 'meta',
  lead_id text not null,                     -- Meta leadgen id
  account_id text,
  page_id text,
  page_name text,
  form_id text,
  form_name text,
  campaign_id text,
  campaign_name text,
  ad_id text,
  ad_name text,
  is_organic boolean not null default false,
  created_time timestamptz,                  -- when the person submitted the form
  full_name text,
  email text,
  phone text,
  field_data jsonb not null default '[]'::jsonb,
  matched_lead_id text,                      -- pipeline_leads.id when found in CRM
  match_basis text,                          -- lead_id | email | phone | name | imported
  synced_at timestamptz not null default now(),
  primary key (provider, lead_id)
);

create index if not exists ad_leads_created_idx on public.ad_leads (created_time);
create index if not exists ad_leads_unmatched_idx on public.ad_leads (provider) where matched_lead_id is null;

alter table public.ad_leads enable row level security;

drop policy if exists ad_leads_staff_all on public.ad_leads;
create policy ad_leads_staff_all on public.ad_leads
  for all using (is_staff()) with check (is_staff());

grant select, insert, update, delete
  on public.ad_leads
  to authenticated, service_role;
