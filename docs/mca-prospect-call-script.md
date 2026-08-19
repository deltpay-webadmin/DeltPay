# MCA Prospect Call — Preliminary Checklist & Script

First-contact call structure for Delt Capital advance prospects. Three jobs,
in order: (1) establish that Delt processes their card payments as part of
the program, (2) explain *why* that's a requirement and not a catch,
(3) get the Plaid connect link sent **while still on the phone**.

Companion docs: `plaid-cost-optimization.md` (link timing + email cadence),
`plaid-setup-walkthrough.md` (the Send connect link button), and the
scoring engine in `src/backend/components/backend/underwritingScore.ts`
(where the numbers below come from).

---

## 1. Pre-call checklist

Before dialing, from the lead's CRM record:

- [ ] **Source** — deltcapital.com application, Meta lead form, referral, or
      statement audit? An applicant already told us how much they want; a
      referral hasn't heard the pitch at all. Calibrate accordingly.
- [ ] **Requested amount + stated monthly revenue** (if from the application).
      Sanity-check: we advance at most **45–100% of monthly revenue**
      depending on tier. If they asked for $80K on $20K/mo revenue, plan to
      reset expectations on the call.
- [ ] **Bank already connected?** Check the lead's Plaid panel. If the vault
      already has their data (self-serve applicants), skip the Plaid ask and
      the call becomes a processing conversation + next steps.
- [ ] **Current processor** (if known from a statement audit) — you'll need
      it for the switching conversation.
- [ ] **State** — NY and VA (and other disclosure states) have mandatory
      disclosure/review periods that affect the funding timeline you can
      quote. Never promise same-week funding to a disclosure-state merchant.
- [ ] **Open the lead in the CRM** so you can click **Send connect link**
      live on the call — the email goes out instantly and connect rates fall
      off sharply after 24 hours.
- [ ] **Know your numbers** — holdback runs 10–22% and factors 1.25–1.55 by
      risk tier. Quote *ranges*, never a specific price, until underwriting
      has scored the file.

---

## 2. Call script

### 2.1 Opening (15 seconds)

> "Hi [name], this is [you] with Delt Capital — you [applied on our site /
> came to us through …] about funding for [business name]. Do you have five
> minutes? I want to explain how our program works and what I need from you
> to get you a real offer — not a teaser rate."

If bad timing: book a specific slot, and still send the Plaid link before
hanging up (see 2.5 — "so the offer's ready when we talk").

### 2.2 Discovery (2 minutes)

Keep it short — Plaid will give us the real numbers. You're qualifying
intent, not auditing.

1. "What's the money for?" *(expansion, inventory, payroll gap — signals
   urgency and whether an advance is even the right product)*
2. "Roughly what does the business do in monthly revenue, and how much of
   that comes in on cards?" *(a card-heavy business is the ideal fit for a
   holdback; a mostly-ACH/invoice business may need different structuring —
   flag for the Deal Desk, don't improvise)*
3. "Who handles your card processing today, and are you under contract?"
4. "Any open advances right now?" *(stacking matters: 3+ open positions is
   an auto-decline — better to learn it now than after underwriting)*

### 2.3 The processing requirement (the heart of the call)

State it plainly and early. It is not a gotcha to be buried.

> "Here's the one thing about our program that's different from a bank loan,
> and honestly it's the reason the whole thing works: **as part of the
> advance, Delt becomes your card processor.** Repayment isn't a fixed
> monthly bill — we keep a small percentage of each day's card sales,
> usually somewhere between 10 and 20 percent depending on the file, until
> the advance is satisfied."

Then the **why** — give all three reasons, they're each true:

> "Three reasons we do it that way, and they all work in your favor:
>
> **One — repayment breathes with your sales.** Slow Tuesday, you pay less
> that day. Big Saturday, you pay more and finish sooner. There's no fixed
> payment sitting on your calendar during a bad week. We can only do that
> if the card sales settle through us — that's what lets us take a
> percentage instead of hitting your bank account for a fixed debit.
>
> **Two — it's how you get a better price.** When we're your processor, we
> see your revenue in real time and we earn on the processing side too, so
> we don't have to make all our margin on the advance. That's priced into
> the offer. And on the processing itself, we'll run your current statement
> through our analyzer — most merchants we switch end up paying less than
> they do today, and I'll show you that comparison in writing before you
> sign anything.
>
> **Three — no separate collections relationship.** No daily ACH pulls from
> a company you've never met, no NSF fees when a debit hits on the wrong
> day. Your processor and your funder are the same people, and you can see
> both in one dashboard."

**Confirm before moving on:**

> "So to be direct: taking the advance means moving your processing to us.
> Is that something you're open to if the numbers make sense?"

- **Yes / maybe** → proceed to 2.4.
- **Hard no** → don't chase it on this call. "Understood — let me at least
  run your numbers so you know what you'd qualify for, and you can decide
  with the offer in hand." (Still send the Plaid link — a real offer is the
  best objection-handler we have.)

### 2.4 The Plaid ask

> "Next step costs you nothing and commits you to nothing. I'm going to
> email you a secure link — it's through **Plaid**, the same system apps
> like Venmo use to connect banks. You tap it on your phone, pick your
> bank, log in on **your bank's own screen** — I never see your username or
> password — and it gives us read-only access to about 90 days of business
> account history. No documents to dig up, no PDFs to email me.
>
> That's what our underwriting actually prices from — real deposits, real
> balances — instead of guessing conservatively from a stated number.
> Merchants almost always qualify for more this way than off a pasted
> bank statement."

