-- ============================================================================
-- RLS rewrite: org scope × permission × ownership.
--
-- Replaces the flat `is_staff()` FOR ALL policies with per-command policies:
--
--   org_id = (select current_org_id())          -- tenant isolation
--   AND (select has_perm('<module>.<action>'))  -- RBAC matrix lookup
--   AND <ownership branch>                      -- agent row scoping
--
-- Ownership branches (owner decision 2026-07-31):
--   - agents see ONLY their own merchants / deals / residuals / capital
--   - agents see their own + UNASSIGNED pipeline leads (claimable inbound),
--     and onboarding apps follow the same rule
--   - super_admin/admin see the whole org; viewer sees the whole org
--     read-only (their allowlist holds only .view perms)
--
-- Permission-key map for tables without an obvious module:
--   pipeline_leads, lead_imports, ad_leads, outreach_events  → leads.*
--   referrals                                                → leads.*
--   referral_program (program settings)                      → org admins
--   underwriting_apps, plaid_items, plaid_nodes              → underwriting.*
--   merchants, contracts, onboarding_apps                    → merchants.* / leads.edit
--   residual_imports, residual_rows                          → residuals.*
--   crm_deals, capital_deals, loan_payments, ach_*           → capital.*
--   ad_connections, ad_insights_daily                        → integrations.*
--   orgs / org_members / role_permissions / agents           → general.edit / roles.edit / agents.*
--
-- Every helper call is wrapped in (select ...) so the planner evaluates it
-- once per statement (initplan), not per row. SELECT policies are row
-- filters, never errors — a role without a perm gets zero rows, so the CRM's
-- hydration can't be blanked by a denial (table GRANTs stay in place).
--
-- plaid_credentials / ad_credentials / kv_store_940653c6 keep ZERO policies:
-- service-role only, unchanged.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Drop the flat staff policies
-- ---------------------------------------------------------------------------

drop policy if exists pipeline_leads_staff_all on public.pipeline_leads;
drop policy if exists onboarding_apps_staff_all on public.onboarding_apps;
drop policy if exists underwriting_apps_staff_all on public.underwriting_apps;
drop policy if exists referrals_staff_all on public.referrals;
drop policy if exists referral_program_staff_all on public.referral_program;
drop policy if exists lead_imports_staff on public.lead_imports;
drop policy if exists capital_deals_staff_all on public.capital_deals;
drop policy if exists loan_payments_staff on public.loan_payments;
drop policy if exists ach_imports_staff_all on public.ach_imports;
drop policy if exists ach_daily_activity_staff_all on public.ach_daily_activity;
drop policy if exists outreach_events_staff_read on public.outreach_events;
drop policy if exists merchants_staff_all on public.merchants;
drop policy if exists crm_deals_staff_all on public.crm_deals;
drop policy if exists residual_imports_staff_all on public.residual_imports;
drop policy if exists residual_rows_staff_all on public.residual_rows;
drop policy if exists contracts_staff_all on public.contracts;
drop policy if exists ad_connections_staff_all on public.ad_connections;
drop policy if exists ad_insights_daily_staff_all on public.ad_insights_daily;
drop policy if exists ad_leads_staff_all on public.ad_leads;
drop policy if exists plaid_items_staff_read on public.plaid_items;
drop policy if exists plaid_nodes_staff_read on public.plaid_nodes;
drop policy if exists orgs_staff_read on public.orgs;
drop policy if exists agents_staff_all on public.agents;
drop policy if exists org_members_staff_read on public.org_members;

