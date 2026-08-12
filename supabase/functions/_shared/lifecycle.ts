/**
 * Lifecycle emails — Tier 1 + Tier 2 + growth (cross-sell / referral).
 *
 * Every job here is idempotent (one-shot flags or counters on the row it
 * acts on) and quiet-hours aware for merchant-facing sends (8am–9pm ET,
 * weekdays — same convention as plaid_notify.withinSendWindow). Internal
 * alerts are exempt.
 *
 * Jobs (registered in server/index.tsx, scheduled in
 * migrations/20260811_10_lifecycle.sql):
 *   mpa-stall-reminders  hourly  — DP-4/5/6: saved-application nudges
 *   deal-status-notify   15 min  — DP-8/10: approved / declined
 *   sla-watch            15 min  — P-INT: New lead untouched > 1 business hour
 *   stale-lead-digest    daily   — P-INT: leads sitting in "New" > 2 days
 *   capital-renewal-sweep daily  — DC-15: renewal-eligible advances
 *   growth-sweep         weekly  — DP-14 cross-sell, DP-15 referral, DC-16
 *
 * From-addresses (env-overridable):
 *   LIFECYCLE_FROM_SYSTEM   "DeltPay <noreply@deltpay.com>"     — system mail
 *   LIFECYCLE_FROM_SALES    "David Hazday <david@deltpay.com>"  — human touch
 *   LIFECYCLE_FROM_CAPITAL  "David Hazday <david@deltcapital.com>"
 *   LIFECYCLE_REPLY_TO      "david@deltpay.com"
 */

import { svc } from "./plaid.ts";
import { notifyStaff, withinSendWindow } from "./plaid_notify.ts";
import { isSuppressed, logEmailEvent } from "./suppression.ts";

const FROM_SYSTEM = () => Deno.env.get("LIFECYCLE_FROM_SYSTEM") || "DeltPay <noreply@deltpay.com>";
const FROM_SALES = () => Deno.env.get("LIFECYCLE_FROM_SALES") || "David Hazday <david@deltpay.com>";
const FROM_CAPITAL = () => Deno.env.get("LIFECYCLE_FROM_CAPITAL") || "David Hazday <david@deltcapital.com>";
const REPLY_TO = () => Deno.env.get("LIFECYCLE_REPLY_TO") || "david@deltpay.com";
const SITE_URL = () => (Deno.env.get("SITE_URL") || "https://www.deltpay.com").replace(/\/$/, "");
const CAPITAL_URL = () => Deno.env.get("CAPITAL_URL") || "https://www.deltcapital.com";
const PHONE = () => Deno.env.get("LIFECYCLE_PHONE") || "";

// Referral offer (the "juicy" program — see docs/referral-program.md):
// $250 when a referred processing merchant activates; 1% of first funded
// amount (up to $1,000) for Capital referrals.
const REFERRAL_REWARD_PAY = "$250";
const REFERRAL_REWARD_CAPITAL = "1% of their first advance (up to $1,000)";

