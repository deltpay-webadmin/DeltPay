/**
 * ────────────────────────────────────────────────────────────────
 * Plaid engine (shared by the Hono server + the public webhook fn)
 * ────────────────────────────────────────────────────────────────
 * Everything Plaid: link-token creation, public-token exchange, item
 * sync (accounts/auth, identity, transactions, liabilities), cash-flow
 * analysis, and writes into the hierarchical `plaid_nodes` vault.
 *
 * Vault layout (path-keyed, object-storage style):
 *
 *   /prospects
 *   /prospects/{leadId}                                  ← folder per lending prospect
 *   /prospects/{leadId}/summary                          ← rollup document
 *   /prospects/{leadId}/identity/{itemKey}               ← identity verification per institution
 *   /prospects/{leadId}/bank-verification/{itemKey}/{accountId}
 *   /prospects/{leadId}/financials/{itemKey}/transactions/{YYYY-MM}
 *   /prospects/{leadId}/financials/cash-flow-analysis
 *   /prospects/{leadId}/credit/{itemKey}                 ← liabilities / credit data
 *   /prospects/{leadId}/decisioning/underwriting-inputs  ← PlaidInputs for the scoring engine
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV (sandbox|production),
 *   PLAID_PRODUCTS (optional, default "auth,transactions,identity")
 */

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2.49.8";
import { runDecisionModel, MODEL_VERSION, type ModelInput } from "./decision_model.ts";
import {
  emailConfigured,
  withinSendWindow,
  sendEmail,
  notifyStaff,
  connectLinkEmail,
  reminderEmail,
  repairLinkEmail,
  connectedProspectEmail,
  connectedStaffEmail,
  expiredStaffEmail,
} from "./plaid_notify.ts";

// ══════════════════════════════════════════════════════════════
// Config
// ══════════════════════════════════════════════════════════════

// Plaid retired the "development" environment in 2024 — sandbox and
// production are the only valid values for PLAID_ENV.
export const PLAID_HOSTS: Record<string, string> = {
  sandbox: "https://sandbox.plaid.com",
  production: "https://production.plaid.com",
};

export function plaidConfig() {
  const clientId = Deno.env.get("PLAID_CLIENT_ID") ?? "";
  const secret = Deno.env.get("PLAID_SECRET") ?? "";
  const rawEnv = Deno.env.get("PLAID_ENV");
  const env = (rawEnv ?? "sandbox").toLowerCase();
  // Cost posture: Transactions is the only product billed at link time
  // (monthly subscription per item). Auth + Identity ride along as
  // optional_products — Plaid does not charge one-time-fee products added
  // via optional_products until their endpoint is actually called, so
  // verification is a deliberate, per-file spend (see verifyItem below).
  const products = (Deno.env.get("PLAID_PRODUCTS") ?? "transactions")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  // Extra products requested opportunistically on link tokens. Production
  // rejects link-token creation outright when the account isn't enabled
  // for a listed product, even an optional one — Delt is approved for
  // auth + identity, so they are safe defaults here.
  const optionalProducts = (Deno.env.get("PLAID_OPTIONAL_PRODUCTS") ?? "auth,identity")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  // Restore the old bill-everything-at-connect behavior if ever needed.
  const eagerVerification = (Deno.env.get("PLAID_EAGER_VERIFICATION") ?? "").toLowerCase() === "true";
  // Recurring Transactions is a separately billed subscription add-on —
  // never call it unless explicitly enabled for the Plaid account.
  const recurringEnabled = (Deno.env.get("PLAID_RECURRING_ENABLED") ?? "").toLowerCase() === "true";
  // Monitor (ongoing watchlist screening) — required for screenLead().
  const monitorProgramId = (Deno.env.get("PLAID_MONITOR_PROGRAM_ID") ?? "").trim();
  // Auto-retire Plaid items on dead leads after this many days of lead
  // inactivity (ends the monthly Transactions subscription). 0 disables.
  const retireAfterDays = Number(Deno.env.get("PLAID_RETIRE_AFTER_DAYS") ?? "30") || 0;
  return {
    clientId,
    secret,
    env,
    // Unset PLAID_ENV falls back to sandbox (never accidentally production);
    // an unrecognized value fails closed in plaid() instead of silently
    // hitting the sandbox host with production credentials.
    envSource: (rawEnv == null ? "default" : "env") as "default" | "env",
    envValid: env in PLAID_HOSTS,
    products,
    optionalProducts,
    eagerVerification,
    recurringEnabled,
    monitorProgramId,
    retireAfterDays,
    host: PLAID_HOSTS[env] ?? "",
    redirectUri: Deno.env.get("PLAID_REDIRECT_URI") ?? "",
    configured: Boolean(clientId && secret),
  };
}

export function webhookUrl(): string {
  const base = Deno.env.get("SUPABASE_URL") ?? "";
  return base ? `${base}/functions/v1/plaid-webhook` : "";
}

/** The brand shown inside Plaid Link. One name on every surface — the
 * merchant is always the person consenting, whether staff-assisted in
 * the CRM or self-serve on a Plaid-hosted page. */
export function plaidClientName(): string {
  return (Deno.env.get("PLAID_CLIENT_NAME") ?? "").trim() || "Delt Capital";
}

