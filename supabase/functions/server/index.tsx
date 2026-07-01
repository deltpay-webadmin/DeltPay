import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { isEmailConfigured, sendEmail } from "./email.tsx";
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

// Email health check — reports whether Resend is configured, without exposing the key.
app.get("/make-server-940653c6/email/health", (c) => {
  return c.json({ ok: true, configured: isEmailConfigured() });
});

// Test send — verifies the Resend integration end-to-end.
// Body: { to }. Guarded by the `x-admin-token` header matching the ADMIN_TEST_TOKEN
// secret, so this is not an open "email anyone" endpoint.
app.post("/make-server-940653c6/email/test", async (c) => {
  try {
    const expectedToken = Deno.env.get("ADMIN_TEST_TOKEN");
    if (!expectedToken) {
      return c.json({ ok: false, error: "ADMIN_TEST_TOKEN is not configured." }, 503);
    }
    if (c.req.header("x-admin-token") !== expectedToken) {
      return c.json({ ok: false, error: "Unauthorized." }, 401);
    }

    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) && to.length <= 254;
    if (!emailOk) {
      return c.json({ ok: false, error: "Please provide a valid `to` email." }, 400);
    }

    const result = await sendEmail({
      to,
      subject: "DeltPay Resend test email",
      html: "<p>This is a test email from the DeltPay edge function. Resend is wired up correctly.</p>",
      text: "This is a test email from the DeltPay edge function. Resend is wired up correctly.",
    });

    return c.json(result, result.ok ? 200 : 502);
  } catch (err) {
    console.error("email test error", err);
    return c.json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});

Deno.serve(app.fetch);