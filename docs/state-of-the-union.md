# Delt — State of the Union (2026-08-27)

An honest inventory of what has actually been built, what is stubbed, and what
is blocked — written to answer one question: **is there a working machine here,
or a pile of half-projects?**

Short answer: **there is a working machine.** The 18-day sprint that ended
2026-08-21 (87 commits) produced an end-to-end deal system. What's missing to
get merchants is small, and most of it is commercial/operational rather than
technical. The details, with receipts, below.

---

## 1. What works today (verified in code)

| Capability | Where | State |
|---|---|---|
| Quote funnel → self-serve MPA | `src/app/pages/GetAQuotePage.tsx` → `/api/leads/quote`; under-$50K/mo volume auto-issues a tokenized self-serve MPA link (`mpa-application` `self-start`) | **Working** |
| Self-serve merchant application | `/apply/mpa/:token` → `src/features/mpa/` (7-step wizard, EN/ES, token-authenticated) | **Working** |
| Deal Room (verbal yes → funded, one page) | `src/backend/components/backend/pages/DealRoomPage.tsx`, `DealRoomStages.tsx`; server-side funding gate (`supabase/migrations/20260819_04_funding_gate.sql`) blocks "Mark funded" until the packet is complete | **Working** |
| Luqra (Evolve) + Paysafe (Citizens) boarding | Blank MPAs in `docs/mpa-templates/`, field maps in `supabase/functions/_shared/mpa/{luqraMap,paysafeMap}.ts`, PDF fill + DocuSign anchor stamping, contracted buy-rate grids in `src/backend/components/backend/processorSchedules.ts` | **Working — the deepest processor integration in the repo** |
| DocuSign e-sign engine | `supabase/functions/docusign/`, `docusign-connect/` — embedded + email signing, in-CRM countersign, Connect webhook auto-files signed PDFs | **Working** |
| Plaid underwriting stack | `supabase/functions/_shared/plaid.ts` (110KB) — link, IDV, asset reports, repair sweeps, tokens encrypted at rest in Supabase Vault (`20260817` migration); 5 runbooks in `docs/plaid-*.md` | **Working, production-grade** |
| Deterministic underwriting model | Cash-Flow Decision Model v1.0.0 per `docs/sop-deal-flow.md` — hard knockouts mirrored by the phone script gates | **Working** |
| Lifecycle/SLA automation | `supabase/migrations/20260811_10_lifecycle.sql`: `sla-watch` (every 15 min, 1-business-hour speed-to-lead), `stale-lead-digest` (daily), `mpa-stall-reminders` (hourly), `deal-status-notify` (15 min), `capital-renewal-sweep` (daily), `growth-sweep` (weekly) — all via pg_cron + Resend | **Working** |
| Meta ads + lead-ads ingestion | `supabase/functions/_shared/meta.ts`, `20260730_meta_ads.sql`, `20260730_meta_lead_recon.sql`, xlsx/csv `LeadImportFlow` | **Working** |
| Lead pipeline + call system | `pages/BackendLeads.tsx` (full pipeline w/ scoring + KYB), `pages/LeadWorkspacePage.tsx` (the new one-page call/qualify/close workspace), `BackendCallPlaybooks.tsx`, call write-backs + next-action engine | **Working** |
| KYB intake + field encryption | `flows/NewLeadFlow.tsx` (8-step KYB), SSN/DOB/DL/bank encrypted app-side AES-256-GCM before Postgres, no anon RLS, token-hash auth (`20260807_01_merchant_applications.sql`, `docs/mpa-boarding.md`) | **Working** |
| Marketing site | ~46 pages, polished (0% processing pitch, capital flywheel, vertical pages, audit/calculator lead hooks) | **Working / complete** |
| Bilingual sales SOP | `docs/sop-deal-flow.md` (48–72h call-to-wire), `docs/sales/mca-qualification-call.md` (EN/ES, gates mirror the model) | **Written, ready to run** |
| Agent recruiting program | `docs/hiring/` — full Indeed strategy memo, posting, comp plan, interview script | **Written, not launched** |

## 2. What is partial or stubbed

