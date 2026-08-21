# Agent Onboarding SOP (Internal)

*Internal only — do not share with candidates. Owner: David. Last updated: 2026-08-21.*

The pipeline: **Applied → Screened → Interviewed → Offer sent → Signed → Provisioned → Producing.** Nothing skips a stage. Every agent's stage lives in the CRM; the checklist below is per-agent.

## Stage 1 — Application intake (owner: David; ~daily)

1. Review new Indeed applicants. Auto-rejected (answered a required screener wrong): skim once a week for false negatives, otherwise ignore.
2. Grade the open-text answer ("how would you source your first 10 merchants"): a **concrete** answer (named network, named vertical, named territory) → advance. Vague ("I'd work hard, social media") → reject with the polite template.
3. Advance = invite to a 20-minute call within the week (David's calendar link). Log the candidate in the CRM with source = Indeed.

## Stage 2 — The 20-minute call (owner: David)

1. Run `interview-offer-script.md`. The call answers two questions: can they prospect, and can they survive 90 days without a paycheck. Everything else is noise.
2. Strong candidate → send `Delt-Agent-Compensation-Plan.docx` the same day, with a note to run the math and bring questions.
3. Second short call only if they had real questions. Decide within 48 hours — good commission reps get scooped.

## Stage 3 — Offer and signature (owner: David; runs in the CRM)

1. CRM → **Agents → Onboard Agent**: pick the agent type (**1099 is the default** — W-2 is the rare exception and never gets this packet) and leave "Send the 1099 onboarding packet for e-signature now" checked. This creates the DocuSign envelope automatically — Agreement + Schedule A (fee schedule) + Schedule B (comp plan) + **Substitute W-9** + ACH authorization, one signing session. Never send the Word file as an email attachment.
2. The W-9 fields (name, tax classification, address, TIN) and ACH fields (bank, routing, account) are **required DocuSign tabs** — the agent cannot finish signing without them, and the details stay inside the DocuSign envelope (never stored in the CRM database).
3. After the agent signs, countersign from the CRM (Documents → the agent_agreement contract → Countersign now). The executed PDF in DocuSign is the system of record; pull banking details from it into the payout system only.
4. The **W-9 is inside the packet** (Exhibit 1, substitute Form W-9 with its own certification signature) — nothing to chase separately. The rule still stands: **no completed W-9 = no payout**, ever; an executed packet satisfies it.
5. Track it in **Agents → Agent Onboarding**: every envelope shows live status (Sent → Opened → Signed → Executed), with Resend and Countersign-now buttons right there. Envelope reminders run automatically (every 2 days, expires at 14). Unsigned after a week → David calls.
6. **Test sends:** never use a made-up email (it bounces and fails the envelope) and never create fake agents in the CRM. To test, use your own real inbox and void the envelope afterward (Documents → Void).

## Stage 4 — Banking + tax data handling (owner: whoever touches payouts)

- The signed agreement contains **routing and account numbers**. This data lives **only** in the payout system / secure vault. Never in email threads, Slack, screenshots, or the CRM notes field.
- Access: David + whoever runs the 15th payment cycle. Nobody else.
- Agent changes their account → through the portal or signed written notice only; verbal/text changes are never accepted (this is the #1 payout-fraud vector). Change takes effect the next cycle.
- W-9s are stored with the executed agreements, same access rule. 1099-NEC issued each January for any agent paid ≥$600.

## Stage 5 — Provisioning (owner: Patrick; same week as signature)

Per-agent checklist, in order:

- [ ] Portal account created (agent role), agent code assigned
- [ ] Tier set to Tier 1 (50%); start date recorded (starts the Fast Start clock — the portal tracks 30/90-day windows from this date)
- [ ] @delt email created
- [ ] Business cards ordered (Account Manager title)
- [ ] Gear kit queued (ships at first activation, not at signup)
- [ ] Added to the weekly training call invite (recurring)
- [ ] Recruiting attribution: if they were recruited by an existing agent, link the recruiter in the portal **now** — retroactive override disputes are poison
- [ ] Welcome email sent: portal login, training call schedule, how to book David for a merchant call, first-deal walkthrough offer

## Stage 6 — First 90 days (owner: David + Patrick)

1. **Week 1:** first-deal walkthrough — Patrick walks them through a submission in the portal end to end before their first real one.
2. **Closer-on-call:** they book David onto live merchant calls via calendar link. David joins every one in the first 90 days that's actually booked. This promise is in the job posting — it gets honored or it gets removed from the posting.
3. **Fast Start tracking:** portal shows the 3-in-30 and 10-in-90 clocks. At day 21 with <2 activations, Patrick checks in — not to pressure, to unblock.
4. **Day 30 / 60 / 90 touchpoints:** 15 minutes each. Day 90 with zero activations → honest conversation; the agreement doesn't terminate for non-production (never make production a condition of engagement — misclassification risk), but stop investing founder time.

## Stage 7 — Ongoing operations

- **Payout run (15th):** commissions + residuals + overrides computed per merchant → statements generated in portal → ACH batch. Verify: W-9 on file for every payee; new-account activations matched to bonus bands; 90-day clawback checks on cancelled merchants.
- **Tier promotions:** portal flags 15+ / 35+ active accounts; promotion applies from the month criteria are met. Announce it — promotions are marketing to the rest of the roster.
- **Active Producer status:** perks (gym, telehealth, free platform) pause automatically when trailing-90-day activations drop below 3; portal handles it, no manual judgment calls.
- **Sponsor risk pass-throughs:** if Luqra/PCS withholds a merchant's residual (VAMP/chargeback ratios), the agent's residual on that merchant pauses too (Schedule A §A-6). Tell the agent proactively — they'll see it on the statement anyway.

## Stage 8 — Offboarding

1. Voluntary exit or 30-day termination: portal access → read-only "statement only" mode; @delt email disabled; title/marks license ends.
2. **Residuals survive** unless terminated for cause — keep paying on the 15th with statements. This is the promise the whole program stands on; breaking it once destroys recruiting forever.
3. For-cause termination (fraud, solicitation-away, confidentiality breach): document everything **before** acting; residuals stop at termination date per §8.4. Counsel review before pulling the trigger.
4. Recruits of a departed agent keep their own agreements untouched; the departed agent's override ends with their active status (§4.1).

## The rules that never bend

1. No W-9, no payout.
2. Banking details never leave the payout system.
3. Deposit-account changes only via portal or signed notice.
4. Residuals are never clawed back; the only clawback is the activation bonus at ≤90 days.
5. Production is never a condition of *engagement* — only of tiers and perks.
6. No earnings promises to candidates beyond the comp plan document.
7. Every recruiting attribution is linked before the recruit's first deal, not after.
