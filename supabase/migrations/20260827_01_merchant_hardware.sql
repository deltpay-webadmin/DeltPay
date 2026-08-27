-- ────────────────────────────────────────────────────────────
-- Merchant hardware — the devices a merchant actually has and
-- whether they're installed. Deliberately minimal: one row per
-- physical device, a small status ladder, free-text install
-- notes. Replaces the demo "Equipment & Terminals" data with a
-- true record; it is NOT an inventory/dispatch system.
-- Same conventions as the other CRM tables: is_staff() RLS,
-- explicit grants (this project has no default privileges),
-- touch_updated_at trigger.
-- ────────────────────────────────────────────────────────────

create table if not exists public.merchant_hardware (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null references public.merchants(id) on delete cascade,
  model text not null,
  serial text not null default '',
  channel text not null default 'Square'
    check (channel in ('Square', 'Luqra', 'Paysafe', 'Other')),
  status text not null default 'ordered'
    check (status in ('ordered', 'shipped', 'installed', 'active', 'returned')),
  installed_at timestamptz,
  install_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchant_hardware_merchant_idx
  on public.merchant_hardware (merchant_id, created_at desc);

alter table public.merchant_hardware enable row level security;

drop policy if exists merchant_hardware_staff_all on public.merchant_hardware;
create policy merchant_hardware_staff_all on public.merchant_hardware
  for all to authenticated using (is_staff()) with check (is_staff());

grant select, insert, update, delete on public.merchant_hardware
  to authenticated, service_role;

drop trigger if exists merchant_hardware_touch on public.merchant_hardware;
create trigger merchant_hardware_touch before update on public.merchant_hardware
  for each row execute function public.touch_updated_at();