-- Drop this file's own policies too, so re-applying is safe.
do $$
declare pair text[];
begin
  foreach pair slice 1 in array array[
    ['pipeline_leads','pipeline_leads_select'], ['pipeline_leads','pipeline_leads_insert'],
    ['pipeline_leads','pipeline_leads_update'], ['pipeline_leads','pipeline_leads_delete'],
    ['lead_imports','lead_imports_select'], ['lead_imports','lead_imports_insert'],
    ['lead_imports','lead_imports_delete'],
    ['ad_leads','ad_leads_select'], ['ad_leads','ad_leads_write'],
    ['outreach_events','outreach_events_select'],
    ['referrals','referrals_select'], ['referrals','referrals_insert'],
    ['referrals','referrals_update'], ['referrals','referrals_delete'],
    ['referral_program','referral_program_select'], ['referral_program','referral_program_write'],
    ['underwriting_apps','underwriting_apps_select'], ['underwriting_apps','underwriting_apps_write'],
    ['plaid_items','plaid_items_select'], ['plaid_nodes','plaid_nodes_select'],
    ['merchants','merchants_select'], ['merchants','merchants_insert'],
    ['merchants','merchants_update'], ['merchants','merchants_delete'],
    ['contracts','contracts_select'], ['contracts','contracts_write'],
    ['onboarding_apps','onboarding_apps_select'], ['onboarding_apps','onboarding_apps_insert'],
    ['onboarding_apps','onboarding_apps_update'], ['onboarding_apps','onboarding_apps_delete'],
    ['residual_imports','residual_imports_select'], ['residual_imports','residual_imports_insert'],
    ['residual_imports','residual_imports_update'], ['residual_imports','residual_imports_delete'],
    ['residual_rows','residual_rows_select'], ['residual_rows','residual_rows_insert'],
    ['residual_rows','residual_rows_update'], ['residual_rows','residual_rows_delete'],
    ['crm_deals','crm_deals_select'], ['crm_deals','crm_deals_insert'],
    ['crm_deals','crm_deals_update'], ['crm_deals','crm_deals_delete'],
    ['capital_deals','capital_deals_select'], ['capital_deals','capital_deals_insert'],
    ['capital_deals','capital_deals_update'], ['capital_deals','capital_deals_delete'],
    ['loan_payments','loan_payments_select'], ['loan_payments','loan_payments_write'],
    ['ach_imports','ach_imports_select'], ['ach_imports','ach_imports_write'],
    ['ach_daily_activity','ach_daily_activity_select'], ['ach_daily_activity','ach_daily_activity_write'],
    ['ad_connections','ad_connections_select'], ['ad_connections','ad_connections_write'],
    ['ad_insights_daily','ad_insights_daily_select'], ['ad_insights_daily','ad_insights_daily_write'],
    ['orgs','orgs_member_select'], ['orgs','orgs_admin_update'],
    ['org_members','org_members_member_select'], ['org_members','org_members_roles_write'],
    ['agents','agents_select'], ['agents','agents_insert'],
    ['agents','agents_update'], ['agents','agents_delete'],
    ['role_permissions','role_permissions_roles_write']
  ] loop
    execute format('drop policy if exists %I on public.%I', pair[2], pair[1]);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------

create policy pipeline_leads_select on public.pipeline_leads for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id())
       or agent_id is null)
);
create policy pipeline_leads_insert on public.pipeline_leads for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.create'))
);
create policy pipeline_leads_update on public.pipeline_leads for update to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.edit'))
  and ((select public.is_org_admin())
       or agent_id = (select public.current_agent_id())
       or agent_id is null)
) with check (
  org_id = (select public.current_org_id())
);
create policy pipeline_leads_delete on public.pipeline_leads for delete to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.delete'))
);

create policy lead_imports_select on public.lead_imports for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.view'))
);
create policy lead_imports_insert on public.lead_imports for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.create'))
);
create policy lead_imports_delete on public.lead_imports for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.delete'))
);

create policy ad_leads_select on public.ad_leads for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.view'))
);
create policy ad_leads_write on public.ad_leads for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.edit'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.edit'))
);

create policy outreach_events_select on public.outreach_events for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.view'))
);
-- outreach_events writes: service-role only (external serverless functions)

create policy referrals_select on public.referrals for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.view'))
);
create policy referrals_insert on public.referrals for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.create'))
);
create policy referrals_update on public.referrals for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.edit'))
) with check (org_id = (select public.current_org_id()));
create policy referrals_delete on public.referrals for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.delete'))
);

create policy referral_program_select on public.referral_program for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('leads.view'))
);
create policy referral_program_write on public.referral_program for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.is_org_admin())
) with check (
  org_id = (select public.current_org_id()) and (select public.is_org_admin())
);

-- ---------------------------------------------------------------------------
-- Underwriting (incl. Plaid vault reads; vault writes stay service-role only)
-- ---------------------------------------------------------------------------

create policy underwriting_apps_select on public.underwriting_apps for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('underwriting.view'))
);
create policy underwriting_apps_write on public.underwriting_apps for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('underwriting.review'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('underwriting.review'))
);

create policy plaid_items_select on public.plaid_items for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('underwriting.view'))
);
create policy plaid_nodes_select on public.plaid_nodes for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('underwriting.view'))
);

-- ---------------------------------------------------------------------------
-- Merchants / contracts / onboarding
-- ---------------------------------------------------------------------------

create policy merchants_select on public.merchants for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id()))
);
create policy merchants_insert on public.merchants for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.create'))
);
create policy merchants_update on public.merchants for update to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.edit'))
  and ((select public.is_org_admin()) or agent_id = (select public.current_agent_id()))
) with check (org_id = (select public.current_org_id()));
create policy merchants_delete on public.merchants for delete to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.delete'))
);

create policy contracts_select on public.contracts for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or created_by = (select auth.uid())
       or exists (select 1 from public.merchants m
                  where m.id = merchant_id
                    and m.agent_id = (select public.current_agent_id())))
);
create policy contracts_write on public.contracts for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('merchants.edit'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('merchants.edit'))
);

