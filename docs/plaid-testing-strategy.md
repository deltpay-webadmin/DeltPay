# Plaid: Testing Strategy & Applicant-Connection Wiring

This doc answers three questions that came up together:

1. Why does the CRM's Plaid Data Vault throw **"OAuth redirect URI must be
   configured in the developer dashboard"** when clicking *Connect bank*?
2. Shouldn't some prospects **already be connected** from the
   deltcapital.com funding application, making *Connect bank* the wrong
   button?
3. How do we **test the deltcapital.com Plaid application end-to-end**
   without going through real identity verification (which flags repeat
   applicants)?

Related: `docs/plaid-production-cutover.md` (CRM sandbox→production
runbook), `.env.example` (every `PLAID_*` / `APPLY_EXCHANGE_SECRET`
secret), `supabase/scripts/plaid_sandbox_purge.sql` (cleanup).

---

## 1. The OAuth redirect error (CRM "Connect bank")

The toast is Plaid's own rejection of `/link/token/create`. The edge
functions attach `redirect_uri` to **every** link token whenever the
`PLAID_REDIRECT_URI` Supabase secret is set
(`supabase/functions/_shared/plaid.ts`), and Plaid refuses to mint the
token if that URI is not registered in the dashboard.

**Fix (pick one):**

- **Register the URI** (needed anyway for OAuth banks like Chase):
  Plaid dashboard → Developers → API → **Allowed redirect URIs** → add
  exactly

  ```
  https://www.deltpay.com/plaid-oauth-callback
  ```

  It must match the `PLAID_REDIRECT_URI` secret character-for-character
  (scheme, host, path, no trailing slash). The allowed-URI list is
  team-wide in the dashboard, so it covers sandbox and production.

- **Or unset the secret** until OAuth institutions are needed:
  `supabase secrets unset PLAID_REDIRECT_URI`. Non-OAuth banks work
  fine without it; OAuth banks won't.

Verify with the health endpoint:
`GET …/functions/v1/plaid-config-check` → `configured: true`,
`credentials_valid: true` — then *Connect bank* should open Link.

## 2. "Connect bank" vs. connections made in the application

Investigated against the live database (July 2026):

- `plaid_items`, `plaid_credentials`, and `plaid_nodes` are **all
  empty** — no prospect has ever had a connection in the vault.
- The deltcapital.com application *did* run Plaid Link for some visitors:
  `delt_capital.apply_progress` holds 5 `plaid_connected` events — but
  **all of them are internal test submissions** (Dave's Burgers Test /
  TEST 1), none from real prospects.
- More importantly, the application's exchange endpoint
  (`api/plaid-exchange-token.js` in the DeltCapital repo) **discarded
  the access token by design** — it exchanged the public token, showed
  the applicant their account names, and kept nothing. Those items are
  orphaned at Plaid; there is nothing to recover or re-attach.

So *Connect bank* is the correct state for every current prospect. The
real gap was that **future** applicant connections would also be thrown
away. That's now wired up:

### How applicant connections reach the vault

```
deltcapital.com /apply  ──(public_token + applicant email)──▶
  api/plaid-exchange-token.js  ──POST x-apply-secret──▶
    edge fn: /make-server-940653c6/apply/plaid-exchange
      ├─ match pipeline_leads by contact_email (or create lead-app-…)
      ├─ exchangePublicToken → plaid_items + plaid_credentials
      ├─ full vault sync (accounts, identity, transactions, cash flow,
      │  decision model) — the prospect shows as Connected in the CRM
      └─ returns {institution_name, accounts[]} for the applicant UI
```

- Gate: `x-apply-secret` header, timing-safe compare against the
  `APPLY_EXCHANGE_SECRET` edge secret. Fails closed (403) when unset.
- Lead matching: case-insensitive email match against
  `pipeline_leads.contact_email`, newest first. No match → a new lead
  (`lead-app-<uuid8>`, source `deltcapital.com application`, stage/status
  `New`) is created, mirroring the Meta lead-import conventions.
- Failure behavior: the DeltCapital endpoint **falls back to its old
  local exchange** on any error, so the applicant flow never breaks —
  the connection just doesn't persist (and the fallback is logged).

### One-time wiring (operational)

1. Generate a long random secret, e.g. `openssl rand -hex 32`.
2. Supabase: `supabase secrets set APPLY_EXCHANGE_SECRET=<secret>`
   (project `ytemrmpnwmzqeradbeoa`). Edge functions pick it up on the
   next cold start.