**Send the link now, while on the phone:** lead record → Plaid panel →
**Send connect link**. The email arrives instantly.

> "Just sent it — should be in your inbox from Delt. Can you open it while
> we're on? Takes about two minutes."

- **They connect on the call:** data lands in the vault in seconds to a
  couple of minutes. Confirm you see it: "Perfect, it's coming through on
  my end. Underwriting will have a real offer for you by [timeframe]."
- **They can't do it now:** "No problem — the link is good for 7 days, but
  the sooner you connect, the sooner you have an offer. I'll call you
  [specific day/time] with the numbers." (System auto-reminds at 24h and
  72h; you'll get an email the moment they connect.)

### 2.5 Wrap-up

> "So here's the play: you connect the bank, underwriting scores the file,
> and I come back to you with a written offer — amount, factor, holdback
> percentage, all of it — plus the processing comparison against what
> you're paying today. You say yes or no with everything in front of you.
> Fair?"

Book the follow-up call **before hanging up**, with a specific time.

---

## 3. Objection quick-reference

| Objection | Response |
|---|---|
| "I don't want to switch processors." | "I get it — switching sounds painful. We handle the reprogramming and the hardware, and before you commit I'll show you a line-by-line comparison against your current statement. If we can't match or beat it, that's important for both of us to know. But I'll be straight with you: the advance does require it — that's what makes percentage-based repayment possible." |
| "I'm under contract with my processor." | "Let's actually read it — a lot of these are month-to-month with a cancellation fee that first-month savings cover. Send me the contract or a recent statement and I'll tell you exactly what leaving costs." |
| "I'm not giving you my bank login." | "You're not giving it to me — that's the point of Plaid. You log in on your bank's own page; I never see your credentials, and the access is read-only. It's the same rails Venmo and Cash App use. The alternative is emailing me PDF bank statements, which is honestly less secure and slower." |
| "Just tell me the rate." | "I could throw out a teaser, but I won't quote a number I can't stand behind. Factors run 1.25 to 1.55 and holdback 10 to 22 percent depending on the file — where *you* land depends on the bank data. Connect the account and I'll give you your actual number in writing, usually within a day." |
| "Is this a loan?" | "No — and that's a legal distinction that matters. It's a purchase of future receivables: we buy a fixed amount of your future card sales at a discount. No interest rate, no fixed term — the timeline flexes with your sales." |
| "I already have an advance." | "How many positions are open right now? [If 1–2:] We may still be able to work with that — it affects tier and pricing, and underwriting sees it either way, so tell me now. [If 3+:] I'll be honest — with three or more open positions we can't fund on top. Let's talk again when you've paid a couple down." |
| "I'll think about it." | "Totally fine — but connecting the bank isn't the decision, it's what gets you the numbers *to* decide. Free, read-only, no obligation. Think about it with a real offer in front of you instead of a maybe." |

---

## 4. Say / never say

Consistent with the honesty rules everywhere else at Delt: **we tell
merchants the truth about fees, terms, and eligibility — even when it
costs us the deal.**

**Say:**
- "Advance," "factor," "holdback," "purchase of future receivables."
- Ranges with both ends stated ("10 to 22 percent depending on the file").
- "Read-only," "your bank's own login page," "I never see your password."
- The processing requirement, stated plainly, before the Plaid ask.

**Never say:**
- ❌ "Loan," "interest rate," "APR" — it is not a loan; mislabeling it
  creates real legal exposure.
- ❌ "You're approved" / "guaranteed funding" before underwriting scores
  the file. Prequalification talk only: "based on what you've told me,
  you're worth underwriting."
- ❌ A specific factor or holdback as *their* price before scoring.
- ❌ "This won't affect anything" about credit — underwriting includes a
  credit pull; disclose it when you get to that stage.
- ❌ Same-week funding promises to merchants in disclosure states (NY, VA,
  etc.) — the statutory review period is not ours to waive.
- ❌ Any pressure to skip reading the agreement, or any invented term the
  program doesn't offer. Nonstandard structure requests go to the Deal
  Desk.

---

## 5. After-call checklist

- [ ] **Log the call** on the lead's CRM timeline: outcome, disposition,
      objections raised, and whether the processing requirement was
      accepted, open, or refused.
- [ ] **Confirm the connect link shows as sent** on the lead's Plaid panel
      (reminders at 24h/72h are automatic; the link expires day 7 and staff
      get an "expired — call them" alert).
- [ ] **Follow-up call booked** with a specific date/time in the record.
- [ ] **Statement received?** If they agreed to the processing comparison,
      chase the current statement — it's the closing tool.
- [ ] **When the bank connects** (you'll get the instant staff email):
      verify the metrics landed, then move the file to underwriting. Don't
      hit *Verify ownership* / *Fresh pull* / *Asset report* until the file
      actually advances — each one bills (see `plaid-cost-optimization.md`).
- [ ] **Dead lead?** Mark it Not Qualified / Lost so reminders stop and the
      nightly sweep retires the Plaid item instead of billing forever.
