-- ============================================================================
-- Capital offers — the missing record that unlocks the offer sequence.
--
-- Nothing in the system recorded the moment we made someone an offer, so the
-- five highest-value Capital emails had no trigger to fire on. One row per
-- offer fixes that: the terms we quoted, when it expires, where it is, and
-- which DocuSign envelope carries the contract.
--
-- Status is the state machine the email jobs read (capital-offer-sweep,
-- every 15 min — see _shared/lifecycle.ts):
--
--   draft ─────► sent ─────► accepted ─────► contract_out ─────► signed ─────► funded
--                 │  │                                                    DC-11 welcome
--                 │  │           DC-10 chases an envelope sitting unsigned
--                 │  └──► declined      DC-9 pivot
--                 │  └──► expired       (swept automatically past expires_at)
--                 └─ DC-7 on entry, DC-8 48h later while still sitting here
--
-- Terms are denormalized onto the row rather than joined from the lead: an
-- offer is a statement we made at a point in time, and it has to stay
-- readable exactly as sent even if the lead record later changes or is
-- deleted. Same reason the recipient's name and email are copied here.
-- ============================================================================

create table if not exists public.capital_offers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),

  -- Where it came from and where it ends up. Both nullable: an offer can be
  -- made before a lead row exists, and deal_id only appears at funding.
  lead_id text references public.pipeline_leads(id) on delete set null,
  deal_id text references public.capital_deals(id) on delete set null,
  -- The DocuSign envelope lives on contracts (envelope_id, status, kept in
  -- sync by docusign-connect + the nightly sweep). Pointing at the contract
  -- rather than copying the envelope id keeps one source of truth.
  contract_id uuid references public.contracts(id) on delete set null,

  -- Recipient, copied at offer time.
  merchant_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,

  -- Terms as quoted.
  amount numeric not null check (amount > 0),
  factor numeric not null default 1.35 check (factor >= 1 and factor <= 3),
  payback numeric generated always as (round(amount * factor, 2)) stored,
  term_days integer check (term_days is null or term_days > 0),
  holdback_pct numeric check (holdback_pct is null or (holdback_pct > 0 and holdback_pct <= 100)),
  payment_amount numeric check (payment_amount is null or payment_amount > 0),
  payment_frequency text not null default 'daily'
    check (payment_frequency in ('daily', 'weekly', 'monthly')),
  use_of_funds text,
  notes text,

  expires_at timestamptz not null,

  status text not null default 'draft' check (status in (
    'draft', 'sent', 'accepted', 'declined', 'contract_out',
    'signed', 'funded', 'expired', 'withdrawn'
  )),
  declined_reason text,

  -- One-shot email flags, same convention as the Tier 1/2 lifecycle columns:
  -- a timestamp per sequence so every job is idempotent and re-runs are safe.
  offer_sent_at        timestamptz,   -- DC-7  offer email went out
  reminder_sent_at     timestamptz,   -- DC-8  48h reminder
  decline_notified_at  timestamptz,   -- DC-9  decline pivot
  chase_count          integer not null default 0,  -- DC-10 unsigned chases (max 2)
  last_chase_at        timestamptz,
  funded_notified_at   timestamptz,   -- DC-11 funded welcome
  contract_sent_at     timestamptz,   -- when the envelope went out (chase clock)

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists capital_offers_status_idx on public.capital_offers (status, expires_at);
create index if not exists capital_offers_lead_idx on public.capital_offers (lead_id);
create index if not exists capital_offers_deal_idx on public.capital_offers (deal_id);
create index if not exists capital_offers_contract_idx on public.capital_offers (contract_id);
create index if not exists capital_offers_org_idx on public.capital_offers (org_id);
create index if not exists capital_offers_created_idx on public.capital_offers (created_at desc);

-- One live offer per lead. Terminal states are excluded so a merchant who
-- declined (or let one expire) can be re-offered without tripping over the
-- old row, but two competing live offers can never be sent by accident.
create unique index if not exists capital_offers_one_live_per_lead
  on public.capital_offers (lead_id)
  where lead_id is not null
    and status in ('draft', 'sent', 'accepted', 'contract_out', 'signed');

drop trigger if exists capital_offers_org_stamp on public.capital_offers;
create trigger capital_offers_org_stamp before insert on public.capital_offers
  for each row execute function public.set_org_id();

-- updated_at maintenance. INVOKER, not DEFINER: stamping NEW.updated_at needs
-- no privileges the writer doesn't already have, and a definer function in a
-- REST-exposed schema is a lint (and a needless escalation surface).
-- search_path stays pinned — see the hardening migration.
create or replace function public.touch_capital_offers()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists capital_offers_touch on public.capital_offers;
create trigger capital_offers_touch before update on public.capital_offers
  for each row execute function public.touch_capital_offers();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Rides the existing capital.* permission set: viewing an offer is viewing
-- capital, creating one is capital.create, and changing terms or status is
-- capital.modify_terms — quoting a different number is a terms change.
alter table public.capital_offers enable row level security;

drop policy if exists capital_offers_select on public.capital_offers;
create policy capital_offers_select on public.capital_offers for select to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.view'))
);
drop policy if exists capital_offers_insert on public.capital_offers;
create policy capital_offers_insert on public.capital_offers for insert to authenticated with check (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.create'))
);
drop policy if exists capital_offers_update on public.capital_offers;
create policy capital_offers_update on public.capital_offers for update to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
);
drop policy if exists capital_offers_delete on public.capital_offers;
create policy capital_offers_delete on public.capital_offers for delete to authenticated using (
  org_id = (select public.current_org_id()) and (select public.has_perm('capital.modify_terms'))
);

-- The hardening migration revokes default privileges on new tables.
grant select, insert, update, delete on public.capital_offers to authenticated;
grant select, insert, update, delete on public.capital_offers to service_role;

-- Realtime so an offer sent from one seat appears in another's board.
do $$
begin
  alter publication supabase_realtime add table public.capital_offers;
exception
  when duplicate_object then null;
end $$;

-- ── Schedule ────────────────────────────────────────────────────────────────
-- Every 15 minutes, matching deal-status-notify: a status flip in the CRM
-- turns into an email within the quarter hour. Quiet hours (8am-9pm ET,
-- weekdays) are enforced in code; expiry sweeping is not, so a Saturday
-- expiry still lands correctly.
select cron.schedule('capital-offer-sweep-15m', '*/15 * * * *', $$select public.invoke_job('capital-offer-sweep')$$);
