-- ============================================================================
-- AI metering & quotas — commit the hand-created live schema.
--
-- _shared/metering.ts has been reading/writing these three tables since the
-- AI functions shipped, but they were created directly in the live project
-- and never committed. On any rebuild-from-migrations (branch, preview,
-- disaster recovery) the AI endpoints keep working — metering swallows its
-- own errors by design — but usage logging and quota enforcement silently
-- disappear. This file reproduces the live definitions (project
-- ytemrmpnwmzqeradbeoa) so the schema is replayable.
--
-- Writes come only from service-role edge functions; browsers read the
-- ledger/prices with staff eyes and admins manage quota rows.
-- ============================================================================

-- Per-request usage ledger. One row per AI call (ok or error).
create table if not exists public.ai_usage (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null,
  subject_type        text not null,
  merchant_id         text,
  feature             text not null,
  provider            text not null,
  model               text not null,
  input_tokens        integer not null default 0,
  output_tokens       integer not null default 0,
  cached_input_tokens integer not null default 0,
  cost_usd            numeric not null default 0,
  status              text not null default 'ok',
  created_at          timestamptz not null default now()
);
create index if not exists ai_usage_user_idx    on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
create index if not exists ai_usage_feature_idx on public.ai_usage (feature, created_at desc);

-- Price sheet keyed by (provider, model, effective_from) so price changes
-- append instead of rewriting history; metering picks the newest row.
create table if not exists public.ai_model_prices (
  provider                  text not null,
  model                     text not null,
  input_usd_per_mtok        numeric not null default 0,
  output_usd_per_mtok       numeric not null default 0,
  cached_input_usd_per_mtok numeric,
  effective_from            timestamptz not null default now(),
  created_at                timestamptz not null default now(),
  primary key (provider, model, effective_from)
);

-- Monthly spend caps. scope='default'/scope_id='default' is the fallback
-- when a user has no row; no rows at all = unlimited.
create table if not exists public.ai_quotas (
  scope                text not null check (scope = any (array['user','default'])),
  scope_id             text not null,
  monthly_cost_cap_usd numeric check (monthly_cost_cap_usd >= 0),
  updated_by           uuid,
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  primary key (scope, scope_id)
);

alter table public.ai_usage        enable row level security;
alter table public.ai_model_prices enable row level security;
alter table public.ai_quotas       enable row level security;

-- Live policies use bare is_staff(); the (select …) form is behaviorally
-- identical and lets the planner evaluate it once per statement (the repo
-- convention since 20260731_06_rls_rbac.sql).
drop policy if exists ai_usage_staff_read on public.ai_usage;
create policy ai_usage_staff_read on public.ai_usage
  for select using ((select public.is_staff()));

drop policy if exists ai_model_prices_staff_read on public.ai_model_prices;
create policy ai_model_prices_staff_read on public.ai_model_prices
  for select using ((select public.is_staff()));

drop policy if exists ai_quotas_staff_read on public.ai_quotas;
create policy ai_quotas_staff_read on public.ai_quotas
  for select using ((select public.is_staff()));

drop policy if exists ai_quotas_admin_insert on public.ai_quotas;
create policy ai_quotas_admin_insert on public.ai_quotas
  for insert with check ((select public.current_staff_role()) = 'admin');

drop policy if exists ai_quotas_admin_update on public.ai_quotas;
create policy ai_quotas_admin_update on public.ai_quotas
  for update using ((select public.current_staff_role()) = 'admin')
  with check ((select public.current_staff_role()) = 'admin');

drop policy if exists ai_quotas_admin_delete on public.ai_quotas;
create policy ai_quotas_admin_delete on public.ai_quotas
  for delete using ((select public.current_staff_role()) = 'admin');
