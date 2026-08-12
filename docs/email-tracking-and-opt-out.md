# Email tracking and opt-out

What every automated email now records, and what has to be switched on for it
to work.

Before this, the DeltPay side of the product could tell you when an email
**failed** and nothing else. Bounces, complaints and send errors landed in
`email_events`; successes vanished. There was no way to answer "did anyone
open DP-4?", no per-lead communication history, and the growth emails
(cross-sell, referral, renewal) went out with no unsubscribe — which
CAN-SPAM requires for promotional mail.

---

## 1. What gets recorded

Every automated send now writes to `email_events`:

| event               | written by            | means                                  |
| ------------------- | --------------------- | -------------------------------------- |
| `sent`              | the sender            | handed off to Resend, carries `email_id` |
| `delivered`         | resend-webhook        | accepted by the receiving server        |
| `opened`            | resend-webhook        | tracking pixel fired                    |
| `clicked`           | resend-webhook        | followed a link (`link_url` has which)  |
| `bounced`           | resend-webhook        | → suppressed if permanent               |
| `complained`        | resend-webhook        | marked as spam → suppressed             |
| `failed`            | resend-webhook        | Resend gave up                          |
| `delivery_delayed`  | resend-webhook        | retrying                                |
| `send_error`        | the sender            | never reached Resend at all             |
| `unsubscribed`      | email-unsubscribe     | opted out of marketing                  |
| `resubscribed`      | email-unsubscribe     | undid an opt-out                        |

**How opens and clicks find their campaign.** Resend doesn't echo our metadata
back on engagement events, so correlation is by `email_id`: the sender writes
the `sent` row carrying Resend's id plus the campaign code, and the webhook
looks the campaign back up by that id. Everything for one message shares one
id, which is also how the CRM timeline folds a message's events back together.

**Campaign codes** are the blueprint template codes, set at each send site:

| code      | sequence                          | kind          |
| --------- | --------------------------------- | ------------- |
| `DP-2`    | application link                  | transactional |
| `DP-4/5/6`| stall reminders (24h / 72h / final)| transactional |
| `DP-7`    | submitted to underwriting         | transactional |
| `DP-8`    | approved                          | transactional |
| `DP-10`   | declined → pivot                  | transactional |
| `DP-14`   | cross-sell → working capital      | **marketing** |
| `DP-15`   | referral invite                   | **marketing** |
| `DC-15`   | Capital renewal offer             | **marketing** |
| `PLAID-1` | bank connect link                 | transactional |
| `PLAID-2/3`| connect reminders (day 1 / day 3)| transactional |
| `PLAID-4` | bank connected confirmation       | transactional |

Adding a sequence means passing a new `campaign` to `sendLifecycle` — nothing
else. It shows up in the rollups and the CRM immediately; add a friendly name
to `CAMPAIGN_NAMES` in `EmailTimeline.tsx` when you want one.

---

## 2. Transactional vs marketing

`email_suppressions.scope` decides what a suppression blocks:

- **`all`** — hard bounce or spam complaint. Nothing is ever sent to this
  address again.
- **`marketing`** — they unsubscribed. Promotional mail stops; application
  links, reminders and decision notices keep flowing.

That split is the whole point. A blanket opt-out would mean someone who's
tired of the cross-sell pitch stops being told their application was
approved — the product would just go quiet on them.

Marketing sends additionally carry:

- an unsubscribe link in the footer, plus the postal address CAN-SPAM
  requires;
- `List-Unsubscribe` and `List-Unsubscribe-Post` headers, so Gmail and
  Outlook show their own Unsubscribe button. That button is what people press
  *instead of* "Report spam" — and a complaint suppresses the address for
  every sequence at once, so this trade is heavily in our favour.

**A marketing send with no working opt-out is blocked, not sent.** If
`UNSUBSCRIBE_SECRET` is unset, `sendLifecycle` refuses the send and logs a
`send_error` explaining why, rather than mailing something non-compliant.

---

## 3. Required setup

Nothing below is optional — without it, sends are either untracked or blocked.

### Supabase function secrets

