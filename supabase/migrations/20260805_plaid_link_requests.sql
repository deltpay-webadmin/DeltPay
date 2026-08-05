-- ────────────────────────────────────────────────────────────────
-- Plaid Hosted-Link connection requests
-- ────────────────────────────────────────────────────────────────
-- One row per "send the prospect a secure connect link" action in the
-- CRM. Staff can't type a customer's bank credentials, so instead of
-- opening Plaid Link locally, the CRM mints a link token with
-- hosted_link enabled and texts/emails the returned URL to the
-- prospect. When they finish on their own device, either the LINK
-- SESSION_FINISHED webhook or the sweep (Sync all / nightly cron)
-- exchanges the resulting public_token into plaid_items and the row
-- flips to completed.

create table if not exists public.plaid_link_requests (
  link_token text primary key,
  lead_id text references public.pipeline_leads(id) on delete cascade,
  hosted_link_url text not null,
  status text not null default 'pending',      -- pending | completed | expired
  item_id text,                                -- set on completion
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz
);

create index if not exists plaid_link_requests_lead_idx
  on public.plaid_link_requests (lead_id);
create index if not exists plaid_link_requests_status_idx
  on public.plaid_link_requests (status);

alter table public.plaid_link_requests enable row level security;

-- Staff read (writes go through service-role edge functions only) —
-- mirrors plaid_items.
drop policy if exists plaid_link_requests_staff_read on public.plaid_link_requests;
create policy plaid_link_requests_staff_read on public.plaid_link_requests
  for select using (is_staff());

grant select on public.plaid_link_requests to authenticated;
grant all on public.plaid_link_requests to service_role;

-- Realtime — the CRM shows "invite sent / completed" live.
do $$
begin
  begin
    alter publication supabase_realtime add table public.plaid_link_requests;
  exception when duplicate_object then null;
  end;
end $$;
