-- ────────────────────────────────────────────────────────────────
-- Plaid Data Vault
-- ────────────────────────────────────────────────────────────────
-- Hierarchical, file-system-like store for everything pulled from
-- Plaid (identity, bank verification, financials, credit), plus a
-- registry of connected Plaid Items.
--
--   • plaid_items        — one row per institution connection (metadata
--                          only; staff-readable). Never holds tokens.
--   • plaid_credentials  — access tokens. RLS enabled with NO policies,
--                          so only service-role edge functions can read.
--   • plaid_nodes        — the vault itself: every row is a node addressed
--                          by an absolute path key, e.g.
--                          /prospects/lead-001/financials/chase-4f2a/transactions/2026-07
--                          Folders give the tree structure; documents carry
--                          jsonb payloads. parent_path is derived from path
--                          so folder listings are a single indexed lookup.
-- ────────────────────────────────────────────────────────────────

-- 1) Connected Plaid Items
create table if not exists public.plaid_items (
  id uuid primary key default gen_random_uuid(),
  item_id text not null unique,
  lead_id text references public.pipeline_leads(id) on delete set null,
  institution_id text,
  institution_name text,
  item_key text not null default '',           -- slug used in vault paths, e.g. chase-4f2a
  products text[] not null default '{}',
  status text not null default 'active',       -- active | error | disconnected
  error text,
  transactions_cursor text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plaid_items_lead_idx on public.plaid_items (lead_id);

alter table public.plaid_items enable row level security;

drop policy if exists plaid_items_staff_read on public.plaid_items;
create policy plaid_items_staff_read on public.plaid_items
  for select using (is_staff());

-- 2) Access tokens — service role only (RLS on, no policies)
create table if not exists public.plaid_credentials (
  item_id text primary key references public.plaid_items(item_id) on delete cascade,
  access_token text not null,
  created_at timestamptz not null default now()
);

alter table public.plaid_credentials enable row level security;

-- 3) The hierarchical vault
create table if not exists public.plaid_nodes (
  path text primary key
    check (path ~ '^/[^/]' and path !~ '/$'),
  parent_path text generated always as
    (nullif(regexp_replace(path, '/[^/]*$', ''), '')) stored,
  name text not null,
  node_type text not null check (node_type in ('folder', 'document')),
  doc_kind text,                               -- summary | identity | account | transactions | cash_flow | liabilities | underwriting_inputs | ...
  lead_id text,
  item_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plaid_nodes_parent_idx on public.plaid_nodes (parent_path);
create index if not exists plaid_nodes_lead_idx on public.plaid_nodes (lead_id);
create index if not exists plaid_nodes_item_idx on public.plaid_nodes (item_id);
-- Prefix scans: `path like '/prospects/lead-001/%'`
create index if not exists plaid_nodes_prefix_idx on public.plaid_nodes (path text_pattern_ops);

alter table public.plaid_nodes enable row level security;

drop policy if exists plaid_nodes_staff_read on public.plaid_nodes;
create policy plaid_nodes_staff_read on public.plaid_nodes
  for select using (is_staff());

-- 4) updated_at maintenance
create or replace function public.plaid_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists plaid_items_touch on public.plaid_items;
create trigger plaid_items_touch
  before update on public.plaid_items
  for each row execute function public.plaid_touch_updated_at();

drop trigger if exists plaid_nodes_touch on public.plaid_nodes;
create trigger plaid_nodes_touch
  before update on public.plaid_nodes
  for each row execute function public.plaid_touch_updated_at();

-- 5) Realtime — stream vault changes into the CRM like the other tables
do $$
begin
  begin
    alter publication supabase_realtime add table public.plaid_items;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.plaid_nodes;
  exception when duplicate_object then null;
  end;
end $$;

-- 6) Table privileges
-- This project does not carry Supabase's usual default privileges, so the
-- vault tables come up bare. Grant exactly what each role needs; RLS still
-- gates rows. plaid_credentials stays service-role only.
grant select on public.plaid_items to authenticated;
grant select on public.plaid_nodes to authenticated;
grant select, insert, update, delete on public.plaid_items to service_role;
grant select, insert, update, delete on public.plaid_nodes to service_role;
grant select, insert, update, delete on public.plaid_credentials to service_role;
revoke truncate, trigger, references on public.plaid_items from anon, authenticated;
revoke truncate, trigger, references on public.plaid_nodes from anon, authenticated;
revoke truncate, trigger, references on public.plaid_credentials from anon, authenticated;
