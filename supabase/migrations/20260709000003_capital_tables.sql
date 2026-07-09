-- ============================================================================
-- Migration 3: Delt Capital tables — the shared surface the external Capital
-- app also reads/writes.
-- ----------------------------------------------------------------------------
--   loans                – active/settled financing advances
--   loan_repayments      – individual repayment postings (denormalised user_id)
--   capital_applications – merchant requests for capital (real write target)
--   capital_eligibility  – computed readiness/limits shown on the dashboard
--
-- Owner-scoped RLS on user_id = auth.users.id. The external Delt Capital app
-- points at this same project and shares these tables under the same RLS.
-- Trusted server jobs in that app (repayment postings, underwriting) use the
-- SERVICE ROLE key server-side (bypasses RLS) — never a browser key.
-- Idempotent: safe to (re)apply.
-- ============================================================================

-- ── loans ────────────────────────────────────────────────────────────────────
create table if not exists public.loans (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null default auth.uid() references auth.users(id) on delete cascade,
  original_amount_cents bigint not null,
  balance_cents         bigint not null,
  daily_repayment_cents bigint not null default 0,
  factor_rate           numeric(5,3),
  status                text not null default 'active',   -- active | paid | pending
  issued_at             date,
  estimated_payoff      date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists loans_user_id_idx on public.loans (user_id);

drop trigger if exists loans_set_updated_at on public.loans;
create trigger loans_set_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

alter table public.loans enable row level security;

drop policy if exists "loans_select_own" on public.loans;
create policy "loans_select_own" on public.loans
  for select using (auth.uid() = user_id);
drop policy if exists "loans_insert_own" on public.loans;
create policy "loans_insert_own" on public.loans
  for insert with check (auth.uid() = user_id);
drop policy if exists "loans_update_own" on public.loans;
create policy "loans_update_own" on public.loans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── loan_repayments ──────────────────────────────────────────────────────────
create table if not exists public.loan_repayments (
  id           uuid primary key default gen_random_uuid(),
  loan_id      uuid not null references public.loans(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount_cents bigint not null,
  method       text,
  status       text not null default 'completed',   -- completed | pending | failed
  repaid_on    date not null default current_date,
  created_at   timestamptz not null default now()
);
create index if not exists loan_repayments_user_id_repaid_on_idx
  on public.loan_repayments (user_id, repaid_on desc);

alter table public.loan_repayments enable row level security;

drop policy if exists "loan_repayments_select_own" on public.loan_repayments;
create policy "loan_repayments_select_own" on public.loan_repayments
  for select using (auth.uid() = user_id);
drop policy if exists "loan_repayments_insert_own" on public.loan_repayments;
create policy "loan_repayments_insert_own" on public.loan_repayments
  for insert with check (auth.uid() = user_id);

-- ── capital_applications ─────────────────────────────────────────────────────
create table if not exists public.capital_applications (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  requested_amount_cents bigint not null,
  purpose                text,
  status                 text not null default 'submitted',   -- submitted | review | approved | declined
  created_at             timestamptz not null default now()
);
create index if not exists capital_applications_user_id_idx
  on public.capital_applications (user_id);

alter table public.capital_applications enable row level security;

drop policy if exists "capital_applications_select_own" on public.capital_applications;
create policy "capital_applications_select_own" on public.capital_applications
  for select using (auth.uid() = user_id);
drop policy if exists "capital_applications_insert_own" on public.capital_applications;
create policy "capital_applications_insert_own" on public.capital_applications
  for insert with check (auth.uid() = user_id);

-- ── capital_eligibility ──────────────────────────────────────────────────────
create table if not exists public.capital_eligibility (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  readiness_score    int,
  max_available_cents bigint,
  eligible_after     text,
  updated_at         timestamptz not null default now()
);

drop trigger if exists capital_eligibility_set_updated_at on public.capital_eligibility;
create trigger capital_eligibility_set_updated_at
  before update on public.capital_eligibility
  for each row execute function public.set_updated_at();

alter table public.capital_eligibility enable row level security;

drop policy if exists "capital_eligibility_select_own" on public.capital_eligibility;
create policy "capital_eligibility_select_own" on public.capital_eligibility
  for select using (auth.uid() = user_id);
drop policy if exists "capital_eligibility_insert_own" on public.capital_eligibility;
create policy "capital_eligibility_insert_own" on public.capital_eligibility
  for insert with check (auth.uid() = user_id);
drop policy if exists "capital_eligibility_update_own" on public.capital_eligibility;
create policy "capital_eligibility_update_own" on public.capital_eligibility
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
