-- ============================================================================
-- crm_leads + the mirror trigger — commit the hand-created live schema.
--
-- crm_leads is the raw landing table for website form submissions posted
-- by external integrations (delt_pay_site / delt_capital_site). A live-only
-- AFTER INSERT trigger, mirror_crm_lead_to_pipeline(), copies each row into
-- pipeline_leads (id 'crm-<uuid>', external_id 'crm_leads:<uuid>') so the
-- CRM sees them. Neither the table nor the trigger existed in migrations —
-- this file reproduces the live definitions (project ytemrmpnwmzqeradbeoa)
-- and closes the security advisor's finding that the SECURITY DEFINER
-- function was executable by anon via /rest/v1/rpc.
-- ============================================================================

create table if not exists public.crm_leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  source           text not null check (source = any (array['delt_pay_site','delt_capital_site'])),
  form_name        text,
  origin_id        uuid unique,
  full_name        text,
  email            text,
  phone            text,
  company          text,
  message          text,
  monthly_volume   text,
  product_interest text check (product_interest = any (array['payments','capital','both'])),
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_term         text,
  utm_content      text,
  landing_page     text,
  referrer         text,
  fbclid           text,
  fbp              text,
  fbc              text,
  status           text not null default 'new'
                   check (status = any (array['new','contacted','qualified','proposal','won','lost'])),
  assigned_to      text,
  notes            text,
  raw              jsonb
);
create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);
create index if not exists crm_leads_status_idx     on public.crm_leads (status);
create index if not exists crm_leads_source_idx     on public.crm_leads (source);

alter table public.crm_leads enable row level security;

drop policy if exists "authenticated can read crm leads" on public.crm_leads;
create policy "authenticated can read crm leads" on public.crm_leads
  for select to authenticated using (true);
drop policy if exists "authenticated can update crm leads" on public.crm_leads;
create policy "authenticated can update crm leads" on public.crm_leads
  for update to authenticated using (true) with check (true);

-- Inserts come from service-role integrations only (matches live grants:
-- authenticated has select/update, anon has no data privileges).
revoke all on public.crm_leads from anon;
revoke insert, delete on public.crm_leads from authenticated;

create or replace function public.mirror_crm_lead_to_pipeline()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_source text;
  v_type text;
  v_notes text;
begin
  v_source := case new.source
    when 'delt_pay_site'     then 'Website Inquiry'
    when 'delt_capital_site' then 'Capital Site'
    when 'meta_ads'          then 'Meta Ads'
    else coalesce(nullif(new.source, ''), 'Website Inquiry')
  end;

  v_type := case lower(coalesce(new.product_interest, ''))
    when 'capital' then 'MCA'
    else 'Processing'
  end;

  v_notes := concat_ws(e'\n',
    nullif(new.message, ''),
    nullif(concat_ws(' · ',
      case when nullif(new.form_name, '')    is not null then 'Form: ' || new.form_name end,
      case when nullif(new.utm_campaign, '') is not null then 'Campaign: ' || new.utm_campaign end,
      case when nullif(new.utm_source, '')   is not null then 'UTM source: ' || new.utm_source end
    ), '')
  );

  insert into public.pipeline_leads (
    id, external_id, business_name, industry, contact_name, contact_email,
    contact_phone, type, source, monthly_sales, amount_requested, score,
    status, priority, last_activity, assigned_agent, stage, timeline, notes
  )
  values (
    'crm-' || new.id,
    'crm_leads:' || new.id,
    coalesce(nullif(new.company, ''), nullif(new.full_name, ''), 'Website Lead'),
    'General',
    coalesce(new.full_name, ''),
    coalesce(new.email, ''),
    coalesce(new.phone, ''),
    v_type,
    v_source,
    coalesce(nullif(new.monthly_volume, ''), ''),
    '',
    50, 'New', 'Medium', 'just now', 'Unassigned', 'New',
    jsonb_build_array(jsonb_build_object(
      'title', 'Lead created',
      'description', 'Imported automatically from ' || v_source,
      'user', 'Website',
      'timestamp', to_char(new.created_at, 'YYYY-MM-DD HH24:MI')
    )),
    coalesce(v_notes, '')
  )
  on conflict (external_id) do nothing;

  return new;
end; $$;

-- SECURITY DEFINER + default ACL made this callable by anon via
-- /rest/v1/rpc (flagged by the security advisor). Trigger execution does
-- not need EXECUTE grants — lock it to service paths, mirroring
-- 20260731_07_hardening.sql.
revoke execute on function public.mirror_crm_lead_to_pipeline() from public, anon, authenticated;

drop trigger if exists crm_leads_mirror_to_pipeline on public.crm_leads;
create trigger crm_leads_mirror_to_pipeline
  after insert on public.crm_leads
  for each row execute function public.mirror_crm_lead_to_pipeline();