Edge Functions → Secrets:

| secret                     | why                                                        |
| -------------------------- | ---------------------------------------------------------- |
| `UNSUBSCRIBE_SECRET`       | HMAC key for unsubscribe links. **Marketing sends are blocked until this is set.** Any long random string: `openssl rand -base64 32` |
| `LIFECYCLE_POSTAL_ADDRESS` | Physical mailing address in the marketing footer — CAN-SPAM §7704(a)(5). e.g. `Delt · 123 Main St, Suite 4, City ST 00000` |

Optional: `UNSUBSCRIBE_BASE_URL` overrides the link base (defaults to
`SITE_URL` + `/unsubscribe`).

Rotating `UNSUBSCRIBE_SECRET` invalidates the links in already-delivered
email — someone clicking an old one gets a "that link isn't valid" page with a
mailto fallback. Don't rotate it casually.

### Resend dashboard

1. **Domains → your domain → Tracking**: enable **Open tracking** and **Click
   tracking**. Without this, `email.opened` / `email.clicked` never fire and
   the funnel stays empty no matter what the code does.
2. **Webhooks → the existing endpoint**: add the events
   `email.delivered`, `email.opened`, `email.clicked`. (`email.bounced`,
   `email.complained`, `email.failed`, `email.delivery_delayed` are already
   subscribed.)

Note that click tracking rewrites links through Resend's redirector, which
costs a little domain-alignment purity in exchange for the data. Open tracking
adds a 1×1 pixel.

### Deploy

The `Deploy Plaid edge functions` workflow covers both functions on push to
`main` (or run it manually):

```
supabase functions deploy resend-webhook    --no-verify-jwt --project-ref ytemrmpnwmzqeradbeoa
supabase functions deploy email-unsubscribe --no-verify-jwt --project-ref ytemrmpnwmzqeradbeoa
supabase functions deploy make-server-940653c6              --project-ref ytemrmpnwmzqeradbeoa
```

`--no-verify-jwt` is correct for both: the webhook authenticates with a Svix
signature, the unsubscribe page with the HMAC token in its URL. Neither has a
Supabase JWT to present.

The Vercel site must also be redeployed — `vercel.json` rewrites
`/unsubscribe` to the edge function so the link in the footer sits on
`deltpay.com`.

---

## 4. Where to read it

**Per lead** — CRM → Leads → open a lead → **Emails** tab. Every message,
what happened to it, and a banner if the address is suppressed or opted out.

**Per campaign** — the `email-health-digest` job (weekday mornings) now
carries a 7-day sent → opened → clicked table. The digest stays silent on
clean weekdays; Mondays always send, so there's a standing weekly read on
which sequences work.

**Ad hoc** — `select * from email_campaign_stats;` (unique recipients per
campaign, all time).

### Reading the numbers honestly

Open rates are the least trustworthy number in email. Blocked images read as
"never opened", and Apple Mail Privacy Protection pre-fetches the pixel
whether or not a human looked — so opens are simultaneously under- and
over-counted, in proportions you can't see. Use them for relative comparison
between variants of the same sequence, never as an absolute.

**Clicks are the honest signal.** So is reply rate, which nothing here
measures — if a sequence's whole job is to start a conversation, the funnel
will understate it.

---

## 5. Operational notes

- **Un-suppressing** a typo'd address: delete its row in
  `email_suppressions`. Do this only for genuine mistakes — re-mailing a real
  complaint is how a domain's reputation dies.
- **Marketing opt-outs are not incidents.** They appear in the digest as
  information and never trigger one. An unsubscribe is a good outcome
  compared to the alternative.
- **A person emailing a lead directly is unaffected** by a marketing opt-out.
  The scope governs automated promotional sends, not one-to-one mail from a
  rep.
- **Volume ramp**: both root domains are new senders. Once automated volume
  passes roughly 150 emails/day to Gmail addresses, add the domains to
  [Google Postmaster Tools](https://postmaster.google.com) and watch the spam
  rate — Gmail's threshold is 0.3%, and the complaint rate in the digest is
  the early warning.
