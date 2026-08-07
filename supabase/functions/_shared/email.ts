/**
 * ────────────────────────────────────────────────────────────────
 * Transactional email for edge functions (Resend)
 * ────────────────────────────────────────────────────────────────
 * The marketing site sends its lead notifications from the Vercel
 * routes in /api/leads/* (same provider, same key). This is the
 * server-side counterpart: prospect-facing sends that originate
 * inside the CRM, where the browser must never hold an API key.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY   — required; unset means every send fails closed
 *   OUTREACH_FROM    — optional verified sender, default below
 *
 * The From domain has to be verified in Resend or the API rejects
 * the message; the error text is surfaced verbatim to the caller so
 * staff see "domain not verified" instead of a generic failure.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Delt Capital <noreply@deltpay.com>";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function emailConfig() {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  return {
    apiKey,
    from: Deno.env.get("OUTREACH_FROM") ?? DEFAULT_FROM,
    configured: Boolean(apiKey),
  };
}

/** Deliberately permissive — the real validation is the send itself. */
export function isEmailAddress(v: unknown): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? "").trim());
}

export function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  bcc?: string | string[];
}

/** Send one message. Throws with the provider's reason on failure. */
export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const cfg = emailConfig();
  if (!cfg.configured) {
    throw new Error(
      "Email is not configured. Add RESEND_API_KEY as an Edge Function secret.",
    );
  }
  const payload: Record<string, unknown> = {
    from: cfg.from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
  };
  if (input.text) payload.text = input.text;
  if (input.replyTo) payload.reply_to = input.replyTo;
  if (input.bcc) payload.bcc = Array.isArray(input.bcc) ? input.bcc : [input.bcc];

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    const reason = (json as any)?.message ?? (json as any)?.error?.message ?? res.statusText;
    throw new Error(`Email provider rejected the message (${res.status}): ${reason}`);
  }
  return { id: String((json as any)?.id ?? "") };
}

// ══════════════════════════════════════════════════════════════
// Prospect-facing template
// ══════════════════════════════════════════════════════════════
// Single-CTA layout on the DeltPay palette (navy #041E42 header,
// indigo accent), table-based so Outlook renders it. Matches the
// lead-notification emails in /api/leads/* so both sides of the
// funnel look like they came from the same company.

export interface ActionEmail {
  /** Inbox preview line — hidden in the body. */
  preheader: string;
  badge: string;
  heading: string;
  /** e.g. "Hi Maria," — omitted when the contact name is unknown. */
  greeting?: string;
  /** Body copy, one <p> each. */
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  /** Small print under the button — expiry and the like. The paste-this-URL
   * fallback is rendered by the template itself. */
  ctaNote?: string;
  /** Reassurance checklist rendered above the sign-off. */
  bullets?: string[];
  signOff?: string;
  accent?: string;
}

export function renderActionEmail(o: ActionEmail): string {
  const accent = o.accent ?? "#6C63FF";
  const paragraphs = o.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font:400 15px ${FONT_STACK};color:#334155;line-height:1.65">${escapeHtml(p)}</p>`,
    )
    .join("");
  const bullets = (o.bullets ?? [])
    .map(
      (b) =>
        `<tr><td style="padding:5px 0;font:400 14px ${FONT_STACK};color:#475569;line-height:1.5">
          <span style="color:${accent};font-weight:700">&#10003;</span>&nbsp;&nbsp;${escapeHtml(b)}</td></tr>`,
    )
    .join("");
  // Anchors are the only place a raw URL is interpolated; encodeURI keeps a
  // quote or angle bracket in the URL from breaking out of the attribute.
  const href = encodeURI(o.ctaUrl);
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${escapeHtml(o.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:#041E42;padding:26px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:${accent}">Pay</span></td>
            <td align="right"><span style="display:inline-block;background:${accent};color:#ffffff;font:700 11px ${FONT_STACK};padding:6px 13px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px">${escapeHtml(o.badge)}</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${accent};">&nbsp;</td></tr>
        <tr><td style="padding:36px 40px 0;">
          <h1 style="margin:0 0 18px;font:800 23px ${FONT_STACK};color:#041E42;letter-spacing:-.4px;line-height:1.3">${escapeHtml(o.heading)}</h1>
          ${o.greeting ? `<p style="margin:0 0 14px;font:600 15px ${FONT_STACK};color:#0F172A">${escapeHtml(o.greeting)}</p>` : ""}
          ${paragraphs}
        </td></tr>
        <tr><td align="center" style="padding:14px 40px 6px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:10px;background:${accent};">
              <a href="${href}" style="display:inline-block;padding:15px 34px;font:700 15px ${FONT_STACK};color:#ffffff;text-decoration:none;border-radius:10px">${escapeHtml(o.ctaLabel)}</a>
            </td>
          </tr></table>
        </td></tr>
        ${
          o.ctaNote
            ? `<tr><td align="center" style="padding:4px 40px 0;">
                 <p style="margin:0;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">${escapeHtml(o.ctaNote)}</p>
               </td></tr>`
            : ""
        }
        <!-- Plain-URL fallback: some clients strip the button, and people
             forward these to a phone where tapping is easier than clicking. -->
        <tr><td align="center" style="padding:8px 40px 0;">
          <p style="margin:0;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6;word-break:break-all">
            Button not working? Copy and paste this address into your browser:<br>
            <a href="${href}" style="color:#64748B;text-decoration:underline">${escapeHtml(o.ctaUrl)}</a>
          </p>
        </td></tr>
        ${
          // Padding lives on the inner cell, not the table — Outlook drops
          // padding declared on a <table>.
          bullets
            ? `<tr><td style="padding:22px 40px 0;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #EEF1F6;border-radius:12px;">
                   <tr><td style="padding:14px 18px;">
                     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bullets}</table>
                   </td></tr>
                 </table>
               </td></tr>`
            : ""
        }
        ${
          o.signOff
            ? `<tr><td style="padding:22px 40px 0;">
                 <p style="margin:0;font:400 14px ${FONT_STACK};color:#475569;line-height:1.6">${escapeHtml(o.signOff).replace(/\n/g, "<br>")}</p>
               </td></tr>`
            : ""
        }
        <tr><td style="padding:28px 40px 34px;">
          <p style="margin:0;font:400 11px ${FONT_STACK};color:#94A3B8;line-height:1.6">
            You're receiving this because you asked Delt Capital about funding for your business.
            If this wasn't you, ignore this email &mdash; nothing happens until you open the link yourself.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Plain-text alternative — every send should carry one. */
export function renderActionEmailText(o: ActionEmail): string {
  return [
    o.greeting ?? "",
    "",
    ...o.paragraphs.flatMap((p) => [p, ""]),
    `${o.ctaLabel}:`,
    o.ctaUrl,
    "",
    o.ctaNote ?? "",
    "",
    ...(o.bullets ?? []).map((b) => `- ${b}`),
    "",
    o.signOff ?? "",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
