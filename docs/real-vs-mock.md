# Real vs. mock — the page-by-page truth map

Last verified: 2026-08-27. The CRM mixes genuinely live, Supabase-backed
surfaces with pages that render convincing hardcoded demo data. This file is
the authority on which is which. **Update it when a page changes category.**

Rules of thumb:
- A page is **REAL** only if it reads/writes a Supabase table through a store
  or edge function.
- A page is **MOCK** if its data comes from a `const` array in the component.
  Mock pages must not be "fixed" as if live, and should not be trusted in any
  business decision.

## Real (Supabase-backed, safe to trust)

| Surface | Files | Backing |
|---|---|---|
| Lead pipeline + scoring + KYB | `pages/BackendLeads.tsx`, `crmStore.ts` | `pipeline_leads` |
| Lead Workspace (call/qualify/close) | `pages/LeadWorkspacePage.tsx` | `pipeline_leads`, call write-backs |
| Deal Room (verbal yes → funded) | `pages/DealRoomPage.tsx`, `DealRoomStages.tsx` | `deal_submissions`, `contracts`, funding-gate RPCs |
| Deal submissions / Agent Desk | `dealSubmissionsStore.ts` | `deal_submissions` |
| Underwriting | `pages/BackendUnderwriting*.tsx`, `crmStore.ts` | `underwriting_apps` |
| Merchants | `pages/BackendMerchants.tsx`, `MerchantDetail.tsx`, `crmStore.ts` | `merchants`, `crm_deals` |
| Hardware & installs | `merchantHardwareStore.ts`, card on `MerchantDetail.tsx` | `merchant_hardware` (migration `20260827_01`) |
| Residuals | `pages/BackendResiduals.tsx`, `residualsStore.ts` | `residual_imports`, `residual_rows` |
| Book health flags | `bookHealth.ts` (unit-tested) | residual rows |
| MPA applications + boarding | `MpaBoardingPanel.tsx`, `merchantApplicationsStore.ts` | `merchant_applications`, `mpa-application` fn |
| Plaid panel incl. spend/products tab | `pages/BackendPlaid.tsx` | `plaid_items`, `plaid_api_events`, `plaid_link_events` |
| Marketing hub (Meta only) | `pages/BackendMarketing.tsx`, `marketingStore.ts` | `ad_connections`, `ad_insights_daily`, `ad_leads` — real CPL/CPM |
| Capital book | `capitalStore.ts`, capital pages | `capital_deals`, `loan_payments` |
| Lifecycle/SLA automation | `_shared/lifecycle.ts` + pg_cron | `sla-watch`, digests, sweeps — 13 registered jobs |
| Outreach telemetry | `pages/BackendOutreach.tsx` | `outreach_events` (written by deltcapital.com, read-only here) |
| Sync indicator | `SyncIndicator.tsx` | live `useCrmSync()` state |

## Mock (hardcoded demo data — do not trust, do not "fix" as live)

| Surface | File | The tell |
|---|---|---|
| Financials (P&L) | `pages/BackendFinancials.tsx` | `summaryCards`/`cashFlowData` const arrays; "$185K expenses" is invented |
| Payroll | `pages/BackendPayroll.tsx` | `upcomingItems`/`pastRuns` hardcoded; no provider |
| Reports | `pages/BackendReports.tsx` | `const REPORTS` catalog; nothing generates a report |
| Subscriptions | `pages/BackendSubscriptions.tsx` | hardcoded `subscriptions[]`; MRR/ARPU computed off fakes |
| Tasks | `pages/BackendTasks.tsx` | `const TASKS` |
| Inbox | `pages/BackendInbox.tsx` | no store imports at all |
| Disputes | `pages/BackendDisputes.tsx` | `const DISPUTES` |
| Retention | `pages/BackendRetention.tsx` | no data store |
| Settings → Integrations health | `BackendSettings.tsx` (`INTEGRATIONS`) | every health score/lastSync is fabricated — even Plaid, which has a real self-check (`plaid-config-check`) |
| Merchant residual detail demo record | `pages/MerchantResidualDetail.tsx` | static 7-merchant record; fake Clover serials, fake `lastPing` |
| Compliance → Monitoring (VAMP/ECM) | `pages/BackendCompliance.tsx` | thresholds hardcoded |
| Marketing "Sample" mode | `BackendMarketing.tsx` demo branch | multi-channel ROAS (Google/LinkedIn/SMS) is fiction; only Meta is real |
| Shopping cart | `src/app/pages/ShoppingCartPage.tsx` | checkout only fires a Meta Pixel event |
| Notes & Tasks pad on MerchantDetail | `pages/MerchantDetail.tsx` | session-local state, not persisted |

## Stubs on public routes

- `/apply` — `ApplicationPage.tsx` fabricates a Plaid link token.
- `/onboarding` — `OnboardingPage.tsx` persists nothing (email only).

Both should redirect into the working Get-a-Quote → self-serve MPA path
(`/get-a-quote` → `/apply/mpa/:token`) until rebuilt.

## Named but not integrated

SentiLink, CRS Credit, DataMerch (manual steps; no code). Jotform DLT-APP
(external form; inbound webhook explicitly not built — see
`docs/deal-room-rollout.md`). North/NAB, ACH.com, FiCoSo, 10Web, QuickBooks
(settings mock only).

## Recommended next hardening (not yet built)

1. Bring `submit-lead` + `crm_leads` into this repo, or add failure paging —
   today all website lead capture depends on the deltcapital project and can
   fail silently.
2. Cron-failure alerting (the job runner already returns `{ok, task, ms}`).
3. A unit-price map for `plaid_api_events` so the spend tab shows dollars.
4. Jotform inbound webhook for DLT-APP submissions.
5. Park the mock pages out of navigation until real data backs them.
