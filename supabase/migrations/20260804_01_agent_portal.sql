-- ============================================================================
-- Agent portal: in-portal deal submission pipeline + deal desk.
--
-- deal_submissions backs the agent "Submit a Deal" flow: each row is a
-- merchant application moving Submitted → Underwriting → Approved →
-- Activated → Paid (or Declined). expected_bonus is stamped at submission
-- from the volume-banded activation bonus schedule so the agent's pipeline
-- shows pending earnings the moment a deal goes in.
--
-- deal_desk_threads / deal_desk_messages back the agent support channel:
-- agents raise deal/merchant questions in-portal and ops answers them,
-- replacing ad-hoc email. Agent ownership scoping mirrors pipeline_leads
-- (org scope × permission matrix × agent ownership).
-- ============================================================================

create table if not exists public.deal_submissions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  agent_id uuid references public.agents(id) on delete set null,
  agent_name text not null default '',
  merchant_name text not null,
  contact_name text,
  phone text,
  email text,
  vertical text,
  monthly_volume numeric not null default 0,
  wants_pos boolean not null default false,
  wants_capital boolean not null default false,
  notes text,
  status text not null default 'Submitted'
    check (status in ('Submitted', 'Underwriting', 'Approved', 'Activated', 'Paid', 'Declined')),
  expected_bonus numeric not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deal_submissions_org_idx on public.deal_submissions (org_id);
create index if not exists deal_submissions_agent_idx on public.deal_submissions (org_id, agent_id);
create index if not exists deal_submissions_status_idx on public.deal_submissions (org_id, status);
create index if not exists deal_submissions_created_idx on public.deal_submissions (created_at desc);

drop trigger if exists deal_submissions_org_stamp on public.deal_submissions;
create trigger deal_submissions_org_stamp before insert on public.deal_submissions
  for each row execute function public.set_org_id();

alter table public.deal_submissions enable row level security;

drop policy if exists deal_submissions_select on public.deal_submissions;
create policy deal_submissions_select on public.deal_submissions for select to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or agent_id = (select public.current_agent_id()))
);
drop policy if exists deal_submissions_insert on public.deal_submissions;
create policy deal_submissions_insert on public.deal_submissions for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('leads.create'))
       or agent_id = (select public.current_agent_id()))
);
drop policy if exists deal_submissions_update on public.deal_submissions;
create policy deal_submissions_update on public.deal_submissions for update to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or agent_id = (select public.current_agent_id()))
) with check (org_id = (select public.current_org_id()));
drop policy if exists deal_submissions_delete on public.deal_submissions;
create policy deal_submissions_delete on public.deal_submissions for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.edit'))
);

grant select, insert, update, delete on public.deal_submissions to authenticated, service_role;

-- ── Deal desk ──

create table if not exists public.deal_desk_threads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  agent_id uuid references public.agents(id) on delete set null,
  agent_name text not null default '',
  subject text not null,
  merchant_name text,
  status text not null default 'Open'
    check (status in ('Open', 'Answered', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deal_desk_threads_org_idx on public.deal_desk_threads (org_id);
create index if not exists deal_desk_threads_agent_idx on public.deal_desk_threads (org_id, agent_id);
create index if not exists deal_desk_threads_status_idx on public.deal_desk_threads (org_id, status);

drop trigger if exists deal_desk_threads_org_stamp on public.deal_desk_threads;
create trigger deal_desk_threads_org_stamp before insert on public.deal_desk_threads
  for each row execute function public.set_org_id();

alter table public.deal_desk_threads enable row level security;

drop policy if exists deal_desk_threads_select on public.deal_desk_threads;
create policy deal_desk_threads_select on public.deal_desk_threads for select to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or agent_id = (select public.current_agent_id()))
);
drop policy if exists deal_desk_threads_insert on public.deal_desk_threads;
create policy deal_desk_threads_insert on public.deal_desk_threads for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or agent_id = (select public.current_agent_id()))
);
drop policy if exists deal_desk_threads_update on public.deal_desk_threads;
create policy deal_desk_threads_update on public.deal_desk_threads for update to authenticated using (
  org_id = (select public.current_org_id())
  and ((select public.has_perm('agents.edit'))
       or agent_id = (select public.current_agent_id()))
) with check (org_id = (select public.current_org_id()));
drop policy if exists deal_desk_threads_delete on public.deal_desk_threads;
create policy deal_desk_threads_delete on public.deal_desk_threads for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.edit'))
);

grant select, insert, update, delete on public.deal_desk_threads to authenticated, service_role;

create table if not exists public.deal_desk_messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  thread_id uuid not null references public.deal_desk_threads(id) on delete cascade,
  author_name text not null default '',
  from_ops boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists deal_desk_messages_thread_idx on public.deal_desk_messages (thread_id, created_at);
create index if not exists deal_desk_messages_org_idx on public.deal_desk_messages (org_id);

drop trigger if exists deal_desk_messages_org_stamp on public.deal_desk_messages;
create trigger deal_desk_messages_org_stamp before insert on public.deal_desk_messages
  for each row execute function public.set_org_id();

alter table public.deal_desk_messages enable row level security;

-- Message visibility rides on the parent thread's scoping.
drop policy if exists deal_desk_messages_select on public.deal_desk_messages;
create policy deal_desk_messages_select on public.deal_desk_messages for select to authenticated using (
  org_id = (select public.current_org_id())
  and exists (select 1 from public.deal_desk_threads t where t.id = thread_id)
);
drop policy if exists deal_desk_messages_insert on public.deal_desk_messages;
create policy deal_desk_messages_insert on public.deal_desk_messages for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and exists (select 1 from public.deal_desk_threads t where t.id = thread_id)
);
drop policy if exists deal_desk_messages_delete on public.deal_desk_messages;
create policy deal_desk_messages_delete on public.deal_desk_messages for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.edit'))
);

grant select, insert, delete on public.deal_desk_messages to authenticated, service_role;
