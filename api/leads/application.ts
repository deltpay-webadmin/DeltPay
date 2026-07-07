import {
  sendLeadEmail,
  parseBody,
  clean,
  emailOk,
} from "../../lib/leadEmail";

// Application ("Get Started" / Apply) submission → branded email to sales.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const fullName = clean(body.fullName, 200);
  const email = clean(body.email, 254).toLowerCase();
  if (!fullName || !emailOk(email)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please enter a valid name and email." });
  }

  const lead = {
    fullName,
    email,
    businessName: clean(body.businessName, 200),
    phone: clean(body.phone, 40),
    businessType: clean(body.businessType, 80),
  };

  const emailResult = await sendLeadEmail({
    subject: `New application — ${fullName}`,
    heading: "New merchant application",
    subtitle: `${fullName} started a merchant application on the DeltPay site.`,
    badge: "Application",
    accent: "#16C784",
    replyTo: email,
    rows: [
      ["Full name", lead.fullName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Business name", lead.businessName],
      ["Business type", lead.businessType],
    ],
  });

  return res
    .status(200)
    .json({ ok: true, emailed: emailResult.ok, emailError: emailResult.error });
}
