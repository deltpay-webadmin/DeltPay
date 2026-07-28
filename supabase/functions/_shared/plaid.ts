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

// ══════════════════════════════════════════════════════════════
// Config
// ══════════════════════════════════════════════════════════════

const PLAID_HOSTS: Record<string, string> = {
  sandbox: "https://sandbox.plaid.com",
  development: "https://development.plaid.com",
  production: "https://production.plaid.com",
};

export function plaidConfig() {
  const clientId = Deno.env.get("PLAID_CLIENT_ID") ?? "";
  const secret = Deno.env.get("PLAID_SECRET") ?? "";
  const env = (Deno.env.get("PLAID_ENV") ?? "sandbox").toLowerCase();
  const products = (Deno.env.get("PLAID_PRODUCTS") ?? "auth,transactions,identity")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    clientId,
    secret,
    env,
    products,
    host: PLAID_HOSTS[env] ?? PLAID_HOSTS.sandbox,
    configured: Boolean(clientId && secret),
  };
}

export function webhookUrl(): string {
  const base = Deno.env.get("SUPABASE_URL") ?? "";
  return base ? `${base}/functions/v1/plaid-webhook` : "";
}

export function svc(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Raw Plaid API call. Throws with Plaid's error_message on failure. */
async function plaid(path: string, body: Record<string, unknown>): Promise<any> {
  const cfg = plaidConfig();
  if (!cfg.configured) {
    throw new Error(
      "Plaid credentials not configured. Add PLAID_CLIENT_ID and PLAID_SECRET as Edge Function secrets.",
    );
  }
  const res = await fetch(`${cfg.host}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: cfg.clientId, secret: cfg.secret, ...body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error_message || json?.error_code || `Plaid ${path} failed (${res.status})`;
    const err = new Error(msg) as Error & { plaid?: any };
    err.plaid = json;
    throw err;
  }
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
    client_name: "Delt Pay CRM",
    language: "en",
    country_codes: ["US"],
    products: cfg.products,
    optional_products: ["liabilities"],
  };
  const hook = webhookUrl();
  if (hook) req.webhook = hook;
  const out = await plaid("/link/token/create", req);
  return { link_token: out.link_token, expiration: out.expiration };
}

export async function exchangePublicToken(
  leadId: string,
  publicToken: string,
  institution?: { institution_id?: string; name?: string },
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
    },
    { onConflict: "item_id" },
  );
  if (itemErr) throw new Error(`Failed to save Plaid item: ${itemErr.message}`);

  const { error: credErr } = await db
    .from("plaid_credentials")
    .upsert({ item_id: itemId, access_token: accessToken }, { onConflict: "item_id" });
  if (credErr) throw new Error(`Failed to save Plaid credentials: ${credErr.message}`);

  const sync = await syncItem(itemId);
  return { item_id: itemId, item_key: itemKey, institution_name: instName, sync };
}

/** Sandbox-only: create + exchange a test item without going through Link. */
export async function sandboxQuickConnect(leadId: string, institutionId = "ins_109508") {
  const cfg = plaidConfig();
  if (cfg.env !== "sandbox") {
    throw new Error("Sandbox quick-connect is only available when PLAID_ENV=sandbox.");
  }
  const out = await plaid("/sandbox/public_token/create", {
    institution_id: institutionId,
    initial_products: cfg.products,
  });
  return exchangePublicToken(leadId, out.public_token);
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

export async function syncItem(itemId: string) {
  const db = svc();
  const { item, accessToken } = await loadItem(itemId);
  const leadId: string = item.lead_id;
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
    // ── 1. Accounts + balances ──
    const accountsRes = await plaid("/accounts/get", { access_token: accessToken });
    const accounts: any[] = accountsRes.accounts ?? [];

    // ── 2. Bank account verification (Auth) — store masked numbers only ──
    const routingByAccount = new Map<string, { routingLast4: string; accountLast4: string; wireRouting?: string }>();
    try {
      const auth = await plaid("/auth/get", { access_token: accessToken });
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
    try {
      const identity = await plaid("/identity/get", { access_token: accessToken });
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

    // ── 4. Credit data (liabilities) ──
    let liabilities: any = null;
    try {
      const li = await plaid("/liabilities/get", { access_token: accessToken });
      liabilities = li?.liabilities ?? null;
    } catch { /* liabilities unavailable — fine */ }

    // ── 5. Transactions (incremental /transactions/sync) ──
    let cursor: string | null = item.transactions_cursor ?? null;
    const added: Txn[] = [];
    const modified: Txn[] = [];
    const removedIds: string[] = [];
    try {
      let hasMore = true;
      let guard = 0;
      while (hasMore && guard++ < 50) {
        const page = await plaid("/transactions/sync", {
          access_token: accessToken,
          cursor: cursor ?? undefined,
          count: 500,
        });
        added.push(...(page.added ?? []));
        modified.push(...(page.modified ?? []));
        removedIds.push(...((page.removed ?? []).map((r: any) => r.transaction_id)));
        cursor = page.next_cursor;
        hasMore = Boolean(page.has_more);
      }
    } catch (err) {
      // PRODUCT_NOT_READY right after linking — webhook will retrigger us.
      const code = (err as any)?.plaid?.error_code;
      if (code !== "PRODUCT_NOT_READY") throw err;
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

    const m = cashFlow.metrics;
    const analysisDocs: NodeRow[] = [
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
          monthly_revenue: m.monthlyRevenue,
          avg_daily_balance: m.avgDailyBalance,
          nsf_count_90d: m.nsfCount90d,
          last_synced: now,
        },
      },
    ];
    await writeNodes(db, [], analysisDocs);

    await db
      .from("plaid_items")
      .update({
        transactions_cursor: cursor,
        last_synced_at: now,
        status: "active",
        error: null,
      })
      .eq("item_id", itemId);

    return {
      ok: true,
      item_id: itemId,
      accounts: accounts.length,
      depository_accounts: depositoryAccounts.length,
      owners: owners.length,
      transactions_added: added.length,
      transactions_modified: modified.length,
      transactions_removed: removedIds.length,
      metrics: m,
    };
  } catch (err: any) {
    await db
      .from("plaid_items")
      .update({ status: "error", error: String(err?.message ?? err) })
      .eq("item_id", itemId);
    throw err;
  }
}

export async function syncAllItems(leadId?: string) {
  const db = svc();
  let q = db.from("plaid_items").select("item_id").neq("status", "disconnected");
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
    if (code === "ERROR" || code === "PENDING_EXPIRATION" || code === "PENDING_DISCONNECT") {
      await db
        .from("plaid_items")
        .update({ status: "error", error: body?.error?.error_message ?? code })
        .eq("item_id", itemId);
      return { handled: `item-error:${itemId}` };
    }
    if (code === "USER_PERMISSION_REVOKED" || code === "USER_ACCOUNT_REVOKED") {
      await db
        .from("plaid_items")
        .update({ status: "disconnected", error: code })
        .eq("item_id", itemId);
      return { handled: `revoked:${itemId}` };
    }
  }

  return { handled: `ignored:${type}.${code}` };
}
