import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  plaidConfig,
  webhookUrl,
  createLinkToken,
  createUpdateLinkToken,
  markItemRepaired,
  recordLinkEvent,
  exchangePublicToken,
  sandboxQuickConnect,
  syncItem,
  syncAllItems,
  removeItem,
  attachIdentityVerification,
  createIdentityVerification,
  createAssetReport,
  refreshAssetReport,
  applyPlaidExchange,
  applyIntake,
  createHostedLink,
  sweepHostedLinks,
  sweepRepairLinks,
  sendConnectReminders,
  retryIdentityVerification,
  verifyItem,
  verifyLead,
  refreshLeadTransactions,
  realtimeBalances,
  screenLead,
  refreshScreening,
  retireItem,
  retireStaleItems,
  svc,
} from "../_shared/plaid.ts";
import { adsStatus, connectMeta, syncMeta, disconnectMeta, syncMetaLeads, importMetaLeads } from "../_shared/meta.ts";
import { requireUser, hasPerm, verifyCronSecret, verifyApplySecret, type AuthContext } from "../_shared/auth.ts";
import { sweepInFlightEnvelopes } from "../_shared/docusign_status.ts";
import {
  capitalRenewalSweep,
  dealStatusNotify,
  emailHealthDigest,
  growthSweep,
  mpaStallReminders,
  slaWatch,
  staleLeadDigest,
} from "../_shared/lifecycle.ts";
const app = new Hono();
// Build marker: vault-token rollout (see 20260817_plaid_tokens_into_vault.sql).

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
  // Sweep pending hosted-link invites first so a connection completed on a
  // phone overnight is exchanged before (and then included in) the sync.
  "plaid-sync-all": async () => ({
    hosted_links: await sweepHostedLinks().catch((err: any) => ({ error: String(err?.message ?? err) })),
    items: await syncAllItems(),
    // Repair safety net: any item flagged repair-needed without an
    // outstanding reconnect invite gets one emailed (webhooks are the
    // fast path; this catches missed webhooks and sync-detected flags).
    repair_links: await sweepRepairLinks().catch((err: any) => ({ error: String(err?.message ?? err) })),
    // Retire items on dead leads afterwards so the monthly Transactions
    // subscription stops accruing on files that will never fund.
    retired: await retireStaleItems().catch((err: any) => ({ error: String(err?.message ?? err) })),
  }),
  // Prospect follow-ups for pending connect links (quiet-hours aware).
  "plaid-link-nudges": () => sendConnectReminders(),
  // Lifecycle emails (see _shared/lifecycle.ts) — all idempotent, merchant
  // sends are quiet-hours aware.
  "mpa-stall-reminders": () => mpaStallReminders(),
  "deal-status-notify": () => dealStatusNotify(),
  "sla-watch": () => slaWatch(),
  "stale-lead-digest": () => staleLeadDigest(),
  "capital-renewal-sweep": () => capitalRenewalSweep(),
  "growth-sweep": () => growthSweep(),
  "email-health-digest": () => emailHealthDigest(),
  "meta-insights": () => syncMeta(90),
  // syncMetaLeads already reconciles matches against pipeline_leads
  "meta-leads": () => syncMetaLeads(),
  "docusign-sweep": () => sweepInFlightEnvelopes(50),
};

app.post("/make-server-940653c6/jobs", async (c) => {
  if (!(await verifyCronSecret(c.req.raw))) {
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
// Public deltpay.com intake (/apply application + /get-a-quote quiz) —
// browser-callable with the anon key only (same posture as the
// pricing-guide capture above). Creates or matches a Processing lead.
// Plaid is Capital-only: a hosted connect link is returned ONLY when
// capitalInterest is set (the quiz's Capital feature card); connection
// then completes via webhook with no client Plaid SDK. Guards mirror
// mpa-application self-start: honeypot → fake success, email
// validation, and an hourly cap on new leads per source.
// ────────────────────────────────────────────────────────────────

app.post("/make-server-940653c6/apply/intake", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));

    // Honeypot: bots fill hidden fields — pretend success, create nothing.
    if (
      (typeof body.company_website === "string" && body.company_website.trim() !== "") ||
      (typeof body.hp_extra_field === "string" && body.hp_extra_field.trim() !== "")
    ) {
      return c.json({ ok: true });
    }

    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) || rawEmail.length > 254) {
      return c.json({ ok: false, error: "Please enter a valid email." }, 400);
    }
    const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 200) : "";
    const businessName = typeof body.businessName === "string" ? body.businessName.trim().slice(0, 200) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    const businessType = typeof body.businessType === "string" ? body.businessType.trim().slice(0, 40) : "";
    const capitalInterest = body.capitalInterest === true;
    const origin = body.origin === "quiz" ? "quiz" as const : "application" as const;

    // Throttle: cap brand-new leads at 20/hour per public source, so a
    // quiz burst can't starve /apply and vice versa. (Resubmits that
    // match an existing lead don't insert a row and stay cheap.)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await svc()
      .from("pipeline_leads")
      .select("id", { count: "exact", head: true })
      .eq("source", origin === "quiz" ? "deltpay.com quiz" : "deltpay.com application")
      .gte("created_at", hourAgo);
    if ((count ?? 0) >= 20) {
      return c.json({ ok: false, error: "We're receiving a lot of applications right now — please try again in a bit." }, 429);
    }

    const out = await applyIntake({
      email: rawEmail,
      fullName: fullName || undefined,
      businessName: businessName || undefined,
      phone: phone || undefined,
      businessType: businessType || undefined,
      capitalInterest,
      origin,
    });
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("apply intake error", err);
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
        linkSessionId:
          typeof applicant.linkSessionId === "string" ? applicant.linkSessionId.slice(0, 64) : undefined,
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

