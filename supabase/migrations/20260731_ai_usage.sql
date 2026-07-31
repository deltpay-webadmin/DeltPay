-- ────────────────────────────────────────────────────────────────
-- AI usage metering
-- ────────────────────────────────────────────────────────────────
-- Per-call cost attribution for the CRM's AI features. Both AI edge
-- functions return token counts but discarded them, and neither knew
-- which user called. These tables close that gap.
--
--   • ai_model_prices — provider/model rates, versioned by effective_from
--                       so a price change is an insert, not a redeploy.
--                       Staff-readable; service-role writes.
--   • ai_usage        — one immutable row per model call: who, which
--                       feature, which model actually served it, tokens,
--                       and the cost frozen at write time. Staff-readable;
--                       written by edge functions via the service role.
--   • ai_usage_daily  — rollup view the CRM reads instead of raw rows.
--
-- Deliberately no quota/limit tables yet: there is no usage history to
-- set informed limits from. `status` reserves 'blocked' for when they land,
-- and `merchant_id` is the (currently unused) seam for billing customers
-- once a user→merchant link exists.
-- ────────────────────────────────────────────────────────────────

-- 1) Model prices — versioned rate card
create table if not exists public.ai_model_prices (
  provider text not null,                           -- nebius | anthropic
  model text not null,                              -- model id as returned by the provider
  input_usd_per_mtok numeric not null default 0,
  output_usd_per_mtok numeric not null default 0,
  cached_input_usd_per_mtok numeric,                -- null where the provider has no prompt caching
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (provider, model, effective_from)
);

-- 2) Usage ledger — one row per model call, immutable
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                            -- auth.uid() of the caller, from the JWT
  subject_type text not null,                       -- staff | customer
  merchant_id text,                                 -- billable org; unused until a user→merchant link exists
  feature text not null,                            -- lens_chat | statement_analyzer
  provider text not null,                           -- nebius | anthropic
  model text not null,                              -- the model that actually served the call
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  cost_usd numeric not null default 0,              -- computed at write time from ai_model_prices
  status text not null default 'ok',                -- ok | error | blocked
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_idx on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
create index if not exists ai_usage_feature_idx on public.ai_usage (feature, created_at desc);

-- 3) Daily rollup — what the CRM reads.
-- security_invoker so the view honours the caller's RLS rather than the owner's.
drop view if exists public.ai_usage_daily;
create view public.ai_usage_daily
  with (security_invoker = true)
as
  select
    date_trunc('day', created_at)::date as day,
    subject_type,
    feature,
    provider,
    model,
    count(*)::bigint as calls,
    sum(input_tokens)::bigint as input_tokens,
    sum(output_tokens)::bigint as output_tokens,
    sum(cost_usd) as cost_usd
  from public.ai_usage
  where status = 'ok'
  group by 1, 2, 3, 4, 5;

-- 4) RLS — staff read; edge functions write via the service role, which bypasses RLS
alter table public.ai_model_prices enable row level security;
alter table public.ai_usage enable row level security;

drop policy if exists ai_model_prices_staff_read on public.ai_model_prices;
create policy ai_model_prices_staff_read on public.ai_model_prices
  for select using (is_staff());

drop policy if exists ai_usage_staff_read on public.ai_usage;
create policy ai_usage_staff_read on public.ai_usage
  for select using (is_staff());

-- 5) Grants — RLS policies alone don't grant table privileges.
grant select on public.ai_model_prices, public.ai_usage, public.ai_usage_daily
  to authenticated, service_role;

grant insert, update, delete on public.ai_model_prices, public.ai_usage
  to service_role;

-- 6) Seed the rate card with the models currently in use.
-- Rates are USD per million tokens at the entry tier; insert a newer
-- effective_from row to reprice rather than updating these.
insert into public.ai_model_prices
  (provider, model, input_usd_per_mtok, output_usd_per_mtok, cached_input_usd_per_mtok)
values
  ('nebius', 'Qwen/Qwen3-235B-A22B-Instruct-2507', 0.455, 0.900, null),
  ('nebius', 'Qwen/Qwen2.5-VL-72B-Instruct',       0.800, 0.900, null),
  ('anthropic', 'claude-opus-5',                   5.000, 25.000, 0.500)
on conflict do nothing;
