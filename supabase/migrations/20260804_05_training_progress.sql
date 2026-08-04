-- Training progress: one row per (user, lesson) with the passing quiz score.
-- Agents read/write their own rows; ops (agents.edit) can read everyone's
-- for certification reporting. Content itself ships with the app
-- (trainingContent.ts); only completion state lives here.

create table if not exists public.training_progress (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  score numeric,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists training_progress_user_idx on public.training_progress (user_id);
create index if not exists training_progress_org_idx on public.training_progress (org_id);

drop trigger if exists training_progress_org_stamp on public.training_progress;
create trigger training_progress_org_stamp before insert on public.training_progress
  for each row execute function public.set_org_id();

alter table public.training_progress enable row level security;

drop policy if exists training_progress_select on public.training_progress;
create policy training_progress_select on public.training_progress for select to authenticated using (
  org_id = (select public.current_org_id())
  and (user_id = (select auth.uid()) or (select public.has_perm('agents.edit')))
);
drop policy if exists training_progress_insert on public.training_progress;
create policy training_progress_insert on public.training_progress for insert to authenticated with check (
  org_id = (select public.current_org_id())
  and user_id = (select auth.uid())
);
drop policy if exists training_progress_delete on public.training_progress;
create policy training_progress_delete on public.training_progress for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('agents.edit'))
);

grant select, insert, delete on public.training_progress to authenticated, service_role;
