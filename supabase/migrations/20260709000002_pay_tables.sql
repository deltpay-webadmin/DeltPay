-- ============================================================================
-- Migration 2: Delt Pay tables — payments, invoices, customers
-- ----------------------------------------------------------------------------
-- Owner-scoped on user_id = auth.users.id. Every table has RLS enabled so a
-- signed-in merchant only ever reads/writes their own rows. `invoices` and
-- `customers` are created now and wired into the UI in a later pass.
-- Idempotent: safe to (re)apply.
-- ============================================================================

-- ── payments ─────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount_cents   bigint not null,
  currency       text not null default 'usd',
  status         text not null default 'succeeded',   -- succeeded | pending | failed | refunded
  method         text,                                -- card | ach | ...
  customer_name  text,
  customer_email text,
  description    text,
  created_at     timestamptz not null default now()
);
create index if not exists payments_user_id_created_at_idx
  on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);
drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);
drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own" on public.payments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own" on public.payments
  for delete using (auth.uid() = user_id);

-- ── customers ────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name              text not null,
  email             text,
  phone             text,
  total_spend_cents bigint not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists customers_user_id_idx on public.customers (user_id);

alter table public.customers enable row level security;

drop policy if exists "customers_select_own" on public.customers;
create policy "customers_select_own" on public.customers
  for select using (auth.uid() = user_id);
drop policy if exists "customers_insert_own" on public.customers;
create policy "customers_insert_own" on public.customers
  for insert with check (auth.uid() = user_id);
drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own" on public.customers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "customers_delete_own" on public.customers;
create policy "customers_delete_own" on public.customers
  for delete using (auth.uid() = user_id);

-- ── invoices ─────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  number       text,
  client_name  text,
  amount_cents bigint not null,
  status       text not null default 'draft',   -- draft | sent | paid | overdue
  due_date     date,
  created_at   timestamptz not null default now()
);
create index if not exists invoices_user_id_idx on public.invoices (user_id);

alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = user_id);
drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = user_id);
drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own" on public.invoices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own" on public.invoices
  for delete using (auth.uid() = user_id);
