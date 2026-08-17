/**
 * ────────────────────────────────────────────────────────────────
 * Plaid lead-flow emails (Resend HTTP API)
 * ────────────────────────────────────────────────────────────────
 * Closes the connect loop:
 *   • prospect gets the hosted connect link the moment staff sends it
 *   • prospect gets day-1 / day-3 reminders while the link is pending
 *   • prospect gets a confirmation when their bank connects
 *   • staff get an instant "bank connected" heads-up (and an expiry note)
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY     — required; without it every send is a silent no-op
 *   PLAID_EMAIL_FROM   — default "DeltPay <noreply@deltpay.com>"
 *   PLAID_NOTIFY_TO    — staff inbox, default "david@deltpay.com"
 *   PLAID_NOTIFY_BCC   — default "carlos@deltpay.com" (set "" to disable)
 *
 * Design rule (mirrors metering.ts): email must never break the flow it
 * announces. Every send swallows its own errors and logs loudly.
 */

const FROM = () => Deno.env.get("PLAID_EMAIL_FROM") || "DeltPay <noreply@deltpay.com>";
const NOTIFY_TO = () => Deno.env.get("PLAID_NOTIFY_TO") || "david@deltpay.com";
// No BCC by default (per operator request, Aug 2026) — set PLAID_NOTIFY_BCC
// to re-enable a copy for someone else.
const NOTIFY_BCC = () => Deno.env.get("PLAID_NOTIFY_BCC") || null;

export function emailConfigured(): boolean {
  return Boolean(Deno.env.get("RESEND_API_KEY"));
}

/** Prospect-facing sends respect the operator's quiet hours: 8am–9pm
 * Eastern, weekdays only (same convention as the deltcapital.com
 * sms-nudge). Staff notifications are exempt — send those anytime. */
export function withinSendWindow(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    weekday: "short",
    hour: "numeric",
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  if (weekday === "Sat" || weekday === "Sun") return false;
  return hour >= 8 && hour < 21;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  bcc?: string | null;
}): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("[plaid-notify] RESEND_API_KEY not set — skipping:", opts.subject);
    return false;
  }
  // Deliverability gate — skip addresses that hard-bounced or complained.
  const { isSuppressed, logEmailEvent } = await import("./suppression.ts");
  if (await isSuppressed(opts.to)) {
    console.warn("[plaid-notify] suppressed recipient — skipping:", opts.to, opts.subject);
    return false;
  }
  try {
    const body: Record<string, unknown> = {
      from: FROM(),
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    };
    if (opts.bcc) body.bcc = [opts.bcc];
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("[plaid-notify] Resend send failed:", res.status, detail);
      await logEmailEvent({ recipient: opts.to, event: "send_error", reason: `resend ${res.status}: ${detail}`, subject: opts.subject });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[plaid-notify] Resend send threw:", err);
    await logEmailEvent({ recipient: opts.to, event: "send_error", reason: String((err as Error)?.message || err), subject: opts.subject });
    return false;
  }
}

/** Staff heads-up — exempt from quiet hours. */
export function notifyStaff(subject: string, html: string): Promise<boolean> {
  return sendEmail({ to: NOTIFY_TO(), bcc: NOTIFY_BCC(), subject, html });
}

// ══════════════════════════════════════════════════════════════
// Templates — simple inline-styled HTML, Delt cobalt on white
// ══════════════════════════════════════════════════════════════

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#0B1B3F;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em;">Delt</span>
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #e8ecf5;">
          <p style="margin:0;font-size:11px;line-height:1.5;color:#8a93a8;">
            Delt uses Plaid to connect your bank securely. Your credentials are never shared with Delt.
            Questions? Just reply to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const btn = (url: string, label: string) =>
  `<a href="${esc(url)}" style="display:inline-block;background:#2E6BFF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">${esc(label)}</a>`;

const p = (s: string) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#26324b;">${s}</p>`;
const h = (s: string) => `<h1 style="margin:0 0 14px;font-size:19px;line-height:1.35;color:#0B1B3F;">${esc(s)}</h1>`;

