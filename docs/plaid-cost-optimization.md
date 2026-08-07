# Plaid: Cost Optimization & Product Playbook

How Delt uses each approved Plaid product, when it bills, and which CRM
action triggers it. Goal: every dollar of Plaid spend maps to a deliberate
underwriting, servicing, or compliance decision — never a background default.

## Billing models (per Plaid)

| Product | Model | Trigger |
|---|---|---|
| Transactions | Monthly subscription per item | Item exists with the product |
| Auth | One-time per item | First `/auth/get` call |
| Identity | One-time per item | First `/identity/get` call |
| Balance | Per successful call | `/accounts/balance/get` |
| Transactions Refresh | Per successful call | `/transactions/refresh` |
| Assets | Per report (days × items) | `/asset_report/create` |
| Identity Verification | Per verification events | IDV Link session steps |
| Monitor | Base fee per new user + monthly rescan fee | Screening created / rescanned |

Key rule this codebase relies on: one-time-fee products added via
`optional_products` on `/link/token/create` are **not billed until their
endpoint is first called**. `/accounts/get` (cached balances) is free —
only `/accounts/balance/get` (real-time) bills.

## The lifecycle → spend map

| Stage | Action | What bills |
|---|---|---|
| Prospect connects bank | Link / hosted link | Transactions subscription starts (the only default) |
| Every sync (webhook / nightly / manual) | `/transactions/sync` + free `/accounts/get` | Nothing new |
| File advances to underwriting | **Verify ownership** button → `POST /plaid/verify` | Auth + Identity one-time fees (then free forever on that item) |
| Right before a decision | **Fresh pull** button → `POST /plaid/refresh` | One Transactions Refresh call per item |
| Deep 90-day evidence needed | **Asset report** button | One Assets report |
| Deal funds | **AML screen** button → `POST /plaid/monitor/screen` | Monitor base fee, then monthly rescans |
| Before each ACH pull | **Live balance** button → `POST /plaid/balance` | One Balance call per item |
| Lead goes dead | Nightly retire sweep or **Retire** button | Billing STOPS (item removed at Plaid, vault data kept) |

## Onboarding & lead-flow timing

**When prospects connect.** Two rails, both landing in the same vault:

1. **Self-serve (preferred):** the deltcapital.com application asks for the
   bank connection mid-application — peak-motivation moment, right after
   the prospect has stated how much they want. Zero staff effort.
2. **CRM-initiated:** for leads that arrive without applying (Meta lead
   forms, referrals, statement audits), staff click **Send connect link**
   as part of first contact. The CRM now emails the secure link to the
   prospect automatically (and still copies it for texting). Rule of
   thumb: send the link during or immediately after the first
   conversation — connect rates fall off sharply after 24 hours.

**How fast data lands.** The connect → CRM pipeline is webhook-driven:

| Moment | Latency |
|---|---|
| Prospect finishes Link | `SESSION_FINISHED` webhook exchanges the token in seconds |
| Accounts + cached balances | Immediately on exchange (first sync) |
| Transactions / cash-flow metrics / model recommendation | Plaid's initial pull, typically **seconds to ~2 minutes** (`INITIAL_UPDATE` → auto-sync); full history follows minutes later (`HISTORICAL_UPDATE`) |
| CRM screen | Realtime — no refresh needed |
| Safety net | Hosted-link sweep + nightly 3am ET sync catch anything a webhook missed |

**Who gets emailed.**

| Event | Prospect | Staff (PLAID_NOTIFY_TO) |
|---|---|---|
| Staff click Send connect link | Secure link email, instantly | — |
| Link pending 24h | Reminder 1 (quiet-hours aware) | — |
| Link pending 72h | Reminder 2 (final) | — |
| Bank connects (either rail) | Confirmation ("file moving to review") | Instant "bank connected" heads-up |
| Link expires (day 7) | — | "Expired without connecting — call them" |

Prospect emails respect quiet hours (8am–9pm ET, weekdays); staff
notifications send anytime. Reminders stop for dead leads and every
touch is stamped on the lead's CRM timeline. The deltcapital.com
T+45min bounce nudge (Vercel cron) continues to cover applicants who
stall before the Plaid step.

## Environment variables (edge-function secrets)

| Secret | Default | Notes |
|---|---|---|
| `PLAID_PRODUCTS` | `transactions` | Billed at link time. Keep minimal. |
| `PLAID_OPTIONAL_PRODUCTS` | `auth,identity` | Deferred one-time fees. Add `liabilities`/`investments` only if enabled on the Plaid account (each starts a monthly subscription per item once called). |
| `PLAID_EAGER_VERIFICATION` | unset (`false`) | `true` restores the old bill-Auth+Identity-on-connect behavior. |
| `PLAID_RECURRING_ENABLED` | unset (`false`) | `/transactions/recurring/get` is a separately billed monthly add-on — leave off unless enabled on the account. |
| `PLAID_MONITOR_PROGRAM_ID` | unset | Required for AML screening. Create the program in the Plaid dashboard (Monitor → programs, ongoing screening on) and paste its ID. |
| `PLAID_RETIRE_AFTER_DAYS` | `30` | Nightly sweep retires items on leads in `Not Qualified` / `Declined` / `Lost` untouched this many days. `0` disables. |
| `RESEND_API_KEY` | unset | Required for all lead-flow emails (connect link, reminders, confirmations, staff alerts). Same key as the Vercel lead-email pipeline. |
| `PLAID_EMAIL_FROM` | `DeltPay <noreply@deltpay.com>` | Sender for lead-flow emails. |
| `PLAID_NOTIFY_TO` | `david@deltpay.com` | Staff inbox for connect/expiry alerts. |
| `PLAID_NOTIFY_BCC` | `carlos@deltpay.com` | Set to empty string to disable. |

## Spend visibility

Every billable call writes a row to `plaid_api_events` (product, pricing
model, lead, item, status). In the CRM, the Plaid vault's **Products &
Spend** tab shows a live product-utilization board, subscription counts,
and the full billable-call ledger (realtime); each prospect's detail view
shows its own connections, verification state, and per-product call
counts. API rollups: `GET /plaid/usage?leadId=…` (per lead) or
`GET /plaid/usage` (account-wide). Reconcile against the Plaid dashboard
invoice monthly.

## Retire vs. disconnect

- **Retire** (`POST /plaid/items/:id/retire`) — removes the item at Plaid
  (subscription ends), deletes stored credentials, keeps every vault
  document. Use for dead files and post-payoff merchants.
- **Disconnect** (`DELETE /plaid/items/:id`) — also erases the vault data.
  Use only when the data itself must go.

## Contract posture (MSA guardrail)

Plaid stays a narrow rail: bank connection, account/ownership verification,
cash-flow visibility, and ACH-adjacent checks. Credit decisioning and
FCRA-adjacent use stay on separate rails (CRS et al.) per Delt's Plaid MSA
posture — Monitor screening here is KYC/AML compliance, not credit.
