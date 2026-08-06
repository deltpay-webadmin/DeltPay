# MPA Boarding — Setup & Runbook

The unified merchant application (MPA) flow: staff (or a merchant via a
secure link) fill one wizard; the answers can fill **either** the Luqra
(Evolve) or Paysafe (Citizens) MPA PDF, or be copy-pasted into the Square /
OrderOut reseller portal. Signing happens through DocuSign — in person on a
tablet (embedded signing) or by email.

## One-time setup

### 1. Run the migration

`supabase/migrations/20260807_01_merchant_applications.sql` creates the
`merchant_applications` table, extends `contracts.kind` with `'mpa'`, and
creates the private `mpa-templates` storage bucket.

```sh
supabase db push
```

### 2. Set the encryption key

Owner SSNs/DOBs/license numbers and bank account numbers are encrypted
app-side (AES-256-GCM) before they touch the database. Generate a key once
and set it as a function secret. **Store a copy in the password manager —
losing it means re-collecting every application's sensitive fields.**

```sh
openssl rand -base64 32          # → the key
supabase secrets set APP_ENCRYPTION_KEY="<key>"
```

### 3. Upload the blank MPA templates

The blank processor PDFs live in `docs/mpa-templates/` in this repo:

- `luqra-mpa-v1.pdf` — Luqra application (3 pages, 295 form fields)
- `paysafe-mpa-v1.pdf` — Paysafe application, **decryption already applied**
  (the original ships AES-encrypted, which pdf-lib cannot fill; this copy
  was re-written with pypdf and all 355 form fields verified intact)

Upload them to the `mpa-templates` bucket at these exact paths
(Dashboard → Storage → mpa-templates, or the CLI):

| Bucket path            | Repo file                              |
|------------------------|----------------------------------------|
| `luqra/mpa-v1.pdf`     | `docs/mpa-templates/luqra-mpa-v1.pdf`  |
| `paysafe/mpa-v1.pdf`   | `docs/mpa-templates/paysafe-mpa-v1.pdf`|

When a processor revises its application: extract the new field names,
update `supabase/functions/_shared/mpa/{luqraMap,paysafeMap}.ts` (and the
tests), upload as `mpa-v2.pdf`, and bump `MPA_TEMPLATE_PATHS` in
`supabase/functions/_shared/mpa/generate.ts`.

### 4. Deploy the edge functions

```sh
supabase functions deploy mpa-application docusign docusign-connect
```

DocuSign secrets (`DOCUSIGN_*`) and the Connect webhook are unchanged from
the existing e-sign setup.

## Daily flow

1. **Agent Desk → expand a deal → "Start MPA application"** — fill the
   7-step wizard with the merchant next to you (SSN + EIN required; card-mix
   percentages must total 100). Or **"Send merchant link"** to let the
   merchant self-complete remotely (link expires in 14 days, dies on submit).
2. When the application shows **submitted**, pick the **channel**:
   - **Luqra / Paysafe** — fill the pricing grid, **Preview PDF** (check the
     fill warnings), then **"Generate MPA & sign now (in person)"**. Open
     the signing session on the iPad (or copy the link into Safari on it) —
     it expires in ~5 minutes; regenerate with one click. Merchant not
     present? **"Send for remote signature"** emails the envelope instead.
   - **Square** — **Open OrderOut portal**
     (reseller.orderout.co/portal/links?org=delt&iso=all) + **Copy full
     packet** (includes SSN/bank — confirm prompt; clear your clipboard
     after pasting), then **Mark boarded**.
3. The signed PDF lands automatically in the deal's Documents panel
   (`Signed MPA - <merchant>.pdf`) via the DocuSign Connect webhook.

## First-envelope tuning (DocuSign sandbox)

Signature/date tab positions are derived from each template's own form
field rectangles and stamped as white-ink anchors. Before the first real
send, run one envelope per processor in the demo environment and check the
tabs sit on the signature lines. Adjust the `dx`/`dy` offsets in
`supabase/functions/_shared/mpa/anchors.ts` if needed:

- Luqra: anchored to `disclosureSignatureDate1`, `guarantorSignatureDate1`,
  `ownerSignatureDate1`
- Paysafe: anchored to `Date`, `Date_1`, `Date_3`

## Security posture (v1)

- `merchant_applications` has **no anon RLS policies** — the public link is
  served exclusively by the `mpa-application` edge function (service role),
  which authenticates by token hash (sha256; raw token never stored) with
  uniform 404s.
- Sensitive fields are one AES-256-GCM blob; **no API response ever
  includes them** — clients render `masks` (last-4s). The two deliberate
  egress points are the filled PDF (DocuSign) and the full Square packet
  (explicit confirm, `merchants.edit` only).
- Deferred to v2: SSN-view audit log, endpoint rate limiting, multi-signer
  guaranty routing, encryption key rotation.