export async function sendLifecycle(opts: {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("[lifecycle] RESEND_API_KEY not set — skipping:", opts.subject);
    return false;
  }
  // Deliverability gate: never auto-email a bounced/complained address.
  if (await isSuppressed(opts.to)) {
    console.warn("[lifecycle] suppressed recipient — skipping:", opts.to, opts.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: opts.from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo || REPLY_TO(),
      }),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("[lifecycle] send failed:", res.status, detail);
      await logEmailEvent({ recipient: opts.to, event: "send_error", reason: `resend ${res.status}: ${detail}`, subject: opts.subject });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lifecycle] send threw:", err);
    await logEmailEvent({ recipient: opts.to, event: "send_error", reason: String((err as Error)?.message || err), subject: opts.subject });
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// Template shell — Delt navy on white, same family as plaid_notify
// ══════════════════════════════════════════════════════════════

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell(inner: string, brand: "pay" | "capital" = "pay"): string {
  const name = brand === "capital" ? "Delt Capital" : "DeltPay";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#041E42;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em;">${name}</span>
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #e8ecf5;">
          <p style="margin:0;font-size:11px;line-height:1.5;color:#8a93a8;">
            Questions? Just reply to this email — it lands in a real inbox, not a ticket queue.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a2333;">${s}</p>`;
const h1 = (s: string) => `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#041E42;">${s}</h1>`;
const btn = (href: string, label: string) =>
  `<p style="margin:6px 0 18px;"><a href="${esc(href)}" style="display:inline-block;padding:13px 26px;background:#041E42;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">${esc(label)} &rarr;</a></p>`;
const signPay = () =>
  `<p style="margin:20px 0 0;font-size:14px;color:#041E42;">— David Hazday<br/><span style="color:#8a93a8;">Founder, Delt</span></p>`;
const signCapital = () =>
  `<p style="margin:20px 0 0;font-size:14px;color:#041E42;">— David Hazday<br/><span style="color:#8a93a8;">Director, Delt Capital</span></p>`;

function firstNameOf(contact?: string | null): string {
  const n = String(contact || "").trim().split(/\s+/)[0] || "";
  return n;
}
const hi = (first: string) => (first ? `Hi ${esc(first)},` : "Hi,");

// ══════════════════════════════════════════════════════════════
// DP-2 / DP-7 — exported for mpa-application to call directly
// ══════════════════════════════════════════════════════════════

export function dp2ApplicationLink(opts: { firstName?: string | null; businessName: string; url: string }) {
  const subject = "Your DeltPay application link (10 minutes, saves as you go)";
  const html = shell(
    h1("Your secure application link") +
      p(hi(firstNameOf(opts.firstName))) +
      p(`Here's your secure application link for <strong>${esc(opts.businessName)}</strong>:`) +
      btn(opts.url, "Start my application") +
      p(`What to expect:<br/>&bull; <strong>~10 minutes.</strong> Business details, ownership, bank connection, sign.<br/>&bull; <strong>Saves as you go.</strong> Close the tab, come back later — nothing is lost.<br/>&bull; <strong>Bank connection is handled by Plaid</strong> (used by Venmo and American Express). Your credentials never touch our servers.`) +
      p(`Once you sign, we submit the same day. Most clean applications are approved within 24–72 hours; some same-day.`) +
      p(`Stuck on anything? Reply here — a real person answers.`) +
      signPay(),
  );
  return { subject, html };
}

export function dp7Submitted(opts: { firstName?: string | null; businessName: string }) {
  const subject = `${opts.businessName} is in underwriting — timeline inside`;
  const html = shell(
    h1("Signed, sealed, submitted") +
      p(hi(firstNameOf(opts.firstName))) +
      p(`Your signed application went to the processing bank today. What happens now:`) +
      p(`&bull; <strong>Underwriting review:</strong> typically 24–72 hours. Clean, low-risk businesses sometimes clear same-day.<br/>&bull; <strong>Possible follow-up:</strong> if the bank wants an extra document (a voided check, a license), we'll ask you directly — that's normal, not a bad sign.<br/>&bull; <strong>Decision:</strong> you'll hear from us the moment we hear from them.`) +
      p(`No action needed from you. Reply anytime with questions.`) +
      signPay(),
  );
  return { subject, html };
}

// ══════════════════════════════════════════════════════════════
// Job: mpa-stall-reminders (hourly) — DP-4 (24h) / DP-5 (72h) / DP-6 (final)
// ══════════════════════════════════════════════════════════════

export async function mpaStallReminders() {
  if (!withinSendWindow()) return { skipped: "quiet-hours" };
  const db = svc();
  const { data: rows, error } = await db
    .from("merchant_applications")
    .select("id, applicant_email, link_url, link_sent_at, token_expires_at, reminder_count, deal_submissions(merchant_name, contact_name)")
    .eq("status", "draft")
    .not("link_url", "is", null)
    .not("applicant_email", "is", null);
  if (error) return { error: error.message };

  const out = { checked: 0, sent: 0, errors: 0 };
  const now = Date.now();
  for (const r of rows ?? []) {
    out.checked++;
    const to = String(r.applicant_email || "").trim();
    if (!to || !r.link_url) continue;
    const expMs = r.token_expires_at ? new Date(r.token_expires_at).getTime() : 0;
    if (expMs && expMs < now) continue; // expired — nothing to chase
    const sentAt = r.link_sent_at ? new Date(r.link_sent_at).getTime() : 0;
    if (!sentAt) continue;
    const ageH = (now - sentAt) / 3600000;
    const count = r.reminder_count ?? 0;
    const expSoon = expMs > 0 && expMs - now <= 36 * 3600000;
    let due: 1 | 2 | 3 | null = null;
    if (count === 0 && ageH >= 24) due = 1;
    else if (count === 1 && ageH >= 72) due = 2;
    else if (count === 2 && expSoon) due = 3;
    if (!due) continue;

    const sub = (r as any).deal_submissions;
    const businessName = sub?.merchant_name || "your business";
    const first = firstNameOf(sub?.contact_name);
    let subject: string, body: string;
    if (due === 1) {
      subject = "Your application is waiting right where you left it";
      body =
        h1("Saved exactly where you left off") +
        p(hi(first)) +
        p(`You started your DeltPay application for <strong>${esc(businessName)}</strong> — it's saved exactly where you left off.`) +
        btn(r.link_url, "Pick up where I left off") +
        p(`Nothing re-entered, nothing lost. Most people finish in under 10 minutes from where you are.`) +
        p(`If something in the application stopped you — a question you weren't sure about, a document you don't have — just reply and tell me which step. I can usually unblock you in one email.`);
    } else if (due === 2) {
      subject = "Should I hold your spot?";
      body =
        h1("Your saved application expires soon") +
        p(hi(first)) +
        p(`Your application for <strong>${esc(businessName)}</strong> is still saved, but the secure link expires in a few days.`) +
        btn(r.link_url, "Finish my application") +
        p(`If the timing's wrong, no problem — reply "later" and I'll check back next month instead of nagging you. If something about the offer didn't sit right, reply and tell me that too. Straight answers both ways.`);
    } else {
      subject = "Your secure link expires tomorrow";
      body =
        h1("Last call on your saved application") +
        p(hi(first)) +
        p(`Quick heads-up — your saved application link for <strong>${esc(businessName)}</strong> expires tomorrow. After that, a new application starts from scratch.`) +
        btn(r.link_url, "Finish it now") +
        p(`That's the last automated note from me. If now's not the time, all good — we'll be here when it is.`);
    }
    const ok = await sendLifecycle({ to, from: FROM_SYSTEM(), subject, html: shell(body + signPay()) });
    if (!ok) { out.errors++; continue; }
    out.sent++;
    await db
      .from("merchant_applications")
      .update({ reminder_count: due, last_reminder_at: new Date().toISOString() })
      .eq("id", r.id);
  }
  return out;
}

// ══════════════════════════════════════════════════════════════
// Job: deal-status-notify (15 min) — DP-8 approved / DP-10 declined
// ══════════════════════════════════════════════════════════════

export async function dealStatusNotify() {
  if (!withinSendWindow()) return { skipped: "quiet-hours" };
  const db = svc();
  const { data: rows, error } = await db
    .from("deal_submissions")
    .select("id, merchant_name, contact_name, email, status, status_notified")
    .in("status", ["Approved", "Declined"])
    .not("email", "is", null);
  if (error) return { error: error.message };

  const out = { checked: 0, sent: 0, errors: 0 };
  for (const r of rows ?? []) {
    out.checked++;
    if (r.status_notified === r.status) continue;
    const to = String(r.email || "").trim();
    if (!to) continue;
    const first = firstNameOf(r.contact_name);
    const business = r.merchant_name || "your business";
    let subject: string, body: string;
    if (r.status === "Approved") {
      subject = `Approved — welcome to Delt${first ? ", " + first : ""}`;
      body =
        h1(`${esc(business)} is approved`) +
        p(hi(first)) +
        p(`Great news — <strong>${esc(business)} is approved.</strong> Next (and last) steps:`) +
        p(`1. <strong>Setup call (15 min):</strong> we configure your terminal/gateway and test a transaction together — reply with a good time and number.<br/>2. <strong>Hardware:</strong> if your setup includes a terminal, it ships after the setup call.<br/>3. <strong>First settlement:</strong> you'll see funds move on your normal schedule — we'll confirm your first batch together.`) +
        p(`One ask: keep your first processing statement from your old provider. In 30 days we'll put it next to your Delt statement and show you the difference in real dollars.`) +
        p(`Welcome aboard.`);
    } else {
      subject = "About your application — and a different path";
      body =
        h1("Straight answer") +
        p(hi(first)) +
        p(`The processing bank declined <strong>${esc(business)}</strong>'s application. That's their call, not ours, and it's usually about their internal risk categories — not about whether your business is good.`) +
        p(`Two real options:<br/>1. <strong>A different channel.</strong> We work with multiple processing banks with different appetites. Reply "retry" and I'll tell you honestly whether another one fits.<br/>2. <strong>Revisit in 90 days.</strong> Some declines are timing (new business, thin history). We'll flag your file and reach back out.`) +
        p(`If you were also looking at working capital, that review is done in-house by us — a processing decline doesn't affect it. Worth a look: <a href="${esc(CAPITAL_URL())}" style="color:#4945FF;">${esc(CAPITAL_URL())}</a>`) +
        p(`Either way, thanks for giving us the shot.`);
    }
    const ok = await sendLifecycle({ to, from: FROM_SALES(), subject, html: shell(body + signPay()) });
    if (!ok) { out.errors++; continue; }
    out.sent++;
    await db
      .from("deal_submissions")
      .update({ status_notified: r.status, status_notified_at: new Date().toISOString() })
      .eq("id", r.id);
  }
  return out;
}

// ══════════════════════════════════════════════════════════════
// Job: sla-watch (15 min) — internal ping for untouched New leads > 1h
// ══════════════════════════════════════════════════════════════

export async function slaWatch() {
  // Internal, but stay inside the business window so 3am signups alert at 8am.
  if (!withinSendWindow()) return { skipped: "quiet-hours" };
  const db = svc();
  const cutoff = new Date(Date.now() - 3600000).toISOString();
  const { data: rows, error } = await db
    .from("pipeline_leads")
    .select("id, business_name, contact_name, contact_email, contact_phone, source, amount_requested, created_at")
    .eq("stage", "New")
    .is("sla_alerted_at", null)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) return { error: error.message };
  if (!rows || rows.length === 0) return { checked: 0, sent: 0 };

  const items = rows
    .map((r) => {
      const age = Math.round((Date.now() - new Date(r.created_at).getTime()) / 3600000);
      return `<li style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong>${esc(r.business_name)}</strong> — ${esc(r.contact_name || "no contact name")} &middot; ${esc(r.contact_email || "no email")} &middot; ${esc(r.contact_phone || "no phone")}<br/><span style="color:#8a93a8;">source: ${esc(r.source || "unknown")} &middot; requested: ${esc(r.amount_requested || "—")} &middot; waiting ${age}h</span></li>`;
    })
    .join("");
  const html = shell(
    h1(`SLA: ${rows.length} lead${rows.length === 1 ? "" : "s"} untouched &gt; 1 business hour`) +
      p(`These are still in <strong>New</strong> with no activity. Speed-to-lead is the whole game — a 5-minute callback multiplies contact rates.`) +
      `<ul style="margin:0 0 14px;padding-left:18px;">${items}</ul>` +
      p(`Open the CRM &rarr; Leads board to work the list.`),
  );
  const ok = await notifyStaff(`⏱ ${rows.length} lead${rows.length === 1 ? "" : "s"} past the 1-hour SLA`, html);
  if (!ok) return { checked: rows.length, sent: 0, errors: 1 };
  const now = new Date().toISOString();
  await db.from("pipeline_leads").update({ sla_alerted_at: now }).in("id", rows.map((r) => r.id));
  return { checked: rows.length, sent: 1 };
}

