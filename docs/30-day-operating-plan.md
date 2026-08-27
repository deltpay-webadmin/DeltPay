# Delt — 30-Day Operating Plan (Aug 31 – Sep 25, 2026)

Companion to `docs/state-of-the-union.md`. Premise: the machine is built; it
has never been fed. This plan runs it for four weeks with pre-agreed
go/no-go gates, so "inspire or abandon" becomes a measured decision instead
of a mood.

**Scope decisions this plan encodes:**
- **Channels: both, routed by fit** — Square/OrderOut, Luqra/Evolve, and
  Paysafe/Citizens, chosen per merchant by the routing table below.
- **Lead sources: inbound website forms + Meta ads.** (The 1099 agent
  program stays parked until the funnel is proven by hand.)
- **No new product code this month.** Verification and operations only.
  Code gaps found in the state-of-the-union are listed at the end as the
  *next* sprint, contingent on the day-30 decision.

---

## 1. Channel routing table (both, by fit)

One rule set, applied in the Deal Room's channel selector. Economics from
`src/backend/components/backend/processorSchedules.ts`; signing mechanics
from `docs/sop-deal-flow.md` Stage 3.

| Merchant profile | Channel | Why |
|---|---|---|
| Capital (MCA) deal attached — the flagship flow | **Luqra** (low/medium risk) | 90% residual share on the top tiers, full e-sign path, one-sitting MCA + MPA. The repayment-through-processing model needs a channel we control end-to-end. |
| High-risk vertical (CBD, vape, nutra, etc.) or Luqra declines | **Paysafe** (85% share; PCS variant for petroleum) | Citizens sponsorship, high-risk appetite, unlimited-guaranty paper ready. |
| Simple low-volume retail/food, wants turnkey POS, no capital attached | **Square via OrderOut** | Zero paperwork burden (copy-packet + mark-boarded), Square hardware sells itself. **70/30 net split, Schedule A still pending — board sparingly until it lands.** |
| Petroleum / fuel | **Paysafe PCS** | Dedicated schedule exists (`paysafe-pcs`). |

Tie-breakers: capital attached → never Square (no e-sign path there — the
DocuSign function hard-blocks it). Merchant needs same-day boarding and
fits Square's published pricing → Square. Everything else → Luqra first.

## 2. The weekly operating loop (all four weeks)

- **Daily driver:** `LeadWorkspacePage` (dashboard → Leads → workspace).
  Every inbound lead gets a call within **1 business hour** — the
  `sla-watch` cron (every 15 min) emails when you miss; the goal is that it
  never fires.
- **Every call** runs `docs/sales/mca-qualification-call.md` (EN/ES). The
  phone gates mirror the model's knockouts — kill fast, mark **Not
  Qualified** immediately so `stale-lead-digest` stays honest.
- **Every qualified merchant** goes down the SOP: Plaid link on the same
  call → model → one DocuSign sitting → board via the routing table → fund.
- **Friday, 30 minutes:** write the week's numbers into the scoreboard
  (§4). No dashboard-building — a note in the repo or a text file is fine.

## 3. Week by week

### Week 1 (Aug 31 – Sep 4) — verify the pipes, chase the paper

The single theme: prove leads cannot silently vanish, then open the taps.

1. **Smoke-test every inbound form** on the live site: Get-a-Quote,
   contact, audit, calculator, rate-check, newsletter, hardware. For each,
   confirm (a) the notification email arrives and (b) the lead appears in
   the CRM (`crm_leads` via the deltcapital `submit-lead` function, and
   `pipeline_leads` where applicable). Record pass/fail per form. This
   directly tests the out-of-repo dependency — the highest-risk gap.
2. **Confirm the under-$50K self-serve path**: submit a test quote at low
   volume, verify the tokenized `/apply/mpa/:token` link is issued and the
   wizard completes.
3. **Verify the automations fire**: leave one test lead in New past 1
   business hour → `sla-watch` email arrives; confirm `stale-lead-digest`
   lands weekday mornings.
4. **Verify Meta lead-ads ingestion** end to end with a test lead form
   entry (connect/sync endpoints exist in `supabase/functions/server/`);
   confirm dedupe via `pipeline_leads.external_id`.
5. **Chase the Square Schedule A** (owner: Carlos/David). One email + one
   call to the OrderOut/Square contact. Ask: written Schedule A for the
   agreed 70/30 net split. Outcome logged either way — "resolved either
   way" is a day-30 gate.
6. **DocuSign demo pass** per `docs/deal-room-rollout.md` §3 if not already
   done: one DLT-APP, one MCA, one Luqra + Paysafe MPA envelope; eyeball
   anchor tabs. (Setup verification, not product work.)

**Week 1 exit criteria:** every form verified lossless (or the break
documented precisely), SLA emails confirmed firing, Meta pipe verified,
Schedule A chase initiated.

