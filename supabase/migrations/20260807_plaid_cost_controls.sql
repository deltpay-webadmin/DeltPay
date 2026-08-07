-- ────────────────────────────────────────────────────────────────
-- Plaid cost controls
-- ────────────────────────────────────────────────────────────────
-- 1) plaid_items.verified_at — Auth + Identity are one-time-fee
--    products; they now bill only when a staff member (or eager env
--    flag) runs verification on an item. Once verified, subsequent
--    syncs keep refreshing the (already paid for) data.
-- 2) plaid_items.retired_at + 'retired' status — items on dead leads
--    are removed at Plaid (/item/remove ends the monthly Transactions
--    subscription) while their vault documents are retained.
-- 3) plaid_api_events — a ledger row per billable Plaid API call so
--    spend is attributable per lead/product (mirrors ai_usage_events).

alter table public.plaid_items
  add column if not exists verified_at timestamptz,
  add column if not exists retired_at timestamptz;

create table if not exists public.plaid_api_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product text not null,          -- auth | identity | transactions | transactions_refresh | balance | assets | identity_verification | monitor
  endpoint text not null,         -- the Plaid path called
  pricing_model text not null,    -- one_time | subscription | per_request | per_report | per_event
  item_id text,
  lead_id text,
  status text not null default 'ok',  -- ok | error
  meta jsonb not null default '{}'
);

create index if not exists plaid_api_events_lead_idx on public.plaid_api_events (lead_id);
create index if not exists plaid_api_events_created_idx on public.plaid_api_events (created_at);

alter table public.plaid_api_events enable row level security;

drop policy if exists plaid_api_events_staff_read on public.plaid_api_events;
create policy plaid_api_events_staff_read on public.plaid_api_events
  for select using (is_staff());

grant select on public.plaid_api_events to authenticated;
grant all on public.plaid_api_events to service_role;
