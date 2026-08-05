-- ============================================================================
-- Cover the unindexed foreign keys reported by the Supabase performance
-- advisor (unindexed_foreign_keys). Without these, every delete/update on
-- the referenced table seq-scans the referencing table to check the FK.
-- ============================================================================

create index if not exists ad_connections_connected_by_idx  on public.ad_connections (connected_by);
create index if not exists ad_leads_matched_lead_id_idx     on public.ad_leads (matched_lead_id);
create index if not exists contracts_created_by_idx         on public.contracts (created_by);
create index if not exists contracts_deal_id_idx            on public.contracts (deal_id);
create index if not exists deal_desk_threads_agent_id_idx   on public.deal_desk_threads (agent_id);
create index if not exists deal_submissions_agent_id_idx    on public.deal_submissions (agent_id);
create index if not exists deal_submissions_created_by_idx  on public.deal_submissions (created_by);
create index if not exists lead_imports_created_by_idx      on public.lead_imports (created_by);
create index if not exists residual_rows_import_id_idx      on public.residual_rows (import_id);
create index if not exists statement_analyses_created_by_idx on public.statement_analyses (created_by);

-- loan_repayments exists only in the live project (legacy, no migration);
-- guard so this file replays cleanly on a fresh database.
do $$
begin
  if to_regclass('public.loan_repayments') is not null then
    create index if not exists loan_repayments_loan_id_idx on public.loan_repayments (loan_id);
  end if;
end $$;