### Week 2 (Sep 7 – Sep 11) — turn on lead flow

1. **Meta campaign live** with a modest fixed budget you're comfortable
   burning entirely (suggested $50–75/day). Two creatives, both pointing at
   existing hooks: the **free statement audit** (`/audit`) and the **0%
   processing + built-in capital** pitch. Lead-ads form feeds the verified
   ingestion path from Week 1.
2. **Work every inbound same-hour** through the Lead Workspace loop (§2).
3. **Statement analyzer as the closer**: every prospect with a current
   processor gets "send me your last statement" → `analyze-statement` →
   savings comparison on the follow-up call.
4. Target: **20+ qualified conversations attempted** (dials on inbound +
   Meta leads), with call outcomes written back so the next-action engine
   stays truthful.

### Week 3 (Sep 14 – Sep 18) — first boardings

1. Run the full SOP on every qualified prospect: **qualify → Plaid on the
   call → model → one signing sitting → board via routing table**.
2. Target: **first merchant boarded** — expected via Luqra or Paysafe (the
   fully-automated path). A Square/OrderOut boarding counts only if the
   economics are acceptable without the Schedule A on file.
3. If a capital deal qualifies: run it through the Deal Room to the funding
   gate. The 48–72h call-to-wire claim gets its first real timing data.
4. Keep Meta running; adjust creative only on evidence (cost per qualified
   conversation, not cost per lead).

### Week 4 (Sep 21 – Sep 25) — measure, decide

1. Fill the scoreboard (§4) from the four weeks of Friday notes.
2. Compute the unit economics you now have real inputs for: cost per lead,
   cost per qualified conversation, hours per boarded merchant, expected
   monthly residual per boarded merchant (Schedule A grids are already in
   the CRM's composer).
3. **Decision meeting Friday Sep 25** against the gates in §5. Write the
   decision down.

## 4. Scoreboard (fill weekly, judge on day 30)

| Metric | Source | W1 | W2 | W3 | W4 | 30-day total |
|---|---|---|---|---|---|---|
| Inbound leads captured (verified in CRM) | forms + Meta | | | | | |
| SLA breaches (`sla-watch` emails) | inbox | | | | | |
| Qualified conversations (gates passed) | call write-backs | | | | | |
| Plaid links completed on-call | Deal Room | | | | | |
| MPAs sent / signed | DocuSign | | | | | |
| Merchants boarded (by channel) | Deal Room | | | | | |
| Capital deals funded | funding gate | | | | | |
| Meta spend / cost per qualified convo | Meta + calls | | | | | |

## 5. Go / no-go gates — decided now, judged Sep 25

**GO (recommit, fund the next sprint) if ALL of:**

1. Lead capture proven lossless end-to-end (or the one break found *and*
   understood), and
2. ≥ 15 qualified conversations happened, and
3. ≥ 5 MPAs sent (any channel), and
4. **≥ 1 merchant boarded**, and
5. Square Schedule A status resolved either way (received, or a dated
   written answer, or formally deprioritized in favor of Luqra/Paysafe).

**NO-GO (wind down deliberately) if, with the pipes verified and ≥ 15 real
conversations:** zero MPAs sent, or the conversations demonstrate the offer
itself doesn't convert (not that nobody was called). Low activity is not a
no-go signal — it's a signal the plan wasn't run; the gates only bind if
the reps' side of the loop actually happened.

**Wind-down path (so no-go is a plan, not a failure):** keep the Plaid +
DocuSign + Supabase infrastructure (reusable in any fintech direction),
keep the marketing site live as a lead-gen asset with forms pointed at a
simple inbox, archive the CRM, and write a one-page post-mortem. The work
is not lost either way.

**The morale point, stated plainly:** the codebase shows a team that builds
honestly ("approval is not funding", "truthful UI states") and fast. What
it has never had is 30 days of feeding. Run the month; let the scoreboard
make the call.

## 6. Next sprint (only if GO) — the code gaps, pre-scoped

In priority order, from the state-of-the-union:

1. Bring `submit-lead` + `crm_leads` into this repo (or add monitoring so a
   capture failure pages someone) — removes the silent-loss risk.
2. Build the **Jotform inbound webhook** so DLT-APP submissions land in the
   CRM without re-keying (explicitly deferred in
   `docs/deal-room-rollout.md`).
3. Fix or retire `/apply` (fake Plaid token) and `/onboarding` (no
   persistence) — redirect both into the working Get-a-Quote → self-serve
   MPA path until rebuilt.
4. Reconcile the MCA DocuSign renderer with the executed template (Exhibit
   B vs. §3.3) before the first real envelope — flagged in the SOP itself.
5. Replace the mock Integrations panel with real connection state (Plaid,
   Meta, DocuSign, Resend only).
