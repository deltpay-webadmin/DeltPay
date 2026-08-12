// Consolidated lead endpoint for every site form. One self-contained function
// (no imports — the project is ESM with no tsconfig, so cross-file imports crash
// at load). A FORMS registry themes the branded email per form `type`.
// All notifications go to david@deltpay.com via Resend. Optional BCC via LEAD_NOTIFY_BCC env.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = process.env.LEAD_NOTIFY_BCC || "";
const LEAD_NOTIFY_FROM =
  process.env.LEAD_NOTIFY_FROM || "DeltPay Leads <noreply@deltpay.com>";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
// Where the calculator lives (HashRouter → /#/calculator). Overridable per env.
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://deltpay.com";
const VISITOR_FROM =
  process.env.VISITOR_EMAIL_FROM || "DeltPay <noreply@deltpay.com>";

// Max base64 attachment size (~3.5MB) — Vercel caps the request body near 4.5MB.
const MAX_ATTACH_B64 = 3_500_000;

// Abuse controls. Only accept requests whose Origin/Referer is our own site
// (blocks the trivial `curl` flood). The honeypot is NON-FATAL: browser
// autofill can fill hidden fields too, so a filled honeypot tags the email as
// possible spam instead of dropping it — a real lead is never lost to a
// false positive. Every block/tag is logged so Vercel runtime logs show why.
const ALLOWED_HOST_RE = /(^|\.)deltpay\.com$|(^|\.)delt\.com$|(^|\.)vercel\.app$/i;
function originAllowed(req: any): boolean {
  const src = req.headers?.origin || req.headers?.referer || "";
  if (!src) return true; // same-origin fetches may omit Origin; don't hard-block
  try {
    const host = new URL(src).hostname;
    if (ALLOWED_HOST_RE.test(host)) return true;
    console.warn("lead blocked: origin not allowed:", host);
    return false;
  } catch {
    console.warn("lead blocked: unparseable origin:", String(src).slice(0, 100));
    return false;
  }
}
// Accept both the current and the legacy honeypot field names.
const honeypotFilled = (b: Record<string, unknown>) =>
  clean(b.hp_extra_field, 200) !== "" || clean(b.company_website, 200) !== "";