| Item | Where | Problem |
|---|---|---|
| `/apply` page | `src/app/pages/ApplicationPage.tsx` | Fabricates a Plaid link token client-side (`'link-sandbox-' + Math.random()`). Demo-ware on a public route. |
| `/onboarding` page | `src/app/pages/OnboardingPage.tsx` | Plaid step is UI-only (its own comment says so); collects then discards identity fields; **persists nothing to a database** — fire-and-forget email only. |
| Settings → Integrations panel | `src/backend/components/backend/BackendSettings.tsx` | The whole `INTEGRATIONS` array is hardcoded mock data. Only Plaid and Meta have real backing. |
| Identity/risk vendors | SentiLink, CRS Credit, DataMerch | Named in the SOP and settings mock; **no code** — they are manual steps today. |
| MCA renderer vs. template | `supabase/functions/docusign/mca_agreement.ts` | Flagged in the SOP itself: renderer still emits an "Exhibit B" ACH block; the executed template folds ACH into §3.3. Reconcile before the next real envelope. |

## 3. Absent by design vs. absent by neglect

**Absent by design (stop feeling bad about these):**

- **Square API integration.** There is none because **OrderOut's reseller
  portal has no API** (stated in `MpaBoardingPanel.tsx`). The manual channel
  is already built and coherent: open portal → copy full packet
  (`squarePacketText()`, masked by default, full version permission-gated) →
  Mark boarded, with a funding write-back. Building "Square automation" is
  not a real work item.

**Absent by neglect (real gaps, ranked):**

1. **Lead capture depends on code outside this repo.** All four
   `/api/leads/*` endpoints persist via a hardcoded URL to a `submit-lead`
   edge function + `crm_leads` table that live in the deltcapital project
   (`api/leads/submit.ts:342` and siblings). If that function breaks, this
   repo cannot see it — website leads silently vanish. Highest-risk gap.
2. **Jotform inbound webhook not built** (listed as out of scope in
   `docs/deal-room-rollout.md`). DLT-APP submissions from the Jotform online
   application require manual re-keying into the CRM.
3. **UCC-1 filing workflow and wire/disbursement tracking** beyond
   approved/funded — also explicitly deferred in the rollout doc.
4. **Waitlist / newsletter nurture** — capture exists (`newsletter` form
   type), no nurture behind it.

## 4. Commercial blockers (rank above every technical item)

1. **Square Schedule A never received.** `processorSchedules.ts` carries the
   agreed **70/30 net split** with `pending: true` — "Awaiting Schedule A
   from Square." Until it lands, Square deals can be quoted on the agreed
   split but the paper isn't on file. This is a phone call / email chase,
   not a sprint.
2. **The agent hiring program is written but not launched.** The Indeed
   strategy memo, posting, comp ladder (50→60→70 lifetime residuals), and
   banded activation bonuses are done. Zero agents recruited.
3. **No evidence of live deal flow.** The machine has been built faster than
   it has been fed. That is the actual source of the "voluminous but
   uninspired" feeling: output without revenue feedback.

## 5. Repo hygiene flags (future sprint, not now)

- `README.md` and `guidelines/Guidelines.md` are untouched Figma Make
  boilerplate; `package.json` is still `@figma/my-make-file`. A newcomer
  learns nothing true from them.
- No `CLAUDE.md` despite the codebase being overwhelmingly agent-authored.
- `src/backend/components/dp/index.tsx` cites a `DELTPAY_DESIGN_SPEC.md`
  that does not exist in the repo.
- Two UI systems coexist (shadcn/Radix/Tailwind and MUI 7 + Emotion).
- `deploy.sh` and `deploy-wave1.sh` hardcode divergent stale paths.
- Stray orphan: `workspaces/default/code/src/app/components/DeltMarquee.tsx`.

## 6. The verdict

The inventory does not support abandonment. It supports a different
diagnosis: **eleven working subsystems and zero merchants is an operations
gap, not a product gap.** The system was explicitly built around a 48–72
hour call-to-wire path (`docs/sop-deal-flow.md`) that has never been run at
volume. Before abandoning, run it — measured, time-boxed, with pre-agreed
kill criteria. That is what `docs/30-day-operating-plan.md` defines.
