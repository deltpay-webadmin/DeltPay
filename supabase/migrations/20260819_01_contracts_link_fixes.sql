-- ---------------------------------------------------------------------------
-- Contracts linkage fixes (Deal Room prep, phase 0)
--
-- 1. Drop the contracts.deal_id → crm_deals FK. The UI stages MCA envelopes
--    from both crm_deals and capital_deals (DELT-YYYY-NNN ids), so the strict
--    FK made the post-envelope insert fail — the envelope was already sent,
--    but the contract row never recorded. deal_id becomes a loose reference.
-- 2. Add contracts.lead_id so lead-originated envelopes stay attached to the
--    prospect instead of becoming orphan rows.
-- ---------------------------------------------------------------------------

alter table public.contracts drop constraint if exists contracts_deal_id_fkey;
comment on column public.contracts.deal_id is
  'Loose reference: crm_deals.id or capital_deals.id (DELT-YYYY-NNN). No FK by design.';

alter table public.contracts
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null;
create index if not exists contracts_lead_idx on public.contracts (lead_id);