export function svc(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ──────────────────────────────────────────────────────────────
// Billable-call ledger — one plaid_api_events row per call that
// costs money, so spend is attributable per lead and per product.
// Mirrors the AI metering rule: bookkeeping must never break the
// feature it measures (inserts are fire-and-forget).
// ──────────────────────────────────────────────────────────────

interface PlaidCallCtx {
  itemId?: string;
  leadId?: string;
}

const BILLABLE: Record<string, { product: string; pricing: string }> = {
  "/auth/get": { product: "auth", pricing: "one_time" },
  "/identity/get": { product: "identity", pricing: "one_time" },
  "/transactions/sync": { product: "transactions", pricing: "subscription" },
  "/transactions/refresh": { product: "transactions_refresh", pricing: "per_request" },
  "/transactions/recurring/get": { product: "recurring_transactions", pricing: "subscription" },
  "/accounts/balance/get": { product: "balance", pricing: "per_request" },
  "/asset_report/create": { product: "assets", pricing: "per_report" },
  "/identity_verification/get": { product: "identity_verification", pricing: "per_event" },
  "/identity_verification/retry": { product: "identity_verification", pricing: "per_event" },
  "/liabilities/get": { product: "liabilities", pricing: "subscription" },
  "/investments/holdings/get": { product: "investments", pricing: "subscription" },
  "/watchlist_screening/individual/create": { product: "monitor", pricing: "per_event" },
};

function logPlaidCall(
  path: string,
  ctx: PlaidCallCtx | undefined,
  status: "ok" | "error",
  meta?: Record<string, unknown>,
) {
  const billable = BILLABLE[path];
  if (!billable) return; // link/item/institution/accounts-get calls are free
  try {
    svc()
      .from("plaid_api_events")
      .insert({
        product: billable.product,
        endpoint: path,
        pricing_model: billable.pricing,
        item_id: ctx?.itemId ?? null,
        lead_id: ctx?.leadId ?? null,
        status,
        ...(meta && Object.keys(meta).length ? { meta } : {}),
      })
      .then(({ error }) => {
        if (error) console.error("plaid_api_events insert failed:", error.message);
      });
  } catch (err) {
    console.error("plaid_api_events logging failed:", err);
  }
}

// ──────────────────────────────────────────────────────────────
// Link funnel telemetry — one plaid_link_events row per observable
// step of a connect or repair journey (token created → link sent →
// opened → session finished → exchanged → first sync, plus exits,
// errors, and webhook callbacks). Same rule as the billable ledger:
// telemetry must never break the flow it observes.
// ──────────────────────────────────────────────────────────────

type LinkEventName =
  | "created"
  | "sent"
  | "opened"
  | "callback"
  | "session_finished"
  | "exchanged"
  | "first_sync"
  | "exit"
  | "error";

/** Plaid error codes that mean "get the user back into Link" (update
 * mode) rather than a hard technical failure. */
export const REPAIR_ERROR_CODES = new Set([
  "ITEM_LOGIN_REQUIRED",
  "ADDITIONAL_CONSENT_REQUIRED",
  "ACCESS_NOT_GRANTED",
  "PENDING_EXPIRATION",
  "PENDING_DISCONNECT",
  "USER_PERMISSION_REVOKED",
]);

export function recordLinkEvent(evt: {
  event: LinkEventName;
  leadId?: string | null;
  itemId?: string | null;
  linkToken?: string | null;
  linkSessionId?: string | null;
  errorCode?: string | null;
  institution?: string | null;
  requestId?: string | null;
  meta?: Record<string, unknown>;
}): void {
  try {
    svc()
      .from("plaid_link_events")
      .insert({
        event: evt.event,
        lead_id: evt.leadId ?? null,
        item_id: evt.itemId ?? null,
        link_token: evt.linkToken ?? null,
        link_session_id: evt.linkSessionId ?? null,
        error_code: evt.errorCode ?? null,
        institution: evt.institution ?? null,
        request_id: evt.requestId ?? null,
        meta: evt.meta ?? {},
      })
      .then(({ error }) => {
        if (error) console.error("plaid_link_events insert failed:", error.message);
      });
  } catch (err) {
    console.error("plaid_link_events logging failed:", err);
  }
}

/** Raw Plaid API call. Throws with Plaid's error_message on failure. */
async function plaid(path: string, body: Record<string, unknown>, ctx?: PlaidCallCtx): Promise<any> {
  const cfg = plaidConfig();
  if (!cfg.configured) {
    throw new Error(
      "Plaid credentials not configured. Add PLAID_CLIENT_ID and PLAID_SECRET as Edge Function secrets.",
    );
  }
  if (!cfg.envValid) {
    throw new Error(
      `PLAID_ENV "${cfg.env}" is not valid. Set the PLAID_ENV edge-function secret to "sandbox" or "production".`,
    );
  }
  const res = await fetch(`${cfg.host}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: cfg.clientId, secret: cfg.secret, ...body }),
  });
  const json = await res.json().catch(() => ({}));
  // Plaid returns a request_id on every response — persisting it is what
  // makes a support ticket to Plaid actionable.
  const requestId: string | null = json?.request_id ?? null;
  if (!res.ok) {
    logPlaidCall(path, ctx, "error", {
      ...(requestId ? { request_id: requestId } : {}),
      ...(json?.error_code ? { error_code: json.error_code } : {}),
    });
    const msg = json?.error_message || json?.error_code || `Plaid ${path} failed (${res.status})`;
    const err = new Error(msg) as Error & { plaid?: any; plaidRequestId?: string | null };
    err.plaid = json;
    err.plaidRequestId = requestId;
    throw err;
  }
  logPlaidCall(path, ctx, "ok", requestId ? { request_id: requestId } : undefined);
  return json;
}

// ══════════════════════════════════════════════════════════════
// Staff auth (mirrors the CRM's is_staff() RLS gate)
// ══════════════════════════════════════════════════════════════

export async function verifyStaff(authHeader: string | undefined): Promise<
  { ok: true; userId: string } | { ok: false; status: number; error: string }
> {
  const token = (authHeader ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Missing Authorization token" };
  const db = svc();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, status: 401, error: "Sign in required" };
  }
  const { data: staff } = await db
    .from("staff_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!staff) return { ok: false, status: 403, error: "Staff access required" };
  return { ok: true, userId: data.user.id };
}

// ══════════════════════════════════════════════════════════════
// Vault writers
// ══════════════════════════════════════════════════════════════

interface NodeRow {
  path: string;
  name: string;
  node_type: "folder" | "document";
  doc_kind?: string | null;
  lead_id?: string | null;
  item_id?: string | null;
  data?: Record<string, unknown>;
}

function folderRow(path: string, name: string, leadId?: string | null, itemId?: string | null): NodeRow {
  return { path, name, node_type: "folder", lead_id: leadId ?? null, item_id: itemId ?? null, data: {} };
}

/** Upsert a batch of nodes; folders use ignoreDuplicates so re-syncs don't churn. */
async function writeNodes(db: SupabaseClient, folders: NodeRow[], docs: NodeRow[]) {
  if (folders.length) {
    const { error } = await db
      .from("plaid_nodes")
      .upsert(folders, { onConflict: "path", ignoreDuplicates: true });
    if (error) throw new Error(`vault folder write failed: ${error.message}`);
  }
  if (docs.length) {
    const { error } = await db.from("plaid_nodes").upsert(docs, { onConflict: "path" });
    if (error) throw new Error(`vault document write failed: ${error.message}`);
  }
}

/** Parse a money-ish string ("$75,000") into a number. */
function parseMoney(v: unknown): number {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function slugify(s: string): string {
  return (
    (s || "institution")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "institution"
  );
}

// ══════════════════════════════════════════════════════════════
// Cash-flow analysis → PlaidInputs for the underwriting engine
// ══════════════════════════════════════════════════════════════

interface Txn {
  transaction_id: string;
  account_id: string;
  amount: number; // Plaid: > 0 money out, < 0 money in
  date: string;
  authorized_date?: string | null;
  name?: string;
  merchant_name?: string | null;
  pending?: boolean;
  personal_finance_category?: { primary?: string } | null;
}

const NSF_RE = /nsf|insufficient|overdraft|returned\s*item|return\s*fee/i;
const TRANSFER_RE = /^TRANSFER_IN|^TRANSFER_OUT|^LOAN_PAYMENTS/;

function monthOf(t: Txn): string {
  return (t.authorized_date || t.date || "").slice(0, 7);
}

export function computeCashFlow(transactions: Txn[], depositoryBalance: number) {
  const settled = transactions.filter((t) => !t.pending && t.date);
  const today = new Date();
  const dayMs = 86_400_000;

  // ── Monthly inflow/outflow buckets ──
  const months = new Map<string, { inflows: number; outflows: number; revenue: number; count: number }>();
  for (const t of settled) {
    const m = monthOf(t);
    if (!m) continue;
    const b = months.get(m) ?? { inflows: 0, outflows: 0, revenue: 0, count: 0 };
    const cat = t.personal_finance_category?.primary ?? "";
    if (t.amount < 0) {
      b.inflows += -t.amount;
      // Revenue = inflows excluding obvious internal transfers / loan proceeds
      if (!TRANSFER_RE.test(cat)) b.revenue += -t.amount;
    } else {
      b.outflows += t.amount;
    }
    b.count++;
    months.set(m, b);
  }
  const monthKeys = [...months.keys()].sort();
  const monthly = monthKeys.map((m) => ({ month: m, ...months.get(m)! }));

  // Last 3 *complete-ish* months for revenue stats (drop current partial month
  // when there are at least 3 prior months of data).
  const currentMonth = today.toISOString().slice(0, 7);
  let window = monthly.filter((m) => m.month !== currentMonth).slice(-3);
  if (window.length === 0) window = monthly.slice(-3);
  const revs = window.map((m) => m.revenue);
  const mean = revs.length ? revs.reduce((a, b) => a + b, 0) / revs.length : 0;
  const variance = revs.length
    ? revs.reduce((a, b) => a + (b - mean) ** 2, 0) / revs.length
    : 0;
  const stdDevPct = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const first = revs[0] ?? 0;
  const last = revs[revs.length - 1] ?? 0;
  const change3mo = first > 0 ? (last - first) / first : 0;
  const trend = change3mo > 0.05 ? "growing" : change3mo < -0.05 ? "declining" : "flat";

  // ── NSF activity (last 90 days) ──
  const cutoff90 = new Date(today.getTime() - 90 * dayMs);
  let nsfCount90d = 0;
  let lastNsf: Date | null = null;
  for (const t of settled) {
    if (!NSF_RE.test(t.name ?? "")) continue;
    const d = new Date(t.date);
    if (d >= cutoff90) nsfCount90d++;
    if (!lastNsf || d > lastNsf) lastNsf = d;
  }
  const daysSinceLastNsf = lastNsf
    ? Math.max(0, Math.round((today.getTime() - lastNsf.getTime()) / dayMs))
    : 9999;

  // ── Deposit concentration (share of largest inflow counterparty, 90d) ──
  const bySource = new Map<string, number>();
  let totalIn90 = 0;
  for (const t of settled) {
    if (t.amount >= 0) continue;
    if (new Date(t.date) < cutoff90) continue;
    const key = (t.merchant_name || t.name || "unknown").toLowerCase().slice(0, 60);
    bySource.set(key, (bySource.get(key) ?? 0) + -t.amount);
    totalIn90 += -t.amount;
  }
  const topShare = totalIn90 > 0 ? Math.max(...bySource.values()) / totalIn90 : 0;
  const depositConcentration =
    topShare > 0.6 ? "concentrated" : topShare > 0.35 ? "moderate" : "diversified";

  // ── Daily balance series, reconstructed backwards from today's balance ──
  // balance(day-1, end) = balance(day, end) + Σ amounts settled on `day`
  // (Plaid amounts: outflow positive, inflow negative.)
  const byDay = new Map<string, number>();
  for (const t of settled) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount);
  const series: { date: string; balance: number }[] = [];
  let bal = depositoryBalance;
  for (let i = 0; i < 90; i++) {
    const d = new Date(today.getTime() - i * dayMs).toISOString().slice(0, 10);
    series.push({ date: d, balance: Math.round(bal * 100) / 100 });
    bal += byDay.get(d) ?? 0;
  }
  series.reverse();
  const balances = series.map((s) => s.balance);
  const avgDailyBalance = balances.length
    ? Math.round(balances.reduce((a, b) => a + b, 0) / balances.length)
    : 0;
  const minDailyBalance = balances.length ? Math.round(Math.min(...balances)) : 0;

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    monthly: monthly.map((m) => ({
      month: m.month,
      inflows: round(m.inflows),
      outflows: round(m.outflows),
      revenue: round(m.revenue),
      transactions: m.count,
    })),
    balanceSeries: series,
    metrics: {
      monthlyRevenue: Math.round(mean),
      revenueStdDevPct: round(stdDevPct),
      revenueTrend: trend as "growing" | "flat" | "declining",
      revenueChange3moPct: round(change3mo),
      nsfCount90d,
      daysSinceLastNsf,
      depositConcentration: depositConcentration as "diversified" | "moderate" | "concentrated",
      avgDailyBalance,
      minDailyBalance,
      topDepositorSharePct: round(topShare),
      transactionCount: settled.length,
      monthsOfData: monthly.length,
    },
  };
}

// ══════════════════════════════════════════════════════════════
// Item lifecycle
// ══════════════════════════════════════════════════════════════

export async function createLinkToken(leadId: string, userId: string) {
  const cfg = plaidConfig();
  const req: Record<string, unknown> = {
    user: { client_user_id: userId || leadId || "delt-crm" },
    client_name: plaidClientName(),
    language: "en",
    country_codes: ["US"],
    products: cfg.products,
  };
  if (cfg.optionalProducts.length) req.optional_products = cfg.optionalProducts;
  const hook = webhookUrl();
  if (hook) req.webhook = hook;
  // OAuth institutions (Chase etc.) require a redirect_uri that exactly
  // matches one registered in the Plaid dashboard → API → Allowed redirect URIs.
  if (cfg.redirectUri) req.redirect_uri = cfg.redirectUri;
  const out = await plaid("/link/token/create", req);
  recordLinkEvent({
    event: "created",
    leadId,
    linkToken: out.link_token,
    meta: { mode: "add", surface: "crm" },
  });
  return { link_token: out.link_token, expiration: out.expiration };
}

export async function exchangePublicToken(
  leadId: string,
  publicToken: string,
  institution?: { institution_id?: string; name?: string },
  extras?: { linkSessionId?: string | null },
) {
  const db = svc();
  const cfg = plaidConfig();
  const ex = await plaid("/item/public_token/exchange", { public_token: publicToken });
  const itemId: string = ex.item_id;
  const accessToken: string = ex.access_token;

  let instId = institution?.institution_id ?? "";
  let instName = institution?.name ?? "";
  if (!instName) {
    try {
      const item = await plaid("/item/get", { access_token: accessToken });
      instId = item?.item?.institution_id ?? instId;
      if (instId) {
        const inst = await plaid("/institutions/get_by_id", {
          institution_id: instId,
          country_codes: ["US"],
        });
        instName = inst?.institution?.name ?? "";
      }
    } catch {
      /* institution metadata is cosmetic — never fail the exchange over it */
    }
  }
  const itemKey = `${slugify(instName || instId || "bank")}-${itemId.slice(-4).toLowerCase()}`;

  // Duplicate-connection guard: the same bank actively connected for this
  // lead already. Warn-only — the older item may hold cursor/history state
  // for a legitimately re-linked bank, so nothing is removed automatically.
  let duplicateOf: string | null = null;
  if (instId) {
    try {
      const { data: dupes } = await db
        .from("plaid_items")
        .select("item_id")
        .eq("lead_id", leadId)
        .eq("institution_id", instId)
        .eq("status", "active")
        .neq("item_id", itemId)
        .limit(1);
      duplicateOf = dupes?.[0]?.item_id ?? null;
    } catch { /* guard is best-effort */ }
  }

  const { error: itemErr } = await db.from("plaid_items").upsert(
    {
      item_id: itemId,
      lead_id: leadId,
      institution_id: instId || null,
      institution_name: instName || null,
      item_key: itemKey,
      products: cfg.products,
      status: "active",
      error: null,
      error_code: null,
    },
    { onConflict: "item_id" },
  );
  if (itemErr) throw new Error(`Failed to save Plaid item: ${itemErr.message}`);

  const { error: credErr } = await db
    .from("plaid_credentials")
    .upsert({ item_id: itemId, access_token: accessToken }, { onConflict: "item_id" });
  if (credErr) throw new Error(`Failed to save Plaid credentials: ${credErr.message}`);

  recordLinkEvent({
    event: "exchanged",
    leadId,
    itemId,
    linkSessionId: extras?.linkSessionId ?? null,
    institution: instName || instId || null,
    meta: duplicateOf ? { duplicate_of: duplicateOf } : {},
  });

  // The connection is established at this point — a failed first sync
  // (consent gap, PRODUCT_NOT_READY race, bank hiccup) must not fail the
  // exchange. syncItem already flagged the item; the CRM shows "reconnect
  // needed"/"verifying" and the webhook/repair machinery takes it from here.
  let sync: any;
  try {
    sync = await syncItem(itemId);
  } catch (err: any) {
    sync = {
      ok: false,
      item_id: itemId,
      error: String(err?.message ?? err),
      error_code: err?.plaid?.error_code ?? null,
    };
  }
  return { item_id: itemId, item_key: itemKey, institution_name: instName, sync, duplicate_of: duplicateOf };
}

/** Sandbox-only: create + exchange a test item without going through Link. */
export async function sandboxQuickConnect(leadId: string, institutionId = "ins_109508") {
  const cfg = plaidConfig();
  if (cfg.env !== "sandbox") {
    throw new Error("Sandbox quick-connect is only available when PLAID_ENV=sandbox.");
  }
  const hook = webhookUrl();
  const out = await plaid("/sandbox/public_token/create", {
    institution_id: institutionId,
    initial_products: cfg.products,
    ...(hook ? { options: { webhook: hook } } : {}),
  });
  return exchangePublicToken(leadId, out.public_token);
}

// ══════════════════════════════════════════════════════════════
// Applicant-side exchange (deltcapital.com funding application)
// ══════════════════════════════════════════════════════════════
// The public /apply flow on deltcapital.com mints its own link tokens
// (same Plaid client, its own PLAID_ENV) and forwards the resulting
// public_token here so the connection lands in the vault instead of
// being discarded. The public_token is env-bound: if the application
// runs on a different PLAID_ENV than these edge functions, the
// exchange fails with INVALID_PUBLIC_TOKEN and the caller falls back
// to its local, non-persisting exchange.

export interface ApplyApplicant {
  email: string;
  fullName?: string;
  businessName?: string;
  /** The deltcapital.com lead uuid (delt_capital.leads.id), if known. */
  leadId?: string;
  /** Plaid Link session id from the applicant's Link flow — funnel telemetry. */
  linkSessionId?: string;
}

/** Match an applicant to a pipeline lead by email, or create one using the
 * same conventions as the Meta lead import (see meta.ts importMetaLeads). */
async function resolveApplyLead(applicant: ApplyApplicant): Promise<string> {
  const db = svc();
  const email = applicant.email.trim().toLowerCase();

  // ilike with no wildcards = case-insensitive equality in PostgREST.
  const { data: matches } = await db
    .from("pipeline_leads")
    .select("id, created_at")
    .ilike("contact_email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  if (matches?.length) return matches[0].id as string;

  const id = `lead-app-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const name = applicant.businessName || applicant.fullName || email;
  const { error } = await db.from("pipeline_leads").insert({
    id,
    products: ["Capital"],
    business_name: name,
    contact_name: applicant.fullName ?? null,
    contact_email: email,
    source: "deltcapital.com application",
    stage: "New",
    status: "New",
    external_id: applicant.leadId ? `apply:${applicant.leadId}` : null,
    timeline: [{
      date: now,
      event: "Created from the deltcapital.com funding application (bank connected via Plaid).",
    }],
  });
  if (error) throw new Error(`Failed to create pipeline lead for applicant: ${error.message}`);
  return id;
}

/** Exchange + store + sync a connection made by an applicant, and return
 * the friendly account summary the application UI renders. */
export async function applyPlaidExchange(
  publicToken: string,
  applicant: ApplyApplicant,
  institution?: { institution_id?: string; name?: string },
) {
  const leadId = await resolveApplyLead(applicant);
  const out = await exchangePublicToken(leadId, publicToken, institution, {
    linkSessionId: applicant.linkSessionId ?? null,
  });

  // Friendly summary for the applicant-facing UI (name/mask/subtype only).
  let accounts: { name: string; mask: string; subtype: string }[] = [];
  try {
    const { accessToken } = await loadItem(out.item_id);
    const res = await plaid("/accounts/get", { access_token: accessToken });
    accounts = (res.accounts ?? []).map((a: any) => ({
      name: a.name || a.official_name || "Account",
      mask: a.mask || "",
      subtype: a.subtype || a.type || "",
    }));
  } catch { /* summary is cosmetic — the item is already stored + synced */ }

  // Timeline note so the CRM shows how the connection arrived.
  try {
    const db = svc();
    const { data: lead } = await db
      .from("pipeline_leads").select("timeline").eq("id", leadId).maybeSingle();
    const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    timeline.push({
      date: new Date().toISOString(),
      event: `Bank connected via the deltcapital.com application (${out.institution_name || "bank"}).`,
    });
    await db.from("pipeline_leads").update({ timeline }).eq("id", leadId);

    // Instant staff heads-up — the apply flow shows the prospect their own
    // on-screen confirmation, so only the internal notification goes out.
    const staffTpl = connectedStaffEmail({
      businessName: applicant.businessName || applicant.fullName || applicant.email,
      leadId,
      institution: out.institution_name || "",
      source: "deltcapital.com application",
      accounts: accounts.length || undefined,
    });
    notifyStaff(staffTpl.subject, staffTpl.html).catch(() => {});
  } catch { /* best-effort */ }

  return {
    lead_id: leadId,
    item_id: out.item_id,
    institution_name: out.institution_name,
    accounts,
  };
}

// ══════════════════════════════════════════════════════════════
// Hosted Link (send the prospect a connect-your-bank URL)
// ══════════════════════════════════════════════════════════════
// Staff can't type a customer's bank credentials, so the CRM's local
// Link button only works with the customer present. Hosted Link flips
// the flow: mint a link token with hosted_link enabled, hand staff the
// returned URL to text/email, and the prospect completes Link on their
// own device on a Plaid-hosted page. Completion lands here two ways
// (either wins, both are idempotent via the request row's status):
//   1. LINK / SESSION_FINISHED webhook (handlePlaidWebhook below)
//   2. sweepHostedLinks() — polled by "Sync all" and the nightly cron

const HOSTED_LINK_LIFETIME_SECONDS = 7 * 24 * 3600;

export async function createHostedLink(leadId: string) {
  const cfg = plaidConfig();
  const db = svc();
  const req: Record<string, unknown> = {
    user: { client_user_id: leadId || "delt-crm" },
    // Prospect-facing brand: this name shows on the Plaid-hosted page.
    client_name: plaidClientName(),
    language: "en",
    country_codes: ["US"],
    products: cfg.products,
    // No redirect_uri: Plaid's hosted page handles OAuth banks itself,
    // so the flow works for Chase etc. even before the dashboard
    // redirect-URI registration is done.
    hosted_link: { url_lifetime_seconds: HOSTED_LINK_LIFETIME_SECONDS },
  };
  if (cfg.optionalProducts.length) req.optional_products = cfg.optionalProducts;
  const hook = webhookUrl();
  if (hook) req.webhook = hook;

  const out = await plaid("/link/token/create", req);
  if (!out.hosted_link_url) {
    throw new Error("Plaid did not return a hosted link URL for this token.");
  }
  const expiresAt = out.expiration ?? new Date(Date.now() + HOSTED_LINK_LIFETIME_SECONDS * 1000).toISOString();
  const { error } = await db.from("plaid_link_requests").insert({
    link_token: out.link_token,
    lead_id: leadId,
    hosted_link_url: out.hosted_link_url,
    status: "pending",
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to record link request: ${error.message}`);
  recordLinkEvent({
    event: "created",
    leadId,
    linkToken: out.link_token,
    meta: { mode: "add", hosted: true },
  });

  // Email the link to the prospect immediately — staff clicked "send", so
  // this is a deliberate, expected touch (no quiet-hours gate). Falls back
  // silently to copy/text when the lead has no email or Resend is unset.
  let emailed = false;
  try {
    const { data: lead } = await db
      .from("pipeline_leads")
      .select("business_name, contact_email, timeline")
      .eq("id", leadId)
      .maybeSingle();
    const to = (lead?.contact_email ?? "").trim();
    if (to && emailConfigured()) {
      const tpl = connectLinkEmail(lead?.business_name || "your business", out.hosted_link_url, expiresAt);
      emailed = await sendEmail({ to, subject: tpl.subject, html: tpl.html });
      if (emailed) {
        recordLinkEvent({ event: "sent", leadId, linkToken: out.link_token, meta: { mode: "add" } });
        const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
        timeline.push({
          date: new Date().toISOString(),
          event: `Secure bank-connect link emailed to ${to}.`,
        });
        await db.from("pipeline_leads").update({ timeline }).eq("id", leadId);
      }
    }
  } catch (err) {
    console.error("hosted-link email failed:", err);
  }

  return {
    link_token: out.link_token,
    hosted_link_url: out.hosted_link_url,
    expiration: out.expiration ?? null,
    emailed,
  };
}

// ══════════════════════════════════════════════════════════════
// Link update mode — re-auth / consent repair on an existing item
// ══════════════════════════════════════════════════════════════
// Fixes ITEM_LOGIN_REQUIRED, PENDING_EXPIRATION / PENDING_DISCONNECT,
// and "client does not have user consent to access PRODUCT_TRANSACTIONS"
// (ADDITIONAL_CONSENT_REQUIRED) without creating a new item: the token
// is minted against the stored access_token, the user runs through Link
// once more, and the item keeps its id, cursor, and vault history.

export async function createUpdateLinkToken(
  itemId: string,
  userId?: string,
  opts?: { hosted?: boolean },
) {
  const cfg = plaidConfig();
  const { item, accessToken } = await loadItem(itemId);
  const leadId: string | null = item.lead_id ?? null;
  const hosted = Boolean(opts?.hosted);

  const req: Record<string, unknown> = {
    user: { client_user_id: userId || leadId || "delt-crm" },
    client_name: plaidClientName(),
    language: "en",
    country_codes: ["US"],
    // Update mode: access_token instead of a products array.
    access_token: accessToken,
    // Re-collect consent for everything the integration uses — this is
    // what repairs items whose Transactions consent was never granted.
    additional_consented_products: [...cfg.products, ...cfg.optionalProducts],
  };
  const hook = webhookUrl();
  if (hook) req.webhook = hook;
  if (hosted) {
    // Plaid's hosted page handles OAuth itself — no redirect_uri needed.
    req.hosted_link = { url_lifetime_seconds: HOSTED_LINK_LIFETIME_SECONDS };
  } else if (cfg.redirectUri) {
    req.redirect_uri = cfg.redirectUri;
  }

  let out: any;
  try {
    out = await plaid("/link/token/create", req);
  } catch (err: any) {
    // additional_consented_products isn't accepted on every client
    // configuration — plain update mode still repairs login errors.
    if (err?.plaid?.error_code !== "INVALID_FIELD") throw err;
    delete req.additional_consented_products;
    out = await plaid("/link/token/create", req);
  }

  recordLinkEvent({
    event: "created",
    leadId,
    itemId,
    linkToken: out.link_token,
    institution: item.institution_name ?? null,
    meta: { mode: "update", hosted },
  });

  if (!hosted) return { link_token: out.link_token, expiration: out.expiration };

  if (!out.hosted_link_url) {
    throw new Error("Plaid did not return a hosted link URL for this token.");
  }
  const db = svc();
  const expiresAt =
    out.expiration ?? new Date(Date.now() + HOSTED_LINK_LIFETIME_SECONDS * 1000).toISOString();
  const { error } = await db.from("plaid_link_requests").insert({
    link_token: out.link_token,
    lead_id: leadId,
    hosted_link_url: out.hosted_link_url,
    status: "pending",
    mode: "update",
    item_id: itemId,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to record repair link request: ${error.message}`);

  // Email the reconnect link to the prospect (deliberate touch, same
  // posture as createHostedLink) — falls back silently to copy/text.
  let emailed = false;
  try {
    if (leadId) {
      const { data: lead } = await db
        .from("pipeline_leads")
        .select("business_name, contact_email, timeline")
        .eq("id", leadId)
        .maybeSingle();
      const to = (lead?.contact_email ?? "").trim();
      if (to && emailConfigured()) {
        const tpl = repairLinkEmail(
          lead?.business_name || "your business",
          item.institution_name || "your bank",
          out.hosted_link_url,
          expiresAt,
        );
        emailed = await sendEmail({ to, subject: tpl.subject, html: tpl.html });
        if (emailed) {
          recordLinkEvent({
            event: "sent",
            leadId,
            itemId,
            linkToken: out.link_token,
            meta: { mode: "update" },
          });
          const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
          timeline.push({
            date: new Date().toISOString(),
            event: `Bank reconnect link emailed to ${to} (${item.institution_name || "bank"}).`,
          });
          await db.from("pipeline_leads").update({ timeline }).eq("id", leadId);
        }
      }
    }
  } catch (err) {
    console.error("repair-link email failed:", err);
  }

  return {
    link_token: out.link_token,
    hosted_link_url: out.hosted_link_url,
    expiration: out.expiration ?? null,
    emailed,
  };
}

/** Clear repair state after a successful update-mode Link session and
 * pull fresh data. A failed resync re-flags the item via syncItem's own
 * error path — which is the correct end state, not a repair failure. */
export async function markItemRepaired(itemId: string) {
  const db = svc();
  await db
    .from("plaid_items")
    .update({ status: "active", error: null, error_code: null })
    .eq("item_id", itemId);
  try {
    const sync = await syncItem(itemId);
    return { ok: true, item_id: itemId, sync };
  } catch (err: any) {
    return { ok: false, item_id: itemId, error: String(err?.message ?? err) };
  }
}

/** Auto-repair rail: when an item is flagged as needing the user back in
 * Link, email the prospect a hosted update-mode link. Idempotent (one
 * outstanding repair link per item) and never nudges dead files.
 * Best-effort — a failure here must never break the caller. */
async function autoSendRepairLink(itemId: string): Promise<string> {
  try {
    const db = svc();
    const { data: existing } = await db
      .from("plaid_link_requests")
      .select("link_token")
      .eq("item_id", itemId)
      .eq("mode", "update")
      .eq("status", "pending")
      .limit(1);
    if (existing?.length) return "already-pending";
    const { data: item } = await db
      .from("plaid_items")
      .select("lead_id, status")
      .eq("item_id", itemId)
      .maybeSingle();
    if (!item?.lead_id || item.status === "retired" || item.status === "disconnected") return "not-eligible";
    const { data: lead } = await db
      .from("pipeline_leads")
      .select("contact_email, stage, status")
      .eq("id", item.lead_id)
      .maybeSingle();
    if (!(lead?.contact_email ?? "").trim()) return "no-email";
    if ([lead?.stage, lead?.status].some((s) => ["Not Qualified", "Declined", "Lost"].includes(s ?? ""))) return "dead-lead";
    const out = await createUpdateLinkToken(itemId, undefined, { hosted: true });
    return out.emailed ? "sent" : "created-not-emailed";
  } catch (err: any) {
    console.error(`auto repair link failed for ${itemId}:`, err?.message ?? err);
    return "error";
  }
}

/** Safety net alongside the webhook rail: send a reconnect link for every
 * item flagged repair-needed that has no outstanding repair invite — e.g.
 * when the ITEM error webhook was missed or the flag was set by a failed
 * sync rather than a webhook. Runs in the plaid-sync-all job (nightly +
 * on demand); autoSendRepairLink's idempotence makes re-runs safe. */
export async function sweepRepairLinks() {
  const db = svc();
  const { data: flagged } = await db
    .from("plaid_items")
    .select("item_id, error_code")
    .in("status", ["active", "error"])
    .not("error_code", "is", null);
  const out: Record<string, number> = {};
  for (const it of flagged ?? []) {
    if (!REPAIR_ERROR_CODES.has(it.error_code ?? "")) continue;
    const result = await autoSendRepairLink(it.item_id);
    out[result] = (out[result] ?? 0) + 1;
  }
  return out;
}

/** Exchange one completed hosted-link session and close out its request row. */
async function completeHostedLink(
  linkToken: string,
  leadId: string,
  publicToken: string,
  institution?: { institution_id?: string; name?: string },
) {
  const out = await exchangePublicToken(leadId, publicToken, institution);
  const db = svc();
  await db
    .from("plaid_link_requests")
    .update({ status: "completed", item_id: out.item_id, completed_at: new Date().toISOString() })
    .eq("link_token", linkToken);

  // Close the loop: staff get an instant heads-up, the prospect gets a
  // confirmation. Both fire-and-forget — the exchange already succeeded.
  try {
    const { data: lead } = await db
      .from("pipeline_leads")
      .select("business_name, contact_email")
      .eq("id", leadId)
      .maybeSingle();
    const businessName = lead?.business_name || leadId;
    const staffTpl = connectedStaffEmail({
      businessName,
      leadId,
      institution: out.institution_name || "",
      source: "hosted connect link",
    });
    notifyStaff(staffTpl.subject, staffTpl.html).catch(() => {});
    const to = (lead?.contact_email ?? "").trim();
    if (to) {
      const tpl = connectedProspectEmail(businessName, out.institution_name || "");
      sendEmail({ to, subject: tpl.subject, html: tpl.html }).catch(() => {});
    }
  } catch (err) {
    console.error("connect notifications failed:", err);
  }
  return out;
}

/** Pull completed sessions out of /link/token/get (shape mirrors the
 * deltcapital.com poller — results.item_add_results[].public_token). */
function extractHostedCompletions(data: any): { public_token: string; institution?: { institution_id?: string; name?: string } }[] {
  const found: { public_token: string; institution?: { institution_id?: string; name?: string } }[] = [];
  for (const s of data?.link_sessions ?? []) {
    for (const a of s?.results?.item_add_results ?? []) {
      if (a?.public_token) {
        found.push({
          public_token: a.public_token,
          institution: a.institution
            ? { institution_id: a.institution.institution_id, name: a.institution.name }
            : undefined,
        });
      }
    }
  }
  return found;
}

/** Check every pending hosted-link request against Plaid and complete or
 * expire it. Safety net for missed webhooks — runs on "Sync all" and the
 * nightly plaid-sync-all cron. */
export async function sweepHostedLinks(leadId?: string) {
  const db = svc();
  let q = db
    .from("plaid_link_requests")
    .select("link_token, lead_id, expires_at, mode, item_id")
    .eq("status", "pending");
  if (leadId) q = q.eq("lead_id", leadId);
  const { data: pending } = await q;

  const out = { checked: 0, completed: 0, expired: 0, errors: 0 };
  for (const r of pending ?? []) {
    out.checked++;
    try {
      const data = await plaid("/link/token/get", { link_token: r.link_token });

      // Update-mode (repair) sessions don't produce a public_token — a
      // finished session means the user re-authed/re-consented in place.
      if ((r.mode ?? "add") === "update") {
        const session = (data?.link_sessions ?? []).find((s: any) => s?.finished_at);
        if (session && r.item_id) {
          await db
            .from("plaid_link_requests")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              link_session_id: session.link_session_id ?? null,
            })
            .eq("link_token", r.link_token);
          await markItemRepaired(r.item_id);
          out.completed++;
        } else if (r.expires_at && new Date(r.expires_at).getTime() < Date.now()) {
          await db.from("plaid_link_requests").update({ status: "expired" }).eq("link_token", r.link_token);
          out.expired++;
          notifyLinkExpired(db, r.lead_id).catch(() => {});
        }
        continue;
      }

      const completions = extractHostedCompletions(data);
      if (completions.length) {
        for (const c of completions) {
          await completeHostedLink(r.link_token, r.lead_id, c.public_token, c.institution);
        }
        out.completed++;
      } else if (r.expires_at && new Date(r.expires_at).getTime() < Date.now()) {
        await db.from("plaid_link_requests").update({ status: "expired" }).eq("link_token", r.link_token);
        out.expired++;
        notifyLinkExpired(db, r.lead_id).catch(() => {});
      }
    } catch (err: any) {
      // An expired/invalid link token is a normal end state, not an error.
      const code = err?.plaid?.error_code;
      if (code === "INVALID_FIELD" || code === "INVALID_LINK_TOKEN") {
        await db.from("plaid_link_requests").update({ status: "expired" }).eq("link_token", r.link_token);
        out.expired++;
        notifyLinkExpired(db, r.lead_id).catch(() => {});
      } else {
        out.errors++;
        console.error(`hosted-link sweep failed for ${r.link_token.slice(-6)}:`, err?.message ?? err);
      }
    }
  }
  return out;
}

/** Staff note when a connect link lapses — the prospect already got two
 * automatic reminders, so a human touch is the right next step. */
async function notifyLinkExpired(db: SupabaseClient, leadId: string | null) {
  if (!leadId) return;
  const { data: lead } = await db
    .from("pipeline_leads")
    .select("business_name")
    .eq("id", leadId)
    .maybeSingle();
  const tpl = expiredStaffEmail(lead?.business_name || leadId, leadId);
  await notifyStaff(tpl.subject, tpl.html);
}

// ════════════════════════════════════════════════════════
// Connect-link reminders — hourly job, quiet-hours aware
// ════════════════════════════════════════════════════════
// Cadence: reminder 1 at ~24h pending, reminder 2 at ~72h, then silence
// until the link expires (staff get the expiry note above). Runs hourly
// so reminders land shortly after their threshold — during business
// hours — instead of whenever a nightly job happens to fire.

export async function sendConnectReminders() {
  if (!emailConfigured()) return { skipped: "resend-not-configured" };
  if (!withinSendWindow()) return { skipped: "quiet-hours" };
  const db = svc();
  const { data: pending } = await db
    .from("plaid_link_requests")
    .select("link_token, lead_id, hosted_link_url, created_at, expires_at, reminder_count")
    .eq("status", "pending");

  const out = { checked: 0, sent: 0, errors: 0 };
  const now = Date.now();
  for (const r of pending ?? []) {
    out.checked++;
    try {
      if (!r.lead_id) continue;
      if (r.expires_at && new Date(r.expires_at).getTime() < now) continue; // sweep handles expiry
      const ageHours = (now - new Date(r.created_at).getTime()) / 3600000;
      const count = r.reminder_count ?? 0;
      const due: 1 | 2 | null = count === 0 && ageHours >= 24 ? 1 : count === 1 && ageHours >= 72 ? 2 : null;
      if (!due) continue;

      const { data: lead } = await db
        .from("pipeline_leads")
        .select("business_name, contact_email, timeline, stage, status")
        .eq("id", r.lead_id)
        .maybeSingle();
      const to = (lead?.contact_email ?? "").trim();
      if (!to) continue;
      // Never nudge dead files.
      if ([lead?.stage, lead?.status].some((s) => ["Not Qualified", "Declined", "Lost"].includes(s ?? ""))) continue;

      const tpl = reminderEmail(lead?.business_name || "your business", r.hosted_link_url, due);
      const ok = await sendEmail({ to, subject: tpl.subject, html: tpl.html });
      if (!ok) { out.errors++; continue; }
      await db
        .from("plaid_link_requests")
        .update({ reminder_count: due, last_reminder_at: new Date().toISOString() })
        .eq("link_token", r.link_token);
      const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
      timeline.push({
        date: new Date().toISOString(),
        event: `Bank-connect reminder ${due} of 2 emailed to ${to}.`,
      });
      await db.from("pipeline_leads").update({ timeline }).eq("id", r.lead_id);
      out.sent++;
    } catch (err: any) {
      out.errors++;
      console.error(`connect reminder failed for ${String(r.link_token).slice(-6)}:`, err?.message ?? err);
    }
  }
  return out;
}

async function loadItem(itemId: string) {
  const db = svc();
  const [{ data: item, error: e1 }, { data: cred, error: e2 }] = await Promise.all([
    db.from("plaid_items").select("*").eq("item_id", itemId).maybeSingle(),
    db.from("plaid_credentials").select("access_token").eq("item_id", itemId).maybeSingle(),
  ]);
  if (e1 || !item) throw new Error(`Unknown Plaid item ${itemId}`);
  if (e2 || !cred) throw new Error(`No credentials stored for item ${itemId}`);
  return { item, accessToken: cred.access_token as string };
}

// ══════════════════════════════════════════════════════════════
// Full item sync → vault
// ══════════════════════════════════════════════════════════════

export async function syncItem(itemId: string, opts?: { verification?: boolean }) {
  const db = svc();
  const cfg = plaidConfig();
  const { item, accessToken } = await loadItem(itemId);
  const leadId: string = item.lead_id;
  // Auth + Identity are one-time-fee products deferred via optional_products:
  // the first call bills them. Only call once verification has been
  // deliberately requested (verifyItem / eager env flag); after that the
  // data is already paid for, so every sync keeps it fresh for free.
  const runVerification = Boolean(opts?.verification) || Boolean(item.verified_at) || cfg.eagerVerification;
  const itemKey: string = item.item_key || `item-${itemId.slice(-4).toLowerCase()}`;
  if (!leadId) throw new Error(`Plaid item ${itemId} is not attached to a lead`);

  const { data: leadRow } = await db
    .from("pipeline_leads")
    .select("id, business_name, contact_name, amount_requested")
    .eq("id", leadId)
    .maybeSingle();
  const businessName = leadRow?.business_name || leadId;

  const base = `/prospects/${leadId}`;
  const now = new Date().toISOString();

  try {
    // ── 1. Accounts + balances (cached — /accounts/get is free) ──
    const accountsRes = await plaid("/accounts/get", { access_token: accessToken });
    const accounts: any[] = accountsRes.accounts ?? [];

    // ── 2. Bank account verification (Auth) — store masked numbers only ──
    const routingByAccount = new Map<string, { routingLast4: string; accountLast4: string; wireRouting?: string }>();
    if (runVerification) try {
      const auth = await plaid("/auth/get", { access_token: accessToken }, { itemId, leadId });
      for (const n of auth?.numbers?.ach ?? []) {
        routingByAccount.set(n.account_id, {
          routingLast4: String(n.routing ?? "").slice(-4),
          accountLast4: String(n.account ?? "").slice(-4),
          wireRouting: n.wire_routing ? String(n.wire_routing).slice(-4) : undefined,
        });
      }
    } catch { /* auth product unavailable on this item */ }

    // ── 3. Identity ──
    let owners: any[] = [];
    if (runVerification) try {
      const identity = await plaid("/identity/get", { access_token: accessToken }, { itemId, leadId });
      const seen = new Set<string>();
      for (const acc of identity?.accounts ?? []) {
        for (const o of acc.owners ?? []) {
          const key = JSON.stringify(o.names ?? []);
          if (seen.has(key)) continue;
          seen.add(key);
          owners.push({
            names: o.names ?? [],
            emails: (o.emails ?? []).map((e: any) => ({ data: e.data, primary: e.primary, type: e.type })),
            phone_numbers: (o.phone_numbers ?? []).map((p: any) => ({ data: p.data, primary: p.primary, type: p.type })),
            addresses: (o.addresses ?? []).map((a: any) => ({ data: a.data, primary: a.primary })),
          });
        }
      }
    } catch { /* identity product unavailable */ }

    // ── 4. Credit data (liabilities) — subscription-billed once called;
    // only touch it when explicitly opted in via PLAID_OPTIONAL_PRODUCTS ──
    let liabilities: any = null;
    if (cfg.optionalProducts.includes("liabilities")) try {
      const li = await plaid("/liabilities/get", { access_token: accessToken }, { itemId, leadId });
      liabilities = li?.liabilities ?? null;
    } catch { /* liabilities unavailable — fine */ }

    // ── 4b. Investments (holdings) — same subscription-billing rule ──
    let investments: any = null;
    if (cfg.optionalProducts.includes("investments")) try {
      const inv = await plaid("/investments/holdings/get", { access_token: accessToken }, { itemId, leadId });
      const securities = new Map<string, any>(
        (inv?.securities ?? []).map((s: any) => [s.security_id, s]),
      );
      const holdings = (inv?.holdings ?? []).map((h: any) => {
        const sec = securities.get(h.security_id) ?? {};
        return {
          account_id: h.account_id,
          name: sec.name ?? null,
          ticker: sec.ticker_symbol ?? null,
          type: sec.type ?? null,
          quantity: h.quantity ?? null,
          price: h.institution_price ?? null,
          value: h.institution_value ?? null,
          iso_currency_code: h.iso_currency_code ?? "USD",
        };
      });
      if (holdings.length) {
        investments = {
          holdings,
          total_value:
            Math.round(holdings.reduce((s: number, h: any) => s + (h.value ?? 0), 0) * 100) / 100,
          account_count: ((inv?.accounts ?? []) as any[]).filter((a) => a.type === "investment").length,
        };
      }
    } catch { /* investments product unavailable on this item */ }

    // ── 4c. Recurring transaction streams — separately billed monthly
    // add-on; opt in via PLAID_RECURRING_ENABLED=true ──
    let recurring: any = null;
    if (cfg.recurringEnabled) try {
      const rec = await plaid("/transactions/recurring/get", { access_token: accessToken }, { itemId, leadId });
      const slimStream = (s: any) => ({
        stream_id: s.stream_id,
        description: s.description ?? null,
        merchant_name: s.merchant_name ?? null,
        category: s.personal_finance_category?.primary ?? null,
        frequency: s.frequency ?? "UNKNOWN",
        average_amount: s.average_amount?.amount ?? null,
        last_amount: s.last_amount?.amount ?? null,
        last_date: s.last_date ?? null,
        is_active: s.is_active !== false,
        status: s.status ?? null,
      });
      recurring = {
        inflow_streams: (rec?.inflow_streams ?? []).map(slimStream),
        outflow_streams: (rec?.outflow_streams ?? []).map(slimStream),
      };
    } catch { /* recurring not ready / unavailable */ }

    // ── 5. Transactions (incremental /transactions/sync) ──
    const originalCursor: string | null = item.transactions_cursor ?? null;
    let cursor: string | null = originalCursor;
    let added: Txn[] = [];
    let modified: Txn[] = [];
    let removedIds: string[] = [];
    // False when Plaid hasn't finished preparing transactions yet — the
    // item stays in the "verifying" state (no last_synced_at stamp) until
    // the INITIAL_UPDATE webhook retriggers a sync that actually lands data.
    let txReady = true;
    // Plaid can mutate the underlying data mid-pagination
    // (TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION); its prescribed fix is
    // to restart pagination from the cursor the run began with.
    for (let attempt = 0; attempt < 3; attempt++) {
      cursor = originalCursor;
      added = [];
      modified = [];
      removedIds = [];
      try {
        let hasMore = true;
        let guard = 0;
        while (hasMore && guard++ < 50) {
          const page = await plaid("/transactions/sync", {
            access_token: accessToken,
            cursor: cursor ?? undefined,
            count: 500,
          }, guard === 1 && attempt === 0 ? { itemId, leadId } : undefined);
          added.push(...(page.added ?? []));
          modified.push(...(page.modified ?? []));
          removedIds.push(...((page.removed ?? []).map((r: any) => r.transaction_id)));
          cursor = page.next_cursor;
          hasMore = Boolean(page.has_more);
        }
        break;
      } catch (err) {
        const code = (err as any)?.plaid?.error_code;
        if (code === "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION" && attempt < 2) continue;
        // PRODUCT_NOT_READY right after linking — webhook will retrigger us.
        if (code !== "PRODUCT_NOT_READY") throw err;
        txReady = false;
        cursor = originalCursor;
        added = [];
        modified = [];
        removedIds = [];
        break;
      }
    }

    // ── Merge transactions into monthly vault documents ──
    const txPrefix = `${base}/financials/${itemKey}/transactions`;
    const { data: existingTxDocs } = await db
      .from("plaid_nodes")
      .select("path, data")
      .like("path", `${txPrefix}/%`)
      .eq("node_type", "document");

    const byMonth = new Map<string, Map<string, Txn>>();
    for (const doc of existingTxDocs ?? []) {
      const month = doc.path.slice(txPrefix.length + 1);
      const map = new Map<string, Txn>();
      for (const t of (doc.data?.transactions ?? []) as Txn[]) map.set(t.transaction_id, t);
      byMonth.set(month, map);
    }
    const slim = (t: any): Txn => ({
      transaction_id: t.transaction_id,
      account_id: t.account_id,
      amount: t.amount,
      date: t.date,
      authorized_date: t.authorized_date ?? null,
      name: t.name ?? t.original_description ?? "",
      merchant_name: t.merchant_name ?? null,
      pending: Boolean(t.pending),
      personal_finance_category: t.personal_finance_category
        ? { primary: t.personal_finance_category.primary }
        : null,
    });
    for (const t of [...added, ...modified]) {
      const m = monthOf(t as Txn) || "unknown";
      if (!byMonth.has(m)) byMonth.set(m, new Map());
      byMonth.get(m)!.set(t.transaction_id, slim(t));
    }
    if (removedIds.length) {
      const removedSet = new Set(removedIds);
      for (const map of byMonth.values()) {
        for (const id of [...map.keys()]) if (removedSet.has(id)) map.delete(id);
      }
    }

    // ── Build vault rows ──
    const inst = item.institution_name || itemKey;
    const folders: NodeRow[] = [
      folderRow("/prospects", "Prospects"),
      folderRow(base, businessName, leadId),
      folderRow(`${base}/identity`, "Identity Verification", leadId),
      folderRow(`${base}/bank-verification`, "Bank Account Verification", leadId),
      folderRow(`${base}/bank-verification/${itemKey}`, inst, leadId, itemId),
      folderRow(`${base}/financials`, "Financials", leadId),
      folderRow(`${base}/financials/${itemKey}`, inst, leadId, itemId),
      folderRow(txPrefix, "Transactions", leadId, itemId),
      folderRow(`${base}/credit`, "Credit Data", leadId),
      folderRow(`${base}/decisioning`, "Decisioning", leadId),
    ];
    const docs: NodeRow[] = [];

    const depositoryAccounts = accounts.filter((a) => a.type === "depository");
    for (const a of accounts) {
      const routing = routingByAccount.get(a.account_id);
      docs.push({
        path: `${base}/bank-verification/${itemKey}/${a.account_id}`,
        name: `${a.name || a.official_name || "Account"} ••${a.mask ?? "????"}`,
        node_type: "document",
        doc_kind: "account",
        lead_id: leadId,
        item_id: itemId,
        data: {
          account_id: a.account_id,
          name: a.name,
          official_name: a.official_name,
          type: a.type,
          subtype: a.subtype,
          mask: a.mask,
          balances: {
            available: a.balances?.available ?? null,
            current: a.balances?.current ?? null,
            limit: a.balances?.limit ?? null,
            iso_currency_code: a.balances?.iso_currency_code ?? "USD",
          },
          verification: {
            method: "Plaid Auth",
            verified: Boolean(routing),
            routing_last4: routing?.routingLast4 ?? null,
            account_last4: routing?.accountLast4 ?? (a.mask || null),
            wire_routing_last4: routing?.wireRouting ?? null,
          },
          institution: { id: item.institution_id, name: item.institution_name },
          as_of: now,
        },
      });
    }

    docs.push({
      path: `${base}/identity/${itemKey}`,
      name: `Identity — ${inst}`,
      node_type: "document",
      doc_kind: "identity",
      lead_id: leadId,
      item_id: itemId,
      data: {
        institution: { id: item.institution_id, name: item.institution_name },
        verified: owners.length > 0,
        owners,
        account_count: accounts.length,
        as_of: now,
      },
    });

    if (liabilities) {
      const credit = liabilities.credit ?? [];
      const mortgages = liabilities.mortgage ?? [];
      const student = liabilities.student ?? [];
      docs.push({
        path: `${base}/credit/${itemKey}`,
        name: `Liabilities — ${inst}`,
        node_type: "document",
        doc_kind: "liabilities",
        lead_id: leadId,
        item_id: itemId,
        data: {
          institution: { id: item.institution_id, name: item.institution_name },
          summary: {
            credit_cards: credit.length,
            mortgages: mortgages.length,
            student_loans: student.length,
            total_credit_balance: credit.reduce(
              (s: number, c: any) => s + (c.last_statement_balance ?? 0), 0),
            overdue_accounts: [...credit, ...mortgages, ...student].filter((l: any) => l.is_overdue).length,
          },
          credit,
          mortgage: mortgages,
          student,
          as_of: now,
        },
      });
    }

    if (investments) {
      folders.push(folderRow(`${base}/investments`, "Investments", leadId));
      docs.push({
        path: `${base}/investments/${itemKey}`,
        name: `Holdings — ${inst}`,
        node_type: "document",
        doc_kind: "investments",
        lead_id: leadId,
        item_id: itemId,
        data: {
          institution: { id: item.institution_id, name: item.institution_name },
          ...investments,
          as_of: now,
        },
      });
    }

    if (recurring && (recurring.inflow_streams.length || recurring.outflow_streams.length)) {
      docs.push({
        path: `${base}/financials/${itemKey}/recurring`,
        name: "Recurring Streams",
        node_type: "document",
        doc_kind: "recurring",
        lead_id: leadId,
        item_id: itemId,
        data: {
          institution: { id: item.institution_id, name: item.institution_name },
          ...recurring,
          as_of: now,
        },
      });
    }

    const txMonths = [...byMonth.keys()].sort();
    for (const m of txMonths) {
      const txs = [...byMonth.get(m)!.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
      if (!txs.length) continue;
      docs.push({
        path: `${txPrefix}/${m}`,
        name: m,
        node_type: "document",
        doc_kind: "transactions",
        lead_id: leadId,
        item_id: itemId,
        data: {
          month: m,
          count: txs.length,
          inflows: Math.round(txs.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0) * 100) / 100,
          outflows: Math.round(txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0) * 100) / 100,
          transactions: txs,
        },
      });
    }

    // Persist item-level docs first so the recompute below sees fresh data.
    await writeNodes(db, folders, docs);

    // ── 6. Recompute lead-level analysis across ALL of this lead's items ──
    const { data: allTxDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "transactions");
    const allTx: Txn[] = (allTxDocs ?? []).flatMap((d: any) => d.data?.transactions ?? []);

    const { data: allAccountDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "account");
    const allAccounts = (allAccountDocs ?? []).map((d: any) => d.data);
    const depositoryBalance = allAccounts
      .filter((a: any) => a.type === "depository")
      .reduce((s: number, a: any) => s + (a.balances?.current ?? 0), 0);

    const cashFlow = computeCashFlow(allTx, depositoryBalance);

    const { data: allIdentityDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "identity");
    const identityVerified = (allIdentityDocs ?? []).some((d: any) => d.data?.verified);

    const { data: allLiabilityDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "liabilities");

    const { data: leadItems } = await db
      .from("plaid_items")
      .select("item_id, institution_name, status")
      .eq("lead_id", leadId);

    // ── Debt service + recurring revenue, across all of this lead's items ──
    // Outflow streams that look like loan/MCA/financing payments reveal
    // existing positions (stacking risk) before DataMerch is even pulled.
    const { data: allRecurringDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "recurring");
    const PER_MONTH: Record<string, number> = {
      WEEKLY: 4.33, BIWEEKLY: 2.17, SEMI_MONTHLY: 2, MONTHLY: 1, ANNUALLY: 1 / 12, UNKNOWN: 1,
    };
    const DEBT_RE = /loan|advance|capital|lend|funding|mca|leas(e|ing)|financ/i;
    let monthlyDebtService = 0;
    let detectedDebtPositions = 0;
    let recurringRevenueStreams = 0;
    for (const doc of allRecurringDocs ?? []) {
      const inflows = (doc.data?.inflow_streams ?? []) as any[];
      const outflows = (doc.data?.outflow_streams ?? []) as any[];
      recurringRevenueStreams += inflows.filter((s) => s.is_active).length;
      for (const s of outflows) {
        if (!s.is_active) continue;
        const isDebt =
          s.category === "LOAN_PAYMENTS" ||
          DEBT_RE.test(`${s.merchant_name ?? ""} ${s.description ?? ""}`);
        if (!isDebt) continue;
        detectedDebtPositions++;
        monthlyDebtService +=
          Math.abs(s.average_amount ?? 0) * (PER_MONTH[s.frequency ?? "UNKNOWN"] ?? 1);
      }
    }
    monthlyDebtService = Math.round(monthlyDebtService);

    const { data: allInvestmentDocs } = await db
      .from("plaid_nodes")
      .select("data")
      .eq("lead_id", leadId)
      .eq("doc_kind", "investments");
    const investmentsValue =
      Math.round(
        (allInvestmentDocs ?? []).reduce(
          (s: number, d: any) => s + (d.data?.total_value ?? 0), 0) * 100) / 100;

    const m = {
      ...cashFlow.metrics,
      monthlyDebtService,
      detectedDebtPositions,
      recurringRevenueStreams,
      debtServiceToRevenuePct:
        cashFlow.metrics.monthlyRevenue > 0
          ? Math.round((monthlyDebtService / cashFlow.metrics.monthlyRevenue) * 1000) / 1000
          : 0,
      investmentsValue,
    };
    cashFlow.metrics = m as typeof cashFlow.metrics;

    // ── 7. Run the standardized decision model (versioned, deterministic) ──
    const bankVerified = allAccounts.some((a: any) => a.verification?.verified);
    const modelInput: ModelInput = {
      monthlyRevenue: m.monthlyRevenue,
      revenueStdDevPct: m.revenueStdDevPct,
      revenueTrend: m.revenueTrend,
      revenueChange3moPct: m.revenueChange3moPct,
      avgDailyBalance: m.avgDailyBalance,
      minDailyBalance: m.minDailyBalance,
      nsfCount90d: m.nsfCount90d,
      daysSinceLastNsf: m.daysSinceLastNsf,
      depositConcentration: m.depositConcentration,
      monthsOfData: m.monthsOfData,
      transactionCount: m.transactionCount,
      monthlyDebtService,
      detectedDebtPositions,
      debtServiceToRevenuePct: m.debtServiceToRevenuePct,
      requestedAmount: parseMoney(leadRow?.amount_requested),
      bankVerified,
      identityVerified,
      institutionsConnected: (leadItems ?? []).length,
    };
    const recommendation = runDecisionModel(modelInput);

    const analysisDocs: NodeRow[] = [
      {
        path: `${base}/decisioning/recommendation`,
        name: `Recommendation (model v${MODEL_VERSION})`,
        node_type: "document",
        doc_kind: "recommendation",
        lead_id: leadId,
        data: { ...recommendation, computed_at: now },
      },
      {
        path: `${base}/financials/cash-flow-analysis`,
        name: "Cash Flow Analysis",
        node_type: "document",
        doc_kind: "cash_flow",
        lead_id: leadId,
        data: { ...cashFlow, generated_at: now },
      },
      {
        path: `${base}/decisioning/underwriting-inputs`,
        name: "Underwriting Inputs (Plaid)",
        node_type: "document",
        doc_kind: "underwriting_inputs",
        lead_id: leadId,
        data: {
          // Exact PlaidInputs shape consumed by the CRM scoring engine.
          plaidInputs: {
            avgDailyBalance: m.avgDailyBalance,
            minDailyBalance: m.minDailyBalance,
            nsfCount90d: m.nsfCount90d,
            daysSinceLastNsf: m.daysSinceLastNsf,
            monthlyRevenue: m.monthlyRevenue,
            revenueStdDevPct: m.revenueStdDevPct,
            revenueTrend: m.revenueTrend,
            depositConcentration: m.depositConcentration,
            revenueChange3moPct: m.revenueChange3moPct,
          },
          // Extra signals for the analyst / DataMerch seeding: recurring
          // outflows that look like existing loan/MCA payments.
          detected: {
            debt_positions: detectedDebtPositions,
            monthly_debt_service: monthlyDebtService,
            debt_service_to_revenue_pct: m.debtServiceToRevenuePct,
            recurring_revenue_streams: recurringRevenueStreams,
          },
          provenance: {
            source: "plaid",
            items: (leadItems ?? []).map((i: any) => i.item_id),
            transaction_count: m.transactionCount,
            months_of_data: m.monthsOfData,
            generated_at: now,
          },
        },
      },
      {
        path: `${base}/summary`,
        name: "Prospect Summary",
        node_type: "document",
        doc_kind: "summary",
        lead_id: leadId,
        data: {
          business_name: businessName,
          contact_name: leadRow?.contact_name ?? null,
          amount_requested: leadRow?.amount_requested ?? null,
          institutions: (leadItems ?? []).map((i: any) => ({
            item_id: i.item_id,
            name: i.institution_name,
            status: i.status,
          })),
          accounts: allAccounts.length,
          depository_accounts: allAccounts.filter((a: any) => a.type === "depository").length,
          depository_balance: Math.round(depositoryBalance * 100) / 100,
          identity_verified: identityVerified,
          bank_verified: allAccounts.some((a: any) => a.verification?.verified),
          has_credit_data: (allLiabilityDocs ?? []).length > 0,
          has_investments: (allInvestmentDocs ?? []).length > 0,
          investments_value: investmentsValue,
          monthly_revenue: m.monthlyRevenue,
          avg_daily_balance: m.avgDailyBalance,
          nsf_count_90d: m.nsfCount90d,
          monthly_debt_service: monthlyDebtService,
          detected_debt_positions: detectedDebtPositions,
          recurring_revenue_streams: recurringRevenueStreams,
          last_synced: now,
        },
      },
    ];
    await writeNodes(db, [], analysisDocs);

    const firstSync = txReady && !item.last_synced_at;
    await db
      .from("plaid_items")
      .update({
        transactions_cursor: cursor,
        // Only stamp last_synced_at once transaction data actually landed —
        // "active with no last_synced_at" is the CRM's "verifying bank
        // data" state between exchange and the first real sync.
        ...(txReady ? { last_synced_at: now } : {}),
        status: "active",
        error: null,
        error_code: null,
      })
      .eq("item_id", itemId);
    if (firstSync) {
      recordLinkEvent({
        event: "first_sync",
        leadId,
        itemId,
        institution: item.institution_name ?? null,
        meta: { transactions_added: added.length },
      });
    }

    return {
      ok: true,
      item_id: itemId,
      accounts: accounts.length,
      depository_accounts: depositoryAccounts.length,
      owners: owners.length,
      transactions_added: added.length,
      transactions_modified: modified.length,
      transactions_removed: removedIds.length,
      tx_ready: txReady,
      metrics: m,
    };
  } catch (err: any) {
    const errorCode: string | null = err?.plaid?.error_code ?? null;
    const requestId: string | null = err?.plaidRequestId ?? err?.plaid?.request_id ?? null;
    const msg = String(err?.message ?? err);
    await db
      .from("plaid_items")
      .update({
        status: "error",
        error: requestId ? `${msg} (request_id ${requestId})` : msg,
        error_code: errorCode,
      })
      .eq("item_id", itemId);
    throw err;
  }
}

