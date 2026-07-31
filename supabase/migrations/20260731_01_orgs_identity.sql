-- ============================================================================
-- Multi-tenancy foundation: orgs, agents roster, org membership.
--
-- - orgs: one row per tenant (DeltPay itself becomes org #1). Carries the
--   per-tenant branding fields the white-label CRM reads (logo, colors,
--   custom_domain). Domain-based org resolution is future work — today the
--   org is derived from the signed-in user's membership.
-- - agents: the CRM roster entity that legacy name-string columns
--   (merchants.agent, crm_deals.agent, residual_rows.agent, capital_deals.rep,
--   pipeline_leads.assigned_agent, onboarding_apps.agent) resolve to.
--   user_id is nullable: an agent can exist before/without a login.
-- - org_members: auth.users ↔ org with an RBAC role. One org per user in v1
--   (current_org_id() depends on that).
--
-- is_staff() is redefined on top of org_members so every existing policy and
-- the docusign function's rpc("is_staff") keep working unchanged.
-- ============================================================================

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text not null default '#2E6BFF',
  secondary_color text not null default '#041e42',
  custom_domain text unique,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DeltPay is org #1 with a fixed UUID so backfills and edge-function
-- fallbacks are deterministic.
insert into public.orgs (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Delt Pay LLC', 'deltpay')
on conflict (id) do nothing;

create or replace function public.default_org_id()
returns uuid
language sql immutable parallel safe
as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  split numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists agents_org_name_idx on public.agents (org_id, lower(name));
create unique index if not exists agents_user_idx on public.agents (user_id) where user_id is not null;

create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'admin', 'agent', 'viewer')),
  agent_id uuid references public.agents(id) on delete set null,
  display_name text,
  email text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
-- v1: one org per user. current_org_id()/get_me() rely on this.
create unique index if not exists org_members_single_org_idx on public.org_members (user_id);
create index if not exists org_members_agent_idx on public.org_members (agent_id);

drop trigger if exists orgs_touch on public.orgs;
create trigger orgs_touch before update on public.orgs
  for each row execute function public.touch_updated_at();
drop trigger if exists agents_touch on public.agents;
create trigger agents_touch before update on public.agents
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Backfills
-- ---------------------------------------------------------------------------

-- Existing staff → members of org #1. The founding team (all current
-- staff_profiles rows) becomes super_admin per owner decision 2026-07-31;
-- users added later get their role assigned explicitly.
insert into public.org_members (org_id, user_id, role, display_name, email)
select public.default_org_id(), sp.id, 'super_admin', nullif(sp.full_name, ''), sp.email
from public.staff_profiles sp
on conflict (org_id, user_id) do nothing;

-- Agent roster seeded from every legacy name column.
insert into public.agents (org_id, name)
select public.default_org_id(), n from (
  select distinct trim(agent) as n from public.merchants
  union select distinct trim(agent) from public.crm_deals
  union select distinct trim(agent) from public.residual_rows
  union select distinct trim(assigned_agent) from public.pipeline_leads
  union select distinct trim(agent) from public.onboarding_apps
  union select distinct trim(rep) from public.capital_deals
) s
where n is not null and n not in ('', 'Unassigned')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- is_staff() now means "active member of an org"
-- ---------------------------------------------------------------------------

create or replace function public.is_staff()
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = auth.uid() AND status = 'active'
  );
$$;
grant execute on function public.is_staff() to authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- RLS + grants (interim is_staff policies; rewritten by 20260731_06_rls_rbac)
-- ---------------------------------------------------------------------------

alter table public.orgs enable row level security;
alter table public.agents enable row level security;
alter table public.org_members enable row level security;

drop policy if exists orgs_staff_read on public.orgs;
create policy orgs_staff_read on public.orgs
  for select to authenticated using (is_staff());

drop policy if exists agents_staff_all on public.agents;
create policy agents_staff_all on public.agents
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists org_members_staff_read on public.org_members;
create policy org_members_staff_read on public.org_members
  for select to authenticated using (is_staff());

grant select, update on public.orgs to authenticated;
grant select, insert, update, delete on public.orgs to service_role;
grant select, insert, update, delete on public.agents to authenticated, service_role;
grant select on public.org_members to authenticated;
grant select, insert, update, delete on public.org_members to service_role;
