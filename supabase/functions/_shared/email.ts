/**
 * Resend email for edge functions.
 *
 * The Vercel api/leads/*.ts handlers are deliberately self-contained (no
 * cross-file imports), so nothing can be shared with them at import level —
 * this module ports their Resend fetch shape and design language (navy
 * #041E42 header, #4945FF accent, 600px table layout) into the edge runtime
 * for CRM-triggered, prospect-facing sends.
 *
 * Secrets: RESEND_API_KEY (required), LEAD_EMAIL_FROM (optional — the
 * prospect-facing From; defaults to Delt Capital, matching the brand shown
 * on the Plaid-hosted connect page).
 */

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const ACCENT = "#4945FF";
const NAVY = "#041E42";

export function emailFrom(): string {
  return Deno.env.get("LEAD_EMAIL_FROM") || "Delt Capital <noreply@deltpay.com>";
}

export function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const emailOk = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

export async function sendResendEmail(o: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<{ id: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    throw new Error("Email is not configured (RESEND_API_KEY secret is unset).");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: o.from || emailFrom(),
      to: Array.isArray(o.to) ? o.to : [o.to],
      subject: o.subject,
      html: o.html,
      ...(o.text ? { text: o.text } : {}),
      ...(o.replyTo ? { reply_to: o.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  const json = await res.json().catch(() => ({}));
  return { id: String(json?.id ?? "") };
}

/** Prospect-facing "connect your bank" invite. The CTA and fallback link
 * both point at the click-tracking redirect (never the raw Plaid URL) and
 * the open pixel sits just before </body>. */
export function renderConnectLinkEmail(o: {
  businessName: string;
  contactName?: string | null;
  agentName?: string | null;
  clickUrl: string;
  openPixelUrl: string;
  expiresAt?: string | null;
  note?: string | null;
}): { html: string; text: string } {
  const firstName = (o.contactName ?? "").trim().split(/\s+/)[0] || "";
  const hello = firstName ? `Hi ${firstName},` : "Hello,";
  const validLine = o.expiresAt
    ? `This secure link is valid until ${new Date(o.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "This secure link is valid for 7 days.";
  const signoff = (o.agentName ?? "").trim()
    ? `${o.agentName!.trim()} · Delt Capital`
    : "The Delt Capital team";
  const noteHtml = (o.note ?? "").trim()
    ? `<tr><td style="padding:0 40px 8px;">
        <p style="margin:0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6;border-left:3px solid #E2E8F0;padding-left:14px;font-style:italic">${escapeHtml(o.note!.trim())}</p>
      </td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:${NAVY};padding:26px 40px;">
          <span style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt&nbsp;<span style="color:#6C63FF">Capital</span></span>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${ACCENT};">&nbsp;</td></tr>
        <tr><td style="padding:38px 40px 6px;">
          <h1 style="margin:0;font:800 24px ${FONT_STACK};color:${NAVY};letter-spacing:-.4px">Connect your bank to complete your application</h1>
          <p style="margin:12px 0 0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6">${escapeHtml(hello)} to move your funding application for <strong style="color:${NAVY}">${escapeHtml(o.businessName)}</strong> forward, we need a quick, secure look at your business bank activity. Connect through Plaid &mdash; the same bank-grade service used by Venmo and American Express. It takes about 60 seconds, and we never see your login credentials.</p>
        </td></tr>
        ${noteHtml}
        <tr><td style="padding:26px 40px 8px;">
          <a href="${escapeHtml(o.clickUrl)}" style="display:inline-block;background:${ACCENT};color:#ffffff;font:700 15px ${FONT_STACK};text-decoration:none;padding:15px 30px;border-radius:10px">Securely connect your bank &rarr;</a>
        </td></tr>
        <tr><td style="padding:6px 40px 10px;">
          <p style="margin:0;font:400 13px ${FONT_STACK};color:#94A3B8;line-height:1.6">Or paste this link into your browser:<br><a href="${escapeHtml(o.clickUrl)}" style="color:${ACCENT};text-decoration:none;word-break:break-all">${escapeHtml(o.clickUrl)}</a></p>
        </td></tr>
        <tr><td style="padding:6px 40px 36px;">
          <p style="margin:0;font:400 13px ${FONT_STACK};color:#94A3B8;line-height:1.6">${escapeHtml(validLine)} Questions? Just reply to this email.<br>&mdash; ${escapeHtml(signoff)}</p>
        </td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="padding:22px 40px;text-align:center;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">
          Delt Capital &middot; <a href="https://deltpay.com" style="color:${ACCENT};text-decoration:none">deltpay.com</a><br>You're receiving this because you applied for funding with Delt Capital.
        </td></tr>
      </table>
    </td></tr>
  </table>
  <img src="${escapeHtml(o.openPixelUrl)}" width="1" height="1" alt="" style="display:none;max-height:1px;max-width:1px;border:0">
</body></html>`;

  const text = [
    hello,
    "",
    `To move your funding application for ${o.businessName} forward, we need a quick, secure look at your business bank activity. Connect through Plaid — it takes about 60 seconds, and we never see your login credentials.`,
    ...((o.note ?? "").trim() ? ["", o.note!.trim()] : []),
    "",
    `Securely connect your bank: ${o.clickUrl}`,
    "",
    `${validLine} Questions? Just reply to this email.`,
    `— ${signoff}`,
  ].join("\n");

  return { html, text };
}

/** Short internal notice to staff when a prospect completes the bank
 * connection. */
export function renderStaffConnectNotice(o: {
  businessName: string;
  institutionName?: string | null;
  leadId: string;
}): { html: string; text: string; subject: string } {
  const inst = (o.institutionName ?? "").trim() || "their bank";
  const subject = `Bank connected — ${o.businessName}`;
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:${NAVY};padding:26px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:#6C63FF">Pay</span></td>
            <td align="right"><span style="display:inline-block;background:#16A34A;color:#ffffff;font:700 11px ${FONT_STACK};padding:6px 13px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px">Bank connected</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:#16A34A;">&nbsp;</td></tr>
        <tr><td style="padding:36px 40px 40px;">
          <h1 style="margin:0;font:800 23px ${FONT_STACK};color:${NAVY};letter-spacing:-.4px">${escapeHtml(o.businessName)} connected ${escapeHtml(inst)}</h1>
          <p style="margin:12px 0 0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6">The prospect completed the Plaid bank connection from the emailed link. Their statements are syncing into the Plaid vault now &mdash; open the lead in the CRM to review.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${o.businessName} connected ${inst} via the emailed Plaid link. Their statements are syncing into the vault — open the lead in the CRM to review. (Lead ${o.leadId})`;
  return { html, text, subject };
}