export async function syncAllItems(leadId?: string) {
  const db = svc();
  let q = db.from("plaid_items").select("item_id").in("status", ["active", "error"]);
  if (leadId) q = q.eq("lead_id", leadId);
  const { data: items } = await q;
  const results: any[] = [];
  for (const it of items ?? []) {
    try {
      results.push(await syncItem(it.item_id));
    } catch (err: any) {
      results.push({ ok: false, item_id: it.item_id, error: String(err?.message ?? err) });
    }
  }
  return results;
}

// ════════════════════════════════════════════════════════
// Verification (Auth + Identity) — deliberate one-time spend
// ════════════════════════════════════════════════════════

/** Bill Auth + Identity on one item (first call incurs each one-time fee)
 * and refresh its vault docs with the verification data. */
export async function verifyItem(itemId: string) {
  const db = svc();
  const { error } = await db
    .from("plaid_items")
    .update({ verified_at: new Date().toISOString() })
    .eq("item_id", itemId);
  if (error) throw new Error(`Failed to mark item verified: ${error.message}`);
  return syncItem(itemId, { verification: true });
}

/** Run verification across every active connection on a lead — the
 * "file advanced to underwriting" action. */
export async function verifyLead(leadId: string) {
  const db = svc();
  const { data: items } = await db
    .from("plaid_items")
    .select("item_id")
    .eq("lead_id", leadId)
    .eq("status", "active");
  if (!items?.length) throw new Error("No active Plaid connections on this lead");
  const results: any[] = [];
  for (const it of items) {
    try {
      results.push(await verifyItem(it.item_id));
    } catch (err: any) {
      results.push({ ok: false, item_id: it.item_id, error: String(err?.message ?? err) });
    }
  }
  return results;
}

