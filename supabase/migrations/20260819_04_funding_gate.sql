-- ============================================================================
-- Packet status + funding gate (phase 4)
--
-- Approval stops meaning "funded". capital_deals gains an 'approved' state
-- plus approved_at/funded_at, approval becomes a transactional RPC with a
-- server-generated id, and mark_funded() hard-gates on the deal's packet
-- being complete: bank connected, application signed, MCA signed AND
-- countersigned, MPA signed/boarded, ID + voided check on file.
-- ============================================================================

alter table public.capital_deals
  add column if not exists submission_id uuid references public.deal_submissions(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists funded_at timestamptz;
create index if not exists capital_deals_submission_idx on public.capital_deals (submission_id);

alter table public.capital_deals drop constraint if exists capital_deals_status_check;
alter table public.capital_deals add constraint capital_deals_status_check
  check (status in ('approved', 'active', 'paid', 'slow', 'default'));

-- Legacy rows predate the split: stamp funded_at from the funded date so
-- "active means money moved" stays true for the existing book.
update public.capital_deals
set funded_at = funded::timestamptz
where funded_at is null and status <> 'approved';

-- ---------------------------------------------------------------------------
-- approve_underwriting: the transactional Approve → Capital handoff.
-- Replaces the client-side three-write sequence (race-prone client-generated
-- ids, partial failures). The client still computes scoring/terms — this
-- takes the numbers and makes the state change atomic.
-- ---------------------------------------------------------------------------

create or replace function public.approve_underwriting(
  p_app_id text,
  p_funded_amt numeric,
  p_factor numeric,
  p_holdback numeric,
  p_tier text default null,
  p_notes text default null
) returns text
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_org uuid := public.current_org_id();
  v_app record;
  v_year text := to_char(now(), 'YYYY');
  v_seq int;
  v_deal_id text;
begin
  if v_org is null or not public.has_perm('underwriting.approve') then
    raise exception 'Missing permission: underwriting.approve';
  end if;

  select * into v_app from public.underwriting_apps
  where id = p_app_id and org_id = v_org
  for update;
  if not found then
    raise exception 'Underwriting application % not found', p_app_id;
  end if;
  if v_app.approved_deal_id is not null then
    return v_app.approved_deal_id; -- idempotent: already approved
  end if;

  -- Serialize id generation org-wide (DELT-YYYY-NNN).
  perform pg_advisory_xact_lock(hashtext('capital_deal_id:' || v_org::text));
  select coalesce(max((regexp_match(id, '^DELT-' || v_year || '-(\d+)$'))[1]::int), 0) + 1
    into v_seq
  from public.capital_deals
  where org_id = v_org and id like 'DELT-' || v_year || '-%';
  v_deal_id := 'DELT-' || v_year || '-' || lpad(v_seq::text, 3, '0');

  insert into public.capital_deals (
    id, org_id, merchant, type, channel,
    funded_amt, factor, total_owed, collected, holdback,
    status, approved_at, submission_id, notes
  ) values (
    v_deal_id, v_org, v_app.merchant_name, 'Capital', 'self',
    coalesce(p_funded_amt, v_app.requested_amount, 0),
    coalesce(p_factor, 1.4),
    round(coalesce(p_funded_amt, v_app.requested_amount, 0) * coalesce(p_factor, 1.4)),
    0,
    coalesce(p_holdback, 12),
    'approved', now(), v_app.submission_id, p_notes
  );

  update public.underwriting_apps
  set stage = 'approved',
      approved_deal_id = v_deal_id,
      tier = coalesce(p_tier, tier)
  where id = p_app_id;

  return v_deal_id;
end;
$$;

revoke execute on function public.approve_underwriting(text, numeric, numeric, numeric, text, text) from public, anon;
grant execute on function public.approve_underwriting(text, numeric, numeric, numeric, text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- packet_status: one server-side truth for "is this deal fully signed".
-- ---------------------------------------------------------------------------

create or replace function public.packet_status(p_submission_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path to 'public'
as $$
declare
  v_org uuid := public.current_org_id();
  v_sub record;
  v_plaid boolean := false;
  v_app_signed boolean := false;
  v_mca_signed boolean := false;
  v_mca_countersigned boolean := false;
  v_mpa_state text := 'none';
  v_id boolean := false;
  v_check boolean := false;
begin
  select * into v_sub from public.deal_submissions
  where id = p_submission_id
    and (v_org is null or org_id = v_org); -- service_role has no org context
  if not found then
    raise exception 'Deal submission % not found', p_submission_id;
  end if;

  if v_sub.lead_id is not null then
    select exists (
      select 1 from public.plaid_items
      where lead_id = v_sub.lead_id and status = 'active'
    ) into v_plaid;
  end if;

  select
    bool_or(kind = 'deal_application' and status = 'completed'),
    bool_or(kind = 'mca' and status = 'completed'),
    bool_or(kind = 'mca' and status = 'completed' and countersigned_at is not null)
  into v_app_signed, v_mca_signed, v_mca_countersigned
  from public.contracts
  where submission_id = p_submission_id and status not in ('voided', 'declined');

  -- MPA: boarded (any channel, incl. Square) > signed envelope > sent > none.
  if exists (select 1 from public.merchant_applications
             where submission_id = p_submission_id and status = 'boarded') then
    v_mpa_state := 'boarded';
  elsif exists (select 1 from public.contracts
                where submission_id = p_submission_id and kind = 'mpa' and status = 'completed') then
    v_mpa_state := 'signed';
  elsif exists (select 1 from public.contracts
                where submission_id = p_submission_id and kind = 'mpa'
                  and status not in ('voided', 'declined')) then
    v_mpa_state := 'sent';
  end if;

  select
    bool_or(doc_kind = 'drivers_license'),
    bool_or(doc_kind = 'voided_check')
  into v_id, v_check
  from public.deal_documents
  where submission_id = p_submission_id;

  return jsonb_build_object(
    'plaid_connected', coalesce(v_plaid, false),
    'application_signed', coalesce(v_app_signed, false),
    'mca_signed', coalesce(v_mca_signed, false),
    'mca_countersigned', coalesce(v_mca_countersigned, false),
    'mpa_state', v_mpa_state,
    'id_uploaded', coalesce(v_id, false),
    'voided_check_uploaded', coalesce(v_check, false),
    'complete',
      coalesce(v_plaid, false) and coalesce(v_app_signed, false)
      and coalesce(v_mca_signed, false) and coalesce(v_mca_countersigned, false)
      and v_mpa_state in ('signed', 'boarded')
      and coalesce(v_id, false) and coalesce(v_check, false)
  );
end;
$$;

revoke execute on function public.packet_status(uuid) from public, anon;
grant execute on function public.packet_status(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- mark_funded: money moves only when the packet is complete and the MCA is
-- countersigned. The SOP's "fund after the MPA is signed and submitted"
-- becomes enforceable instead of aspirational.
-- ---------------------------------------------------------------------------

create or replace function public.mark_funded(p_deal_id text)
returns void
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_org uuid := public.current_org_id();
  v_deal record;
  v_packet jsonb;
begin
  if v_org is null or not public.has_perm('capital.fund') then
    raise exception 'Missing permission: capital.fund';
  end if;

  select * into v_deal from public.capital_deals
  where id = p_deal_id and org_id = v_org
  for update;
  if not found then
    raise exception 'Deal % not found', p_deal_id;
  end if;
  if v_deal.status <> 'approved' then
    raise exception 'Deal % is % — only approved deals can be funded', p_deal_id, v_deal.status;
  end if;
  if v_deal.submission_id is null then
    raise exception 'Deal % has no linked deal submission — start deals from the Deal Room so the signed packet can be verified', p_deal_id;
  end if;

  v_packet := public.packet_status(v_deal.submission_id);
  if not (v_packet->>'complete')::boolean then
    raise exception 'Packet incomplete for %: plaid=% application=% mca=% countersigned=% mpa=% id=% voided_check=%',
      p_deal_id,
      v_packet->>'plaid_connected', v_packet->>'application_signed',
      v_packet->>'mca_signed', v_packet->>'mca_countersigned',
      v_packet->>'mpa_state', v_packet->>'id_uploaded', v_packet->>'voided_check_uploaded';
  end if;

  update public.capital_deals
  set status = 'active', funded_at = now(), funded = current_date
  where id = p_deal_id;
end;
$$;

revoke execute on function public.mark_funded(text) from public, anon;
grant execute on function public.mark_funded(text) to authenticated, service_role;
