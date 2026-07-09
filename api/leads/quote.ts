// Get-a-Quote wizard submission → branded email to the sales inbox via Resend.
// Fully self-contained (no imports): the project is ESM ("type":"module"), where
// relative imports need file extensions and any resolution miss crashes the
// function at load. Keeping zero imports sidesteps that entirely.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = "carlos@deltpay.com";
const LEAD_NOTIFY_FROM =
  process.env.LEAD_NOTIFY_FROM || "DeltPay Leads <noreply@deltpay.com>";

// ── Supabase persistence ─────────────────────────────────────────────
// Every quote submission is also written to the public.leads table so the
// lead is durable in the Delt backend, not just delivered as an email.
// Prefer a service-role key when configured (bypasses RLS); otherwise fall
// back to the project's public anon key, which the leads table's RLS policy
// allows to INSERT (and nothing else). The anon key already ships in the
// client bundle, so embedding it here as a fallback exposes nothing new.
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://ukruhkiwhxoreamerfoh.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnVoa2l3aHhvcmVhbWVyZm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDA1MjcsImV4cCI6MjA4ODMxNjUyN30.CigRxidM_NRstzasqnWEOHhpiXnes9Gd86mFBXUZptw";

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const ALLOWED_HOST_RE = /(^|\.)deltpay\.com$|(^|\.)delt\.com$|(^|\.)vercel\.app$/i;
function originAllowed(req: any): boolean {
  const src = req.headers?.origin || req.headers?.referer || "";
  if (!src) return true;
  try {
    const host = new URL(src).hostname;
    if (ALLOWED_HOST_RE.test(host)) return true;
    console.warn("quote lead blocked: origin not allowed:", host);
    return false;
  } catch {
    console.warn("quote lead blocked: unparseable origin");
    return false;
  }
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
}): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: LEAD_NOTIFY_FROM, to: [LEAD_NOTIFY_TO], bcc: [LEAD_NOTIFY_BCC],
        subject: o.subject, html: renderLeadEmail(o),
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

// Insert a lead row into public.leads via PostgREST. Zero-import (fetch only)
// to match this function's ESM-safe style. Non-fatal: a DB miss must never
// break the submission — the email path and success screen stand on their own.
async function persistLead(row: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: false, error: "supabase not configured" };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `supabase ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `db error: ${(err as Error)?.message || err}` };
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
  const name = clean(body.name, 200);
  const email = clean(body.email, 254).toLowerCase();
  if (!name || !emailOk(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid name and email." });
  }

  // Persist to the backend and notify sales in parallel — each is independent
  // and non-fatal, so one failing never blocks the other.
  const leadRow = {
    source: "get-a-quote",
    name,
    email,
    phone: clean(body.phone, 40) || null,
    business_name: clean(body.business, 200) || null,
    business_type: clean(body.bizType, 80) || null,
    monthly_volume: clean(body.volume, 80) || null,
    features: cleanList(body.features),
    recommended_plan: clean(body.recommendedPlan, 80) || null,
    notes: clean(body.notes, 2000) || null,
    spam_suspect: spamSuspect,
    user_agent: clean(req.headers?.["user-agent"], 500) || null,
  };

  const [persist, r] = await Promise.all([
    persistLead(leadRow),
    sendLeadEmail({
    subject: `${spamSuspect ? "[possible spam] " : ""}New quote request — ${name}`,
    heading: "New Get-a-Quote request",
    subtitle: `${name} just requested a quote through the DeltPay site.`,
    badge: "Quote request",
    accent: "#4945FF",
    replyTo: email,
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", clean(body.phone, 40)],
      ["Business", clean(body.business, 200)],
      ["Business type", clean(body.bizType, 80)],
      ["Monthly volume", clean(body.volume, 80)],
      ["Features", cleanList(body.features).join(", ")],
      ["Recommended plan", clean(body.recommendedPlan, 80)],
      ["Notes", clean(body.notes, 2000)],
    ],
    }),
  ]);
  if (!persist.ok) console.warn("quote lead not persisted:", persist.error);
  return res.status(200).json({
    ok: true,
    persisted: persist.ok,
    persistError: persist.error,
    emailed: r.ok,
    emailError: r.error,
  });
}
