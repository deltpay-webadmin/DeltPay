import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  plaidConfig,
  webhookUrl,
  createLinkToken,
  exchangePublicToken,
  sandboxQuickConnect,
  syncItem,
  syncAllItems,
  removeItem,
  attachIdentityVerification,
  createAssetReport,
  refreshAssetReport,
  applyPlaidExchange,
  svc,
} from "../_shared/plaid.ts";
import { adsStatus, connectMeta, syncMeta, disconnectMeta, syncMetaLeads, importMetaLeads } from "../_shared/meta.ts";
import { requireUser, hasPerm, verifyCronSecret, verifyApplySecret, type AuthContext } from "../_shared/auth.ts";
import { sweepInFlightEnvelopes } from "../_shared/docusign_status.ts";
const app = new Hono();

// Per-route RBAC gate. The group middleware below resolves the caller once
// (requireUser) and stashes the AuthContext; needPerm checks a specific
// permission key from the org's role_permissions matrix.
const needPerm = (perm: string) => async (c: any, next: () => Promise<void>) => {
  const ctx = c.get("authCtx") as AuthContext | undefined;
  if (!ctx) return c.json({ ok: false, error: "Sign in required" }, 401);
  if (!hasPerm(ctx, perm)) {
    return c.json({ ok: false, error: `Missing permission: ${perm}` }, 403);
  }
  await next();
};

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

// ────────────────────────────────────────────────────────────────
// Scheduled jobs dispatcher — the pg_cron target.
//
// POST { task } with header x-cron-secret: <CRON_SECRET>. No user JWT:
// pg_cron sends the public anon key as Authorization (to pass platform
// JWT verification) and verifyCronSecret (timing-safe, fails closed when
// the secret is unset) is the real gate. Invoked nightly via
// public.invoke_job() (supabase/migrations/20260731_05_cron.sql); for a
// manual run:
//   curl -X POST .../functions/v1/make-server-940653c6/jobs \
//        -H 'Authorization: Bearer <anon key>' \
//        -H 'x-cron-secret: ...' -d '{"task":"docusign-sweep"}'
// ────────────────────────────────────────────────────────────────

const JOB_TASKS: Record<string, () => Promise<unknown>> = {
  "plaid-sync-all": () => syncAllItems(),
  "meta-insights": () => syncMeta(90),
  // syncMetaLeads already reconciles matches against pipeline_leads
  "meta-leads": () => syncMetaLeads(),
  "docusign-sweep": () => sweepInFlightEnvelopes(50),
};

