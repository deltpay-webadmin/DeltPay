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

// Jotform application URL config
// Returns the stored Jotform URL, seeding the default if not yet set.
const JOTFORM_DEFAULT_URL = "https://form.jotform.com/261806885237063";
const JOTFORM_KV_KEY = "config:jotform_application_url";

app.get("/make-server-940653c6/config/jotform-url", async (c) => {
  try {
    let record = await kv.get(JOTFORM_KV_KEY);
    if (!record || typeof record.url !== "string") {
      await kv.set(JOTFORM_KV_KEY, { url: JOTFORM_DEFAULT_URL });
      record = { url: JOTFORM_DEFAULT_URL };
    }
    return c.json({ ok: true, url: record.url });
  } catch (err) {
    console.error("jotform-url config error", err);
    return c.json({ ok: true, url: JOTFORM_DEFAULT_URL });
  }
});

// Merchant application submission
// Body: full merchant application field set (see FIELD_GROUPS on the client).
// Persists each submission to kv and emails it to the applications recipient
// via Resend. Requires the RESEND_API_KEY env var; FROM_EMAIL and
// APPLICATION_RECIPIENT are optional overrides.
const APPLICATION_RECIPIENT = Deno.env.get("APPLICATION_RECIPIENT") || "david@deltpay.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "DeltPay Applications <onboarding@resend.dev>";

// Ordered field definitions — label + key. Mirrors the client form so the
// email renders in a predictable, readable order.
const APPLICATION_FIELDS: { key: string; label: string; required?: boolean }[] = [
  // Owner
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: true },
  { key: "cellPhone", label: "Cell Phone Number" },
  { key: "email", label: "Email" },
  { key: "ssn", label: "Social Security Number", required: true },
  { key: "dob", label: "Date of Birth" },
  { key: "homeAddress", label: "Home Address", required: true },
  { key: "homeCity", label: "Home City", required: true },
  { key: "homeState", label: "Home State", required: true },
  { key: "homeZip", label: "Home Zip Code", required: true },
  // Business
  { key: "legalBusinessName", label: "Legal Business Name", required: true },
  { key: "dba", label: "DBA" },
  { key: "businessType", label: "Business Type", required: true },
  { key: "businessAddress", label: "Business Address", required: true },
  { key: "businessCity", label: "Business City", required: true },
  { key: "businessState", label: "Business State", required: true },
  { key: "businessZip", label: "Business Zip Code", required: true },
  { key: "businessPhone", label: "Business Phone Number", required: true },
  { key: "connectionType", label: "Connection Type", required: true },
  { key: "yearsInBusiness", label: "Years in Business" },
  { key: "averageTicket", label: "Average Ticket" },
  { key: "wantTips", label: "Do you want tips?" },
  { key: "autoBatchTime", label: "Auto Batch Time", required: true },
  { key: "monthlyVolume", label: "Total Monthly Card Volume", required: true },
  { key: "highTicket", label: "High Ticket", required: true },
  { key: "ein", label: "EIN Federal Tax ID #", required: true },
  { key: "ebtFsn", label: "EBT FSN #" },
  { key: "acceptWex", label: "Accept WEX/Fleet Cards?", required: true },
  // Bank & Deposit
  { key: "bankName", label: "Bank Name", required: true },
  { key: "accountHolderName", label: "Account Holder Name", required: true },
  { key: "routingNumber", label: "Routing Number", required: true },
  { key: "accountNumber", label: "Account Number", required: true },
  { key: "accountType", label: "Account Type", required: true },
];

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.post("/make-server-940653c6/applications", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));

    // Normalize to strings and enforce required fields.
    const data: Record<string, string> = {};
    const missing: string[] = [];
    for (const f of APPLICATION_FIELDS) {
      const raw = body[f.key];
      const val = typeof raw === "string" ? raw.trim().slice(0, 500) : "";
      data[f.key] = val;
      if (f.required && !val) missing.push(f.label);
    }

    if (missing.length) {
      return c.json({ ok: false, error: `Missing required fields: ${missing.join(", ")}` }, 400);
    }

    const now = new Date().toISOString();
    const applicant = `${data.firstName} ${data.lastName}`.trim();
    const key = `application:${now}:${(data.email || data.legalBusinessName || "unknown").toLowerCase()}`;

    // Persist first — email is best-effort and must not lose the submission.
    await kv.set(key, { ...data, submitted_at: now });

    // Build the email body.
    const rows = APPLICATION_FIELDS
      .map((f) => {
        const val = data[f.key] || "—";
        return `<tr><td style="padding:6px 12px;font-weight:600;color:#041E42;border-bottom:1px solid #eee">${escapeHtml(f.label)}</td><td style="padding:6px 12px;color:#333;border-bottom:1px solid #eee">${escapeHtml(val)}</td></tr>`;
      })
      .join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#041E42">New DeltPay Merchant Application</h2>
      <p style="color:#555">Submitted ${escapeHtml(now)}${applicant ? ` by ${escapeHtml(applicant)}` : ""}.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
    </div>`;

    const apiKey = Deno.env.get("RESEND_API_KEY");
    let emailed = false;
    let emailError = "";
    if (apiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [APPLICATION_RECIPIENT],
            reply_to: data.email || undefined,
            subject: `New Merchant Application${applicant ? ` — ${applicant}` : ""}`,
            html,
          }),
        });
        if (res.ok) {
          emailed = true;
        } else {
          emailError = await res.text();
          console.error("resend send failed", res.status, emailError);
        }
      } catch (err) {
        emailError = String(err);
        console.error("resend send error", err);
      }
    } else {
      emailError = "RESEND_API_KEY not configured";
      console.warn("applications: RESEND_API_KEY not set — submission stored but not emailed");
    }

    // The submission is saved regardless; report email status without failing.
    return c.json({ ok: true, emailed, ...(emailed ? {} : { emailError }) });
  } catch (err) {
    console.error("application submit error", err);
    return c.json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});

Deno.serve(app.fetch);