// ════════════════════════════════════════════════════════
// Transactions Refresh — decision-time freshness (per-call fee)
// ════════════════════════════════════════════════════════

/** Ask Plaid to pull fresh transactions from the bank right now for every
 * active connection on a lead. Plaid fires TRANSACTIONS webhooks
 * (SYNC_UPDATES_AVAILABLE) as new data lands, which auto-syncs the vault —
 * call this right before an underwriting decision. */
export async function refreshLeadTransactions(leadId: string) {
  const db = svc();
  const { data: items } = await db
    .from("plaid_items")
    .select("item_id")
    .eq("lead_id", leadId)
    .eq("status", "active");
  if (!items?.length) throw new Error("No active Plaid connections on this lead");
  const out = { requested: 0, errors: [] as string[] };
  for (const it of items) {
    try {
      const { accessToken } = await loadItem(it.item_id);
      await plaid("/transactions/refresh", { access_token: accessToken }, { itemId: it.item_id, leadId });
      out.requested++;
    } catch (err: any) {
      out.errors.push(`${it.item_id.slice(-4)}: ${String(err?.message ?? err)}`);
    }
  }
  return out;
}

// ════════════════════════════════════════════════════════
// Balance — real-time balance check before an ACH pull (per-call fee)
// ════════════════════════════════════════════════════════

