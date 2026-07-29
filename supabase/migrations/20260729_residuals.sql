-- ────────────────────────────────────────────────────────────
-- Residuals — processor residual report imports and per-merchant
-- rows. Backs the Residuals page (admin upload + agent statements).
-- Same conventions as the other CRM tables: is_staff() RLS.
-- ────────────────────────────────────────────────────────────

create table if not exists public.residual_imports (
  id uuid primary key default gen_random_uuid(),
  period text not null,          -- 'YYYY-MM'
  period_label text not null,    -- 'March 2026'
  filename text not null,
  row_count integer not null default 0,
  status text not null default 'Processed',
  created_at timestamptz not null default now()
);

create table if not exists public.residual_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references public.residual_imports(id) on delete cascade,
  period text not null,          -- 'YYYY-MM'
  merchant_id text,
  merchant_name text not null,
  monthly_volume numeric not null default 0,
  transaction_count integer not null default 0,
  gross_revenue numeric not null default 0,
  processor_fees numeric not null default 0,
  net_revenue numeric not null default 0,
  agent text not null default 'Unassigned',
  agent_share numeric not null default 0,
  delt_net numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists residual_rows_period_idx on public.residual_rows (period);
create index if not exists residual_rows_agent_idx on public.residual_rows (agent);

alter table public.residual_imports enable row level security;
alter table public.residual_rows enable row level security;

drop policy if exists residual_imports_staff_all on public.residual_imports;
create policy residual_imports_staff_all on public.residual_imports
  for all using (is_staff()) with check (is_staff());

drop policy if exists residual_rows_staff_all on public.residual_rows;
create policy residual_rows_staff_all on public.residual_rows
  for all using (is_staff()) with check (is_staff());