// ══════════════════════════════════════════════════════════════
// Job: stale-lead-digest (daily, weekdays) — leads in New > 2 days
// ══════════════════════════════════════════════════════════════

export async function staleLeadDigest() {
  const db = svc();
  const cutoff = new Date(Date.now() - 48 * 3600000).toISOString();
  const { data: rows, error } = await db
    .from("pipeline_leads")
    .select("id, business_name, contact_name, contact_email, contact_phone, source, amount_requested, created_at")
    .eq("stage", "New")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return { error: error.message };
  if (!rows || rows.length === 0) return { stale: 0, sent: 0 };

  const items = rows
    .map((r) => {
      const days = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
      return `<li style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong>${esc(r.business_name)}</strong> — ${esc(r.contact_email || r.contact_phone || "no contact")} <span style="color:#8a93a8;">(${days}d in New &middot; ${esc(r.source || "unknown")})</span></li>`;
    })
    .join("");
  const html = shell(
    h1(`${rows.length} lead${rows.length === 1 ? "" : "s"} sitting in "New" &gt; 2 days`) +
      p(`Oldest first. Work top-down, or move dead files to Not Qualified so this list stays honest.`) +
      `<ul style="margin:0 0 14px;padding-left:18px;">${items}</ul>`,
  );
  const ok = await notifyStaff(`📋 Stale-lead digest: ${rows.length} in "New" > 2 days`, html);
  return { stale: rows.length, sent: ok ? 1 : 0 };
}