/** Live (non-cached) balances across a lead's connections, with a
 * balance-snapshot vault doc per item for the ACH decision audit trail. */
export async function realtimeBalances(leadId: string) {
  const db = svc();
  const { data: items } = await db
    .from("plaid_items")
    .select("item_id, item_key, institution_name")
    .eq("lead_id", leadId)
    .eq("status", "active");
  if (!items?.length) throw new Error("No active Plaid connections on this lead");

  const { data: leadRow } = await db
    .from("pipeline_leads")
    .select("business_name")
    .eq("id", leadId)
    .maybeSingle();
  const base = `/prospects/${leadId}`;
  const now = new Date().toISOString();
  const results: any[] = [];

  for (const it of items) {
    try {
      const { accessToken } = await loadItem(it.item_id);
      const res = await plaid("/accounts/balance/get", { access_token: accessToken }, { itemId: it.item_id, leadId });
      const accounts = (res.accounts ?? []).map((a: any) => ({
        account_id: a.account_id,
        name: a.name ?? null,
        mask: a.mask ?? null,
        type: a.type ?? null,
        subtype: a.subtype ?? null,
        available: a.balances?.available ?? null,
        current: a.balances?.current ?? null,
        iso_currency_code: a.balances?.iso_currency_code ?? "USD",
      }));
      const itemKey = it.item_key || `item-${it.item_id.slice(-4).toLowerCase()}`;
      await writeNodes(
        db,
        [
          folderRow("/prospects", "Prospects"),
          folderRow(base, leadRow?.business_name || leadId, leadId),
          folderRow(`${base}/financials`, "Financials", leadId),
        ],
        [
          {
            path: `${base}/financials/${itemKey}/balance-snapshot`,
            name: `Real-time balance — ${it.institution_name || itemKey}`,
            node_type: "document",
            doc_kind: "balance_snapshot",
            lead_id: leadId,
            item_id: it.item_id,
            data: { checked_at: now, accounts },
          },
        ],
      );
      results.push({ ok: true, item_id: it.item_id, institution: it.institution_name, accounts });
    } catch (err: any) {
      results.push({ ok: false, item_id: it.item_id, error: String(err?.message ?? err) });
    }
  }
  return results;
}

