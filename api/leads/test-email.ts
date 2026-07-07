import { sendLeadEmail, LEAD_CONFIG } from "../_lib/leadEmail";

// Manual delivery check. Hit this once after setting the RESEND_API_KEY env
// var to confirm Resend + domain verification work end-to-end. Returns the
// outcome so failures (e.g. unverified domain) are visible directly.
export default async function handler(_req: any, res: any) {
  const result = await sendLeadEmail({
    subject: "DeltPay Resend test email",
    heading: "Resend test email",
    subtitle: "This confirms your lead notification emails are set up correctly.",
    badge: "Test",
    accent: "#4945FF",
    rows: [
      ["Status", "If you received this, Resend delivery is working."],
      ["Recipient", LEAD_CONFIG.to],
      ["BCC", LEAD_CONFIG.bcc],
      ["Sender", LEAD_CONFIG.from],
      ["Sent at", new Date().toISOString()],
    ],
  });

  return res.status(result.ok ? 200 : 500).json({
    ok: result.ok,
    sentTo: LEAD_CONFIG.to,
    bcc: LEAD_CONFIG.bcc,
    from: LEAD_CONFIG.from,
    keyConfigured: LEAD_CONFIG.keyConfigured,
    ...(result.error ? { error: result.error } : {}),
  });
}