app.post("/make-server-940653c6/jobs", async (c) => {
  if (!verifyCronSecret(c.req.raw)) {
    return c.json({ ok: false, error: "Forbidden" }, 403);
  }
  const body = await c.req.json().catch(() => ({}));
  const task = String(body?.task ?? "");
  const run = JOB_TASKS[task];
  if (!run) {
    return c.json({ ok: false, error: `Unknown task: ${task}`, tasks: Object.keys(JOB_TASKS) }, 400);
  }
  const started = Date.now();
  try {
    const summary = await run();
    const ms = Date.now() - started;
    console.log(`jobs: ${task} ok in ${ms}ms`, summary);
    return c.json({ ok: true, task, ms, summary });
  } catch (err: any) {
    const ms = Date.now() - started;
    console.error(`jobs: ${task} failed in ${ms}ms`, err);
    return c.json({ ok: false, task, ms, error: String(err?.message ?? err) }, 500);
  }
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
// Applicant-side Plaid exchange — called server-to-server by the
// deltcapital.com funding application (api/plaid-exchange-token.js)
// so applicant bank connections land in the vault instead of being
// discarded. No user JWT (applicants aren't staff): the caller sends
// the public anon key as Authorization to pass platform JWT
// verification, and x-apply-secret (timing-safe compare against the
// APPLY_EXCHANGE_SECRET function secret, fails closed when unset) is
// the real gate. The public_token is env-bound — if deltcapital.com
// runs a different PLAID_ENV than these functions, the exchange fails
// and the caller falls back to its local, non-persisting exchange.
// ────────────────────────────────────────────────────────────────

app.post("/make-server-940653c6/apply/plaid-exchange", async (c) => {
  if (!verifyApplySecret(c.req.raw)) {
    return c.json({ ok: false, error: "Forbidden" }, 403);
  }
  const body = await c.req.json().catch(() => ({}));
  const publicToken = String(body.public_token ?? "");
  const applicant = (body.applicant ?? {}) as Record<string, unknown>;
  const email = String(applicant.email ?? "").trim().toLowerCase();
  if (!publicToken) {
    return c.json({ ok: false, error: "public_token is required" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return c.json({ ok: false, error: "applicant.email is required" }, 400);
  }
  try {
    const out = await applyPlaidExchange(
      publicToken,
      {
        email,
        fullName: typeof applicant.fullName === "string" ? applicant.fullName.slice(0, 200) : undefined,
        businessName: typeof applicant.businessName === "string" ? applicant.businessName.slice(0, 200) : undefined,
        leadId: typeof applicant.leadId === "string" ? applicant.leadId.slice(0, 64) : undefined,
      },
      body.institution,
    );
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("apply plaid-exchange error", err);
    return c.json({
      ok: false,
      error: String(err?.message ?? err),
      plaid_error_code: err?.plaid?.error_code ?? null,
    }, 500);
  }
});

// ────────────────────────────────────────────────────────────────
// Plaid Data Vault API — the CRM sends the signed-in user's JWT;
// requireUser resolves org membership + permission set, and each
// route enforces its permission key (underwriting.view to look,
// underwriting.review to act — mirrors the RLS matrix).
// ────────────────────────────────────────────────────────────────

const PLAID_BASE = "/make-server-940653c6/plaid";

// All Plaid routes require an org member.
app.use(`${PLAID_BASE}/*`, async (c, next) => {
  const auth = await requireUser(c.req.header("Authorization"));
  if (!auth.ok) return c.json({ ok: false, error: auth.error }, auth.status as any);
  c.set("authCtx" as never, auth.ctx as never);
  c.set("staffUserId" as never, auth.ctx.userId as never);
  await next();
});

// Config / connection status for the dashboard banner.
app.get(`${PLAID_BASE}/status`, needPerm("underwriting.view"), async (c) => {
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
    env_valid: cfg.envValid,
    env_source: cfg.envSource,
    redirect_uri_set: Boolean(cfg.redirectUri),
    products: cfg.products,
    webhook_url: webhookUrl(),
    items,
    prospects,
  });
});

app.post(`${PLAID_BASE}/link-token`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/exchange`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/sandbox/quick-connect`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/sync`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/sync-all`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const results = await syncAllItems(body.leadId ? String(body.leadId) : undefined);
    return c.json({ ok: true, results });
  } catch (err: any) {
    console.error("plaid sync-all error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/idv/attach`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/asset-report`, needPerm("underwriting.review"), async (c) => {
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

app.post(`${PLAID_BASE}/asset-report/refresh`, needPerm("underwriting.review"), async (c) => {
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

app.delete(`${PLAID_BASE}/items/:itemId`, needPerm("underwriting.review"), async (c) => {
  try {
    const out = await removeItem(c.req.param("itemId"));
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid remove error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// ────────────────────────────────────────────────────────────────
// Ad accounts API (Meta) — staff-only, same gate as Plaid. Tokens
// are stored server-side (ad_credentials) and never returned.
// ────────────────────────────────────────────────────────────────

const ADS_BASE = "/make-server-940653c6/ads";

app.use(`${ADS_BASE}/*`, async (c, next) => {
  const auth = await requireUser(c.req.header("Authorization"));
  if (!auth.ok) return c.json({ ok: false, error: auth.error }, auth.status as any);
  c.set("authCtx" as never, auth.ctx as never);
  c.set("staffUserId" as never, auth.ctx.userId as never);
  await next();
});

app.get(`${ADS_BASE}/status`, needPerm("integrations.view"), async (c) => {
  try {
    const out = await adsStatus();
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("ads status error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${ADS_BASE}/meta/connect`, needPerm("integrations.configure"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const accessToken = String(body.accessToken ?? "");
    const adAccountId = String(body.adAccountId ?? "");
    if (!accessToken || !adAccountId) {
      return c.json({ ok: false, error: "accessToken and adAccountId are required" }, 400);
    }
    const account = await connectMeta(
      accessToken,
      adAccountId,
      String(c.get("staffUserId" as never) ?? ""),
    );
    // First pull immediately so the page goes live without a second click.
    const sync = await syncMeta(90).catch((err: any) => ({ error: String(err?.message ?? err) }));
    return c.json({ ok: true, account, sync });
  } catch (err: any) {
    console.error("meta connect error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${ADS_BASE}/meta/sync`, needPerm("integrations.configure"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const days = Number(body.days) || 90;
    const out = await syncMeta(days);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("meta sync error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${ADS_BASE}/meta/leads/sync`, needPerm("integrations.configure"), async (c) => {
  try {
    const out = await syncMetaLeads();
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("meta leads sync error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${ADS_BASE}/meta/leads/import`, needPerm("leads.create"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds.map(String) : [];
    if (!leadIds.length) return c.json({ ok: false, error: "leadIds is required" }, 400);
    const out = await importMetaLeads(leadIds);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("meta leads import error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.delete(`${ADS_BASE}/meta`, needPerm("integrations.configure"), async (c) => {
  try {
    await disconnectMeta();
    return c.json({ ok: true });
  } catch (err: any) {
    console.error("meta disconnect error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

Deno.serve(app.fetch);
