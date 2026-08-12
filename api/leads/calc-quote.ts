// Savings-calculator completion → two emails via Resend:
//   1. the VISITOR gets their custom quote (the numbers they just built), and
//   2. the SALES inbox gets notified with the same figures.
// Self-contained (no imports): the project is ESM ("type":"module") with no
// tsconfig, so any cross-file import can crash the function at load. Keeping
// zero project imports sidesteps that — matching submit.ts / quote.ts.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = process.env.LEAD_NOTIFY_BCC || "";
const LEAD_NOTIFY_FROM =
  process.env.LEAD_NOTIFY_FROM || "DeltPay Leads <noreply@deltpay.com>";
const VISITOR_FROM =
  process.env.VISITOR_EMAIL_FROM || "DeltPay <noreply@deltpay.com>";
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://deltpay.com";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const ALLOWED_HOST_RE = /(^|\.)deltpay\.com$|(^|\.)delt\.com$|(^|\.)vercel\.app$/i;
function originAllowed(req: any): boolean {
  const src = req.headers?.origin || req.headers?.referer || "";
  if (!src) return true;
  try {
    const host = new URL(src).hostname;
    if (ALLOWED_HOST_RE.test(host)) return true;
    console.warn("calc-quote blocked: origin not allowed:", host);
    return false;
  } catch {
    console.warn("calc-quote blocked: unparseable origin");
    return false;
  }
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
const clean = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function parseBody(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") return body as Record<string, unknown>;
  if (typeof body === "string" && body.trim()) {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return {};
}
function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? n : 0;
}
const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Shared visual shell ──────────────────────────────────────────
function shell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:#041E42;padding:26px 40px;">
          <span style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:#6C63FF">Pay</span></span>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:#4945FF;">&nbsp;</td></tr>
        ${inner}
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="padding:22px 40px;text-align:center;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">
          DeltPay &middot; <a href="https://deltpay.com" style="color:#4945FF;text-decoration:none">deltpay.com</a><br>${escapeHtml(new Date().toUTCString())}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
function figureRow(label: string, value: string, strong = false): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #EEF1F6;font:600 13px ${FONT_STACK};color:#64748B">${escapeHtml(label)}</td>
    <td align="right" style="padding:12px 0;border-bottom:1px solid #EEF1F6;font:${strong ? "800 18px" : "600 15px"} ${FONT_STACK};color:${strong ? "#4945FF" : "#0F172A"}">${escapeHtml(value)}</td>
  </tr>`;
}

type Q = {
  email: string; monthlyVolume: string; processingRate: string;
  currentCost: number; deltCost: number; savings: number; annual: number;
};

function visitorEmailHtml(q: Q): string {
  const applyUrl = `${SITE_ORIGIN}/#/apply`;
  const savingsLine = q.savings > 0
    ? `<p style="margin:9px 0 0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6">Based on the numbers you entered, here's what switching to Delt looks like &mdash; <strong style="color:#041E42">${escapeHtml(usd(q.annual))} a year</strong> back in your pocket.</p>`
    : `<p style="margin:9px 0 0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6">Here's the quote you just built. Want us to dig into your statement and find every dollar? Just reply to this email.</p>`;
  const inner = `
    <tr><td style="padding:36px 40px 4px;">
      <h1 style="margin:0;font:800 23px ${FONT_STACK};color:#041E42;letter-spacing:-.4px">Your custom Delt quote</h1>
      ${savingsLine}
    </td></tr>
    <tr><td style="padding:20px 40px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${figureRow("Monthly volume", usd(num(q.monthlyVolume)))}
        ${figureRow("Your current monthly cost", usd(q.currentCost))}
        ${figureRow("Your cost with Delt", usd(q.deltCost))}
        ${figureRow("Monthly savings", usd(Math.max(0, q.savings)), true)}
        ${figureRow("Estimated yearly savings", usd(Math.max(0, q.annual)), true)}
      </table>
    </td></tr>
    <tr><td style="padding:26px 40px 6px;">
      <a href="${applyUrl}" style="display:inline-block;background:#4945FF;color:#ffffff;font:700 15px ${FONT_STACK};text-decoration:none;padding:15px 30px;border-radius:10px">Get started with Delt &rarr;</a>
    </td></tr>
    <tr><td style="padding:4px 40px 34px;">
      <p style="margin:0;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">Estimates are illustrative and based on the rates you entered. Delt's 2.6% + $0.10 rate applies to standard card-present transactions on the Free plan. Actual savings depend on card mix, plan, and volume.</p>
    </td></tr>`;
  return shell(inner);
}