export function connectLinkEmail(businessName: string, url: string, expiresAt?: string | null): { subject: string; html: string } {
  const days = expiresAt
    ? Math.max(1, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000))
    : 7;
  return {
    subject: `${businessName}: connect your bank to move your funding request forward`,
    html: shell(
      h(`One quick step to keep ${businessName}'s funding request moving`) +
      p("To review your file we verify business bank activity electronically — it takes about two minutes, is read-only, and replaces chasing PDF statements back and forth.") +
      p(btn(url, "Connect your bank securely")) +
      p(`This secure link works for about ${days} day${days === 1 ? "" : "s"} and can be opened from your phone. Bank credentials go to Plaid (used by Venmo and American Express) — never to Delt.`),
    ),
  };
}

export function reminderEmail(businessName: string, url: string, attempt: 1 | 2): { subject: string; html: string } {
  return attempt === 1
    ? {
        subject: `Quick reminder — your secure bank link for ${businessName}`,
        html: shell(
          h("Your funding file is waiting on one step") +
          p(`We can't complete the review for ${esc(businessName)} until the business bank account is connected. It takes about two minutes:`) +
          p(btn(url, "Connect your bank securely")) +
          p("Read-only, encrypted, powered by Plaid. If you'd rather send bank statements instead, just reply to this email."),
        ),
      }
    : {
        subject: `Last reminder — ${businessName}'s bank link expires soon`,
        html: shell(
          h("Your secure connect link expires soon") +
          p(`This is the last automatic reminder for ${esc(businessName)}. Once the link expires we'll need to issue a new one, which can delay your decision:`) +
          p(btn(url, "Connect your bank now")) +
          p("Two minutes, read-only, powered by Plaid. Prefer statements or have questions? Reply here and a person answers."),
        ),
      };
}

export function repairLinkEmail(
  businessName: string,
  institution: string,
  url: string,
  expiresAt?: string | null,
): { subject: string; html: string } {
  const days = expiresAt
    ? Math.max(1, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000))
    : 7;
  const bank = institution || "your bank";
  return {
    subject: `Action needed — reconnect ${bank} for ${businessName}`,
    html: shell(
      h(`${bank} needs a quick reconnect`) +
      p(`The secure connection between ${esc(bank)} and ${esc(businessName)}'s funding file needs to be refreshed — banks periodically ask you to re-confirm access. It takes about a minute and keeps your review moving without chasing statements.`) +
      p(btn(url, `Reconnect ${bank} securely`)) +
      p(`This secure link works for about ${days} day${days === 1 ? "" : "s"} and can be opened from your phone. It's read-only and your credentials go to Plaid (used by Venmo and American Express) — never to Delt.`),
    ),
  };
}

export function connectedProspectEmail(businessName: string, institution: string): { subject: string; html: string } {
  return {
    subject: `You're all set — ${institution || "your bank"} is connected`,
    html: shell(
      h("Bank connected — your file is moving") +
      p(`Thanks! ${esc(institution || "Your bank")} is now securely connected for ${esc(businessName)}, and your file has moved to review. No further action is needed from you right now.`) +
      p("Most reviews complete quickly during business hours — we'll reach out with a decision or any follow-up questions."),
    ),
  };
}

export function connectedStaffEmail(args: {
  businessName: string;
  leadId: string;
  institution: string;
  source: string;
  accounts?: number;
}): { subject: string; html: string } {
  return {
    subject: `Bank connected: ${args.businessName} (${args.institution || "bank"})`,
    html: shell(
      h(`${args.businessName} just connected ${args.institution || "a bank"}`) +
      p(`Source: ${esc(args.source)}${args.accounts != null ? ` · ${args.accounts} account(s)` : ""}<br/>Lead: <code>${esc(args.leadId)}</code>`) +
      p("Transactions are syncing into the vault now — cash-flow metrics and the model recommendation are typically ready in a couple of minutes. Open the CRM → Plaid vault to review, then run <strong>Verify ownership</strong> when the file advances."),
    ),
  };
}

export function expiredStaffEmail(businessName: string, leadId: string): { subject: string; html: string } {
  return {
    subject: `Connect link expired without connecting: ${businessName}`,
    html: shell(
      h(`${businessName}'s connect link expired`) +
      p(`Lead <code>${esc(leadId)}</code> never completed the bank connection (two automatic reminders were sent). Consider a personal call/text, or send a fresh link from the CRM → Plaid vault.`),
    ),
  };
}