// ══════════════════════════════════════════════════════════════
// Job: capital-renewal-sweep (daily, weekdays) — DC-15
// ══════════════════════════════════════════════════════════════

function fmtMoney(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

export async function capitalRenewalSweep() {
  const db = svc();
  const { data: rows, error } = await db
    .from("capital_deals")
    .select("id, merchant, contact_email, funded_amt, total_owed, collected, status, ach_status, renewal_eligible, renewal_notified_at")
    .eq("status", "active")
    .is("renewal_notified_at", null);
  if (error) return { error: error.message };

  const out = { checked: 0, merchant_emails: 0, internal_flagged: 0, errors: 0 };
  const internal: string[] = [];
  for (const r of rows ?? []) {
    out.checked++;
    const paidPct = r.total_owed > 0 ? r.collected / r.total_owed : 0;
    const eligible = r.renewal_eligible === true || paidPct >= 0.6;
    if (!eligible) continue;
    if (r.ach_status !== "current") continue;

    const renewalEstimate = Math.max(r.funded_amt, Math.round((r.funded_amt * 1.25) / 5000) * 5000);
    const to = String(r.contact_email || "").trim();
    if (to && withinSendWindow()) {
      const body =
        h1(`${esc(r.merchant)} is renewal-eligible`) +
        p("Hi,") +
        p(`Your payment history on the current advance unlocked a renewal:`) +
        p(`&bull; <strong>Up to ~${fmtMoney(renewalEstimate)}</strong> — pre-qualified estimate, subject to underwriting review<br/>&bull; <strong>Cleaner terms than round one</strong> — clean history earns better pricing<br/>&bull; <strong>Remaining balance handled</strong> in the new agreement — one payment stream, not two`) +
        p(`You're ${Math.round(paidPct * 100)}% paid down. Reply "numbers" and I'll bring the real figures — takes one business day, no credit pull to look.`) +
        signCapital();
      const ok = await sendLifecycle({
        to,
        from: FROM_CAPITAL(),
        subject: `${r.merchant} is renewal-eligible: up to ~${fmtMoney(renewalEstimate)}`,
        html: shell(body, "capital"),
      });
      if (!ok) { out.errors++; continue; }
      out.merchant_emails++;
      await db.from("capital_deals").update({ renewal_notified_at: new Date().toISOString() }).eq("id", r.id);
    } else if (!to) {
      internal.push(
        `<li style="margin:0 0 8px;font-size:14px;"><strong>${esc(r.merchant)}</strong> — ${Math.round(paidPct * 100)}% paid &middot; funded ${fmtMoney(r.funded_amt)} &middot; est. renewal up to ~${fmtMoney(renewalEstimate)} <span style="color:#8a93a8;">(no contact email on file — reach out personally)</span></li>`,
      );
      out.internal_flagged++;
      await db.from("capital_deals").update({ renewal_notified_at: new Date().toISOString() }).eq("id", r.id);
    }
  }
  if (internal.length > 0) {
    await notifyStaff(
      `💰 ${internal.length} renewal-eligible advance${internal.length === 1 ? "" : "s"} (no email on file)`,
      shell(h1("Renewal-eligible — personal touch needed") + `<ul style="margin:0 0 14px;padding-left:18px;">${internal.join("")}</ul>` + p(`Add contact emails to capital_deals and future sweeps go out automatically.`)),
    );
  }
  return out;
}

// ══════════════════════════════════════════════════════════════
// Job: email-health-digest (weekday mornings) — the "nothing breaks
// silently" report: bounces, complaints, failures, send errors, and
// new suppressions since the last business day. Silent when clean.
// ══════════════════════════════════════════════════════════════

export async function emailHealthDigest() {
  const db = svc();
  // Monday looks back over the weekend; other weekdays cover ~1 day.
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(new Date());
  const hours = weekday === "Mon" ? 74 : 26;
  const cutoff = new Date(Date.now() - hours * 3600000).toISOString();

  const { data: events, error } = await db
    .from("email_events")
    .select("recipient, event, reason, subject, created_at")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return { error: error.message };
  const { data: sups } = await db
    .from("email_suppressions")
    .select("email, reason, created_at")
    .gte("created_at", cutoff);

  if ((events?.length ?? 0) === 0 && (sups?.length ?? 0) === 0) return { clean: true, sent: 0 };

  const counts: Record<string, number> = {};
  for (const e of events ?? []) counts[e.event] = (counts[e.event] || 0) + 1;
  const summary = Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(" · ") || "0 events";

  const rows = (events ?? [])
    .map((e) => `<li style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong>${esc(e.event)}</strong> — ${esc(e.recipient)}<br/><span style="color:#8a93a8;">${esc(e.subject || "(no subject)")} &middot; ${esc(e.reason || "no detail")} &middot; ${esc(String(e.created_at).slice(0, 16).replace("T", " "))} UTC</span></li>`)
    .join("");
  const supRows = (sups ?? [])
    .map((s) => `<li style="margin:0 0 8px;font-size:14px;"><strong>${esc(s.email)}</strong> <span style="color:#8a93a8;">(${esc(s.reason)}) — future automated emails to this address are blocked</span></li>`)
    .join("");

  const html = shell(
    h1("Email health — issues since last check") +
      p(`<strong>${esc(summary)}</strong>`) +
      (rows ? p("<strong>Delivery events:</strong>") + `<ul style="margin:0 0 14px;padding-left:18px;">${rows}</ul>` : "") +
      (supRows ? p("<strong>Newly suppressed addresses:</strong>") + `<ul style="margin:0 0 14px;padding-left:18px;">${supRows}</ul>` : "") +
      p(`Suppressed addresses are skipped by all automated sequences. To un-suppress one (e.g. a fixed typo), delete its row in email_suppressions.`),
  );
  const ok = await notifyStaff(`📮 Email health: ${summary}`, html);
  return { events: events?.length ?? 0, suppressions: sups?.length ?? 0, sent: ok ? 1 : 0 };
}

// ══════════════════════════════════════════════════════════════
// Job: growth-sweep (weekly) — DP-14 cross-sell + DP-15 referral
// ══════════════════════════════════════════════════════════════

export async function growthSweep() {
  if (!withinSendWindow()) return { skipped: "quiet-hours" };
  const db = svc();
  const out = { crosssell_sent: 0, referral_sent: 0, errors: 0 };
  const now = Date.now();

  // DP-14 — processing merchants, activated 30+ days, pitch Capital.
  {
    const { data: rows } = await db
      .from("deal_submissions")
      .select("id, merchant_name, contact_name, email, activated_at, crosssell_notified_at")
      .in("status", ["Activated", "Paid"])
      .is("crosssell_notified_at", null)
      .not("email", "is", null)
      .not("activated_at", "is", null)
      .limit(25);
    for (const r of rows ?? []) {
      if (now - new Date(r.activated_at).getTime() < 30 * 86400000) continue;
      const to = String(r.email || "").trim();
      if (!to) continue;
      const first = firstNameOf(r.contact_name);
      const business = r.merchant_name || "your business";
      const body =
        h1(`${esc(business)} likely pre-qualifies for working capital`) +
        p(hi(first)) +
        p(`Because we see <strong>${esc(business)}</strong>'s real processing volume, we can pre-qualify you for working capital without a credit pull.`) +
        p(`How it's different from the MCA calls you probably get:<br/>&bull; <strong>Your rate is based on your actual deposits</strong> we already see — not a broker's guess.<br/>&bull; <strong>Repayment flexes with your revenue.</strong> Slow week, smaller payment.<br/>&bull; <strong>No credit pull until you accept terms.</strong> Look at the number for free.`) +
        btn(CAPITAL_URL(), "See my exact range in 2 minutes") +
        `<p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:#8a93a8;">Pre-qualification is not a guarantee of funding. Final terms depend on underwriting review.</p>` +
        signPay();
      const ok = await sendLifecycle({ to, from: FROM_SALES(), subject: `${business} pre-qualifies for working capital`, html: shell(body) });
      if (!ok) { out.errors++; continue; }
      out.crosssell_sent++;
      await db.from("deal_submissions").update({ crosssell_notified_at: new Date().toISOString() }).eq("id", r.id);
    }
  }

  // DP-15 — referral invite, activated 45+ days.
  {
    const { data: rows } = await db
      .from("deal_submissions")
      .select("id, merchant_name, contact_name, email, activated_at, referral_invited_at")
      .in("status", ["Activated", "Paid"])
      .is("referral_invited_at", null)
      .not("email", "is", null)
      .not("activated_at", "is", null)
      .limit(25);
    for (const r of rows ?? []) {
      if (now - new Date(r.activated_at).getTime() < 45 * 86400000) continue;
      const to = String(r.email || "").trim();
      if (!to) continue;
      const first = firstNameOf(r.contact_name);
      const body =
        h1("Know an owner who'd want your rate?") +
        p(hi(first)) +
        p(`Short one. If you know another owner paying too much for processing, send them my way:`) +
        p(`&bull; <strong>They get</strong> the same treatment you got — free statement audit, custom rate, no contract games.<br/>&bull; <strong>You get ${REFERRAL_REWARD_PAY}</strong> when they activate — and if they take working capital instead, you get ${REFERRAL_REWARD_CAPITAL}.`) +
        p(`Just reply with their name and number, or forward this email. We take it from there and never cold-blast anyone you send.`) +
        signPay();
      const ok = await sendLifecycle({ to, from: FROM_SALES(), subject: "Know an owner who'd want your rate?", html: shell(body) });
      if (!ok) { out.errors++; continue; }
      out.referral_sent++;
      await db.from("deal_submissions").update({ referral_invited_at: new Date().toISOString() }).eq("id", r.id);
    }
  }

  return out;
}