// ════════════════════════════════════════════════════════
// Monitor — ongoing watchlist screening for funded merchants
// ════════════════════════════════════════════════════════
// Monitor bills a base fee per new user screened plus a monthly rescan
// fee, so screening is reserved for funded deals (real exposure), not
// raw leads. Requires PLAID_MONITOR_PROGRAM_ID (dashboard → Monitor →
// programs) with ongoing screening enabled; the SCREENING webhook keeps
// the vault doc current as Plaid rescans.

function screeningDoc(scr: any, hits: any[]) {
  return {
    id: scr.id,
    status: scr.status ?? null,
    search_terms: scr.search_terms ?? null,
    assignee: scr.assignee ?? null,
    client_user_id: scr.client_user_id ?? null,
    hit_count: hits.length,
    hits: hits.map((h: any) => ({
      id: h.id,
      review_status: h.review_status ?? null,
      list_code: h.list_code ?? null,
      plaid_generated: h.plaid_generated ?? null,
      first_active: h.first_active ?? null,
    })),
    last_checked_at: new Date().toISOString(),
  };
}

async function writeScreeningNode(db: SupabaseClient, leadId: string, doc: any, personName: string) {
  const { data: leadRow } = await db
    .from("pipeline_leads")
    .select("business_name")
    .eq("id", leadId)
    .maybeSingle();
  const base = `/prospects/${leadId}`;
  await writeNodes(
    db,
    [
      folderRow("/prospects", "Prospects"),
      folderRow(base, leadRow?.business_name || leadId, leadId),
      folderRow(`${base}/compliance`, "Compliance", leadId),
    ],
    [
      {
        path: `${base}/compliance/screening-${doc.id.slice(-8)}`,
        name: `Watchlist screening — ${personName}`,
        node_type: "document",
        doc_kind: "watchlist_screening",
        lead_id: leadId,
        data: doc,
      },
    ],
  );
}