create policy onboarding_apps_select on public.onboarding_apps for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id())
       or agent_id is null)
);
create policy onboarding_apps_insert on public.onboarding_apps for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.edit'))   -- created when converting a lead
);
create policy onboarding_apps_update on public.onboarding_apps for update to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.edit'))
  and ((select public.is_org_admin())
       or agent_id = (select public.current_agent_id())
       or agent_id is null)
) with check (org_id = (select public.current_org_id()));
create policy onboarding_apps_delete on public.onboarding_apps for delete to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('merchants.delete'))
);

-- ---------------------------------------------------------------------------
-- Residuals
-- ---------------------------------------------------------------------------

create policy residual_imports_select on public.residual_imports for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.view'))
);
create policy residual_imports_insert on public.residual_imports for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.upload'))
);
create policy residual_imports_update on public.residual_imports for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.edit'))
) with check (org_id = (select public.current_org_id()));
create policy residual_imports_delete on public.residual_imports for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.edit'))
);

create policy residual_rows_select on public.residual_rows for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('residuals.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id()))
);
create policy residual_rows_insert on public.residual_rows for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.upload'))
);
create policy residual_rows_update on public.residual_rows for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.edit'))
) with check (org_id = (select public.current_org_id()));
create policy residual_rows_delete on public.residual_rows for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('residuals.edit'))
);

-- ---------------------------------------------------------------------------
-- Capital (crm_deals, capital_deals, loan_payments, ACH)
-- ---------------------------------------------------------------------------

create policy crm_deals_select on public.crm_deals for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('capital.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id()))
);
create policy crm_deals_insert on public.crm_deals for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);
create policy crm_deals_update on public.crm_deals for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
) with check (org_id = (select public.current_org_id()));
create policy crm_deals_delete on public.crm_deals for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
);

create policy capital_deals_select on public.capital_deals for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('capital.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or agent_id = (select public.current_agent_id()))
);
create policy capital_deals_insert on public.capital_deals for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);
create policy capital_deals_update on public.capital_deals for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
) with check (org_id = (select public.current_org_id()));
create policy capital_deals_delete on public.capital_deals for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
);

create policy loan_payments_select on public.loan_payments for select to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('capital.view'))
  and ((select public.is_org_admin())
       or (select public.current_org_role()) = 'viewer'
       or exists (select 1 from public.capital_deals cd
                  where cd.id = deal_id
                    and cd.agent_id = (select public.current_agent_id())))
);
create policy loan_payments_write on public.loan_payments for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);

create policy ach_imports_select on public.ach_imports for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.view'))
);
create policy ach_imports_write on public.ach_imports for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);

create policy ach_daily_activity_select on public.ach_daily_activity for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.view'))
);
create policy ach_daily_activity_write on public.ach_daily_activity for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);

-- ---------------------------------------------------------------------------
-- Ads / integrations
-- ---------------------------------------------------------------------------

create policy ad_connections_select on public.ad_connections for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.view'))
);
create policy ad_connections_write on public.ad_connections for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.configure'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.configure'))
);

create policy ad_insights_daily_select on public.ad_insights_daily for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.view'))
);
create policy ad_insights_daily_write on public.ad_insights_daily for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.configure'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('integrations.configure'))
);

-- ---------------------------------------------------------------------------
-- Org / membership / roster / matrix
-- ---------------------------------------------------------------------------

create policy orgs_member_select on public.orgs for select to authenticated using (
  id = (select public.current_org_id())
);
create policy orgs_admin_update on public.orgs for update to authenticated using (
  id = (select public.current_org_id()) and (select public.has_perm('general.edit'))
) with check (id = (select public.current_org_id()));

create policy org_members_member_select on public.org_members for select to authenticated using (
  org_id = (select public.current_org_id())
);
create policy org_members_roles_write on public.org_members for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('roles.edit'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('roles.edit'))
);

create policy agents_select on public.agents for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.view'))
);
create policy agents_insert on public.agents for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.create'))
);
create policy agents_update on public.agents for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.edit'))
) with check (org_id = (select public.current_org_id()));
create policy agents_delete on public.agents for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.deactivate'))
);

drop policy if exists role_permissions_member_read on public.role_permissions;
create policy role_permissions_member_read on public.role_permissions for select to authenticated using (
  org_id = (select public.current_org_id())
);
create policy role_permissions_roles_write on public.role_permissions for all to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('roles.edit'))
) with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('roles.edit'))
);

-- ---------------------------------------------------------------------------
-- Grants (re-asserted; new write paths for membership/matrix management)
-- ---------------------------------------------------------------------------

grant insert, update, delete on public.org_members to authenticated;
grant insert, update, delete on public.role_permissions to authenticated;