// Attachment allowlist — sniff the base64 magic bytes so an attacker can't relay
// an executable to the team inbox in a trusted-looking email.
function sniffAllowed(fileName: string, b64: string): boolean {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (!["pdf", "png", "jpg", "jpeg"].includes(ext)) return false;
  const head = b64.slice(0, 16);
  return (
    head.startsWith("JVBERi") ||        // %PDF
    head.startsWith("iVBORw0KGgo") ||   // PNG
    head.startsWith("/9j/")             // JPEG
  );
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
const clean = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const cleanList = (v: unknown, max = 40) =>
  Array.isArray(v) ? v.map((x) => clean(x, 80)).filter(Boolean).slice(0, max) : [];
function parseBody(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") return body as Record<string, unknown>;
  if (typeof body === "string" && body.trim()) {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return {};
}
function fullName(b: Record<string, unknown>): string {
  const joined = `${clean(b.firstName, 100)} ${clean(b.lastName, 100)}`.trim();
  return clean(b.fullName, 200) || joined;
}

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
    <td style="padding:14px 0;border-bottom:1px solid #EEF1F6;vertical-align:top;font:500 15px ${FONT_STACK};color:#0F172A;line-height:1.5">${escapeHtml(v).replace(/\n/g, "<br>")}</td>
  </tr>`;
}
function renderLeadEmail(o: {
  heading: string; subtitle: string; badge: string; accent: string;
  rows: Array<[string, unknown]>; replyTo?: string;
}): string {
  const rowsHtml = o.rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([l, v]) => detailRow(l, v)).join("");
  const sentAt = new Date().toUTCString();
  const cta = o.replyTo
    ? `<tr><td style="padding:8px 40px 40px"><a href="mailto:${escapeHtml(o.replyTo)}" style="display:inline-block;background:#4945FF;color:#ffffff;font:700 14px ${FONT_STACK};text-decoration:none;padding:13px 26px;border-radius:10px">Reply to ${escapeHtml(o.replyTo)} &rarr;</a></td></tr>`
    : "";
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
        ${cta}
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="padding:22px 40px;text-align:center;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">
          Sent automatically when a form was submitted on <a href="https://deltpay.com" style="color:#4945FF;text-decoration:none">deltpay.com</a><br>${escapeHtml(sentAt)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
async function sendLeadEmail(o: {
  subject: string; heading: string; subtitle: string; badge: string;
  accent: string; rows: Array<[string, unknown]>; replyTo?: string;
  attachments?: Array<{ filename: string; content: string }>;
}): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: LEAD_NOTIFY_FROM, to: [LEAD_NOTIFY_TO], ...(LEAD_NOTIFY_BCC ? { bcc: [LEAD_NOTIFY_BCC] } : {}),
        subject: o.subject, html: renderLeadEmail(o),
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
        ...(o.attachments && o.attachments.length ? { attachments: o.attachments } : {}),
      }),
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

// ── Visitor-facing "here's your custom-quote link" email ─────────
// Sent to the address a visitor typed into the homepage rate-check bar.
// Email clients can't run our calculator, so we send a branded button that
// opens the calculator on the site, pre-filled with their email.
function renderVisitorRateEmail(calcUrl: string): string {
  const sentAt = new Date().toUTCString();
  const accent = "#4945FF";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:#041E42;padding:26px 40px;">
          <span style="font:800 21px ${FONT_STACK};color:#ffffff;letter-spacing:-.5px">Delt<span style="color:#6C63FF">Pay</span></span>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${accent};">&nbsp;</td></tr>
        <tr><td style="padding:38px 40px 6px;">
          <h1 style="margin:0;font:800 24px ${FONT_STACK};color:#041E42;letter-spacing:-.4px">Winners don't wait to get paid.</h1>
          <p style="margin:12px 0 0;font:400 15px ${FONT_STACK};color:#475569;line-height:1.6">Thanks for reaching out. Your custom rate is one quick step away &mdash; plug in your current numbers and we'll show you exactly what you'd keep with Delt: <strong style="color:#041E42">0% processing fees</strong> and <strong style="color:#041E42">same-day funding</strong>.</p>
        </td></tr>
        <tr><td style="padding:26px 40px 8px;">
          <a href="${calcUrl}" style="display:inline-block;background:${accent};color:#ffffff;font:700 15px ${FONT_STACK};text-decoration:none;padding:15px 30px;border-radius:10px">Build your custom quote (60 sec) &rarr;</a>
        </td></tr>
        <tr><td style="padding:6px 40px 36px;">
          <p style="margin:0;font:400 13px ${FONT_STACK};color:#94A3B8;line-height:1.6">Or paste this link into your browser:<br><a href="${calcUrl}" style="color:#4945FF;text-decoration:none;word-break:break-all">${calcUrl}</a></p>
        </td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="padding:22px 40px;text-align:center;font:400 12px ${FONT_STACK};color:#94A3B8;line-height:1.6">
          DeltPay &middot; <a href="https://deltpay.com" style="color:#4945FF;text-decoration:none">deltpay.com</a><br>You're receiving this because you requested a custom rate on deltpay.com.<br>${escapeHtml(sentAt)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
// Send an email TO the visitor (not the team). Replies route to sales.
async function sendVisitorEmail(o: {
  to: string; subject: string; html: string; replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: VISITOR_FROM, to: [o.to], subject: o.subject, html: o.html,
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
      }),
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

// ── Per-form themes + row builders ───────────────────────────────
type FormDef = {
  badge: string; accent: string;
  subject: (b: Record<string, unknown>) => string;
  heading: string;
  subtitle: (b: Record<string, unknown>) => string;
  rows: (b: Record<string, unknown>) => Array<[string, unknown]>;
};
const IS_MERCHANT: Record<string, string> = {
  yes: "Yes — already a merchant",
  no: "No — not yet",
  exploring: "Just exploring",
};

const FORMS: Record<string, FormDef> = {
  contact: {
    badge: "Contact", accent: "#2563EB",
    subject: (b) => `New contact — ${fullName(b) || clean(b.email, 254)}`,
    heading: "New contact enquiry",
    subtitle: (b) => `${fullName(b) || "Someone"} reached out through the DeltPay site.`,
    rows: (b) => [
      ["Name", fullName(b)],
      ["Email", clean(b.email, 254)],
      ["Phone", clean(b.phone, 40)],
      ["Company", clean(b.company, 200)],
      ["Merchant?", IS_MERCHANT[clean(b.isMerchant, 20)] || clean(b.isMerchant, 40)],
      ["Monthly volume", clean(b.monthlyVolume, 80)],
      ["Message", clean(b.message, 4000)],
      ["Source", clean(b.source, 80)],
    ],
  },
  audit: {
    badge: "Statement audit", accent: "#F59E0B",
    subject: (b) => `New statement audit — ${clean(b.biz, 200) || clean(b.email, 254)}`,
    heading: "New free statement audit request",
    subtitle: (b) => `${clean(b.biz, 200) || "A business"} requested a free statement audit.`,
    rows: (b) => [
      ["Business", clean(b.biz, 200)],
      ["Email", clean(b.email, 254)],
      ["Statement", clean(b.fileName, 200)],
    ],
  },
  newsletter: {
    badge: "Newsletter", accent: "#0EA5A5",
    subject: (b) => `New newsletter signup — ${clean(b.email, 254)}`,
    heading: "New Delt Dispatch subscriber",
    subtitle: () => `Someone subscribed to the Delt Dispatch newsletter.`,
    rows: (b) => [["Email", clean(b.email, 254)]],
  },
  "rate-check": {
    badge: "Rate check", accent: "#6366F1",
    subject: (b) => `New rate check — ${clean(b.email, 254)}`,
    heading: "New custom-rate request",
    subtitle: () => `Someone asked to see their custom rate from the homepage bar.`,
    rows: (b) => [["Email", clean(b.email, 254)]],
  },
  signup: {
    badge: "Sign-up lead", accent: "#7C3AED",
    subject: (b) => `New sign-up lead — ${clean(b.businessName, 200) || fullName(b)}`,
    heading: "New merchant sign-up",
    subtitle: (b) => `${clean(b.businessName, 200) || fullName(b) || "A business"} started a merchant sign-up.`,
    rows: (b) => [
      ["Business", clean(b.businessName, 200)],
      ["Business type", clean(b.businessType, 80)],
      ["Industry", clean(b.industry, 120)],
      ["Website", clean(b.website, 200)],
      ["Contact", fullName(b)],
      ["Email", clean(b.email, 254)],
      ["Phone", clean(b.phone, 40)],
      ["Monthly volume", clean(b.monthlyVolume, 80)],
      ["Average ticket", clean(b.averageTicket, 80)],
      ["About", clean(b.businessDescription, 4000)],
    ],
  },
  onboarding: {
    badge: "Onboarding", accent: "#DB2777",
    subject: (b) => `New onboarding application — ${clean(b.legalName, 200) || fullName(b)}`,
    heading: "New merchant onboarding application",
    subtitle: (b) => `${clean(b.legalName, 200) || fullName(b) || "A business"} submitted the onboarding application.`,
    rows: (b) => [
      ["Legal name", clean(b.legalName, 200)],
      ["DBA", clean(b.dba, 200)],
      ["EIN", clean(b.ein, 40)],
      ["Entity type", clean(b.entityType, 80)],
      ["Contact", fullName(b)],
      ["Email", clean(b.email, 254)],
      ["Phone", clean(b.phone, 40)],
      ["Category", clean(b.businessCategory, 120)],
      ["Monthly volume", clean(b.monthlyVolume, 80)],
      ["Average ticket", clean(b.averageTicket, 80)],
      ["Accepts cards today", clean(b.acceptsCardToday, 20)],
      ["Bank connected", b.bankConnected === true || b.bankConnected === "true" ? "Yes" : "No"],
      ["Address", [clean(b.addressLine1, 200), clean(b.city, 100), clean(b.state, 40), clean(b.zip, 20)].filter(Boolean).join(", ")],
      ["Identity", "DOB / SSN collected in-app — intentionally not included in email."],
    ],
  },
  "pricing-guide": {
    badge: "Pricing guide", accent: "#041E42",
    subject: (b) => `New pricing-guide request — ${clean(b.email, 254)}`,
    heading: "New hardware pricing-guide request",
    subtitle: () => `Someone requested the Delt hardware pricing guide.`,
    rows: (b) => [
      ["Email", clean(b.email, 254)],
      ["Business", clean(b.business, 200)],
    ],
  },
  signin: {
    badge: "Sign-in attempt", accent: "#64748B",
    subject: (b) => `Sign-in attempt — ${clean(b.email, 254)}`,
    heading: "Sign-in attempt",
    subtitle: () => `Someone attempted to sign in on the DeltPay site. (Password is never captured.)`,
    rows: (b) => [
      ["Email", clean(b.email, 254)],
      ["At", new Date().toISOString()],
    ],
  },
};


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
  if (!originAllowed(req)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }
  const body = parseBody(req.body);
  // Honeypot filled → still send, but tagged (autofill-safe; see note above).
  const spamSuspect = honeypotFilled(body);
  if (spamSuspect) console.log("lead honeypot filled — sending tagged as possible spam");
  const type = clean(body.type, 40);
  const def = FORMS[type];
  if (!def) {
    return res.status(400).json({ ok: false, error: `Unknown form type: ${type || "(none)"}` });
  }
  const email = clean(body.email, 254).toLowerCase();
  if (!emailOk(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }

  const rows = def.rows(body);

  // Audit statement attachment (base64), guarded against the body-size limit.
  let attachments: Array<{ filename: string; content: string }> | undefined;
  if (type === "audit" && typeof body.fileB64 === "string" && body.fileB64) {
    const b64 = body.fileB64.includes(",") ? body.fileB64.split(",").pop()! : body.fileB64;
    const name = clean(body.fileName, 200) || "statement";
    if (b64.length > MAX_ATTACH_B64) {
      rows.push(["Statement", "File too large to attach — follow up with the merchant."]);
    } else if (!sniffAllowed(name, b64)) {
      rows.push(["Statement", "Unsupported file type (not a PDF/PNG/JPG) — not attached; follow up."]);
    } else {
      attachments = [{ filename: name, content: b64 }];
    }
  }

  if (spamSuspect) {
    rows.push(["Spam signals", "Hidden honeypot field was filled (bot, or the sender's browser autofill)."]);
  }

  // DB first, email second — a mail failure can never lose the lead.
  const leadId = spamSuspect
    ? null
    : await captureLead(type, {
        full_name: fullName(body),
        email,
        phone: clean(body.phone, 40),
        company:
          clean(body.company, 200) || clean(body.businessName, 200) ||
          clean(body.legalName, 200) || clean(body.biz, 200) ||
          clean(body.business, 200),
        message: clean(body.message, 4000) || clean(body.businessDescription, 4000),
        monthly_volume: clean(body.monthlyVolume, 80),
      });
  if (leadId) rows.push(["CRM lead", leadId]);

  const r = await sendLeadEmail({
    subject: (spamSuspect ? "[possible spam] " : "") + def.subject(body),
    heading: def.heading,
    subtitle: def.subtitle(body),
    badge: def.badge,
    accent: def.accent,
    replyTo: email,
    rows,
    attachments,
  });

  // Homepage rate-check bar: also send the VISITOR a branded email with a
  // button to the calculator (pre-filled with their email). This is what
  // makes the on-screen "check your inbox — quote on the way" promise real.
  let visitorEmailed: boolean | undefined;
  if (type === "rate-check" && !spamSuspect) {
    const calcUrl = `${SITE_ORIGIN}/#/calculator?e=${encodeURIComponent(email)}`;
    const v = await sendVisitorEmail({
      to: email,
      subject: "Your custom Delt rate — build it in 60 seconds",
      html: renderVisitorRateEmail(calcUrl),
      replyTo: LEAD_NOTIFY_TO,
    });
    visitorEmailed = v.ok;
    if (!v.ok) console.warn("visitor rate email failed:", v.error);
  }

  return res.status(200).json({ ok: true, type, leadId, emailed: r.ok, emailError: r.error, visitorEmailed });
}