/** Screen a person tied to a lead against the configured watchlist
 * program. Name defaults to the lead's contact when not provided. */
export async function screenLead(leadId: string, opts?: { legalName?: string; dateOfBirth?: string; country?: string }) {
  const cfg = plaidConfig();
  if (!cfg.monitorProgramId) {
    throw new Error(
      "Monitor is not configured. Create a screening program in the Plaid dashboard and set the PLAID_MONITOR_PROGRAM_ID edge-function secret.",
    );
  }
  const db = svc();
  let legalName = (opts?.legalName ?? "").trim();
  if (!legalName) {
    const { data: leadRow } = await db
      .from("pipeline_leads")
      .select("contact_name, business_name")
      .eq("id", leadId)
      .maybeSingle();
    legalName = (leadRow?.contact_name ?? "").trim();
    if (!legalName) throw new Error("No legal name — pass one or set the lead's contact name.");
  }
  const search_terms: Record<string, unknown> = {
    watchlist_program_id: cfg.monitorProgramId,
    legal_name: legalName,
  };
  if (opts?.dateOfBirth) search_terms.date_of_birth = opts.dateOfBirth;
  if (opts?.country) search_terms.country = opts.country;

  const scr = await plaid("/watchlist_screening/individual/create", {
    search_terms,
    client_user_id: leadId,
  }, { leadId });
  const hitsRes = await plaid("/watchlist_screening/individual/hit/list", {
    watchlist_screening_id: scr.id,
  });
  const doc = screeningDoc(scr, hitsRes?.watchlist_screening_hits ?? []);
  await writeScreeningNode(db, leadId, doc, legalName);
  return { ok: true, id: scr.id, status: scr.status, hit_count: doc.hit_count };
}

/** Re-pull a screening (used by the SCREENING webhook when Plaid's
 * ongoing rescans change its status or add hits). */
export async function refreshScreening(screeningId: string) {
  const db = svc();
  const scr = await plaid("/watchlist_screening/individual/get", {
    watchlist_screening_id: screeningId,
  });
  const hitsRes = await plaid("/watchlist_screening/individual/hit/list", {
    watchlist_screening_id: screeningId,
  });
  const leadId = String(scr.client_user_id ?? "");
  if (!leadId) return { ok: false, error: "Screening has no client_user_id" };
  const doc = screeningDoc(scr, hitsRes?.watchlist_screening_hits ?? []);
  const { data: existing } = await db
    .from("plaid_nodes")
    .select("name")
    .eq("path", `/prospects/${leadId}/compliance/screening-${screeningId.slice(-8)}`)
    .maybeSingle();
  const personName = existing?.name?.replace(/^Watchlist screening — /, "") || (doc.search_terms as any)?.legal_name || leadId;
  await writeScreeningNode(db, leadId, doc, personName);
  return { ok: true, id: screeningId, status: doc.status, hit_count: doc.hit_count };
}

// ════════════════════════════════════════════════════════
// Item retirement — stop monthly Transactions billing on dead files
// ════════════════════════════════════════════════════════

const DEAD_LEAD_STATES = ["Not Qualified", "Declined", "Lost"];

/** Remove the item at Plaid (ends its subscription) but KEEP the vault
 * documents — unlike removeItem, which erases the analysis too. */
export async function retireItem(itemId: string) {
  const db = svc();
  const { accessToken } = await loadItem(itemId);
  try {
    await plaid("/item/remove", { access_token: accessToken });
  } catch { /* token may already be revoked — still mark it retired */ }
  await db.from("plaid_credentials").delete().eq("item_id", itemId);
  await db
    .from("plaid_items")
    .update({ status: "retired", retired_at: new Date().toISOString(), error: null, error_code: null })
    .eq("item_id", itemId);
  return { ok: true, retired: itemId };
}

/** Nightly sweep: retire items whose lead is in a dead stage/status and
 * hasn't been touched for PLAID_RETIRE_AFTER_DAYS days. */
export async function retireStaleItems() {
  const cfg = plaidConfig();
  if (!cfg.retireAfterDays) return { checked: 0, retired: 0, skipped: "disabled" };
  const db = svc();
  const { data: items } = await db
    .from("plaid_items")
    .select("item_id, lead_id")
    .in("status", ["active", "error"]);
  const out = { checked: 0, retired: 0, errors: 0 };
  const cutoff = Date.now() - cfg.retireAfterDays * 24 * 60 * 60 * 1000;
  for (const it of items ?? []) {
    if (!it.lead_id) continue;
    out.checked++;
    try {
      const { data: lead } = await db
        .from("pipeline_leads")
        .select("stage, status, updated_at")
        .eq("id", it.lead_id)
        .maybeSingle();
      if (!lead) continue;
      const dead = DEAD_LEAD_STATES.includes(lead.stage) || DEAD_LEAD_STATES.includes(lead.status);
      const stale = lead.updated_at ? new Date(lead.updated_at).getTime() < cutoff : false;
      if (dead && stale) {
        await retireItem(it.item_id);
        out.retired++;
      }
    } catch (err: any) {
      out.errors++;
      console.error(`retire sweep failed for ${it.item_id.slice(-4)}:`, err?.message ?? err);
    }
  }
  return out;
}

// ══════════════════════════════════════════════════════════════
// Identity Verification (Plaid IDV product)
// ══════════════════════════════════════════════════════════════

/**
 * Attach an existing Plaid IDV session (created via your IDV template /
 * Link flow) to a lending prospect and file it in the vault.
 */
export async function attachIdentityVerification(leadId: string, idvId: string) {
  const db = svc();
  const idv = await plaid("/identity_verification/get", { identity_verification_id: idvId });

  const { data: leadRow } = await db
    .from("pipeline_leads")
    .select("business_name")
    .eq("id", leadId)
    .maybeSingle();
  const base = `/prospects/${leadId}`;
  const now = new Date().toISOString();

  const slim = {
    id: idv.id,
    client_user_id: idv.client_user_id ?? null,
    status: idv.status ?? null,
    steps: idv.steps ?? null,
    user: {
      name: idv.user?.name ?? null,
      email_address: idv.user?.email_address ?? null,
      phone_number: idv.user?.phone_number ?? null,
      address: idv.user?.address ?? null,
      date_of_birth: idv.user?.date_of_birth ?? null,
    },
    documentary_verification: idv.documentary_verification
      ? {
          status: idv.documentary_verification.status ?? null,
          documents: (idv.documentary_verification.documents ?? []).length,
        }
      : null,
    kyc_check: idv.kyc_check
      ? {
          status: idv.kyc_check.status ?? null,
          name: idv.kyc_check.name?.summary ?? null,
          address: idv.kyc_check.address?.summary ?? null,
          date_of_birth: idv.kyc_check.date_of_birth?.summary ?? null,
          id_number: idv.kyc_check.id_number?.summary ?? null,
        }
      : null,
    watchlist_screening_id: idv.watchlist_screening_id ?? null,
    created_at: idv.created_at ?? null,
    completed_at: idv.completed_at ?? null,
    attached_at: now,
  };

  await writeNodes(
    db,
    [
      folderRow("/prospects", "Prospects"),
      folderRow(base, leadRow?.business_name || leadId, leadId),
      folderRow(`${base}/identity`, "Identity Verification", leadId),
    ],
    [
      {
        path: `${base}/identity/idv-${idvId.slice(-8)}`,
        name: `IDV Session — ${slim.user.name?.given_name ?? ""} ${slim.user.name?.family_name ?? ""}`.trim() || `IDV ${idvId.slice(-8)}`,
        node_type: "document",
        doc_kind: "identity_verification",
        lead_id: leadId,
        data: slim,
      },
    ],
  );
  return { ok: true, id: idv.id, status: idv.status };
}

/**
 * Retry a failed/expired IDV session: Plaid mints a fresh session for the
 * same client_user_id + template, and the new session is filed on the lead.
 * strategy "reset" re-runs every step; "incomplete" resumes where the user
 * stopped. Billed per verification like the original session.
 */
export async function retryIdentityVerification(leadId: string, idvId: string, strategy = "reset") {
  const prior = await plaid("/identity_verification/get", { identity_verification_id: idvId });
  const templateId: string = prior?.template?.id ?? Deno.env.get("PLAID_IDV_TEMPLATE_ID") ?? "";
  const clientUserId: string = prior?.client_user_id ?? "";
  if (!templateId || !clientUserId) {
    throw new Error("Cannot retry this IDV session: the original lacks a template id or client_user_id.");
  }
  const retried = await plaid("/identity_verification/retry", {
    client_user_id: clientUserId,
    template_id: templateId,
    strategy,
  }, { leadId });
  const attached = await attachIdentityVerification(leadId, retried.id);
  return { ...attached, retried_from: idvId, shareable_url: retried.shareable_url ?? null };
}

