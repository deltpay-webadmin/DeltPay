-- ============================================================================
-- Statement Analyzer persistence.
--
-- The analyzer now runs real AI extraction (analyze-statement edge function:
-- Claude for PDFs, Nebius vision for images). Each run is saved here so the
-- Analysis page has a durable history and a per-merchant view instead of the
-- previous mock rows. `extraction` stores the model's full structured output
-- verbatim; the scalar columns are denormalized for list rendering.
-- ============================================================================

create table if not exists public.statement_analyses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  merchant_name text not null,
  filename text,
  extraction jsonb not null,
  current_rate numeric,
  proposed_rate numeric,
  annual_savings numeric,
  status text not null default 'Analyzed'
    check (status in ('Analyzed', 'Lead Created', 'Proposal Sent', 'Won', 'Lost')),
  model text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists statement_analyses_org_idx on public.statement_analyses (org_id);
create index if not exists statement_analyses_created_idx on public.statement_analyses (created_at desc);
create index if not exists statement_analyses_merchant_idx on public.statement_analyses (org_id, lower(merchant_name));

drop trigger if exists statement_analyses_org_stamp on public.statement_analyses;
create trigger statement_analyses_org_stamp before insert on public.statement_analyses
  for each row execute function public.set_org_id();

alter table public.statement_analyses enable row level security;

drop policy if exists statement_analyses_select on public.statement_analyses;
create policy statement_analyses_select on public.statement_analyses for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('analysis.view'))
);
drop policy if exists statement_analyses_insert on public.statement_analyses;
create policy statement_analyses_insert on public.statement_analyses for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('analysis.create'))
);
drop policy if exists statement_analyses_update on public.statement_analyses;
create policy statement_analyses_update on public.statement_analyses for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('analysis.edit'))
) with check (org_id = (select public.current_org_id()));
drop policy if exists statement_analyses_delete on public.statement_analyses;
create policy statement_analyses_delete on public.statement_analyses for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('analysis.edit'))
);

grant select, insert, update, delete on public.statement_analyses to authenticated, service_role;
