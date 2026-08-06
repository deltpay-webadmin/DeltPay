-- ============================================================================
-- MPA onboarding: unified merchant applications.
--
-- One row per deal submission. `data` holds the non-sensitive superset of
-- everything the Luqra and Paysafe MPAs ask for; `secure` holds a single
-- AES-256-GCM blob ({v, iv, ct}, base64) of the sensitive subset (owner
-- SSNs/DOBs/license numbers, bank routing/account) encrypted app-side in the
-- mpa-application edge function with the APP_ENCRYPTION_KEY secret — the
-- database never sees those values in plaintext. `masks` carries last-4
-- display strings so the CRM can render "•••-••-1234" without decrypting.
-- `pricing` is the admin-entered processor fee schedule filled at boarding.
--
-- Public-link mode (merchant self-completes remotely) authenticates by
-- token: only sha256(token) is stored; the raw token is returned once at
-- create-link time. There are deliberately NO anon RLS policies — all
-- merchant-context access flows through the edge function (service role).
--
-- contracts.kind grows 'mpa' so filled processor MPAs ride the existing
-- DocuSign envelope pipeline, and a private mpa-templates bucket stores the
-- blank processor PDFs (service-role only; no authenticated policies).
-- ============================================================================

create table if not exists public.merchant_applications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  submission_id uuid not null references public.deal_submissions(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'boarded', 'void')),
  data jsonb not null default '{}'::jsonb,
  secure jsonb,
  masks jsonb not null default '{}'::jsonb,
  pricing jsonb,
  current_step int not null default 0,
  token_hash text unique,
  token_expires_at timestamptz,
  applicant_email text,
  submitted_at timestamptz,
  boarded_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists merchant_applications_submission_uidx
  on public.merchant_applications (submission_id) where status <> 'void';
create index if not exists merchant_applications_org_idx on public.merchant_applications (org_id);

drop trigger if exists merchant_applications_org_stamp on public.merchant_applications;
create trigger merchant_applications_org_stamp before insert on public.merchant_applications
  for each row execute function public.set_org_id();

alter table public.merchant_applications enable row level security;

-- Visibility rides on the parent submission, same as deal_documents:
-- ops (agents.edit) sees all, agents see applications on their own deals.
-- Staff reads return ciphertext in `secure` (useless without the edge-side
-- key) plus `masks` for display.
drop policy if exists merchant_applications_select on public.merchant_applications;
create policy merchant_applications_select on public.merchant_applications for select to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists merchant_applications_insert on public.merchant_applications;
create policy merchant_applications_insert on public.merchant_applications for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists merchant_applications_update on public.merchant_applications;
create policy merchant_applications_update on public.merchant_applications for update to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
) with check (org_id = (select public.current_org_id()));
drop policy if exists merchant_applications_delete on public.merchant_applications;
create policy merchant_applications_delete on public.merchant_applications for delete to authenticated using (
  org_id = (select public.current_org_id())
  and (select public.has_perm('agents.edit'))
);

grant select, insert, update, delete on public.merchant_applications to authenticated, service_role;

do $$
begin
  alter publication supabase_realtime add table public.merchant_applications;
exception
  when duplicate_object then null;
end $$;

-- ── contracts.kind grows 'mpa' ──

alter table public.contracts drop constraint if exists contracts_kind_check;
alter table public.contracts
  add constraint contracts_kind_check check (kind in ('mca', 'deal_application', 'mpa'));

-- ── Blank MPA template bucket (service-role only; no authenticated policies) ──

insert into storage.buckets (id, name, public)
values ('mpa-templates', 'mpa-templates', false)
on conflict (id) do nothing;
