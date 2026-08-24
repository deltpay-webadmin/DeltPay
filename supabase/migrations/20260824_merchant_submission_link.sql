-- Link merchants to the deal submission that boarded them, so the
-- boarded → merchant write-back is idempotent (no name matching).
alter table public.merchants
  add column if not exists submission_id uuid references public.deal_submissions(id) on delete set null;

create unique index if not exists merchants_submission_id_key
  on public.merchants (submission_id)
  where submission_id is not null;
