-- ============================================================================
-- MPA pricing templates — reusable per-processor fee schedules.
--
-- One row per saved template. `pricing` holds the same shape the boarding
-- panel's pricing grid edits (LuqraPricing / PaysafePricing as string maps),
-- so applying a template is a plain overlay onto the grid. Templates are
-- org-wide: any staff member can read and save them, so the whole team
-- boards from the same fee schedules. Nothing sensitive lives here.
-- ============================================================================

create table if not exists public.mpa_pricing_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  channel text not null check (channel in ('Luqra', 'Paysafe')),
  name text not null check (char_length(trim(name)) between 1 and 80),
  pricing jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists mpa_pricing_templates_name_uidx
  on public.mpa_pricing_templates (org_id, channel, lower(name));
create index if not exists mpa_pricing_templates_org_idx
  on public.mpa_pricing_templates (org_id);

drop trigger if exists mpa_pricing_templates_org_stamp on public.mpa_pricing_templates;
create trigger mpa_pricing_templates_org_stamp before insert on public.mpa_pricing_templates
  for each row execute function public.set_org_id();

alter table public.mpa_pricing_templates enable row level security;

-- Org-wide read/write: templates are shared tooling, not per-agent data.
-- Deleting is limited to ops (agents.edit) or the template's creator.
drop policy if exists mpa_pricing_templates_select on public.mpa_pricing_templates;
create policy mpa_pricing_templates_select on public.mpa_pricing_templates for select to authenticated using (
  org_id = (select public.current_org_id())
);
drop policy if exists mpa_pricing_templates_insert on public.mpa_pricing_templates;
create policy mpa_pricing_templates_insert on public.mpa_pricing_templates for insert to authenticated with check (
  org_id = (select public.current_org_id())
);
drop policy if exists mpa_pricing_templates_update on public.mpa_pricing_templates;
create policy mpa_pricing_templates_update on public.mpa_pricing_templates for update to authenticated using (
  org_id = (select public.current_org_id())
) with check (org_id = (select public.current_org_id()));
drop policy if exists mpa_pricing_templates_delete on public.mpa_pricing_templates;
create policy mpa_pricing_templates_delete on public.mpa_pricing_templates for delete to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit')) or created_by = (select auth.uid()))
);

grant select, insert, update, delete on public.mpa_pricing_templates to authenticated, service_role;

do $$
begin
  alter publication supabase_realtime add table public.mpa_pricing_templates;
exception
  when duplicate_object then null;
end $$;
