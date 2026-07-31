-- ============================================================================
-- Real foreign keys beside the legacy name-string joins.
--
-- Until now merchants ↔ deals ↔ residuals ↔ agents were joined by free-text
-- names (merchants.agent, crm_deals.borrower, residual_rows.merchant_name,
-- capital_deals.rep/merchant, pipeline_leads.assigned_agent, ...), which
-- corrupts silently when two agents share a name or a merchant is renamed.
--
-- Strategy (additive only — no drops, no renames):
--   - new FK columns next to every name column, backfilled by org-scoped,
--     case-insensitive name match
--   - the name columns stay as denormalized display values
--   - a resolve_agent trigger keeps agent_id coherent while the UI still
--     writes names: on insert/name-change it re-resolves (auto-creating an
--     agents row for a brand-new name, preserving free-text entry)
--   - FKs on pre-existing id columns (contracts, ad_leads) are added after
--     nulling orphaned references
--
-- residual_rows.merchant_id is untouched: it holds the processor MID from
-- residual CSVs, not a merchants.id — the new column is merchant_ref.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. New columns
-- ---------------------------------------------------------------------------

alter table public.merchants
  add column if not exists agent_id uuid references public.agents(id) on delete set null;
alter table public.crm_deals
  add column if not exists agent_id uuid references public.agents(id) on delete set null,
  add column if not exists merchant_id text references public.merchants(id) on delete set null;
alter table public.residual_rows
  add column if not exists agent_id uuid references public.agents(id) on delete set null,
  add column if not exists merchant_ref text references public.merchants(id) on delete set null;
alter table public.pipeline_leads
  add column if not exists agent_id uuid references public.agents(id) on delete set null;
alter table public.onboarding_apps
  add column if not exists agent_id uuid references public.agents(id) on delete set null,
  add column if not exists merchant_ref text references public.merchants(id) on delete set null,
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null;
alter table public.capital_deals
  add column if not exists agent_id uuid references public.agents(id) on delete set null,
  add column if not exists merchant_ref text references public.merchants(id) on delete set null;
alter table public.underwriting_apps
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null;

create index if not exists merchants_agent_id_idx on public.merchants (agent_id);
create index if not exists crm_deals_agent_id_idx on public.crm_deals (agent_id);
create index if not exists crm_deals_merchant_id_idx on public.crm_deals (merchant_id);
create index if not exists residual_rows_agent_id_idx on public.residual_rows (agent_id);
create index if not exists residual_rows_merchant_ref_idx on public.residual_rows (merchant_ref);
create index if not exists pipeline_leads_agent_id_idx on public.pipeline_leads (agent_id);
create index if not exists onboarding_apps_agent_id_idx on public.onboarding_apps (agent_id);
create index if not exists onboarding_apps_merchant_ref_idx on public.onboarding_apps (merchant_ref);
create index if not exists onboarding_apps_lead_id_idx on public.onboarding_apps (lead_id);
create index if not exists capital_deals_agent_id_idx on public.capital_deals (agent_id);
create index if not exists capital_deals_merchant_ref_idx on public.capital_deals (merchant_ref);
create index if not exists underwriting_apps_lead_id_idx on public.underwriting_apps (lead_id);

-- ---------------------------------------------------------------------------
-- 2. Backfill by org-scoped, case-insensitive name match
-- ---------------------------------------------------------------------------

update public.merchants m set agent_id = a.id
from public.agents a
where m.agent_id is null and a.org_id = m.org_id
  and lower(a.name) = lower(trim(m.agent));

update public.crm_deals d set agent_id = a.id
from public.agents a
where d.agent_id is null and a.org_id = d.org_id
  and lower(a.name) = lower(trim(d.agent));

update public.crm_deals d set merchant_id = m.id
from public.merchants m
where d.merchant_id is null and m.org_id = d.org_id
  and lower(m.name) = lower(trim(d.borrower));

update public.residual_rows r set agent_id = a.id
from public.agents a
where r.agent_id is null and a.org_id = r.org_id
  and lower(a.name) = lower(trim(r.agent));

update public.residual_rows r set merchant_ref = m.id
from public.merchants m
where r.merchant_ref is null and m.org_id = r.org_id
  and lower(m.name) = lower(trim(r.merchant_name));

update public.pipeline_leads l set agent_id = a.id
from public.agents a
where l.agent_id is null and a.org_id = l.org_id
  and lower(a.name) = lower(trim(coalesce(l.assigned_agent, '')));

update public.onboarding_apps o set agent_id = a.id
from public.agents a
where o.agent_id is null and a.org_id = o.org_id
  and lower(a.name) = lower(trim(o.agent));

update public.onboarding_apps o set merchant_ref = m.id
from public.merchants m
where o.merchant_ref is null and m.org_id = o.org_id
  and lower(m.name) = lower(trim(o.merchant_name));

