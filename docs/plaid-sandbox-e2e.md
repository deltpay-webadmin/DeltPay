# Plaid: Sandbox End-to-End Test Rail

The repeatable, no-real-banks test of the full pipeline:
applicant → Link → exchange → initial sync → vault docs → webhook →
incremental sync → **repair loop** (update mode) → funnel telemetry.

Everything below runs against Plaid **sandbox** — fake credentials
(`user_good` / `pass_good`), unlimited retries, no KYC flags, no billing
surprises. Related: `docs/plaid-testing-strategy.md` (preview-env setup),
`docs/plaid-production-cutover.md` (§8 rollback = the same secret flip).

---

## 0. Enter sandbox (one command, reversible)

CRM edge functions (Supabase project `ytemrmpnwmzqeradbeoa`):

```sh
supabase secrets set PLAID_ENV=sandbox PLAID_SECRET=<sandbox-secret>
```

deltcapital.com applicant flow: use a **Vercel preview deployment** of the
DeltCapital repo — its Preview env is already pinned to sandbox
(see plaid-testing-strategy.md §"One-time setup"). Both sides must be on
the same env or exchanges fail with `INVALID_PUBLIC_TOKEN`.

Exit sandbox afterwards (and purge test data — step 6):

```sh
supabase secrets set PLAID_ENV=production PLAID_SECRET=<production-secret>
```

Health check both directions:
`GET …/functions/v1/plaid-config-check` → `env`, `env_valid: true`,
`credentials_valid: true`.

## 1. Connect (two rails)

- **CRM rail**: Underwriting → Plaid portal → pick a test lead → purple
  **Sandbox test connect** (instant, no Link UI), or **Connect bank** for
  the real Link modal (any institution, `user_good`/`pass_good`; OAuth
  coverage: search "Platypus OAuth", `ins_127287`).
- **Applicant rail**: run the preview-URL apply flow; the Plaid step now
  shows the consent notice, always requests Transactions, and attaches
  the CRM webhook to the token.

**Expect** in the CRM: item appears as **“Verifying bank data”** (amber,
spinning) and flips to **Active** only after the first successful
transactions sync. Toast says "verifying", not "connected", until then.

## 2. Verify the funnel telemetry

```sql
select created_at, event, lead_id, item_id, link_session_id, error_code, institution, meta
from plaid_link_events order by created_at desc limit 20;
```

A clean connect shows: `created` → (`opened`) → `session_finished` /
`exchanged` (with `link_session_id`) → `first_sync`. Applicant-rail rows
carry `meta.surface = 'apply'`. Billable-call bookkeeping:

```sql
select created_at, endpoint, status, meta->>'request_id' as request_id
from plaid_api_events order by created_at desc limit 10;
```

`request_id` must be populated on every row.

## 3. Webhook delivery

Fire a webhook from Plaid (dashboard webhook tester, or API
`/sandbox/item/fire_webhook` with `webhook_code: "DEFAULT_UPDATE"`).

**Expect**: Plaid dashboard shows the delivery as 200 (sandbox default
verification mode is log-only; a curl POST *without* the
`Plaid-Verification` header only 401s when `PLAID_WEBHOOK_VERIFY=enforce`).
Function logs show `synced:<item_id>`:

```sql
-- Supabase logs (last hour)
select timestamp, event_message from <function logs source>
where event_message like '%plaid-webhook%';
```

## 4. The repair loop (the production-incident path)

1. Break the item: `POST /sandbox/item/reset_login { access_token }`
   (or wait — Plaid sandbox also emits `PENDING_EXPIRATION` on demand via
   fire_webhook).
2. **Expect** within seconds (webhook → auto-repair rail):
   - `plaid_items.error_code = 'ITEM_LOGIN_REQUIRED'`, CRM shows
     **"Reconnect needed"** with *Reconnect now* / *Send repair link*;
   - a `plaid_link_requests` row with `mode='update'`, and (if the lead
     has an email) the reconnect email sent — check the lead timeline.
3. Repair it: open the hosted repair link (or CRM *Reconnect now*),
   log in with `user_good`/`pass_good`.
4. **Expect**: `LINK SESSION_FINISHED` webhook → request `completed` with
   `link_session_id` stored → item back to `active`, `error_code` null,
   resynced. The `plaid-sync-all` job's `repair_links` sweep reports
   `already-pending`/`sent` counts and never double-sends.

## 5. Incremental sync

Fire `SYNC_UPDATES_AVAILABLE` again (or use
`/sandbox/transactions/create` to add transactions), confirm
`transactions_added > 0` on the next sync and the vault month documents +
cash-flow analysis update.

## 6. Clean up

Run `supabase/scripts/plaid_sandbox_purge.sql` (clears plaid_items /
credentials / nodes; prints before/after counts), delete `lead-app-…`
test leads, flip secrets back to production (step 0), and re-run
`plaid-config-check`.

---

## Why this is a flip, not a standing sandbox branch

A Supabase preview branch (~$0.01/h) can't currently be provisioned
end-to-end without manual steps this rail avoids: edge-function secrets
are set per-project via CLI/dashboard only, and the branch would need its
own function deploys wired up. The secret flip reuses the production
project's functions, webhook URL, and telemetry tables — which is exactly
what you want the test to exercise. If sandbox testing becomes frequent
enough to want an always-on branch, wire the GitHub↔Supabase branching
integration first so branch functions deploy from git, then pin that
branch's secrets to sandbox once.

## Access-token storage note

Tokens are no longer readable from SQL: `plaid_credentials.access_token`
is a scrubbed marker column, and the real tokens live encrypted in
Supabase Vault (`vault.secrets`, names `plaid:<item_id>`), reachable only
through the service-role RPCs `plaid_token_store` / `plaid_token_get`.
Deleting a credentials row purges its vault secret via trigger.
