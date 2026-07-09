-- ============================================================================
-- Migration 1: profiles (shared identity / merchant record) + shared helpers
-- ----------------------------------------------------------------------------
-- Canonical account record keyed on auth.users.id. Both the DeltPay site and
-- the separate Delt Capital app authenticate against this same Supabase Auth
-- pool and share this table under RLS.
--
-- `product_access` is the per-product gate: {} = none yet, {payments} = Delt Pay
-- only, {capital} = Delt Capital only, {payments,capital} = both. The portal UI
-- reads this to decide which product areas a merchant can see. Each app upserts
-- its own tag on first use.
--
-- Idempotent: safe to (re)apply. Run Step 0 (`list_tables`) FIRST — if a table
-- already exists with a different shape (e.g. created by the Capital app),
-- reconcile columns before applying.
-- ============================================================================

-- Shared trigger fn: keep updated_at fresh on any row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text,
  first_name     text,
  last_name      text,
  business_name  text,
  business_type  text,
  industry       text,
  website        text,
  phone          text,
  monthly_volume text,
  product_access text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Owner-scoped RLS: a signed-in user only ever sees/edits their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── handle_new_user ──────────────────────────────────────────────────────────
-- On every new auth.users row, seed a profile from the signup metadata
-- (raw_user_meta_data). SECURITY DEFINER so it runs regardless of RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, business_name,
    business_type, industry, website, phone, monthly_volume, product_access
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_type',
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'website',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'monthly_volume',
    coalesce(
      (select array_agg(value)
         from jsonb_array_elements_text(new.raw_user_meta_data->'product_access')),
      '{}'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
