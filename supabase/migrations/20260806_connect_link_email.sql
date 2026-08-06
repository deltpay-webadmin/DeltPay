-- ────────────────────────────────────────────────────────────────
-- Emailed connect links: tracking + delivery columns
-- ────────────────────────────────────────────────────────────────
-- The CRM can now email a hosted-link invite to the prospect directly
-- (server/hosted-link/email). Each request row gets an unguessable
-- tracking_id that the public email-track function resolves for the
-- open pixel and the click redirect, plus emailed_to/emailed_at so the
-- realtime-published row can drive "Emailed to X, 2h ago" in the UI
-- without joining outreach_events.

alter table public.plaid_link_requests
  add column if not exists tracking_id uuid not null default gen_random_uuid(),
  add column if not exists emailed_to text,
  add column if not exists emailed_at timestamptz;

create unique index if not exists plaid_link_requests_tracking_idx
  on public.plaid_link_requests (tracking_id);

-- Realtime for outreach_events — the per-lead "sent / opened / clicked"
-- chip and the Outreach analytics page both subscribe to INSERTs. The
-- table was never added to the publication (BackendOutreach's existing
-- subscription has been silently dead), so fix that here.
do $$
begin
  begin
    alter publication supabase_realtime add table public.outreach_events;
  exception when duplicate_object then null;
  end;
end $$;
