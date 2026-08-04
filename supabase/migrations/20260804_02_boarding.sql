-- ============================================================================
-- Boarding efficiency: processor channel routing + deal documents.
--
-- channel: which processor a deal is boarded through (set by ops at
-- underwriting). deal_documents: merchant paperwork (voided check, ID,
-- statements, signed application) attached to a submission, stored in the
-- new private 'deal-docs' storage bucket, with AI-extracted fields cached
-- in `extracted` for the ops boarding packet.
--
-- Storage note: this is the project's first storage bucket. Object paths
-- follow org/{org_id}/{submission_id}/{uuid}-{filename}; policies scope by
-- org, and by agent ownership of the submission for non-admin callers
-- (broad access gates on agents.edit — the agent role holds agents.view).
-- ============================================================================

alter table public.deal_submissions
  add column if not exists channel text
    check (channel in ('Square', 'Luqra', 'Paysafe'));

-- ── Documents table ──

create table if not exists public.deal_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  submission_id uuid not null references public.deal_submissions(id) on delete cascade,
  doc_kind text not null default 'other'
    check (doc_kind in ('voided_check', 'drivers_license', 'statement', 'signed_application', 'other')),
  filename text not null,
  storage_path text not null unique,
  extracted jsonb,
  extract_status text not null default 'none'
    check (extract_status in ('none', 'pending', 'done', 'failed')),
  uploaded_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists deal_documents_submission_idx on public.deal_documents (submission_id, created_at);
create index if not exists deal_documents_org_idx on public.deal_documents (org_id);

drop trigger if exists deal_documents_org_stamp on public.deal_documents;
create trigger deal_documents_org_stamp before insert on public.deal_documents
  for each row execute function public.set_org_id();

alter table public.deal_documents enable row level security;

-- Visibility rides on the parent submission: ops (agents.edit) sees all,
-- agents see documents on their own submissions.
drop policy if exists deal_documents_select on public.deal_documents;
create policy deal_documents_select on public.deal_documents for select to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists deal_documents_insert on public.deal_documents;
create policy deal_documents_insert on public.deal_documents for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists deal_documents_update on public.deal_documents;
create policy deal_documents_update on public.deal_documents for update to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
) with check (org_id = (select public.current_org_id()));
drop policy if exists deal_documents_delete on public.deal_documents;
create policy deal_documents_delete on public.deal_documents for delete to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id = submission_id
                    and s.agent_id = (select public.current_agent_id())))
);

grant select, insert, update, delete on public.deal_documents to authenticated, service_role;

-- ── Storage bucket + object policies ──

insert into storage.buckets (id, name, public)
values ('deal-docs', 'deal-docs', false)
on conflict (id) do nothing;

-- Path convention: org/{org_id}/{submission_id}/{uuid}-{filename}
-- (storage.foldername(name))[2] = org_id, [3] would exceed folders; the
-- submission id is folder segment 3 of the path => foldername index 3.
drop policy if exists deal_docs_select on storage.objects;
create policy deal_docs_select on storage.objects for select to authenticated using (
  bucket_id = 'deal-docs'
  and (storage.foldername(name))[2] = (select public.current_org_id())::text
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id::text = (storage.foldername(name))[3]
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists deal_docs_insert on storage.objects;
create policy deal_docs_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'deal-docs'
  and (storage.foldername(name))[2] = (select public.current_org_id())::text
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id::text = (storage.foldername(name))[3]
                    and s.agent_id = (select public.current_agent_id())))
);
drop policy if exists deal_docs_delete on storage.objects;
create policy deal_docs_delete on storage.objects for delete to authenticated using (
  bucket_id = 'deal-docs'
  and (storage.foldername(name))[2] = (select public.current_org_id())::text
  and ((select public.has_perm('agents.edit'))
       or exists (select 1 from public.deal_submissions s
                  where s.id::text = (storage.foldername(name))[3]
                    and s.agent_id = (select public.current_agent_id())))
);
