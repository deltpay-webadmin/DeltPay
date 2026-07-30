-- ────────────────────────────────────────────────────────────
-- Contracts — MCA agreements sent for e-signature via DocuSign.
-- One row per envelope; terms holds the Schedule A snapshot the
-- envelope was generated from. Same conventions as the other CRM
-- tables: is_staff() RLS, realtime, touch_updated_at.
-- ────────────────────────────────────────────────────────────

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  merchant_id text,
  merchant_name text not null,
  deal_id text,
  signer_name text not null,
  signer_email text not null,
  signer_title text,
  guarantor_name text,
  guarantor_email text,
  terms jsonb not null default '{}'::jsonb,
  envelope_id text,
  status text not null default 'draft',  -- draft | sent | delivered | completed | declined | voided | error
  docusign_status text,
  last_error text,
  sent_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_envelope_idx on public.contracts (envelope_id);
create index if not exists contracts_merchant_idx on public.contracts (merchant_id);

alter table public.contracts enable row level security;

drop policy if exists contracts_staff_all on public.contracts;
create policy contracts_staff_all on public.contracts
  for all using (is_staff()) with check (is_staff());

drop trigger if exists contracts_touch on public.contracts;
create trigger contracts_touch
  before update on public.contracts
  for each row execute function touch_updated_at();

alter publication supabase_realtime add table public.contracts;