3. Vercel project `delt-capital-final` → Settings → Environment
   Variables → add `APPLY_EXCHANGE_SECRET` = the same secret (all
   environments). The forward URL and auth are derived from the
   `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` vars the site already
   has — no other new variables.
4. Redeploy deltcapital.com.

### Environment matching (important)

A `public_token` can only be exchanged in the Plaid environment that
minted it. The application (Vercel `PLAID_ENV`) and the CRM edge
functions (Supabase `PLAID_ENV`) must match for connections to persist:

| deltcapital.com | CRM edge functions | Result |
|---|---|---|
| production | production | ✅ applicant connections land in the vault |
| sandbox (preview) | sandbox | ✅ full end-to-end testable in sandbox |
| production | sandbox (or vice versa) | ⚠️ exchange fails with `INVALID_PUBLIC_TOKEN`; application falls back to local exchange, applicant unaffected, nothing persists |

Both sides also share the same `PLAID_CLIENT_ID` (one Plaid team), which
is what makes the cross-app exchange possible at all.

## 3. Testing the deltcapital.com application without real IDV

**Never test the production flow with real identities** — production
IDV performs real KYC and flags repeat/duplicate applicants (which is
exactly what happened). Instead, test on a **Vercel preview deployment
running Plaid sandbox**. Sandbox verifies nothing real: Link accepts
fake credentials and IDV accepts test data, so you can run the flow as
many times as you like.

### One-time setup

Vercel project `delt-capital-final` → Settings → Environment Variables —
add these scoped to **Preview only** (production values stay untouched):

| Variable | Preview value |
|---|---|
| `PLAID_ENV` | `sandbox` |
| `PLAID_SECRET` | the **sandbox** secret (dashboard → Team Settings → Keys) |
| `PLAID_IDV_TEMPLATE_ID` | an IDV template created **in sandbox** (template IDs are env-scoped — the production one won't work) |
| `PLAID_CLIENT_ID` | same as production (client ID is env-agnostic) |

To create the sandbox IDV template: Plaid dashboard → toggle the
environment picker to **Sandbox** → Identity Verification → Templates →
create one mirroring the production template's steps.

### Per test run

1. Push any branch of the DeltCapital repo (or redeploy an existing
   preview). Vercel builds a preview URL like
   `delt-capital-final-git-<branch>-deltpay.vercel.app` — its `/api/*`
   functions run with the Preview env, i.e. sandbox.
2. Run the application flow on the preview URL:
   - **Bank connection (Link):** pick any institution, credentials
     `user_good` / `pass_good`. For OAuth-flow coverage use the
     "Platypus OAuth" test institution (`ins_127287`).
   - **Identity verification:** follow the IDV prompts — sandbox
     accepts test images/data and never performs real checks. To force
     specific outcomes, use Plaid's documented sandbox IDV test inputs
     (e.g. date of birth `1901-01-01` fails the DOB check).
3. If the apply-exchange wiring is configured **and** the CRM edge
   functions are also on sandbox, the connection appears in the CRM →
   Plaid Data Vault within seconds (lead matched/created by the email
   you typed into the form). Verify: vault shows the institution,
   monthly revenue, and the model decision populate after sync.

### CRM-side sandbox testing (no Link at all)

With the CRM edge functions on `PLAID_ENV=sandbox`, the vault page shows
a purple **Sandbox test connect** button per prospect
(`sandboxQuickConnect`) that creates and syncs a test item in one click —
no Link UI, no credentials. Use this to demo/tune the vault, scoring,
and decision model without touching the application at all.

### Cleanup

Sandbox items are worthless once you cut back to production testing —
run `supabase/scripts/plaid_sandbox_purge.sql` in the Supabase SQL
editor to clear `plaid_items` / `plaid_credentials` / `plaid_nodes`
(prints before/after counts, leaves `pipeline_leads` alone). Delete any
`lead-app-…` test leads from the CRM manually if you created them with
test emails.

## Known limitations / follow-ups

- The DeltPay marketing site's own `/apply` page
  (`src/app/pages/ApplicationPage.tsx`) is still demo-ware (fake link
  token, no exchange). It is unrelated to deltcapital.com; either remove
  its Plaid step or wire it through the same apply-exchange route.
- `plaid_credentials.access_token` remains plaintext at rest
  (service-role-only table) — pre-existing follow-up from the cutover
  runbook, now slightly more urgent since applicant tokens land there
  automatically.
- IDV results from the application are not yet attached to the vault
  prospect (the CRM has a manual "attach IDV" action; auto-attach by
  `client_user_id` is a natural next step).
