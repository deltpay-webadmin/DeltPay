-- ============================================================================
-- org_id on every data table.
--
-- Pattern per table:
--   1. add column if not exists org_id (default org #1 so concurrent inserts
--      during the rollout stay valid)
--   2. backfill nulls to org #1
--   3. set not null + index
--   4. DROP the static default and stamp org_id in a BEFORE INSERT trigger
--      instead: coalesce(explicit value, caller's org, org #1). A static
--      default would silently put another tenant's inserts into org #1;
--      the trigger resolves the caller's org at insert time, and falls back
--      to org #1 only for service-role paths (edge functions) that have no
--      auth context and predate multi-tenant awareness.
--
-- Known limitation, deliberate: ad_connections keeps its `provider` PK, so
-- only one Meta account can exist platform-wide. Re-keying to (org_id,
-- provider) is destructive and deferred to a later tier.
-- ============================================================================

create or replace function public.set_org_id()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  new.org_id := coalesce(new.org_id, public.current_org_id(), public.default_org_id());
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'pipeline_leads', 'onboarding_apps', 'underwriting_apps',
    'referrals', 'referral_program', 'lead_imports',
    'merchants', 'crm_deals', 'capital_deals', 'loan_payments',
    'residual_imports', 'residual_rows', 'contracts',
    'ach_imports', 'ach_daily_activity', 'outreach_events',
    'ad_connections', 'ad_credentials', 'ad_insights_daily', 'ad_leads',
    'plaid_items', 'plaid_credentials', 'plaid_nodes',
    'kv_store_940653c6'
  ] loop
    execute format(
      'alter table public.%I add column if not exists org_id uuid references public.orgs(id) default public.default_org_id()', t);
    execute format(
      'update public.%I set org_id = public.default_org_id() where org_id is null', t);
    execute format('alter table public.%I alter column org_id set not null', t);
    execute format('alter table public.%I alter column org_id drop default', t);
    execute format('create index if not exists %I on public.%I (org_id)', t || '_org_idx', t);
    -- trigger name prefixed so it fires before same-table resolve_agent
    -- triggers (Postgres fires same-event triggers in name order)
    execute format('drop trigger if exists %I on public.%I', t || '_org_stamp', t);
    execute format(
      'create trigger %I before insert on public.%I for each row execute function public.set_org_id()',
      t || '_org_stamp', t);
  end loop;
end $$;
