-- ============================================================================
-- BASELINE: tables + functions that existed in the live database before any
-- committed migration. Captured verbatim from the live schema (project
-- ytemrmpnwmzqeradbeoa) on 2026-07-31.
--
-- Purpose: make the migration set replayable on a fresh database. The files
-- dated 20260728+ reference public.pipeline_leads, is_staff() and
-- touch_updated_at(), none of which had a committed CREATE. This file sorts
-- before them and is a pure no-op when applied to the live database
-- (create table if not exists / create or replace with identical bodies).
--
-- Note: this project does not carry Supabase's usual default privileges —
-- every table needs explicit GRANTs (see 20260728_plaid_vault.sql).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Staff identity (predates the org model added in 20260731_01)
-- ---------------------------------------------------------------------------

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'agent'
    check (role in ('admin', 'manager', 'agent', 'employee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql stable security definer
set search_path to 'public'
as $$ SELECT EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = auth.uid()); $$;

create or replace function public.current_staff_role()
returns text
language sql stable security definer
set search_path to 'public'
as $$ SELECT role FROM public.staff_profiles WHERE id = auth.uid(); $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

create or replace function public.staff_prevent_role_escalation()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(public.current_staff_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can change staff roles';
  END IF;
  RETURN NEW;
END; $$;

-- ---------------------------------------------------------------------------
-- 2. CRM pipeline
-- ---------------------------------------------------------------------------

create table if not exists public.pipeline_leads (
  id text primary key,
  business_name text not null,
  industry text not null default 'General',
  contact_name text,
  contact_email text,
  contact_phone text,
  type text not null default 'MCA',
  source text,
  monthly_sales text,
  amount_requested text,
  score integer not null default 50,
  status text not null default 'New',
  priority text not null default 'Medium',
  last_activity text,
  assigned_agent text,
  stage text not null default 'New',
  timeline jsonb not null default '[]',
  notes text not null default '',
  extra_notes jsonb not null default '[]',
  tasks jsonb not null default '[]',
  blocker text,
  step_details jsonb,
  referred_by text,
  bundle jsonb,
  kyb jsonb,
  external_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- products text[] is added by 20260730_lead_products.sql
);

create table if not exists public.onboarding_apps (
  id text primary key,
  merchant_name text not null,
  agent text not null,
  current_step text not null,
  current_step_index integer not null default 0,
  time_in_step text,
  time_in_step_hours numeric,
  sla_target text,
  sla_status text not null default 'On Track',
  submitted_date text,
  blocker text,
  steps jsonb not null default '[]',
  nudges integer not null default 0,
  last_nudge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.underwriting_apps (
  id text primary key,
  application_id text not null unique,
  business_name text,
  dba text,
  industry text,
  state text,
  product_type text not null default 'MCA',
  requested_amount numeric not null default 0,
  monthly_revenue numeric not null default 0,
  avg_daily_balance numeric not null default 0,
  months_in_business integer not null default 0,
  credit_score integer not null default 0,
  existing_positions integer not null default 0,
  submission_date text,
  reviewer text,
  reviewer_initials text,
  risk_score integer not null default 0,
  stage text not null default 'Received',
  days_in_stage integer not null default 0,
  sla_threshold integer not null default 3,
  factor_rate numeric,
  proposed_payback numeric,
  daily_payment numeric,
  holdback_pct numeric,
  disclosure_state text,
  missing_docs jsonb,
  notes text,
  source text,
  merchant_name text,
  business_type text,
  plaid_inputs jsonb,
  crs_inputs jsonb,
  datamerch_inputs jsonb,
  plaid_score numeric,
  crs_score numeric,
  datamerch_score numeric,
  composite_score numeric,
  tier text,
  disqualifiers jsonb,
  stress_test jsonb,
  approved_deal_id text,
  decline_reason text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id text primary key,
  referring_merchant text not null,
  referred_business text not null,
  referral_code text not null,
  date text,
  status text not null default 'Pending',
  reward_status text not null default 'Pending',
  reward_amount text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_program (
  id integer primary key default 1 check (id = 1),
  reward_amount text not null default '100',
  free_months text not null default '1',
  plan_tier text not null default 'Growth',
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_imports (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  source text not null default 'Meta Ads',
  row_count integer not null default 0,
  inserted_count integer not null default 0,
  duplicate_count integer not null default 0,
  skipped_count integer not null default 0,
  error_count integer not null default 0,
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Capital book
-- ---------------------------------------------------------------------------

create table if not exists public.capital_deals (
  id text primary key,
  merchant text not null,
  type text not null default 'Restaurant',
  channel text not null default 'self' check (channel in ('self', 'fundomate')),
  funded date not null default current_date,
  funded_amt numeric not null default 0,
  factor numeric not null default 1.35,
  total_owed numeric not null default 0,
  collected numeric not null default 0,
  holdback numeric not null default 12,
  daily_debit numeric not null default 0,
  status text not null default 'active' check (status in ('active', 'paid', 'slow', 'default')),
  days_in_default integer not null default 0,
  last_payment date,
  ach_status text not null default 'current'
    check (ach_status in ('current', 'completed', 'nsf-retry', 'suspended')),
  avg_7d numeric not null default 0,
  avg_30d numeric not null default 0,
  stack_count integer not null default 0,
  renewal_eligible boolean not null default false,
  ucc_filed date,
  ucc_expires date,
  cost_of_capital_paid numeric not null default 0,
  referral_commission numeric not null default 0,
  commission_rate numeric,
  commission_paid boolean,
  notes text,
  weekly_payment numeric,
  monthly_payment numeric,
  commission numeric,
  balloon numeric,
  rep text,
  due_date date,
  anshu_pct numeric,
  patrick_pct numeric,
  delt_retained_pct numeric,
  signed_date date,
  daily_payment numeric,
  weeks_behind numeric default 0,
  bounce_count integer default 0,
  funding_sources jsonb,
  borrowing_cost_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists capital_deals_status_idx on public.capital_deals (status);
create index if not exists capital_deals_channel_idx on public.capital_deals (channel);
create index if not exists capital_deals_funded_idx on public.capital_deals (funded desc);

create table if not exists public.loan_payments (
  id text primary key,
  deal_id text not null references public.capital_deals(id) on delete cascade,
  payment_date date not null,
  amount numeric not null default 0,
  category text not null default 'debit',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists loan_payments_deal_idx on public.loan_payments (deal_id);

-- ---------------------------------------------------------------------------
-- 4. ACH activity
-- ---------------------------------------------------------------------------

create table if not exists public.ach_imports (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  source text not null default 'ach.com',
  customer_name text,
  nacha_id text,
  date_range text,
  row_count integer not null default 0,
  inserted_count integer not null default 0,
  skipped_count integer not null default 0,
  total_originated numeric not null default 0,
  total_settled numeric not null default 0,
  total_returned numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists ach_imports_created_at_idx on public.ach_imports (created_at desc);

create table if not exists public.ach_daily_activity (
  id uuid primary key default gen_random_uuid(),
  processing_date date not null,
  record_type text not null check (record_type in ('ORIGINATION', 'Settlement', 'Returns')),
  debit_amount numeric not null default 0,
  credit_amount numeric not null default 0,
  debit_count integer not null default 0,
  credit_count integer not null default 0,
  total_count integer not null default 0,
  effective_entry_date date,
  settlement_date date,
  source text not null default 'ach.com',
  customer_name text,
  nacha_id text,
  import_batch_id uuid,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists ach_daily_activity_dedup_idx on public.ach_daily_activity
  (processing_date, record_type,
   coalesce(effective_entry_date, '1900-01-01'::date),
   coalesce(settlement_date, '1900-01-01'::date),
   debit_amount, credit_amount);
create unique index if not exists ach_daily_activity_dedup_plain on public.ach_daily_activity
  (processing_date, record_type, effective_entry_date, settlement_date,
   debit_amount, credit_amount) nulls not distinct;
create index if not exists ach_daily_activity_processing_date_idx
  on public.ach_daily_activity (processing_date desc);
create index if not exists ach_daily_activity_record_type_idx
  on public.ach_daily_activity (record_type);

-- ---------------------------------------------------------------------------
-- 5. Outreach events (written by external deltcapital.com serverless functions
--    with the service key; the CRM only reads them)
-- ---------------------------------------------------------------------------

create table if not exists public.outreach_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  lead_id text,
  lead_email text,
  lead_name text,
  campaign text not null,
  channel text not null default 'email',
  event text not null check (event in ('sent', 'opened', 'clicked', 'responded', 'bounced')),
  variant text,
  utm jsonb,
  meta jsonb
);
create index if not exists outreach_events_lead_idx on public.outreach_events (lead_id, created_at desc);
create index if not exists outreach_events_email_idx on public.outreach_events (lead_email, created_at desc);
create index if not exists outreach_events_campaign_idx on public.outreach_events (campaign, event, created_at desc);

-- ---------------------------------------------------------------------------
-- 6. KV store used by the `server` edge function (service-role only)
-- ---------------------------------------------------------------------------

create table if not exists public.kv_store_940653c6 (
  key text primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------------------
-- 7. Row-level security (mirrors live behavior at time of capture)
-- ---------------------------------------------------------------------------

alter table public.staff_profiles enable row level security;
alter table public.pipeline_leads enable row level security;
alter table public.onboarding_apps enable row level security;
alter table public.underwriting_apps enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_program enable row level security;
alter table public.lead_imports enable row level security;
alter table public.capital_deals enable row level security;
alter table public.loan_payments enable row level security;
alter table public.ach_imports enable row level security;
alter table public.ach_daily_activity enable row level security;
alter table public.outreach_events enable row level security;
alter table public.kv_store_940653c6 enable row level security;  -- no policies: service-role only

drop policy if exists staff_profiles_select_staff on public.staff_profiles;
create policy staff_profiles_select_staff on public.staff_profiles
  for select to authenticated using (is_staff());
drop policy if exists staff_profiles_update_own on public.staff_profiles;
create policy staff_profiles_update_own on public.staff_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists staff_profiles_admin_all on public.staff_profiles;
create policy staff_profiles_admin_all on public.staff_profiles
  for all to authenticated
  using (current_staff_role() = 'admin') with check (current_staff_role() = 'admin');

drop policy if exists pipeline_leads_staff_all on public.pipeline_leads;
create policy pipeline_leads_staff_all on public.pipeline_leads
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists onboarding_apps_staff_all on public.onboarding_apps;
create policy onboarding_apps_staff_all on public.onboarding_apps
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists underwriting_apps_staff_all on public.underwriting_apps;
create policy underwriting_apps_staff_all on public.underwriting_apps
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists referrals_staff_all on public.referrals;
create policy referrals_staff_all on public.referrals
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists referral_program_staff_all on public.referral_program;
create policy referral_program_staff_all on public.referral_program
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists lead_imports_staff on public.lead_imports;
create policy lead_imports_staff on public.lead_imports
  for all using (is_staff()) with check (is_staff());

drop policy if exists capital_deals_staff_all on public.capital_deals;
create policy capital_deals_staff_all on public.capital_deals
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists loan_payments_staff on public.loan_payments;
create policy loan_payments_staff on public.loan_payments
  for all using (is_staff()) with check (is_staff());

drop policy if exists ach_imports_staff_all on public.ach_imports;
create policy ach_imports_staff_all on public.ach_imports
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists ach_daily_activity_staff_all on public.ach_daily_activity;
create policy ach_daily_activity_staff_all on public.ach_daily_activity
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists outreach_events_staff_read on public.outreach_events;
create policy outreach_events_staff_read on public.outreach_events
  for select to authenticated using (is_staff());

-- ---------------------------------------------------------------------------
-- 8. updated_at triggers + staff role guard
-- ---------------------------------------------------------------------------

drop trigger if exists pipeline_leads_touch on public.pipeline_leads;
create trigger pipeline_leads_touch before update on public.pipeline_leads
  for each row execute function public.touch_updated_at();

drop trigger if exists onboarding_apps_touch on public.onboarding_apps;
create trigger onboarding_apps_touch before update on public.onboarding_apps
  for each row execute function public.touch_updated_at();

drop trigger if exists underwriting_apps_touch on public.underwriting_apps;
create trigger underwriting_apps_touch before update on public.underwriting_apps
  for each row execute function public.touch_updated_at();

drop trigger if exists referrals_touch on public.referrals;
create trigger referrals_touch before update on public.referrals
  for each row execute function public.touch_updated_at();

drop trigger if exists referral_program_touch on public.referral_program;
create trigger referral_program_touch before update on public.referral_program
  for each row execute function public.touch_updated_at();

drop trigger if exists capital_deals_touch on public.capital_deals;
create trigger capital_deals_touch before update on public.capital_deals
  for each row execute function public.touch_updated_at();

drop trigger if exists ach_daily_activity_touch on public.ach_daily_activity;
create trigger ach_daily_activity_touch before update on public.ach_daily_activity
  for each row execute function public.touch_updated_at();

drop trigger if exists staff_profiles_role_guard on public.staff_profiles;
create trigger staff_profiles_role_guard before update on public.staff_profiles
  for each row execute function public.staff_prevent_role_escalation();

-- ---------------------------------------------------------------------------
-- 9. Grants (no default privileges on this project)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on
  public.pipeline_leads, public.onboarding_apps, public.underwriting_apps,
  public.referrals, public.referral_program, public.lead_imports,
  public.capital_deals, public.loan_payments,
  public.ach_imports, public.ach_daily_activity
to authenticated, service_role;

grant select, update on public.staff_profiles to authenticated;
grant select, insert, update, delete on public.staff_profiles to service_role;

grant select on public.outreach_events to authenticated;
grant select, insert, update, delete on public.outreach_events to service_role;
grant usage on sequence public.outreach_events_id_seq to service_role;

revoke all on public.kv_store_940653c6 from anon, authenticated;
grant select, insert, update, delete on public.kv_store_940653c6 to service_role;

grant execute on function public.is_staff() to authenticated, anon, service_role;
grant execute on function public.current_staff_role() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 10. Realtime publication (guarded — mirrors live membership)
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array[
      'pipeline_leads', 'onboarding_apps', 'underwriting_apps',
      'referrals', 'referral_program', 'capital_deals', 'loan_payments',
      'ach_imports', 'ach_daily_activity'
    ] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;
