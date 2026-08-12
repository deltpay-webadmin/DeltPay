# DeltPay repository guidance

## Embedded Backend CRM: LIVE-DATA-ONLY

**This policy is mandatory and non-negotiable.** Everything in `src/backend/**`
must use live data or a clean empty state.

- Never add fabricated, sample, mock, demo, or seeded merchants, agents,
  employees, payments, metrics, correspondence, or hardcoded dataset rows.
- New CRM features must either wire to Supabase/live data or render a clean,
  intentional empty state; never fill a UI with realistic-looking fake data.
- When placeholder copy is unavoidable (for example, a template preview), use
  an obvious generic such as `Sample Business LLC` — never a plausible merchant
  or employee name.
- `scripts/check-dummy-data.mjs` enforces this policy and fails local and Vercel
  builds. Run `npm run check:dummy-data` before submitting CRM changes.
- When removing new dummy data, extend the clearly marked banned list in that
  guard so the same data cannot return.

## Repository orientation

- Stack: Vite, React, and TypeScript.
- The marketing site lives in `src/`; the embedded CRM lives in `src/backend/`.
- Build: `npm run build` (runs the dummy-data guard first).
- Tests: `npm test`.
- Backend guard: `npm run check:dummy-data`.
- Edge-function import check: `npm run check:functions`.
