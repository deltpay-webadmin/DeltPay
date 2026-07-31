-- ============================================================================
-- RBAC storage + helper functions.
--
-- Persists the 4-role × 71-permission matrix designed in
-- src/backend/imports/pasted_text/role-permissions.ts (PERMISSION_MODULES +
-- DEFAULT_PERMS). Stored dense — one row per (org, role, 'module.action') with
-- an `allowed` flag — so has_perm() is a single indexed lookup and tenants can
-- edit their own matrix later. The sparse allow/deny semantics of
-- DEFAULT_PERMS are resolved once, at seed time:
--   super_admin → everything true
--   admin       → everything except the denied list
--   agent/viewer→ only their allowlist
--
-- All helpers are STABLE SECURITY DEFINER with a pinned search_path, and RLS
-- policies must call them wrapped in (select ...) so the planner evaluates
-- them once per statement.
-- ============================================================================

create table if not exists public.role_permissions (
  org_id uuid not null references public.orgs(id) on delete cascade,
  role text not null check (role in ('super_admin', 'admin', 'agent', 'viewer')),
  perm text not null,
  allowed boolean not null default false,
  primary key (org_id, role, perm)
);

create or replace function public.seed_default_permissions(p_org uuid)
returns void
language plpgsql security definer
set search_path to 'public'
as $$
declare
  all_perms text[] := array[
    -- Pipeline
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
    'underwriting.view', 'underwriting.review', 'underwriting.approve', 'underwriting.decline', 'underwriting.assign',
    'cost_calculator.view', 'cost_calculator.use',
    'analysis.view', 'analysis.create', 'analysis.edit', 'analysis.export',
    -- Merchants
    'merchants.view', 'merchants.create', 'merchants.edit', 'merchants.delete', 'merchants.export',
    'residuals.view', 'residuals.upload', 'residuals.edit', 'residuals.verify_ic', 'residuals.export',
    'capital.view', 'capital.create', 'capital.approve', 'capital.fund', 'capital.modify_terms', 'capital.write_off',
    'health.view', 'health.create_action', 'health.resolve',
    -- Team
    'agents.view', 'agents.create', 'agents.edit', 'agents.deactivate', 'agents.view_all',
    'compensation.view', 'compensation.edit', 'compensation.view_all',
    'employees.view', 'employees.create', 'employees.edit', 'employees.deactivate',
    'payroll.view', 'payroll.run', 'payroll.approve', 'payroll.export',
    -- Intelligence
    'lens_ai.view', 'lens_ai.configure', 'lens_ai.export',
    'financials.view', 'financials.export', 'financials.edit_projections',
    -- Settings
    'general.view', 'general.edit',
    'integrations.view', 'integrations.configure', 'integrations.disconnect',
    'roles.view', 'roles.edit',
    'bundles.view', 'bundles.create', 'bundles.edit', 'bundles.delete',
    'billing.view', 'billing.manage'
  ];
  admin_denied text[] := array['roles.edit', 'billing.manage', 'general.edit', 'capital.write_off'];
  agent_allowed text[] := array[
    'leads.view', 'leads.create', 'leads.edit', 'underwriting.view',
    'cost_calculator.view', 'cost_calculator.use',
    'analysis.view', 'analysis.create', 'analysis.export',
    'merchants.view', 'residuals.view', 'capital.view', 'health.view',
    'agents.view', 'compensation.view', 'lens_ai.view'
  ];
  viewer_allowed text[] := array[
    'leads.view', 'merchants.view', 'residuals.view', 'capital.view',
    'health.view', 'financials.view', 'lens_ai.view'
  ];
  p text;
begin
  foreach p in array all_perms loop
    insert into public.role_permissions (org_id, role, perm, allowed) values
      (p_org, 'super_admin', p, true),
      (p_org, 'admin', p, not (p = any(admin_denied))),
      (p_org, 'agent', p, p = any(agent_allowed)),
      (p_org, 'viewer', p, p = any(viewer_allowed))
    -- never clobber a tenant's edited matrix on re-seed
    on conflict (org_id, role, perm) do nothing;
  end loop;
end;
$$;

select public.seed_default_permissions(public.default_org_id());

-- ---------------------------------------------------------------------------
-- Session helpers
-- ---------------------------------------------------------------------------

create or replace function public.current_org_id()
returns uuid
language sql stable security definer
set search_path to 'public'
as $$
  SELECT org_id FROM public.org_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

create or replace function public.current_org_role()
returns text
language sql stable security definer
set search_path to 'public'
as $$
  SELECT role FROM public.org_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

create or replace function public.current_agent_id()
returns uuid
language sql stable security definer
set search_path to 'public'
as $$
  SELECT agent_id FROM public.org_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

create or replace function public.is_org_admin()
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  SELECT public.current_org_role() IN ('super_admin', 'admin');
$$;

create or replace function public.has_perm(p_perm text)
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  SELECT COALESCE((
    SELECT rp.allowed
    FROM public.org_members m
    JOIN public.role_permissions rp
      ON rp.org_id = m.org_id AND rp.role = m.role AND rp.perm = p_perm
    WHERE m.user_id = auth.uid() AND m.status = 'active'
  ), false);
$$;

grant execute on function public.current_org_id() to authenticated, service_role;
grant execute on function public.current_org_role() to authenticated, service_role;
grant execute on function public.current_agent_id() to authenticated, service_role;
grant execute on function public.is_org_admin() to authenticated, service_role;
grant execute on function public.has_perm(text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- get_me(): everything the CRM shell needs in one round trip
-- ---------------------------------------------------------------------------

create or replace function public.get_me()
returns jsonb
language sql stable security definer
set search_path to 'public'
as $$
  SELECT jsonb_build_object(
    'user_id', m.user_id,
    'role', m.role,
    'agent_id', m.agent_id,
    'agent_name', a.name,
    'display_name', coalesce(nullif(m.display_name, ''), nullif(sp.full_name, ''), m.email, sp.email),
    'email', coalesce(m.email, sp.email),
    'org', jsonb_build_object(
      'id', o.id, 'name', o.name, 'slug', o.slug,
      'logo_url', o.logo_url,
      'primary_color', o.primary_color, 'secondary_color', o.secondary_color,
      'custom_domain', o.custom_domain
    ),
    'perms', coalesce((
      SELECT jsonb_agg(rp.perm ORDER BY rp.perm)
      FROM public.role_permissions rp
      WHERE rp.org_id = m.org_id AND rp.role = m.role AND rp.allowed
    ), '[]'::jsonb)
  )
  FROM public.org_members m
  JOIN public.orgs o ON o.id = m.org_id
  LEFT JOIN public.agents a ON a.id = m.agent_id
  LEFT JOIN public.staff_profiles sp ON sp.id = m.user_id
  WHERE m.user_id = auth.uid() AND m.status = 'active'
  LIMIT 1;
$$;
grant execute on function public.get_me() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS + grants (interim; ownership policies land in 20260731_06_rls_rbac)
-- ---------------------------------------------------------------------------

alter table public.role_permissions enable row level security;

drop policy if exists role_permissions_member_read on public.role_permissions;
create policy role_permissions_member_read on public.role_permissions
  for select to authenticated using (org_id = (select public.current_org_id()));

grant select on public.role_permissions to authenticated;
grant select, insert, update, delete on public.role_permissions to service_role;
