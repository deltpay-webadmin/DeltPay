# Deal Room rollout — deploy & verification runbook

The Deal Room (`/dashboard/deal-room/:submissionId`) drives a prospect from
verbal yes to fully signed without leaving the CRM: Plaid link → DLT-APP
funding application (owner + rep sign) → underwriting → MCA agreement
(in-person iPad or email, bank-on-file Exhibit B) → Delt countersignature →
processor MPA (incl. Paysafe site survey + rep signature) → documents →
funding gate. This runbook is the one-time setup and the end-to-end test.

## 1. Migrations

```sh
supabase db push
```

Applies, in order:
- `20260819_01_contracts_link_fixes.sql` — contracts.deal_id FK dropped
  (loose ref), contracts.lead_id added.
- `20260819_02_deal_spine.sql` — deal_submissions.lead_id,
  underwriting_apps.submission_id/lead_id/contact fields + name backfill.
- `20260819_03_esign_engine.sql` — contracts.mode/countersigned_at,
  signed-doc doc_kinds, org_esign_settings, `contracts.countersign` perm.
- `20260819_04_funding_gate.sql` — capital_deals 'approved' status +
  approved_at/funded_at, `approve_underwriting` / `packet_status` /
  `mark_funded` RPCs.

## 2. Function secrets & deploy

All `DOCUSIGN_*` secrets are documented in `.env.example`. New requirement:
**a Delt countersigner must exist** — set it in the CRM (Settings → General
→ "E-Sign — Delt countersigner") or via the
`DOCUSIGN_COUNTERSIGNER_NAME/EMAIL` secrets. MCA sends fail closed without
one.

```sh
supabase functions deploy docusign docusign-connect mpa-application
```

## 3. First-envelope tuning (DocuSign demo)

Send one of each in the demo environment and eyeball tab placement:
1. **DLT-APP** (`send-application`) — owner + rep anchors
   (`/own1_sig/`, `/rep_sig/`).
2. **MCA** (`send`) — merchant/guarantor/purchaser anchors + Exhibit B bank
   tabs. Confirm the purchaser recipient shows as "waiting" (routing 2) and
   receives **no email** (embedded).
3. **Luqra + Paysafe MPA** (`send-mpa`) — the existing SIG1/DATE1 stops plus
   the new rep stops (`/mpa_sig2/` on Luqra's agent line and Paysafe's
   Section V survey line). Nudge `dx/dy` in
   `supabase/functions/_shared/mpa/anchors.ts` as needed — the offsets have
   never had a live visual pass.

## 4. End-to-end test (Plaid sandbox + DocuSign demo)

1. Quick lead → lead detail → **Deal Room** (creates the linked submission).
2. Send the Plaid connect link; complete with `user_good` / `pass_good` —
   the "Bank connected" chip flips.
3. Funding application → **Sign in person** → owner signs on the device,
   then **You sign (rep)** — signed PDF auto-files into Documents.
4. Create the underwriting file (pre-linked), score it, **Approve & Fund**
   → deal is born `Awaiting Funding` (NOT active) and the decision memo
   lands in Documents.
5. MCA → **Sign in person** — Schedule A prefilled from underwriting,
   Exhibit B prefilled from the application's bank on file (verify the
   envelope shows the account, not blank tabs). Merchant + guarantor sign.
6. **Countersign MCA now** (admin) — `countersigned_at` stamps; the signed
   MCA files into Documents (kind `signed_mca`).
7. MPA → pricing template → Paysafe: complete the **site survey** card →
   **Generate & sign now** → merchant signs, then **Sign as rep**.
8. Upload photo ID + voided check.
9. Deal card → **Mark funded** — succeeds only now; before step 8 it
   returns the exact missing items in the error.
10. Repeat one document in email mode and exercise **Resend** and
    **Void**.

## Notes / deferred

- Multi-owner / multi-guarantor MPA routing is still v1 single-signer
  (deferred by design).
- Jotform inbound webhook, UCC-1 filing workflow, and wire/disbursement
  tracking beyond approved/funded are out of scope of this build.
- Legacy envelopes (sent before this rollout) have an email-routed
  countersigner: "Countersign now" re-sends their DocuSign email instead
  of opening an embedded session.
- Deals approved outside the Deal Room (no linked submission) cannot pass
  `mark_funded` — start deals from a lead's Deal Room so the packet can be
  verified.
