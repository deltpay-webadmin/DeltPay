-- contracts.kind grows 'agent_agreement' so agent onboarding paper rides the
-- existing envelope pipeline (send-agent-agreement → status → countersign-url).
-- The envelope carries the agent's ACH details; they live in DocuSign only and
-- are never written back to this table.
alter table public.contracts drop constraint if exists contracts_kind_check;
alter table public.contracts
  add constraint contracts_kind_check check (kind in ('mca', 'deal_application', 'mpa', 'agent_agreement'));
