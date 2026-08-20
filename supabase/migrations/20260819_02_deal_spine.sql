-- ---------------------------------------------------------------------------
-- One deal spine (phase 1)
--
-- deal_submissions becomes the thread a prospect hangs on: leads link forward
-- into it, underwriting links back to it, and (with contracts.submission_id,
-- already present) every envelope attaches to it. This replaces the
-- lowercased-business-name string matching between the three graphs.
-- ---------------------------------------------------------------------------

-- lead → submission
alter table public.deal_submissions
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null;
create index if not exists deal_submissions_lead_idx on public.deal_submissions (lead_id);

-- submission/lead + contact fields → underwriting
alter table public.underwriting_apps
  add column if not exists submission_id uuid references public.deal_submissions(id) on delete set null,
  add column if not exists lead_id text references public.pipeline_leads(id) on delete set null,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;
create index if not exists underwriting_apps_submission_idx on public.underwriting_apps (submission_id);
create index if not exists underwriting_apps_lead_idx on public.underwriting_apps (lead_id);

-- One-time best-effort backfill by the historical name convention. New rows
-- carry real ids from creation; legacy rows keep the name-match fallback in
-- the UI when this doesn't hit.
update public.underwriting_apps u
set lead_id = l.id
from public.pipeline_leads l
where u.lead_id is null
  and lower(trim(u.business_name)) = lower(trim(l.business_name));
