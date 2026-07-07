import {
  sendLeadEmail,
  parseBody,
  clean,
  cleanList,
  emailOk,
} from "../_lib/leadEmail";

// Get-a-Quote wizard submission → branded email to the sales inbox.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const name = clean(body.name, 200);
  const email = clean(body.email, 254).toLowerCase();
  if (!name || !emailOk(email)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please enter a valid name and email." });
  }

  const lead = {
    name,
    email,
    phone: clean(body.phone, 40),
    business: clean(body.business, 200),
    notes: clean(body.notes, 2000),
    features: cleanList(body.features),
    businessType: clean(body.bizType, 80),
    volume: clean(body.volume, 80),
    recommendedPlan: clean(body.recommendedPlan, 80),
  };

  const emailResult = await sendLeadEmail({
    subject: `New quote request — ${name}`,
    heading: "New Get-a-Quote request",
    subtitle: `${name} just requested a quote through the DeltPay site.`,
    badge: "Quote request",
    accent: "#4945FF",
    replyTo: email,
    rows: [
      ["Name", lead.name],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Business", lead.business],
      ["Business type", lead.businessType],
      ["Monthly volume", lead.volume],
      ["Features", lead.features.join(", ")],
      ["Recommended plan", lead.recommendedPlan],
      ["Notes", lead.notes],
    ],
  });

  return res
    .status(200)
    .json({ ok: true, emailed: emailResult.ok, emailError: emailResult.error });
}
