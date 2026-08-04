-- Stamp activation time once so quarter attribution (President's Club
-- leaderboard, Fast Start windows) survives later edits to the row.
-- Backfill existing activated/paid deals from updated_at.

alter table public.deal_submissions
  add column if not exists activated_at timestamptz;

update public.deal_submissions
set activated_at = updated_at
where activated_at is null and status in ('Activated', 'Paid');
