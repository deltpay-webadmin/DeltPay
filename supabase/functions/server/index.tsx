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
const LEAD_NOTIFY_FROM = "DeltPay Leads <noreply@deltpay.com>";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsToHtml(rows: Array<[string, unknown]>): string {
  const body = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(
      ([label, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#64748B;font:600 13px sans-serif;white-space:nowrap;vertical-align:top">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#0F172A;font:400 14px sans-serif">${escapeHtml(
          v,
        )}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse">${body}</table>`;
}

// Sends a formatted lead notification. Returns { ok, error? } and never
// throws — the caller still succeeds (and the lead is stored) even if
// email delivery fails, so the visitor's submit is never blocked.
async function sendLeadEmail(
  subject: string,
  heading: string,
  rows: Array<[string, unknown]>,
  replyTo?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping lead email");
    return { ok: false, error: "email not configured" };
  }
  const html = `<div style="max-width:560px;margin:0 auto;font-family:sans-serif">
    <h2 style="color:#041E42;font-size:20px;margin:0 0 4px">${escapeHtml(heading)}</h2>
    <p style="color:#64748B;font-size:13px;margin:0 0 20px">New submission from the DeltPay site</p>
    ${rowsToHtml(rows)}
  </div>`;
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
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("resend send failed", res.status, detail);
      return { ok: false, error: `resend ${res.status}` };
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

    await sendLeadEmail(
      `New quote request — ${name}`,
      "New Get-a-Quote request",
      [
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
      record.email,
    );

    return c.json({ ok: true });
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

    await sendLeadEmail(
      `New application — ${fullName}`,
      "New merchant application",
      [
        ["Full name", record.fullName],
        ["Email", record.email],
        ["Phone", record.phone],
        ["Business name", record.businessName],
        ["Business type", record.businessType],
      ],
      record.email,
    );

    return c.json({ ok: true });
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
  const result = await sendLeadEmail(
    "DeltPay Resend test email",
    "Resend test email",
    [
      ["Status", "If you received this, Resend delivery is working."],
      ["Recipient", LEAD_NOTIFY_TO],
      ["Sender", LEAD_NOTIFY_FROM],
      ["Sent at", new Date().toISOString()],
    ],
  );
  const status = result.ok ? 200 : 500;
  return c.json(
    {
      ok: result.ok,
      sentTo: LEAD_NOTIFY_TO,
      keyConfigured: RESEND_API_KEY !== "",
      ...(result.error ? { error: result.error } : {}),
    },
    status,
  );
});

Deno.serve(app.fetch);