update public.capital_deals c set agent_id = a.id
from public.agents a
where c.agent_id is null and a.org_id = c.org_id
  and lower(a.name) = lower(trim(coalesce(c.rep, '')));

update public.capital_deals c set merchant_ref = m.id
from public.merchants m
where c.merchant_ref is null and m.org_id = c.org_id
  and lower(m.name) = lower(trim(c.merchant));

-- ---------------------------------------------------------------------------
-- 3. FKs on pre-existing reference columns (null orphans first)
-- ---------------------------------------------------------------------------

update public.contracts c set merchant_id = null
where c.merchant_id is not null
  and not exists (select 1 from public.merchants m where m.id = c.merchant_id);
update public.contracts c set deal_id = null
where c.deal_id is not null
  and not exists (select 1 from public.crm_deals d where d.id = c.deal_id);
update public.ad_leads l set matched_lead_id = null, match_basis = null
where l.matched_lead_id is not null
  and not exists (select 1 from public.pipeline_leads p where p.id = l.matched_lead_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contracts_merchant_id_fkey') then
    alter table public.contracts
      add constraint contracts_merchant_id_fkey
      foreign key (merchant_id) references public.merchants(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contracts_deal_id_fkey') then
    alter table public.contracts
      add constraint contracts_deal_id_fkey
      foreign key (deal_id) references public.crm_deals(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ad_leads_matched_lead_id_fkey') then
    alter table public.ad_leads
      add constraint ad_leads_matched_lead_id_fkey
      foreign key (matched_lead_id) references public.pipeline_leads(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contracts_created_by_fkey') then
    alter table public.contracts
      add constraint contracts_created_by_fkey
      foreign key (created_by) references auth.users(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ad_connections_connected_by_fkey') then
    alter table public.ad_connections
      add constraint ad_connections_connected_by_fkey
      foreign key (connected_by) references auth.users(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Keep agent_id coherent while the UI still writes agent names.
--    tg_argv[0] names the column holding the agent display name.
-- ---------------------------------------------------------------------------

create or replace function public.resolve_agent()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
declare
  col text := tg_argv[0];
  nm text;
  resolved uuid;
begin
  nm := nullif(trim(coalesce(to_jsonb(new) ->> col, '')), '');

  if nm is null or lower(nm) = 'unassigned' then
    if tg_op = 'INSERT' then
      return new;
    end if;
    -- name was cleared and agent_id untouched → clear the link too
    if (to_jsonb(new) ->> col) is distinct from (to_jsonb(old) ->> col)
       and new.agent_id is not distinct from old.agent_id then
      new.agent_id := null;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.agent_id is not null then
      return new;  -- caller set the FK explicitly
    end if;
  else
    if (to_jsonb(new) ->> col) is not distinct from (to_jsonb(old) ->> col) then
      return new;  -- name unchanged
    end if;
    if new.agent_id is distinct from old.agent_id then
      return new;  -- caller changed the FK explicitly alongside the name
    end if;
  end if;

  select id into resolved from public.agents
  where org_id = new.org_id and lower(name) = lower(nm)
  limit 1;

  if resolved is null then
    -- unknown name: keep today's free-text behavior by growing the roster
    insert into public.agents (org_id, name) values (new.org_id, nm)
    on conflict (org_id, lower(name)) do nothing;
    select id into resolved from public.agents
    where org_id = new.org_id and lower(name) = lower(nm)
    limit 1;
  end if;

  new.agent_id := resolved;
  return new;
end;
$$;

-- (fires after <t>_org_stamp — same-event triggers run in name order)
drop trigger if exists merchants_resolve_agent on public.merchants;
create trigger merchants_resolve_agent before insert or update on public.merchants
  for each row execute function public.resolve_agent('agent');

drop trigger if exists crm_deals_resolve_agent on public.crm_deals;
create trigger crm_deals_resolve_agent before insert or update on public.crm_deals
  for each row execute function public.resolve_agent('agent');

drop trigger if exists residual_rows_resolve_agent on public.residual_rows;
create trigger residual_rows_resolve_agent before insert or update on public.residual_rows
  for each row execute function public.resolve_agent('agent');

drop trigger if exists pipeline_leads_resolve_agent on public.pipeline_leads;
create trigger pipeline_leads_resolve_agent before insert or update on public.pipeline_leads
  for each row execute function public.resolve_agent('assigned_agent');

drop trigger if exists onboarding_apps_resolve_agent on public.onboarding_apps;
create trigger onboarding_apps_resolve_agent before insert or update on public.onboarding_apps
  for each row execute function public.resolve_agent('agent');

drop trigger if exists capital_deals_resolve_agent on public.capital_deals;
create trigger capital_deals_resolve_agent before insert or update on public.capital_deals
  for each row execute function public.resolve_agent('rep');
