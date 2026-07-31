-- ============================================================================
-- Statement analyses attach to the lead's file vault.
--
-- When the analyzer creates a pipeline lead, the analysis document is filed
-- into that lead's Data Vault (plaid_nodes, under /prospects/{leadId}/
-- statement-analysis/...), so it shows up alongside the prospect's bank
-- verification and financials in the Plaid Portal.
--
-- plaid_nodes was service-role-write-only (Plaid sync engine). Staff who can
-- edit leads may now INSERT document/folder nodes under /prospects/* in their
-- own org — insert only; updates/deletes stay service-role.
-- ============================================================================

alter table public.statement_analyses
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null;
create index if not exists statement_analyses_lead_idx on public.statement_analyses (lead_id);

drop policy if exists plaid_nodes_staff_insert on public.plaid_nodes;
create policy plaid_nodes_staff_insert on public.plaid_nodes for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and (select public.has_perm('leads.edit'))
  and path like '/prospects/%'
);

grant insert on public.plaid_nodes to authenticated;
