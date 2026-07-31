-- ────────────────────────────────────────────────────────────────
-- AI usage quotas
-- ────────────────────────────────────────────────────────────────
-- Monthly spend caps for the AI features, set by admins from the CRM's
-- AI Management tab and enforced (softly) inside the edge functions:
-- over-cap calls are rejected with 402 quota_exceeded and logged as a
-- status='blocked' ai_usage row so the attempt stays visible.
--
--   • ai_quotas — one row per capped subject. scope='user' rows cap a
--                 single credentialed user (scope_id = auth.uid()::text);
--                 scope='default' rows cap everyone of a subject_type
--                 ('staff' | 'customer') who has no user row. Resolution:
--                 user row → default row → no cap. A null cap means
--                 explicitly unlimited; an absent row falls through.
--
-- Month boundary is UTC first-of-month, matching the store's MTD math.
-- ────────────────────────────────────────────────────────────────

-- 1) Quota table
create table if not exists public.ai_quotas (
  scope text not null check (scope in ('user', 'default')),
  scope_id text not null,                           -- auth.uid()::text for 'user'; staff | customer for 'default'
  monthly_cost_cap_usd numeric check (monthly_cost_cap_usd >= 0),  -- null = explicitly unlimited
  updated_by uuid,                                  -- auth.uid() of the admin who last set it
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (scope, scope_id)
);

-- 2) RLS — staff read; only admins write. The edge functions read via the
-- service role, which bypasses RLS.
alter table public.ai_quotas enable row level security;

drop policy if exists ai_quotas_staff_read on public.ai_quotas;
create policy ai_quotas_staff_read on public.ai_quotas
  for select using (is_staff());

drop policy if exists ai_quotas_admin_insert on public.ai_quotas;
create policy ai_quotas_admin_insert on public.ai_quotas
  for insert with check (current_staff_role() = 'admin');

drop policy if exists ai_quotas_admin_update on public.ai_quotas;
create policy ai_quotas_admin_update on public.ai_quotas
  for update using (current_staff_role() = 'admin')
  with check (current_staff_role() = 'admin');

drop policy if exists ai_quotas_admin_delete on public.ai_quotas;
create policy ai_quotas_admin_delete on public.ai_quotas
  for delete using (current_staff_role() = 'admin');

-- 3) Grants — RLS policies alone don't grant table privileges.
-- authenticated gets write privileges too; the admin-only policies above
-- are what narrow them.
grant select on public.ai_quotas to authenticated, service_role;
grant insert, update, delete on public.ai_quotas to authenticated, service_role;

-- 4) No seed rows: an absent row means uncapped, which is today's behavior.
