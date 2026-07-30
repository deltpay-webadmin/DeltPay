-- ────────────────────────────────────────────────────────────
-- Merchants + CRM deals — persist the last two client-side-only
-- CRM collections. Mirrors the conventions used by the other CRM
-- tables: text PKs supplied by the app, is_staff() RLS, realtime
-- publication, and touch_updated_at trigger.
-- ────────────────────────────────────────────────────────────

create table if not exists public.merchants (
  id text primary key,
  name text not null,
  industry text not null default 'General',
  status text not null default 'Pending',
  monthly_volume numeric not null default 0,
  mca_balance numeric not null default 0,
  capital_deployed numeric not null default 0,
  health_score integer not null default 75,
  agent text not null default 'Unassigned',
  products jsonb not null default '{"processing": true, "capital": false, "website": false, "lens": false}'::jsonb,
  plan text not null default 'Free',
  monthly_fee numeric not null default 0,
  contact_name text,
  contact_email text,
  contact_phone text,
  state text,
  ein text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_deals (
  id text primary key,
  status text not null default 'Current',
  delinquency_label text,
  type text not null default 'MCA',
  borrower text not null,
  loan_amount numeric not null default 0,
  repayment_amount numeric not null default 0,
  collected numeric not null default 0,
  outstanding numeric not null default 0,
  rate numeric not null default 1.35,
  daily_payment numeric not null default 0,
  funded_date date,
  due_date date,
  agent text not null default 'Unassigned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.merchants enable row level security;
alter table public.crm_deals enable row level security;

drop policy if exists merchants_staff_all on public.merchants;
create policy merchants_staff_all on public.merchants
  for all using (is_staff()) with check (is_staff());

drop policy if exists crm_deals_staff_all on public.crm_deals;
create policy crm_deals_staff_all on public.crm_deals
  for all using (is_staff()) with check (is_staff());

drop trigger if exists merchants_touch on public.merchants;
create trigger merchants_touch
  before update on public.merchants
  for each row execute function touch_updated_at();

drop trigger if exists crm_deals_touch on public.crm_deals;
create trigger crm_deals_touch
  before update on public.crm_deals
  for each row execute function touch_updated_at();

alter publication supabase_realtime add table public.merchants;
alter publication supabase_realtime add table public.crm_deals;
