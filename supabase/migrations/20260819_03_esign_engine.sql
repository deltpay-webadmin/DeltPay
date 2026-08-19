-- ============================================================================
-- E-sign engine upgrades (phase 3)
--
-- 1. contracts.mode — how the envelope signs ('email' remote vs 'embedded'
--    in-person on the iPad). Stored on the row (not buried in terms) so any
--    kind can be embedded, and countersign/signing-url can reconstruct the
--    deterministic clientUserId scheme.
-- 2. contracts.countersigned_at / countersigner_email — the executed state
--    the funding gate depends on. An MCA that "completed" without these is
--    signed by the merchant but not executed by Delt.
-- 3. deal_documents.doc_kind grows distinct values for each signed document
--    plus the internal underwriting decision memo.
-- 4. org_esign_settings — the Delt countersigner identity, org-configurable
--    from the CRM (env DOCUSIGN_COUNTERSIGNER_* stays as fallback).
-- 5. New RBAC permission contracts.countersign (super_admin/admin), seeded
--    for existing orgs and added to seed_default_permissions for future ones.
-- ============================================================================

alter table public.contracts
  add column if not exists mode text not null default 'email'
    check (mode in ('email', 'embedded')),
  add column if not exists countersigned_at timestamptz,
  add column if not exists countersigner_email text;

-- Legacy embedded MPAs recorded mode inside terms; lift it onto the column.
update public.contracts
set mode = 'embedded'
where kind = 'mpa' and terms->>'mode' = 'embedded' and mode = 'email';

alter table public.deal_documents drop constraint if exists deal_documents_doc_kind_check;
alter table public.deal_documents add constraint deal_documents_doc_kind_check
  check (doc_kind in (
    'voided_check', 'drivers_license', 'statement',
    'signed_application', 'signed_mca', 'signed_mpa', 'decision_memo', 'other'
  ));

-- ---------------------------------------------------------------------------
-- Countersigner identity
-- ---------------------------------------------------------------------------

create table if not exists public.org_esign_settings (
  org_id uuid primary key references public.orgs(id) on delete cascade,
  countersigner_name text,
  countersigner_email text,
  updated_at timestamptz not null default now()
);

alter table public.org_esign_settings enable row level security;

drop policy if exists org_esign_settings_select on public.org_esign_settings;
create policy org_esign_settings_select on public.org_esign_settings
  for select to authenticated using (org_id = (select public.current_org_id()));
drop policy if exists org_esign_settings_insert on public.org_esign_settings;
create policy org_esign_settings_insert on public.org_esign_settings
  for insert to authenticated with check (
    org_id = (select public.current_org_id()) and (select public.has_perm('general.edit'))
  );
drop policy if exists org_esign_settings_update on public.org_esign_settings;
create policy org_esign_settings_update on public.org_esign_settings
  for update to authenticated using (
    org_id = (select public.current_org_id()) and (select public.has_perm('general.edit'))
  ) with check (org_id = (select public.current_org_id()));

grant select, insert, update on public.org_esign_settings to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- contracts.countersign permission
-- ---------------------------------------------------------------------------

-- Existing orgs: allowed for super_admin/admin, denied for agent/viewer.
insert into public.role_permissions (org_id, role, perm, allowed)
select o.id, r.role, 'contracts.countersign', r.role in ('super_admin', 'admin')
from public.orgs o
cross join (values ('super_admin'), ('admin'), ('agent'), ('viewer')) as r(role)
on conflict (org_id, role, perm) do nothing;

-- Future orgs: re-declare the seeder with the new permission in the matrix
-- (same body as 20260731_02 plus contracts.countersign; conflict-safe).
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
    -- Contracts / e-sign
    'contracts.countersign',
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
    on conflict (org_id, role, perm) do nothing;
  end loop;
end;
$$;

revoke execute on function public.seed_default_permissions(uuid) from public, anon, authenticated;
