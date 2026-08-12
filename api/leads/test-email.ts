// Manual delivery check — GET returns the send outcome so failures are visible.
// Fully self-contained (no imports) — see api/leads/quote.ts for why.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = process.env.LEAD_NOTIFY_BCC || "";
const LEAD_NOTIFY_FROM =
  process.env.LEAD_NOTIFY_FROM || "DeltPay Leads <noreply@deltpay.com>";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function detailRow(label: string, v: unknown): string {
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #EEF1F6;vertical-align:top;width:150px">
      <span style="font:600 11px ${FONT_STACK};color:#94A3B8;text-transform:uppercase;letter-spacing:.6px">${escapeHtml(label)}</span>
    </td>
    <td style="padding:14px 0;border-bottom:1px solid #EEF1F6;vertical-align:top;font:500 15px ${FONT_STACK};color:#0F172A;line-height:1.5">${escapeHtml(v)}</td>
  </tr>`;
}
function renderLeadEmail(o: {
  heading: string; subtitle: string; badge: string; accent: string;
  rows: Array<[string, unknown]>;
}): string {
  const rowsHtml = o.rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([l, v]) => detailRow(l, v)).join("");
  const sentAt = new Date().toUTCString();
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:#041E42;padding:26px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:#6C63FF">Pay</span></td>
            <td align="right"><span style="display:inline-block;background:${o.accent};color:#ffffff;font:700 11px ${FONT_STACK};padding:6px 13px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px">${escapeHtml(o.badge)}</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${o.accent};">&nbsp;</td></tr>
        <tr><td style="padding:36px 40px 4px;">
          <h1 style="margin:0;font:800 23px ${FONT_STACK};color:#041E42;letter-spacing:-.4px">${escapeHtml(o.heading)}</h1>
          <p style="margin:9px 0 0;font:400 14px ${FONT_STACK};color:#64748B;line-height:1.5">${escapeHtml(o.subtitle)}</p>
        </td></tr>
        <tr><td style="padding:20px 40px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rowsHtml}</table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export default async function handler(req: any, res: any) {
  // Optional gate: when LEADS_TEST_TOKEN is set in the Vercel env, require
  // /api/leads/test-email?token=<value>. When unset, the route stays open so
  // the owner can always self-test delivery (set the token to lock it down).
  const token = process.env.LEADS_TEST_TOKEN || "";
  const provided = (req.query && req.query.token) || "";
  if (token && provided !== token) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  const tokenGate = token
    ? "enabled"
    : "disabled — set LEADS_TEST_TOKEN in Vercel to lock this route down";
  let result: { ok: boolean; error?: string } = { ok: false, error: "email not configured" };
  if (RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: LEAD_NOTIFY_FROM, to: [LEAD_NOTIFY_TO], ...(LEAD_NOTIFY_BCC ? { bcc: [LEAD_NOTIFY_BCC] } : {}),
          subject: "DeltPay Resend test email",
          html: renderLeadEmail({
            heading: "Resend test email",
            subtitle: "This confirms your lead notification emails are set up correctly.",
            badge: "Test", accent: "#4945FF",
            rows: [
              ["Status", "If you received this, Resend delivery is working."],
              ["Recipient", LEAD_NOTIFY_TO],
              ["BCC", LEAD_NOTIFY_BCC || "(none)"],
              ["Sender", LEAD_NOTIFY_FROM],
              ["Sent at", new Date().toISOString()],
            ],
          }),
        }),
      });
      result = r.ok
        ? { ok: true }
        : { ok: false, error: `resend ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}` };
    } catch (err) {
      result = { ok: false, error: `send error: ${(err as Error)?.message || err}` };
    }
  }
  return res.status(result.ok ? 200 : 500).json({
    ok: result.ok,
    sentTo: LEAD_NOTIFY_TO,
    bcc: LEAD_NOTIFY_BCC || null,
    from: LEAD_NOTIFY_FROM,
    keyConfigured: RESEND_API_KEY !== "",
    tokenGate,
    ...(result.error ? { error: result.error } : {}),
  });
}
