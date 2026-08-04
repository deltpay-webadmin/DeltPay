# Plaid: Sandbox → Production Cutover Runbook

All Plaid logic runs in Supabase Edge Functions and reads its environment
from the `PLAID_ENV` / `PLAID_SECRET` Edge Function secrets, so the cutover
itself is **operational** — the code in this repo is identical in both
environments. Deploy the code first (it is inert on sandbox), then follow
this runbook.

Related: `.env.example` documents every `PLAID_*` secret;
`supabase/scripts/plaid_sandbox_purge.sql` is the data-cleanup script
referenced in step 5.

---

## 1. Prerequisites (Plaid dashboard)

- **Production access approved.** Apply under Plaid dashboard → Settings →
  Compliance/Production. Plaid's review can take days — start early.
- **Products enabled for production must cover everything the code requests:**
  - `PLAID_PRODUCTS` (default): Auth, Transactions, Identity
  - `optional_products` on every link token: Liabilities, Investments
  - Assets (`/asset_report/*` — used by the asset-report actions)
  - Identity Verification (`/identity_verification/get` — used by IDV attach)

  Production billing applies per product; confirm pricing before cutover.
- **OAuth app profile approved** where required — US OAuth institutions
  (Chase, Charles Schwab, etc.) require the company profile / OAuth
  registration to be completed in the Plaid dashboard before they will work.

## 2. Plaid dashboard configuration

1. Copy the **production secret** (Team Settings → Keys). The client ID is
   the same across environments.
2. Register the **redirect URI** (API → Allowed redirect URIs):

   ```
   https://www.deltpay.com/plaid-oauth-callback
   ```

   It must match `PLAID_REDIRECT_URI` **exactly** (scheme, host, path, no
   trailing slash). The app serves this path via the Vercel SPA rewrite —
   no extra hosting config needed.
3. **Webhooks need no dashboard registration.** The backend attaches

   ```
   https://ytemrmpnwmzqeradbeoa.supabase.co/functions/v1/plaid-webhook
   ```

   to every link token and asset report it creates, which covers all the
   event families the receiver handles (TRANSACTIONS, ITEM, ASSETS). The
   dashboard's Webhooks page only configures listeners for products this
   integration doesn't consume events from (Transfer, IDV, Monitor, Bank
   Income) — leave it empty.

## 3. Deploy the code (safe while still on sandbox)

Deploy the three Plaid edge functions and the frontend:

```sh
supabase functions deploy server
supabase functions deploy plaid-webhook
supabase functions deploy plaid-config-check
# frontend: ./deploy.sh (Vercel)
```

Nothing changes behavior until the secrets below are flipped:
`redirect_uri` is only sent when `PLAID_REDIRECT_URI` is set, and webhook
verification defaults to log-only outside production.

## 4. Pre-cutover validation (still in sandbox)

- **Health check** — `GET .../functions/v1/plaid-config-check` returns
  `configured: true`, `env: "sandbox"`, `env_valid: true`,
  `credentials_valid: true`. (The probe is `/institutions/get`, which is
  the exact call that will run against production.)
- **Fail-closed env** — temporarily set `PLAID_ENV=prod` (typo on purpose):
  the CRM shows the red "unrecognized value" banner and Plaid calls return
  a clear error. Restore `PLAID_ENV=sandbox`.
- **Webhook verification** — set `PLAID_WEBHOOK_VERIFY=enforce` in sandbox
  (sandbox webhooks are signed too), connect a quick-connect item, then
  fire `/sandbox/item/fire_webhook` (`DEFAULT_UPDATE`) from the Plaid API
  and confirm the `plaid-webhook` logs show a successful sync. A `curl`
  POST without the `Plaid-Verification` header must get a 401. Unset the
  override afterwards (sandbox default is log-only).
- **OAuth round trip** — set `PLAID_REDIRECT_URI` in sandbox secrets and
  register the same URI in the dashboard, then connect the sandbox OAuth
  test institution (search "Platypus OAuth" in Link, `ins_127287`).
  Expected: the tab leaves to the bank simulator, returns to
  `/plaid-oauth-callback?oauth_state_id=…`, bounces into `#/dashboard/underwriting`,
  Link reopens automatically, and the exchange completes for the lead you
  started with. Also test aborting at the bank — no orphaned Link reopen
  on the next visit.
- **Non-OAuth regression** — an ordinary sandbox institution and the
  sandbox quick-connect button still work with `PLAID_REDIRECT_URI` set
  (Plaid ignores the redirect URI for non-OAuth institutions).

## 5. Purge sandbox data

Run `supabase/scripts/plaid_sandbox_purge.sql` in the Supabase SQL editor.
Sandbox access tokens are invalid against production; leftover items would
sit as errored connections and make the nightly `plaid-sync-all` cron log
failures. The script prints before/after counts and leaves
`pipeline_leads` untouched.

## 6. Flip the secrets (the actual cutover)

One batch, so no request runs with a mixed config:

```sh
supabase secrets set \
  PLAID_ENV=production \
  PLAID_SECRET=<production-secret> \
  PLAID_REDIRECT_URI=https://www.deltpay.com/plaid-oauth-callback
```

`PLAID_CLIENT_ID` is unchanged. Edge functions pick up new secrets on
their next cold start (typically seconds; no redeploy needed).

## 7. Verify production

1. `plaid-config-check` → `env: "production"`, `env_valid: true`,
   `credentials_valid: true`.
2. CRM → Underwriting → Plaid Portal: the status card shows
   `production`, no amber/red environment banners, and the purple
   "Sandbox test connect" button is gone.
3. Connect one real bank end-to-end — ideally an OAuth institution
   (e.g. Chase) to prove the redirect flow — and confirm accounts,
   identity, and transactions land in the vault.
4. `plaid-webhook` logs show real deliveries passing verification
   (no `verification failed` warnings for genuine Plaid traffic).
5. First-day checks that cannot be tested earlier: Assets and Identity
   Verification calls succeed (production entitlements), and the nightly
   `plaid-sync-all` cron completes cleanly.

## 8. Rollback

Code never needs to roll back — everything is secret-driven:

```sh
supabase secrets set PLAID_ENV=sandbox PLAID_SECRET=<sandbox-secret>
```

Any production items connected in the interim will then show as errored;
remove them via the portal (or re-run the purge script) before retrying.

---

## Known follow-ups (out of scope for the cutover)

- **`plaid_credentials.access_token` is stored in plaintext** (RLS on, no
  policies — service-role only). Consider encrypting at rest (pgsodium /
  Supabase Vault) now that real bank tokens will land there.
- **The public `/apply` page (`src/app/pages/ApplicationPage.tsx`) is
  demo-ware**: it fabricates a fake `link-sandbox-…` token, never exchanges
  it, and its Plaid step silently dead-ends. It is NOT a production Plaid
  surface — the only real Link flow is the staff CRM. Either remove the
  Plaid step there or wire it through a real public link-token endpoint.
