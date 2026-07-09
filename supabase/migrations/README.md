# Delt customer-portal migrations

Canonical schema + RLS for the **shared** Delt backend (Supabase project
`ukruhkiwhxoreamerfoh`). Both this DeltPay site and the separate Delt Capital
app authenticate against the same Supabase Auth pool and read/write these tables
under the same row-level security.

## Apply order

Apply in filename order (each is idempotent — safe to re-run):

1. `20260709000001_profiles.sql` — `profiles` + `set_updated_at()` +
   `handle_new_user()` trigger (seeds a profile from signup metadata, incl.
   `product_access`).
2. `20260709000002_pay_tables.sql` — Delt Pay: `payments`, `customers`, `invoices`.
3. `20260709000003_capital_tables.sql` — Delt Capital: `loans`,
   `loan_repayments`, `capital_applications`, `capital_eligibility`.

This is a web/remote project, so apply via the Supabase MCP `apply_migration`
tool (or paste into the SQL editor). **Before applying, run `list_tables` on the
`public` schema** — if a table already exists (e.g. created by the Capital app),
reconcile columns rather than blindly re-creating. After applying, run
`get_advisors(type: security)` and confirm there are no "RLS disabled on public
table" findings.

## Design

- **Owner-scoped RLS** on `user_id = auth.uid()` (profiles on `id`). Every table
  has RLS enabled — a client using the anon key + a signed-in user's JWT only
  ever sees that user's rows. This is what makes the backend safe to share
  across both apps with no app-specific policies.
- **`profiles.product_access`** (`text[]`) is the per-product gate: `{payments}`,
  `{capital}`, or both. The portal UI unlocks areas from this. Each app should
  upsert its own tag on first use.
- **Service role** (RLS-bypass) is for trusted server jobs only (repayment
  postings, underwriting status) — never ship it to a browser bundle.

## Regenerating types

`src/app/lib/database.types.ts` was hand-authored to match this SQL. Once you
have live access, regenerate with the Supabase MCP `generate_typescript_types`
and replace that file for a fully-synced definition.
