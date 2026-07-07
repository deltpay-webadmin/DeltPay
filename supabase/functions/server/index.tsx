import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-940653c6/health", (c) => {
  return c.json({ status: "ok" });
});

// Pricing guide email opt-in (lead capture)
// Body: { email, business?, source? } — source defaults to 'hardware-pricing-guide'.
// Stores under kv key `lead:pricing-guide:<lowercased-email>` for idempotency.
app.post("/make-server-940653c6/leads/pricing-guide", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    const business = typeof body.business === "string" ? body.business.trim().slice(0, 200) : "";
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "hardware-pricing-guide";

    // Minimal RFC-5322 lite check — enough to reject obvious junk.
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) && rawEmail.length <= 254;
    if (!emailOk) {
      return c.json({ ok: false, error: "Please enter a valid email." }, 400);
    }

    const email = rawEmail.toLowerCase();
    const key = `lead:pricing-guide:${email}`;
    const now = new Date().toISOString();
    const ua = c.req.header("user-agent") || "";
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "";

    await kv.set(key, {
      email,
      business,
      source,
      first_seen: now,
      user_agent: ua,
      ip,
    });

    return c.json({ ok: true });
  } catch (err) {
    console.error("pricing-guide lead error", err);
    return c.json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});

// ── Resend email delivery ────────────────────────────────────────
// Notification recipient + verified sender. RESEND_API_KEY is set as a
// Supabase edge-function secret (never committed). The sending domain
// (deltpay.com) must be verified in Resend for delivery to succeed.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const LEAD_NOTIFY_TO = "david@deltpay.com";
const LEAD_NOTIFY_BCC = "carlos@deltpay.com";
// Sender. Override with LEAD_NOTIFY_FROM secret (e.g. while deltpay.com is
// still being verified in Resend, set it to "DeltPay <onboarding@resend.dev>"
// to confirm the pipeline works). Defaults to the verified-domain sender.
const LEAD_NOTIFY_FROM =
  Deno.env.get("LEAD_NOTIFY_FROM") || "DeltPay Leads <noreply@deltpay.com>";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Renders one label/value row. `full` values (e.g. notes) stack the value
// under the label so long text isn't cramped into a narrow column.
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
// throws — the caller still succeeds (and the lead is stored) even if
// email delivery fails, so the visitor's submit is never blocked.
async function sendLeadEmail(o: {
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

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
const clean = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const cleanList = (v: unknown, max = 40) =>
  Array.isArray(v) ? v.map((x) => clean(x, 80)).filter(Boolean).slice(0, max) : [];

// Get-a-Quote wizard submission.
app.post("/make-server-940653c6/leads/quote", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const name = clean(body.name, 200);
    const email = clean(body.email, 254).toLowerCase();
    if (!name || !emailOk(email)) {
      return c.json({ ok: false, error: "Please enter a valid name and email." }, 400);
    }
    const record = {
      type: "quote",
      name,
      email,
      phone: clean(body.phone, 40),
      business: clean(body.business, 200),
      notes: clean(body.notes, 2000),
      features: cleanList(body.features),
      businessType: clean(body.bizType, 80),
      volume: clean(body.volume, 80),
      recommendedPlan: clean(body.recommendedPlan, 80),
      submitted_at: new Date().toISOString(),
      user_agent: c.req.header("user-agent") || "",
      ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "",
    };
    await kv.set(`lead:quote:${email}:${record.submitted_at}`, record);

    const emailResult = await sendLeadEmail({
      subject: `New quote request — ${name}`,
      heading: "New Get-a-Quote request",
      subtitle: `${name} just requested a quote through the DeltPay site.`,
      badge: "Quote request",
      accent: "#4945FF",
      replyTo: record.email,
      rows: [
        ["Name", record.name],
        ["Email", record.email],
        ["Phone", record.phone],
        ["Business", record.business],
        ["Business type", record.businessType],
        ["Monthly volume", record.volume],
        ["Features", record.features.join(", ")],
        ["Recommended plan", record.recommendedPlan],
        ["Notes", record.notes],
      ],
    });

    return c.json({ ok: true, emailed: emailResult.ok, emailError: emailResult.error });
  } catch (err) {
    console.error("quote lead error", err);
    return c.json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});

// Application ("Get Started" / Apply) submission.
app.post("/make-server-940653c6/leads/application", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const fullName = clean(body.fullName, 200);
    const email = clean(body.email, 254).toLowerCase();
    if (!fullName || !emailOk(email)) {
      return c.json({ ok: false, error: "Please enter a valid name and email." }, 400);
    }
    const record = {
      type: "application",
      fullName,
      email,
      businessName: clean(body.businessName, 200),
      phone: clean(body.phone, 40),
      businessType: clean(body.businessType, 80),
      submitted_at: new Date().toISOString(),
      user_agent: c.req.header("user-agent") || "",
      ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "",
    };
    await kv.set(`lead:application:${email}:${record.submitted_at}`, record);

    const emailResult = await sendLeadEmail({
      subject: `New application — ${fullName}`,
      heading: "New merchant application",
      subtitle: `${fullName} started a merchant application on the DeltPay site.`,
      badge: "Application",
      accent: "#16C784",
      replyTo: record.email,
      rows: [
        ["Full name", record.fullName],
        ["Email", record.email],
        ["Phone", record.phone],
        ["Business name", record.businessName],
        ["Business type", record.businessType],
      ],
    });

    return c.json({ ok: true, emailed: emailResult.ok, emailError: emailResult.error });
  } catch (err) {
    console.error("application lead error", err);
    return c.json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});

// Manual delivery check. Hit this once after deploying + setting the
// RESEND_API_KEY secret to confirm Resend + domain verification work
// end-to-end. Sends a sample email to the lead recipient and returns
// the outcome so you can see failures (e.g. unverified domain) directly.
app.get("/make-server-940653c6/leads/test-email", async (c) => {
  const result = await sendLeadEmail({
    subject: "DeltPay Resend test email",
    heading: "Resend test email",
    subtitle: "This confirms your lead notification emails are set up correctly.",
    badge: "Test",
    accent: "#4945FF",
    rows: [
      ["Status", "If you received this, Resend delivery is working."],
      ["Recipient", LEAD_NOTIFY_TO],
      ["Sender", LEAD_NOTIFY_FROM],
      ["Sent at", new Date().toISOString()],
    ],
  });
  const status = result.ok ? 200 : 500;
  return c.json(
    {
      ok: result.ok,
      sentTo: LEAD_NOTIFY_TO,
      bcc: LEAD_NOTIFY_BCC,
      from: LEAD_NOTIFY_FROM,
      keyConfigured: RESEND_API_KEY !== "",
      ...(result.error ? { error: result.error } : {}),
    },
    status,
  );
});

Deno.serve(app.fetch);