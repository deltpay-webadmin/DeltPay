# DeltPay

The Delt platform in one repository: the public **deltpay.com** marketing site
and the internal **Delt CRM / back-office** for a merchant-services ISO + MCA
funding operation (Delt Pay LLC). One Vite + React SPA, Supabase backend,
Vercel hosting.

- **Start here:** [`CLAUDE.md`](./CLAUDE.md) — architecture, commands,
  conventions, and the honest map of what's real vs. demo data.
- **What's real vs. mock:** [`docs/real-vs-mock.md`](./docs/real-vs-mock.md) —
  read this before trusting (or "fixing") any CRM page.
- **Operating docs:** [`docs/sop-deal-flow.md`](./docs/sop-deal-flow.md)
  (call-to-wire SOP), [`docs/state-of-the-union.md`](./docs/state-of-the-union.md),
  [`docs/30-day-operating-plan.md`](./docs/30-day-operating-plan.md), plus
  runbooks for the Deal Room, MPA boarding, and Plaid under `docs/`.

## Running the code

```sh
npm i            # install dependencies
npm run dev      # dev server
npm run build    # production build
npx vitest run   # unit tests
npm run check:functions   # edge-function import check
```

Environment variables and their fail-closed semantics are documented in
[`.env.example`](./.env.example). Database migrations live in
`supabase/migrations/` and apply with `supabase db push`.
