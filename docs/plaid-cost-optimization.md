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

## Environment variables (edge-function secrets)

| Secret | Default | Notes |
|---|---|---|
| `PLAID_PRODUCTS` | `transactions` | Billed at link time. Keep minimal. |
| `PLAID_OPTIONAL_PRODUCTS` | `auth,identity` | Deferred one-time fees. Add `liabilities`/`investments` only if enabled on the Plaid account (each starts a monthly subscription per item once called). |
| `PLAID_EAGER_VERIFICATION` | unset (`false`) | `true` restores the old bill-Auth+Identity-on-connect behavior. |
| `PLAID_RECURRING_ENABLED` | unset (`false`) | `/transactions/recurring/get` is a separately billed monthly add-on — leave off unless enabled on the account. |
| `PLAID_MONITOR_PROGRAM_ID` | unset | Required for AML screening. Create the program in the Plaid dashboard (Monitor → programs, ongoing screening on) and paste its ID. |
| `PLAID_RETIRE_AFTER_DAYS` | `30` | Nightly sweep retires items on leads in `Not Qualified` / `Declined` / `Lost` untouched this many days. `0` disables. |

## Spend visibility

Every billable call writes a row to `plaid_api_events` (product, pricing
model, lead, item, status). Per-lead rollup: `GET /plaid/usage?leadId=…`;
account-wide: `GET /plaid/usage`. Reconcile against the Plaid dashboard
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
