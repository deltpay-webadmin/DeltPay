import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  plaidConfig,
  webhookUrl,
  verifyStaff,
  createLinkToken,
  exchangePublicToken,
  sandboxQuickConnect,
  syncItem,
  syncAllItems,
  removeItem,
  attachIdentityVerification,
  createAssetReport,
  refreshAssetReport,
  svc,
} from "../_shared/plaid.ts";
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

// ────────────────────────────────────────────────────────────────
// Plaid Data Vault API — staff-only (CRM sends the signed-in user's
// JWT; verifyStaff mirrors the is_staff() RLS gate).
// ────────────────────────────────────────────────────────────────

const PLAID_BASE = "/make-server-940653c6/plaid";

// All Plaid routes require a staff user.
app.use(`${PLAID_BASE}/*`, async (c, next) => {
  const auth = await verifyStaff(c.req.header("Authorization"));
  if (!auth.ok) return c.json({ ok: false, error: auth.error }, auth.status as any);
  c.set("staffUserId" as never, auth.userId as never);
  await next();
});

// Config / connection status for the dashboard banner.
app.get(`${PLAID_BASE}/status`, async (c) => {
  const cfg = plaidConfig();
  let items = 0;
  let prospects = 0;
  try {
    const db = svc();
    const [{ count: itemCount }, { data: leads }] = await Promise.all([
      db.from("plaid_items").select("*", { count: "exact", head: true }),
      db.from("plaid_items").select("lead_id"),
    ]);
    items = itemCount ?? 0;
    prospects = new Set((leads ?? []).map((r: any) => r.lead_id).filter(Boolean)).size;
  } catch { /* status stays best-effort */ }
  return c.json({
    ok: true,
    configured: cfg.configured,
    env: cfg.env,
    products: cfg.products,
    webhook_url: webhookUrl(),
    items,
    prospects,
  });
});

app.post(`${PLAID_BASE}/link-token`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await createLinkToken(leadId, String(c.get("staffUserId" as never) ?? ""));
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid link-token error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/exchange`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    const publicToken = String(body.publicToken ?? "");
    if (!leadId || !publicToken) {
      return c.json({ ok: false, error: "leadId and publicToken are required" }, 400);
    }
    const out = await exchangePublicToken(leadId, publicToken, body.institution);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid exchange error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/sandbox/quick-connect`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await sandboxQuickConnect(leadId, body.institutionId || undefined);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid sandbox connect error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/sync`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const itemId = String(body.itemId ?? "");
    if (!itemId) return c.json({ ok: false, error: "itemId is required" }, 400);
    const out = await syncItem(itemId);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid sync error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/sync-all`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const results = await syncAllItems(body.leadId ? String(body.leadId) : undefined);
    return c.json({ ok: true, results });
  } catch (err: any) {
    console.error("plaid sync-all error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/idv/attach`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    const idvId = String(body.identityVerificationId ?? "").trim();
    if (!leadId || !idvId) {
      return c.json({ ok: false, error: "leadId and identityVerificationId are required" }, 400);
    }
    const out = await attachIdentityVerification(leadId, idvId);
    return c.json(out);
  } catch (err: any) {
    console.error("plaid idv attach error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/asset-report`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await createAssetReport(leadId);
    return c.json(out);
  } catch (err: any) {
    console.error("plaid asset-report error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/asset-report/refresh`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await refreshAssetReport({ leadId });
    return c.json(out);
  } catch (err: any) {
    console.error("plaid asset-report refresh error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.delete(`${PLAID_BASE}/items/:itemId`, async (c) => {
  try {
    const out = await removeItem(c.req.param("itemId"));
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid remove error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

Deno.serve(app.fetch);
