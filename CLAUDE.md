# CLAUDE.md — working in the DeltPay repo

Read this first. It is the truthful map of the project; the README points
here. **Before trusting or modifying any CRM page, check
`docs/real-vs-mock.md`** — a substantial share of the back-office renders
convincing hardcoded demo data, and "fixing" a mock page as if it were live
is the most common way to waste a session.

## What this project is

One Vite + React 18 SPA serving two surfaces:

- `src/app/` — the public **deltpay.com** marketing site (~46 pages; 0%
  processing + built-in capital pitch, quote/audit/calculator funnels).
- `src/backend/` — the **Delt CRM** (leads, Deal Room, underwriting,
  merchants, residuals, agents), lazy-loaded behind Supabase Auth at
  `/dashboard`. Org membership + RBAC resolve via the `get_me` RPC.

Business model: merchant-services ISO + MCA funder. Boarding channels:
**Luqra** (Evolve Bank & Trust) and **Paysafe** (Citizens Bank) via generated
MPA PDFs + DocuSign; **Square** via the OrderOut reseller portal, which is
**manual by design — it has no API** (copy-packet + Mark boarded in
`MpaBoardingPanel.tsx`). The operating SOP is `docs/sop-deal-flow.md`.

## Commands

```sh
npm run dev               # Vite dev server
npm run build             # production build — run before pushing
npx vitest run            # unit tests (src/backend/components/backend/__tests__/)
npm run check:functions   # edge-function import check (scripts/check-functions.mjs)
```

CI (`.github/workflows/ci.yml`) runs build + vitest + the functions check.

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Marketing pages | `src/app/pages/`, components in `src/app/components/` | Heavy three.js/shader work; code-split lazy routes |
| CRM pages | `src/backend/components/backend/pages/` | ~53 pages; nav in `DeltBackendLayout.tsx` |
| CRM stores | `src/backend/components/backend/*Store.ts` | `useSyncExternalStore` pattern: hydrate on first subscribe, refresh after writes, graceful no-op when Supabase env is missing. `crmStore.ts` is the big one; `dealSubmissionsStore.ts` is the clean template to copy |
| Design primitives | `src/backend/components/dp/index.tsx` | (Its referenced DELTPAY_DESIGN_SPEC.md is not in the repo) |
| MPA wizard | `src/features/mpa/` | Bilingual 7-step; public route `/apply/mpa/:token`, also embedded in the CRM |
| Edge functions | `supabase/functions/` | `server` (cron job runner + API), `docusign`, `docusign-connect`, `mpa-application`, `plaid-webhook`, `analyze-statement`, etc. Shared code in `_shared/` |
| Migrations | `supabase/migrations/` | Replayable from `20260727_baseline.sql`. **This project has no default privileges — every new table needs explicit GRANTs**, `is_staff()` RLS, and a `touch_updated_at` trigger (copy an existing migration) |
| Vercel API | `api/` | Zero-import self-contained lead endpoints |

Routing is `react-router` v7 with **HashRouter**. Two UI systems coexist
(shadcn/Radix/Tailwind v4 and MUI 7) — prefer the shadcn/Tailwind idiom of
the file you're touching; don't introduce MUI into new code.

## Conventions

- **Migrations**: `YYYYMMDD_NN_name.sql`; `create table if not exists`;
  `is_staff()` policies; explicit grants to `authenticated, service_role`;
  guard realtime-publication changes. Applied with `supabase db push` — never
  assume a committed migration is live.
- **Stores**: follow `dealSubmissionsStore.ts` (snake_case→camelCase mapper,
  toast on write failure, `refresh()` after writes, offline no-op).
- **Env**: `.env.example` is the integration surface map; secrets fail
  closed. Plaid tokens are encrypted at rest in Supabase Vault; MPA sensitive
  fields are AES-256-GCM app-side — never return them in API responses
  (clients render `masks`).
- **Honesty in UI**: recent work deliberately made states truthful
  ("approval is not funding", real Plaid connection states). Keep that bar:
  never render a status the backend can't back.

## Known sharp edges

- **Lead capture dependency lives outside this repo**: all `api/leads/*`
  endpoints persist via a hardcoded `submit-lead` edge function +
  `crm_leads` table in the sibling deltcapital project. A failure there
  loses website leads silently.
- `/apply` (`ApplicationPage.tsx`) fabricates a Plaid token; `/onboarding`
  (`OnboardingPage.tsx`) persists nothing — both are stubs slated for
  redirect into the working Get-a-Quote → self-serve MPA path.
- The MCA DocuSign renderer still emits an "Exhibit B" ACH block while the
  executed template folds ACH into §3.3 (flagged in `docs/sop-deal-flow.md`).
- No error tracking/APM exists; the only real alerting is the email-health
  digest. Cron jobs (13) are registered in `supabase/functions/server/index.tsx`
  and scheduled via `public.invoke_job()`.
- `deploy.sh` / `deploy-wave1.sh` hardcode divergent stale paths; the
  CI workflows are the reliable deploy path.

## Key docs

`docs/sop-deal-flow.md` (deal SOP) · `docs/deal-room-rollout.md` ·
`docs/mpa-boarding.md` · `docs/plaid-*.md` (5 runbooks) ·
`docs/real-vs-mock.md` (page-by-page truth map) ·
`docs/state-of-the-union.md` + `docs/30-day-operating-plan.md` (strategy) ·
`docs/hiring/` (1099 agent program) · `docs/sales/mca-qualification-call.md`.
