// Shared lead-notification email helper for the Vercel /api/leads/* functions.
// Sends a branded email to the sales inbox via Resend. RESEND_API_KEY is a
// Vercel environment variable (never committed). The sending domain
// (deltpay.com) must be verified in Resend for delivery to succeed.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = "carlos@deltpay.com";
// Sender. Override with the LEAD_NOTIFY_FROM env var (e.g. while deltpay.com is
// still being verified in Resend, set it to "DeltPay <onboarding@resend.dev>"
// to confirm the pipeline works). Defaults to the verified-domain sender.
const LEAD_NOTIFY_FROM =
  process.env.LEAD_NOTIFY_FROM || "DeltPay Leads <noreply@deltpay.com>";

export const LEAD_CONFIG = {
  to: LEAD_NOTIFY_TO,
  bcc: LEAD_NOTIFY_BCC,
  from: LEAD_NOTIFY_FROM,
  keyConfigured: RESEND_API_KEY !== "",
};

// ── Input sanitisation ───────────────────────────────────────────
export const emailOk = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
export const clean = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export const cleanList = (v: unknown, max = 40) =>
  Array.isArray(v) ? v.map((x) => clean(x, 80)).filter(Boolean).slice(0, max) : [];

// ── Email template ───────────────────────────────────────────────
function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Renders one label/value row. Long values (e.g. notes) wrap under the value
// column rather than being cramped into a narrow cell.
function detailRow([label, v]: [string, unknown]): string {
  const value = escapeHtml(v).replace(/\n/g, "<br>");
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #EEF1F6;vertical-align:top;width:150px">
      <span style="font:600 11px ${FONT_STACK};color:#94A3B8;text-transform:uppercase;letter-spacing:.6px">${escapeHtml(label)}</span>
    </td>
    <td style="padding:14px 0;border-bottom:1px solid #EEF1F6;vertical-align:top;font:500 15px ${FONT_STACK};color:#0F172A;line-height:1.5">${value}</td>
  </tr>`;
}

// Builds a branded, email-client-safe HTML document (table layout + inline
// styles, ~600px, works in Gmail/Outlook/Apple Mail).
function renderLeadEmail(o: {
  heading: string;
  subtitle: string;
  badge: string;
  accent: string;
  rows: Array<[string, unknown]>;
  replyTo?: string;
  preheader?: string;
}): string {
  const rowsHtml = o.rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(detailRow)
    .join("");
  const sentAt = new Date().toUTCString();
  const cta = o.replyTo
    ? `<tr><td style="padding:8px 40px 40px">
         <a href="mailto:${escapeHtml(o.replyTo)}" style="display:inline-block;background:#4945FF;color:#ffffff;font:700 14px ${FONT_STACK};text-decoration:none;padding:13px 26px;border-radius:10px">Reply to ${escapeHtml(o.replyTo)} &rarr;</a>
       </td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(o.preheader || o.subtitle)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <!-- header -->
        <tr><td style="background:#041E42;padding:26px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:#6C63FF">Pay</span></td>
            <td align="right"><span style="display:inline-block;background:${o.accent};color:#ffffff;font:700 11px ${FONT_STACK};padding:6px 13px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px">${escapeHtml(o.badge)}</span></td>
          </tr></table>
        </td></tr>
        <!-- accent rule -->
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${o.accent};">&nbsp;</td></tr>
        <!-- title -->
        <tr><td style="padding:36px 40px 4px;">
          <h1 style="margin:0;font:800 23px ${FONT_STACK};color:#041E42;letter-spacing:-.4px">${escapeHtml(o.heading)}</h1>
          <p style="margin:9px 0 0;font:400 14px ${FONT_STACK};color:#64748B;line-height:1.5">${escapeHtml(o.subtitle)}</p>
        </td></tr>
        <!-- details -->
        <tr><td style="padding:20px 40px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rowsHtml}</table>
        </td></tr>
        ${cta}
      </table>
      <!-- footer -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="padding:22px 40px;text-align:center;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">
          Sent automatically when a form was submitted on <a href="https://deltpay.com" style="color:#4945FF;text-decoration:none">deltpay.com</a><br>${escapeHtml(sentAt)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Sends a formatted lead notification. Returns { ok, error? } and never
// throws — the caller still succeeds even if delivery fails, so the visitor's
// submit is never blocked. On failure it surfaces Resend's own message.
export async function sendLeadEmail(o: {
  subject: string;
  heading: string;
  subtitle: string;
  badge: string;
  accent: string;
  rows: Array<[string, unknown]>;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping lead email");
    return { ok: false, error: "email not configured" };
  }
  const html = renderLeadEmail(o);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: LEAD_NOTIFY_FROM,
        to: [LEAD_NOTIFY_TO],
        bcc: [LEAD_NOTIFY_BCC],
        subject: o.subject,
        html,
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("resend send failed", res.status, detail);
      // Surface Resend's own message (e.g. "The deltpay.com domain is not
      // verified") so the cause is visible without digging through logs.
      return { ok: false, error: `resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("resend send error", err);
    return { ok: false, error: "send error" };
  }
}

// Vercel Node functions usually pre-parse JSON bodies, but be defensive in
// case the body arrives as a raw string.
export function parseBody(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") return body as Record<string, unknown>;
  if (typeof body === "string" && body.trim()) {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return {};
}