function teamEmailHtml(q: Q): string {
  const inner = `
    <tr><td style="padding:36px 40px 4px;">
      <h1 style="margin:0;font:800 22px ${FONT_STACK};color:#041E42;letter-spacing:-.4px">New calculator quote</h1>
      <p style="margin:9px 0 0;font:400 14px ${FONT_STACK};color:#64748B;line-height:1.5">${escapeHtml(q.email)} built a custom quote on the savings calculator.</p>
    </td></tr>
    <tr><td style="padding:20px 40px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${figureRow("Email", q.email)}
        ${figureRow("Monthly volume", usd(num(q.monthlyVolume)))}
        ${figureRow("Current rate", q.processingRate ? escapeHtml(q.processingRate) + "%" : "—")}
        ${figureRow("Current monthly cost", usd(q.currentCost))}
        ${figureRow("Delt monthly cost", usd(q.deltCost))}
        ${figureRow("Monthly savings", usd(Math.max(0, q.savings)), true)}
        ${figureRow("Annual savings", usd(Math.max(0, q.annual)), true)}
      </table>
    </td></tr>
    <tr><td style="padding:8px 40px 40px">
      <a href="mailto:${escapeHtml(q.email)}" style="display:inline-block;background:#4945FF;color:#ffffff;font:700 14px ${FONT_STACK};text-decoration:none;padding:13px 26px;border-radius:10px">Reply to ${escapeHtml(q.email)} &rarr;</a>
    </td></tr>`;
  return shell(inner);
}

async function send(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `send error: ${(err as Error)?.message || err}` };
  }
}


// ── DB-first lead capture ─────────────────────────────────────────
// Persist every lead to the CRM (crm_leads) via the shared submit-lead
// edge function BEFORE attempting email, so a mail failure can never
// lose a lead again. Best-effort: errors are logged, never thrown.
const LEAD_FN_URL =
  process.env.LEAD_FN_URL ||
  "https://ytemrmpnwmzqeradbeoa.supabase.co/functions/v1/submit-lead";
const LEAD_FN_KEY = process.env.SUPABASE_ANON_KEY || "";
async function captureLead(
  formName: string,
  fields: Record<string, unknown>,
): Promise<string | null> {
  if (!LEAD_FN_KEY) {
    console.warn("lead capture skipped: SUPABASE_ANON_KEY not set");
    return null;
  }
  try {
    const r = await fetch(LEAD_FN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LEAD_FN_KEY}`,
        apikey: LEAD_FN_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "delt_pay_site",
        form_name: formName,
        product_interest: "payments",
        ...fields,
      }),
    });
    if (!r.ok) {
      console.error("lead capture failed:", r.status, (await r.text().catch(() => "")).slice(0, 200));
      return null;
    }
    const d = await r.json().catch(() => null);
    return d && d.id ? String(d.id) : null;
  } catch (err) {
    console.error("lead capture error:", (err as Error)?.message || err);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!originAllowed(req)) return res.status(403).json({ ok: false, error: "Forbidden" });

  const body = parseBody(req.body);
  // Honeypot is non-fatal (autofill-safe): tag instead of drop.
  const spamSuspect =
    clean(body.hp_extra_field, 200) !== "" || clean(body.company_website, 200) !== "";
  const email = clean(body.email, 254).toLowerCase();
  if (!emailOk(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }

  const savings = num(body.savings);
  const q: Q = {
    email,
    monthlyVolume: clean(body.monthlyVolume, 40),
    processingRate: clean(body.processingRate, 20),
    currentCost: num(body.currentCost),
    deltCost: num(body.deltCost),
    savings,
    annual: body.annual !== undefined ? num(body.annual) : savings * 12,
  };

  // DB first, email second — a mail failure can never lose the lead.
  const leadId = spamSuspect
    ? null
    : await captureLead("calculator", {
        email,
        monthly_volume: q.monthlyVolume,
        message: `Calculator: rate ${q.processingRate || "?"}, est. savings $${q.savings}/mo`,
      });

  // Notify the team (always).
  const team = await send({
    from: LEAD_NOTIFY_FROM, to: [LEAD_NOTIFY_TO], ...(LEAD_NOTIFY_BCC ? { bcc: [LEAD_NOTIFY_BCC] } : {}),
    reply_to: email,
    subject: `${spamSuspect ? "[possible spam] " : ""}Calculator quote — ${email}`,
    html: teamEmailHtml(q),
  });

  // Email the visitor their custom quote (skip if flagged as spam).
  let visitorEmailed: boolean | undefined;
  if (!spamSuspect) {
    const v = await send({
      from: VISITOR_FROM, to: [email], reply_to: LEAD_NOTIFY_TO,
      subject: q.savings > 0
        ? `Your custom Delt quote — save ${usd(Math.max(0, q.annual))}/yr`
        : "Your custom Delt quote",
      html: visitorEmailHtml(q),
    });
    visitorEmailed = v.ok;
    if (!v.ok) console.warn("calc-quote visitor email failed:", v.error);
  }

  return res.status(200).json({
    ok: true, leadId, emailed: team.ok, emailError: team.error, visitorEmailed,
  });
}
