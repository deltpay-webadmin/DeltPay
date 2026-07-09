-- Leads captured from the public "Get a Quote" wizard (and future lead forms).
-- Persisted server-side by api/leads/quote.ts in addition to the sales email,
-- so every prospect who completes the wizard becomes a durable, queryable row
-- in the Delt backend.

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  source            text not null default 'get-a-quote',
  name              text not null,
  email             text not null,
  phone             text,
  business_name     text,
  business_type     text,
  monthly_volume    text,
  features          text[] not null default '{}',
  recommended_plan  text,
  notes             text,
  spam_suspect      boolean not null default false,
  user_agent        text
);

comment on table public.leads is 'Prospect leads from the Get-a-Quote wizard and other public lead forms.';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx      on public.leads (lower(email));

-- Row Level Security: the table is INSERT-only for the public web roles.
-- Nobody can read leads back through the anon/authenticated API — reads happen
-- via the service role (server / dashboard) only.
alter table public.leads enable row level security;

-- Idempotent policy creation (Postgres has no "create policy if not exists").
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leads'
      and policyname = 'Public forms can insert leads'
  ) then
    create policy "Public forms can insert leads"
      on public.leads
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

-- New-table grants: the anon/authenticated roles may INSERT only (RLS still
-- applies). No SELECT/UPDATE/DELETE is granted, so leads cannot be read or
-- altered from the public API.
grant insert on public.leads to anon, authenticated;