// Link funnel telemetry from the deltcapital.com application (opened /
// exit / error from the applicant's Link session). Same x-apply-secret
// gate as the exchange; strictly fire-and-forget — always returns 200
// so a telemetry hiccup can never surface in the applicant flow.
app.post("/make-server-940653c6/apply/plaid-link-event", async (c) => {
  if (!verifyApplySecret(c.req.raw)) {
    return c.json({ ok: false, error: "Forbidden" }, 403);
  }
  const allowed = new Set(["opened", "exit", "error"]);
  try {
    const body = await c.req.json().catch(() => ({}));
    const event = String(body.event ?? "");
    if (!allowed.has(event)) return c.json({ ok: false, error: "invalid event" }, 400);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    recordLinkEvent({
      event: event as "opened" | "exit" | "error",
      linkSessionId: body.linkSessionId ? String(body.linkSessionId).slice(0, 64) : null,
      errorCode: body.errorCode ? String(body.errorCode).slice(0, 64) : null,
      institution: body.institution ? String(body.institution).slice(0, 120) : null,
      meta: { surface: "apply", ...(email ? { email } : {}) },
    });
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: true });
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
    optional_products: cfg.optionalProducts,
    monitor_configured: Boolean(cfg.monitorProgramId),
    idv_configured: Boolean(cfg.idvTemplateId),
    recurring_enabled: cfg.recurringEnabled,
    retire_after_days: cfg.retireAfterDays,
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
    const leadId = body.leadId ? String(body.leadId) : undefined;
    // Best-effort sweep of pending hosted-link invites first, so a bank the
    // prospect connected on their phone shows up on this very sync.
    await sweepHostedLinks(leadId).catch(() => {});
    const results = await syncAllItems(leadId);
    return c.json({ ok: true, results });
  } catch (err: any) {
    console.error("plaid sync-all error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Mint a Plaid-hosted connect URL for a prospect. Staff text/email it;
// the prospect completes Link on their own device and the connection is
// exchanged into the vault by webhook (or the sweep above).
app.post(`${PLAID_BASE}/hosted-link`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await createHostedLink(leadId);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid hosted-link error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Start a Plaid IDV session for a prospect. Requires PLAID_IDV_TEMPLATE_ID;
// the returned shareable_url is a hosted flow staff send to the applicant.
app.post(`${PLAID_BASE}/idv/create`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await createIdentityVerification(leadId);
    return c.json(out);
  } catch (err: any) {
    console.error("plaid idv create error", err);
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

// Retry a failed/expired IDV session — Plaid mints a fresh session for the
// same user + template; the new session is filed on the lead and its
// shareable_url is returned for sending to the applicant.
app.post(`${PLAID_BASE}/idv/retry`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    const idvId = String(body.identityVerificationId ?? "").trim();
    const strategy = String(body.strategy ?? "reset");
    if (!leadId || !idvId) {
      return c.json({ ok: false, error: "leadId and identityVerificationId are required" }, 400);
    }
    const out = await retryIdentityVerification(leadId, idvId, strategy);
    return c.json(out);
  } catch (err: any) {
    console.error("plaid idv retry error", err);
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

// Bill Auth + Identity deliberately — "this file advanced to underwriting".
// Body: { leadId } (verify every connection) or { itemId } (just one).
app.post(`${PLAID_BASE}/verify`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    const itemId = String(body.itemId ?? "");
    if (!leadId && !itemId) return c.json({ ok: false, error: "leadId or itemId is required" }, 400);
    const out = itemId ? await verifyItem(itemId) : await verifyLead(leadId);
    return c.json({ ok: true, results: out });
  } catch (err: any) {
    console.error("plaid verify error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Decision-time freshness: ask the banks for brand-new transactions now
// (per-call fee). The TRANSACTIONS webhook auto-syncs the vault when the
// fresh data lands.
app.post(`${PLAID_BASE}/refresh`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await refreshLeadTransactions(leadId);
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid refresh error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Real-time balances (per-call fee) — run right before an ACH pull.
app.post(`${PLAID_BASE}/balance`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await realtimeBalances(leadId);
    return c.json({ ok: true, results: out });
  } catch (err: any) {
    console.error("plaid balance error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Monitor — ongoing watchlist screening; reserve for funded merchants.
app.post(`${PLAID_BASE}/monitor/screen`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const leadId = String(body.leadId ?? "");
    if (!leadId) return c.json({ ok: false, error: "leadId is required" }, 400);
    const out = await screenLead(leadId, {
      legalName: body.legalName ? String(body.legalName) : undefined,
      dateOfBirth: body.dateOfBirth ? String(body.dateOfBirth) : undefined,
      country: body.country ? String(body.country) : undefined,
    });
    return c.json(out);
  } catch (err: any) {
    console.error("plaid monitor screen error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

app.post(`${PLAID_BASE}/monitor/refresh`, needPerm("underwriting.review"), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const screeningId = String(body.screeningId ?? "");
    if (!screeningId) return c.json({ ok: false, error: "screeningId is required" }, 400);
    const out = await refreshScreening(screeningId);
    return c.json(out);
  } catch (err: any) {
    console.error("plaid monitor refresh error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// ── Link update mode: repair an existing connection in place ──
// (re-auth after ITEM_LOGIN_REQUIRED, consent repair after
// ADDITIONAL_CONSENT_REQUIRED, pre-emptive fix for PENDING_* warnings)

// Token for the CRM's in-app "Reconnect now" (staff with the merchant).
app.post(`${PLAID_BASE}/items/:itemId/update-link-token`, needPerm("underwriting.review"), async (c) => {
  try {
    const out = await createUpdateLinkToken(
      c.req.param("itemId"),
      String(c.get("staffUserId" as never) ?? ""),
    );
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid update-link-token error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Hosted repair link — emailed to the prospect to reconnect on their own
// device (same rail as "Send connect link").
app.post(`${PLAID_BASE}/items/:itemId/repair-link`, needPerm("underwriting.review"), async (c) => {
  try {
    const out = await createUpdateLinkToken(
      c.req.param("itemId"),
      String(c.get("staffUserId" as never) ?? ""),
      { hosted: true },
    );
    return c.json({ ok: true, ...out });
  } catch (err: any) {
    console.error("plaid repair-link error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Called by the CRM after an in-app update-mode Link session succeeds.
app.post(`${PLAID_BASE}/items/:itemId/repair-complete`, needPerm("underwriting.review"), async (c) => {
  try {
    const out = await markItemRepaired(c.req.param("itemId"));
    return c.json(out);
  } catch (err: any) {
    console.error("plaid repair-complete error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Link funnel telemetry from the CRM's Link handlers (onEvent / onExit).
// Fire-and-forget on the client; never fails the caller.
app.post(`${PLAID_BASE}/link-event`, needPerm("underwriting.review"), async (c) => {
  const allowed = new Set(["opened", "exit", "error"]);
  try {
    const body = await c.req.json().catch(() => ({}));
    const event = String(body.event ?? "");
    if (!allowed.has(event)) return c.json({ ok: false, error: "invalid event" }, 400);
    recordLinkEvent({
      event: event as "opened" | "exit" | "error",
      leadId: body.leadId ? String(body.leadId) : null,
      itemId: body.itemId ? String(body.itemId) : null,
      linkSessionId: body.linkSessionId ? String(body.linkSessionId) : null,
      errorCode: body.errorCode ? String(body.errorCode) : null,
      institution: body.institution ? String(body.institution) : null,
      meta: typeof body.meta === "object" && body.meta ? body.meta : {},
    });
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: true }); // telemetry must never break the UI
  }
});

// Retire (stop billing, keep vault data) — the gentle alternative to DELETE.
app.post(`${PLAID_BASE}/items/:itemId/retire`, needPerm("underwriting.review"), async (c) => {
  try {
    const out = await retireItem(c.req.param("itemId"));
    return c.json(out);
  } catch (err: any) {
    console.error("plaid retire error", err);
    return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});

// Per-lead Plaid spend summary from the billable-call ledger.
app.get(`${PLAID_BASE}/usage`, needPerm("underwriting.view"), async (c) => {
  try {
    const leadId = c.req.query("leadId") ?? "";
    const db = svc();
    let q = db
      .from("plaid_api_events")
      .select("product, pricing_model, lead_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (leadId) q = q.eq("lead_id", leadId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const byProduct: Record<string, { calls: number; pricing_model: string }> = {};
    for (const row of data ?? []) {
      if (row.status !== "ok") continue;
      const key = row.product;
      byProduct[key] = byProduct[key] ?? { calls: 0, pricing_model: row.pricing_model };
      byProduct[key].calls++;
    }
    return c.json({ ok: true, events: (data ?? []).length, by_product: byProduct });
  } catch (err: any) {
    console.error("plaid usage error", err);
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
