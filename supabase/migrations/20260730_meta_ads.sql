-- ────────────────────────────────────────────────────────────────
-- Meta Ads integration
-- ────────────────────────────────────────────────────────────────
-- Real ad-account data behind the Marketing Hub.
--
--   • ad_connections    — one row per connected provider ('meta' for now).
--                         Metadata only; staff-readable. Never holds tokens.
--   • ad_credentials    — access tokens. RLS enabled with NO policies, so
--                         only service-role edge functions can read (same
--                         pattern as plaid_credentials).
--   • ad_insights_daily — per-campaign, per-day performance pulled from the
--                         provider's insights API.
-- ────────────────────────────────────────────────────────────────

-- 1) Connections (metadata only)
create table if not exists public.ad_connections (
  provider text primary key,                 -- 'meta'
  account_id text not null,                  -- e.g. act_1234567890
  account_name text,
  currency text,
  status text not null default 'active',     -- active | error | disconnected
  error text,
  last_synced_at timestamptz,
  connected_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_connections enable row level security;

drop policy if exists ad_connections_staff_all on public.ad_connections;
create policy ad_connections_staff_all on public.ad_connections
  for all using (is_staff()) with check (is_staff());

-- 2) Access tokens — service role only (RLS on, no policies)
create table if not exists public.ad_credentials (
  provider text primary key references public.ad_connections(provider) on delete cascade,
  access_token text not null,
  created_at timestamptz not null default now()
);

alter table public.ad_credentials enable row level security;

-- 3) Daily insights, campaign grain
create table if not exists public.ad_insights_daily (
  provider text not null default 'meta',
  account_id text not null,
  campaign_id text not null,
  campaign_name text,
  day date not null,
  spend numeric not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  leads bigint not null default 0,
  synced_at timestamptz not null default now(),
  primary key (provider, account_id, campaign_id, day)
);

create index if not exists ad_insights_daily_day_idx on public.ad_insights_daily (day);

alter table public.ad_insights_daily enable row level security;

drop policy if exists ad_insights_daily_staff_all on public.ad_insights_daily;
create policy ad_insights_daily_staff_all on public.ad_insights_daily
  for all using (is_staff()) with check (is_staff());

-- 4) Grants — RLS policies alone don't grant table privileges.
grant select, insert, update, delete
  on public.ad_connections, public.ad_insights_daily
  to authenticated, service_role;

grant select, insert, update, delete
  on public.ad_credentials
  to service_role;

-- 5) Realtime for the connection row so the UI flips to Live on sync.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.ad_connections;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