// ══════════════════════════════════════════════════════════════
// Asset Reports (verified 90-day report across a lead's banks)
// ══════════════════════════════════════════════════════════════

export async function createAssetReport(leadId: string) {
  const db = svc();
  const { data: items } = await db
    .from("plaid_items")
    .select("item_id")
    .eq("lead_id", leadId)
    .eq("status", "active");
  if (!items?.length) throw new Error("No active Plaid connections on this lead");

  const { data: creds } = await db
    .from("plaid_credentials")
    .select("access_token")
    .in("item_id", items.map((i: any) => i.item_id));
  const tokens = (creds ?? []).map((c: any) => c.access_token);
  if (!tokens.length) throw new Error("No stored credentials for this lead's connections");

  const hook = webhookUrl();
  const out = await plaid("/asset_report/create", {
    access_tokens: tokens,
    days_requested: 90,
    options: {
      client_report_id: leadId,
      ...(hook ? { webhook: hook } : {}),
    },
  });

  const { data: leadRow } = await db
    .from("pipeline_leads")
    .select("business_name")
    .eq("id", leadId)
    .maybeSingle();
  const base = `/prospects/${leadId}`;
  await writeNodes(
    db,
    [
      folderRow("/prospects", "Prospects"),
      folderRow(base, leadRow?.business_name || leadId, leadId),
      folderRow(`${base}/financials`, "Financials", leadId),
    ],
    [
      {
        path: `${base}/financials/asset-report`,
        name: "Asset Report (90d)",
        node_type: "document",
        doc_kind: "asset_report",
        lead_id: leadId,
        data: {
          status: "pending",
          asset_report_id: out.asset_report_id,
          asset_report_token: out.asset_report_token,
          requested_at: new Date().toISOString(),
        },
      },
    ],
  );
  return { ok: true, asset_report_id: out.asset_report_id, status: "pending" };
}

/** Pull a finished asset report into its vault doc (webhook or manual refresh). */
export async function refreshAssetReport(opts: { leadId?: string; assetReportId?: string }) {
  const db = svc();
  let q = db.from("plaid_nodes").select("path, lead_id, data").eq("doc_kind", "asset_report");
  if (opts.leadId) q = q.eq("lead_id", opts.leadId);
  if (opts.assetReportId) q = q.eq("data->>asset_report_id", opts.assetReportId);
  const { data: docs } = await q.limit(1);
  const doc = docs?.[0];
  if (!doc) throw new Error("No asset report found to refresh");

  let rep: any;
  try {
    rep = await plaid("/asset_report/get", { asset_report_token: doc.data.asset_report_token });
  } catch (err: any) {
    if ((err as any)?.plaid?.error_code === "PRODUCT_NOT_READY") {
      return { ok: true, status: "pending" };
    }
    throw err;
  }

  const report = rep.report ?? {};
  const summaryItems = (report.items ?? []).map((it: any) => ({
    institution_name: it.institution_name ?? null,
    accounts: (it.accounts ?? []).map((a: any) => ({
      name: a.name ?? null,
      mask: a.mask ?? null,
      type: a.type ?? null,
      subtype: a.subtype ?? null,
      current_balance: a.balances?.current ?? null,
      available_balance: a.balances?.available ?? null,
      days_available: a.days_available ?? null,
      historical_balances: (a.historical_balances ?? []).slice(0, 92).map((h: any) => ({
        date: h.date, current: h.current,
      })),
      transaction_count: (a.transactions ?? []).length,
      owners: (a.owners ?? []).map((o: any) => (o.names ?? []).join(", ")),
    })),
  }));

  await db
    .from("plaid_nodes")
    .update({
      data: {
        ...doc.data,
        status: "ready",
        generated_time: report.date_generated ?? null,
        days_requested: report.days_requested ?? 90,
        user: report.user ?? null,
        items: summaryItems,
        refreshed_at: new Date().toISOString(),
      },
    })
    .eq("path", doc.path);
  return { ok: true, status: "ready", items: summaryItems.length };
}

// ══════════════════════════════════════════════════════════════
// Disconnect
// ══════════════════════════════════════════════════════════════

export async function removeItem(itemId: string) {
  const db = svc();
  const { item, accessToken } = await loadItem(itemId);
  try {
    await plaid("/item/remove", { access_token: accessToken });
  } catch { /* token may already be revoked — still clean up locally */ }

  await db.from("plaid_nodes").delete().eq("item_id", itemId);
  await db.from("plaid_items").delete().eq("item_id", itemId); // cascades credentials

  const leadId: string | null = item.lead_id;
  if (leadId) {
    const { data: remaining } = await db
      .from("plaid_items")
      .select("item_id")
      .eq("lead_id", leadId)
      .limit(1);
    if (remaining && remaining.length) {
      // Recompute analysis from the surviving connections.
      try { await syncItem(remaining[0].item_id); } catch { /* best effort */ }
    } else {
      // Last connection gone — drop derived docs so stale analysis can't linger.
      const base = `/prospects/${leadId}`;
      await db
        .from("plaid_nodes")
        .delete()
        .in("path", [
          `${base}/summary`,
          `${base}/financials/cash-flow-analysis`,
          `${base}/decisioning/underwriting-inputs`,
        ]);
    }
  }
  return { ok: true, removed: itemId };
}

// ══════════════════════════════════════════════════════════════
// Webhook (mounted as its own public edge function)
// ══════════════════════════════════════════════════════════════

export async function handlePlaidWebhook(body: any): Promise<{ handled: string }> {
  const type = body?.webhook_type ?? "";
  const code = body?.webhook_code ?? "";
  const itemId = body?.item_id ?? "";

  // Asset-report webhooks carry an asset_report_id, not an item_id.
  if (type === "ASSETS") {
    if (code === "PRODUCT_READY" && body?.asset_report_id) {
      try {
        await refreshAssetReport({ assetReportId: body.asset_report_id });
        return { handled: `asset-report-ready:${body.asset_report_id}` };
      } catch (err: any) {
        console.error("[plaid-webhook] asset report fetch failed:", err?.message ?? err);
        return { handled: `asset-report-error:${body.asset_report_id}` };
      }
    }
    return { handled: `assets:${code}` };
  }

  // Monitor — Plaid's ongoing rescans fire SCREENING webhooks when a
  // screening's status changes or new hits land; re-pull into the vault.
  if (type === "SCREENING") {
    const screeningId: string = body?.screening_id ?? "";
    if (code === "STATUS_UPDATED" && screeningId) {
      try {
        await refreshScreening(screeningId);
        return { handled: `screening-updated:${screeningId}` };
      } catch (err: any) {
        console.error("[plaid-webhook] screening refresh failed:", err?.message ?? err);
        return { handled: `screening-error:${screeningId}` };
      }
    }
    return { handled: `screening:${code}` };
  }

  // Hosted-link sessions (CRM "send connect link") finish with a LINK
  // webhook carrying the public_token(s) — no item_id yet.
  if (type === "LINK") {
    const linkToken: string = body?.link_token ?? "";
    const linkSessionId: string | null = body?.link_session_id ?? null;
    if (code === "SESSION_FINISHED") {
      const publicTokens: string[] = (body?.public_tokens ?? []).filter(Boolean);
      if (!linkToken) return { handled: "link:no-token" };
      const db = svc();
      const { data: reqRow } = await db
        .from("plaid_link_requests")
        .select("lead_id, status, mode, item_id")
        .eq("link_token", linkToken)
        .maybeSingle();
      if (!reqRow) return { handled: "link:unknown-token" };
      if (linkSessionId) {
        await db
          .from("plaid_link_requests")
          .update({ link_session_id: linkSessionId })
          .eq("link_token", linkToken);
      }
      recordLinkEvent({
        event: "session_finished",
        leadId: reqRow.lead_id ?? null,
        itemId: reqRow.item_id ?? null,
        linkToken,
        linkSessionId,
        meta: { status: body?.status ?? null, mode: reqRow.mode ?? "add" },
      });
      if (reqRow.status !== "pending") return { handled: "link:already-handled" };
      const finished = String(body?.status ?? "").toUpperCase() === "SUCCESS";

      // Update-mode (repair) sessions fix an existing item in place — no
      // public_token arrives; success means re-auth/consent completed.
      if ((reqRow.mode ?? "add") === "update") {
        if (!finished || !reqRow.item_id) {
          return { handled: `link:finished-${body?.status ?? "no-status"}` };
        }
        await db
          .from("plaid_link_requests")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("link_token", linkToken);
        const repaired = await markItemRepaired(reqRow.item_id);
        return { handled: repaired.ok ? `link:repaired:${reqRow.item_id}` : "link:repair-sync-error" };
      }

      if (!reqRow.lead_id) return { handled: "link:unknown-token" };
      if (!finished || !publicTokens.length) {
        return { handled: `link:finished-${body?.status ?? "no-status"}` };
      }
      try {
        for (const pt of publicTokens) {
          await completeHostedLink(linkToken, reqRow.lead_id, pt);
        }
        return { handled: `link:completed:${reqRow.lead_id}` };
      } catch (err: any) {
        console.error("[plaid-webhook] hosted-link exchange failed:", err?.message ?? err);
        return { handled: "link:exchange-error" };
      }
    }
    // Every other LINK callback (EVENTS, ITEM_ADD_RESULT, ...) used to be
    // discarded — keep them: they are the funnel between "link sent" and
    // "session finished".
    recordLinkEvent({
      event: "callback",
      linkToken: linkToken || null,
      linkSessionId,
      meta: { code },
    });
    return { handled: `link:${code}` };
  }

  if (!itemId) return { handled: "ignored:no-item" };

  if (type === "TRANSACTIONS") {
    const syncCodes = [
      "SYNC_UPDATES_AVAILABLE",
      "INITIAL_UPDATE",
      "HISTORICAL_UPDATE",
      "DEFAULT_UPDATE",
      "TRANSACTIONS_REMOVED",
    ];
    if (syncCodes.includes(code)) {
      try {
        await syncItem(itemId);
        return { handled: `synced:${itemId}` };
      } catch (err: any) {
        console.error("[plaid-webhook] sync failed:", err?.message ?? err);
        return { handled: `sync-error:${itemId}` };
      }
    }
  }

  if (type === "ITEM") {
    const db = svc();
    if (code === "ERROR") {
      const errCode: string = body?.error?.error_code ?? code;
      await db
        .from("plaid_items")
        .update({
          status: "error",
          error: body?.error?.error_message ?? code,
          error_code: errCode,
        })
        .eq("item_id", itemId);
      // Repairable errors (login required, consent gaps) get the prospect
      // a reconnect link automatically; hard errors just stay flagged.
      if (REPAIR_ERROR_CODES.has(errCode)) await autoSendRepairLink(itemId);
      return { handled: `item-error:${itemId}` };
    }
    if (code === "PENDING_EXPIRATION" || code === "PENDING_DISCONNECT") {
      // The connection still works until it actually lapses — keep it
      // active (syncs continue) but flag it so the CRM shows "reconnect
      // needed" and the prospect gets a repair link before data stops.
      await db
        .from("plaid_items")
        .update({
          error: "Bank connection is expiring — reconnect needed.",
          error_code: code,
        })
        .eq("item_id", itemId);
      await autoSendRepairLink(itemId);
      return { handled: `item-repair-needed:${itemId}` };
    }
    if (code === "LOGIN_REPAIRED") {
      // The user fixed the connection at their bank on their own — clear
      // our repair flag and pull fresh data.
      await markItemRepaired(itemId);
      return { handled: `item-repaired:${itemId}` };
    }
    if (code === "NEW_ACCOUNTS_AVAILABLE") {
      recordLinkEvent({ event: "callback", itemId, meta: { code } });
      return { handled: `item-new-accounts:${itemId}` };
    }
    if (code === "USER_PERMISSION_REVOKED" || code === "USER_ACCOUNT_REVOKED") {
      await db
        .from("plaid_items")
        .update({ status: "disconnected", error: code, error_code: code })
        .eq("item_id", itemId);
      return { handled: `revoked:${itemId}` };
    }
  }

  return { handled: `ignored:${type}.${code}` };
}
