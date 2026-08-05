# Plaid Setup — Beginner Walkthrough

A click-by-click companion to `docs/plaid-testing-strategy.md`. Do the
steps in order; each one says where you are, what to click, and how to
know it worked. Total time: roughly 30 minutes.

You'll need logins for: GitHub, dashboard.plaid.com, supabase.com,
vercel.com — plus a computer with Node.js for one terminal step.

---

## Step 1 — Merge the two pull requests (GitHub, ~2 min)

There is one PR on the **DeltPay** repo (CRM backend + docs) and one on
the **DeltCapital** repo (the deltcapital.com site).

1. Open the PR page, skim the description, click the green
   **Merge pull request** button, then **Confirm merge**. Do this for both.
2. Merging DeltCapital automatically redeploys www.deltcapital.com.
   That's safe: the new code does nothing until Step 3's secret exists,
   and if anything fails it behaves exactly like the old code.

> If Vercel shows an old "blocked" build for the Claude branch, ignore
> it — Vercel blocks builds from unrecognized commit authors. Your merge
> commit builds normally.

## Step 2 — Fix the CRM "Connect bank" error (Plaid, ~2 min)

This is the "OAuth redirect URI must be configured" toast.

1. Go to https://dashboard.plaid.com and sign in.
2. Left sidebar → **Developers → API** (on some accounts it's under the
   gear/Settings icon → API).
3. Find the **Allowed redirect URIs** section → **Configure** / **Add URI**.
4. Paste exactly (no trailing slash, must be character-for-character):
   ```
   https://www.deltpay.com/plaid-oauth-callback
   ```
5. Save.

**Check it worked:** open the CRM → Plaid Data Vault → click
**Connect bank** on any prospect. The Plaid window should now open
instead of the red error toast.

## Step 3 — Create the shared secret (Supabase, ~3 min)

This secret is a password the deltcapital.com site uses to talk to your
CRM backend. You'll paste the SAME value in two places (here and Step 5).

1. Make up the secret: open your password manager's generator (or any
   password generator you trust) and generate a random 40+ character
   string of letters and numbers. Copy it somewhere temporary — you need
   it twice. Don't use a password you use anywhere else.
2. Go to https://supabase.com/dashboard → open the **Delt Pay Database**
   project.
3. Left sidebar → **Edge Functions** → **Secrets** tab (if you don't see
   it there: **Project Settings → Edge Functions**).
4. **Add new secret**: Name `APPLY_EXCHANGE_SECRET`, Value = your random
   string. Save.

## Step 4 — Deploy the updated server function (terminal, ~5 min)

The new code is merged into GitHub, but the Supabase edge function is a
separate deploy. One-time terminal session (works on Mac Terminal or
Windows PowerShell; needs Node.js — https://nodejs.org, LTS version):

```sh
git clone https://github.com/deltpay-webadmin/DeltPay.git
cd DeltPay/supabase
npx supabase login
npx supabase link --project-ref ytemrmpnwmzqeradbeoa
npx supabase functions deploy make-server-940653c6
```

What each line does:
- `git clone …` downloads the repo; `cd DeltPay/supabase` enters it.
- `npx supabase login` opens your browser — click **Authorize**.
- `link` connects the folder to your Supabase project (it may ask for
  your database password — you can press Enter to skip; it isn't needed
  for function deploys).
- `functions deploy make-server-940653c6` uploads the server. Success
  looks like `Deployed Function make-server-940653c6`.

⚠️ Use exactly `make-server-940653c6` — NOT `deploy server`. (A stray
function named `server` already exists in the Supabase dashboard from a
past mistake; you can delete it under Edge Functions → server → ⋯ →
Delete. Nothing uses it.)

**Check it worked:** Supabase dashboard → Edge Functions →
`make-server-940653c6` → the "Last deployed" time is just now.

## Step 5 — Vercel environment variables (~5 min)

1. Go to https://vercel.com → team **Deltpay** → project
   **delt-capital-final** → **Settings** → **Environment Variables**.
2. Add variable #1 — the shared secret:
   - Key: `APPLY_EXCHANGE_SECRET`, Value: the string from Step 3.
   - Environments: check **Production, Preview, and Development** (all).
   - Save.
3. Add three sandbox variables — for each, **check ONLY "Preview"** (this
   is what keeps testing away from the live site):

   | Key | Value |
   |---|---|
   | `PLAID_ENV` | `sandbox` |
   | `PLAID_SECRET` | Plaid dashboard → **Team Settings → Keys** → copy the **Sandbox** secret (not Production!) |
   | `PLAID_IDV_TEMPLATE_ID` | the sandbox template id from Step 6 |

4. Env vars only apply to NEW deployments — Step 7 creates one, so
   nothing else to do here.

## Step 6 — Create a sandbox IDV template (Plaid, ~5 min)

Identity Verification templates are per-environment; your production one
won't work in sandbox.

1. In dashboard.plaid.com, find the environment picker (top of the left
   sidebar, currently says **Production**) and switch it to **Sandbox**.
2. Left sidebar → **Identity Verification** → **Templates** → create a
   new template. Match the production template's steps (ID document +
   selfie, etc.).
3. Copy the new template's id (starts with `idvtmp_`) and paste it into
   the `PLAID_IDV_TEMPLATE_ID` Preview variable in Step 5.

## Step 7 — Make a test link and run the application (~10 min)

Preview deployments run with the sandbox variables, so you can apply as
many times as you want with fake identities — no flagging, and the real
site is untouched.

1. GitHub → **DeltCapital** repo → click the branch dropdown (says
   `main`) → type `sandbox-testing` → click **Create branch:
   sandbox-testing from main**. That one click makes Vercel build a
   preview.
2. Vercel → delt-capital-final → **Deployments** → the newest one shows
   branch `sandbox-testing`. Wait for **Ready**, then click **Visit**.
   - Preview links are login-protected: if you see a Vercel login page,
     sign in with your Vercel account and it will pass you through.
3. Run the application on that preview URL:
   - Fill the form normally (your real email is fine — it's what matches
     the lead in the CRM).
   - **Bank step:** pick any bank, log in with username `user_good`,
     password `pass_good`.
   - **Identity step:** follow the prompts; sandbox accepts test photos
     and fake data. (To force a failure on purpose, use date of birth
     `1901-01-01`.)

## Step 8 — See the result + clean up

- Whether the connection lands in the CRM vault depends on one rule:
  **both sides must be on the same Plaid environment.** The CRM's env
  shows in the Plaid Data Vault status card. Sandbox preview + sandbox
  CRM → the prospect appears Connected with revenue/score within ~a
  minute. Sandbox preview + production CRM → the applicant flow still
  completes fine, but nothing persists (that's expected, not a bug).
- After sandbox testing, clean out test data: Supabase dashboard → SQL
  Editor → paste and run `supabase/scripts/plaid_sandbox_purge.sql`
  (from this repo). Delete any `lead-app-…` test leads in the CRM by
  hand if you created ones with test emails.

---

**When you go fully live** (production application → production CRM),
follow `docs/plaid-production-cutover.md`; the applicant-connection
pipeline then persists real connections automatically with no further
changes.
