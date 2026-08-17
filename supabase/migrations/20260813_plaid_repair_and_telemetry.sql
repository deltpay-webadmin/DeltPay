-- ────────────────────────────────────────────────────────────────
-- Plaid repair (Link update mode) + Link funnel telemetry
-- ────────────────────────────────────────────────────────────────
-- 1) plaid_items.error_code — Plaid's machine-readable error code
--    (ITEM_LOGIN_REQUIRED, ADDITIONAL_CONSENT_REQUIRED,
--    PENDING_EXPIRATION, PENDING_DISCONNECT, ...) so the CRM can
--    distinguish "reconnect needed" from a hard failure. The prose
--    message stays in plaid_items.error.
-- 2) plaid_link_requests.mode — hosted links now come in two flavors:
--    'add' (new connection, exchanges a public_token) and 'update'
--    (Link update mode: re-auth / consent repair on an existing item,
--    no public_token involved).
--    plaid_link_requests.link_session_id — Plaid's Link session id,
--    captured from the LINK SESSION_FINISHED webhook for support and
--    funnel analysis.
-- 3) plaid_link_events — the Link conversion funnel ledger: one row
--    per observable step (token created, link sent/opened, webhook
--    callbacks, session finished, token exchanged, first successful
--    transactions sync, exits and errors). Modeled on outreach_events
--    (constrained event enum + meta jsonb) and written fire-and-forget
--    like plaid_api_events.

alter table public.plaid_items
  add column if not exists error_code text;

alter table public.plaid_link_requests
  add column if not exists mode text not null default 'add',
  add column if not exists link_session_id text;

create table if not exists public.plaid_link_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  lead_id text,
  item_id text,
  link_token text,
  link_session_id text,
  event text not null check (event in
    ('created','sent','opened','callback','session_finished','exchanged','first_sync','exit','error')),
  error_code text,
  institution text,
  request_id text,
  meta jsonb not null default '{}'
);

create index if not exists plaid_link_events_lead_idx on public.plaid_link_events (lead_id, created_at desc);
create index if not exists plaid_link_events_token_idx on public.plaid_link_events (link_token);
create index if not exists plaid_link_events_event_idx on public.plaid_link_events (event, created_at desc);

alter table public.plaid_link_events enable row level security;

drop policy if exists plaid_link_events_staff_read on public.plaid_link_events;
create policy plaid_link_events_staff_read on public.plaid_link_events
  for select using (is_staff());

grant select on public.plaid_link_events to authenticated;
grant all on public.plaid_link_events to service_role;
-- The bigserial's sequence needs its own grant — table grants don't cover it.
grant usage, select on sequence public.plaid_link_events_id_seq to service_role;
