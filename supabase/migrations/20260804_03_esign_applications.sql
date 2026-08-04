-- ============================================================================
-- E-sign for deal submissions.
--
-- contracts grows a `kind` so the same envelope pipeline serves both the MCA
-- agreement and the new Delt merchant application sent from a deal
-- submission, a link to the submission, and a slot for the captured signed
-- PDF (stored in the deal-docs bucket by the docusign-connect webhook on
-- envelope completion — which also inserts a deal_documents row so the
-- signed application appears in the deal's Documents panel).
--
-- deal_documents joins the realtime publication so that webhook-inserted
-- rows (and extraction status flips) land in open panels live.
-- ============================================================================

alter table public.contracts
  add column if not exists kind text not null default 'mca'
    check (kind in ('mca', 'deal_application'));

alter table public.contracts
  add column if not exists submission_id uuid references public.deal_submissions(id) on delete set null;

alter table public.contracts
  add column if not exists signed_storage_path text;

create index if not exists contracts_submission_idx on public.contracts (submission_id);

do $$
begin
  alter publication supabase_realtime add table public.deal_documents;
exception
  when duplicate_object then null;
end $$;
