/**
 * AI usage metering — per-call cost attribution.
 *
 * Both AI edge functions get token counts back from their provider but had
 * nowhere to put them, and neither knew who was calling: platform-level
 * `verify_jwt` proves the caller is signed in without revealing who they are.
 * This resolves the caller from the JWT and writes a ledger row per call.
 *
 * Design rule: metering must never break the feature it measures. Every
 * function here swallows its own errors and logs loudly. Losing a ledger row
 * is an accounting problem; failing a user's AI request because bookkeeping
 * broke is a product problem.
 */

import { createClient } from "npm:@supabase/supabase-js@2";

export interface Caller {
  userId: string;
  /** Staff (internal) vs customer (merchant-facing) — RPT-022's key dimension. */
  subjectType: "staff" | "customer";
}

export interface UsageArgs {
  caller: Caller | null;
  feature: string;               // lens_chat | statement_analyzer
  provider: string;              // nebius | anthropic
  /** The model that ACTUALLY served the call — Anthropic's fallbacks can substitute one. */
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  status?: "ok" | "error" | "blocked";
}

const svc = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

/**
 * Identify the caller from the request's bearer token. Mirrors the
 * verifyStaff() pattern in _shared/plaid.ts, but classifies rather than
 * gates: a customer is a valid caller, just a different subject type.
 *
 * Returns null when the token is missing or invalid — callers should still
 * serve the request (platform verify_jwt already gated it); the call just
 * goes unattributed.
 */
export async function resolveCaller(req: Request): Promise<Caller | null> {
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return null;

    const db = svc();
    const { data, error } = await db.auth.getUser(token);
    if (error || !data?.user) return null;

    const { data: staff } = await db
      .from("staff_profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    return { userId: data.user.id, subjectType: staff ? "staff" : "customer" };
  } catch (err) {
    console.error("[metering] resolveCaller failed:", (err as Error).message);
    return null;
  }
}

/**
 * Write one ledger row, pricing it from ai_model_prices at write time so the
 * historical record reflects what was actually paid even after rates change.
 */
export async function recordUsage(args: UsageArgs): Promise<void> {
  try {
    if (!args.caller) {
      console.warn(`[metering] unattributed ${args.feature} call — no ledger row`);
      return;
    }

    const db = svc();

    // Providers return dated or substituted model ids — Anthropic's
    // fallbacks can serve `claude-opus-5-20260514` when we asked for
    // `claude-opus-5`. Match on the longest seeded id the served model
    // starts with, so a dated variant prices off its base row.
    const { data: prices } = await db
      .from("ai_model_prices")
      .select("model, input_usd_per_mtok, output_usd_per_mtok, cached_input_usd_per_mtok")
      .eq("provider", args.provider)
      .lte("effective_from", new Date().toISOString())
      .order("effective_from", { ascending: false });

    const price = (prices ?? [])
      .filter(p => args.model === p.model || args.model.startsWith(p.model))
      .sort((a, b) => b.model.length - a.model.length)[0];

    if (!price) {
      // Record the usage anyway at zero cost so a newly-introduced model shows
      // up immediately and the rate can be backfilled.
      console.warn(`[metering] no price row for ${args.provider}/${args.model} — recording at $0`);
    }

    const inRate = Number(price?.input_usd_per_mtok ?? 0);
    const outRate = Number(price?.output_usd_per_mtok ?? 0);
    // Providers without prompt caching report no cached tokens; fall back to
    // the full input rate so a stray count is never priced at zero by accident.
    const cachedRate = price?.cached_input_usd_per_mtok == null
      ? inRate
      : Number(price.cached_input_usd_per_mtok);

    const cachedTokens = args.cachedInputTokens ?? 0;
    const costUsd =
      (args.inputTokens * inRate + args.outputTokens * outRate + cachedTokens * cachedRate) / 1_000_000;

    const { error } = await db.from("ai_usage").insert({
      user_id: args.caller.userId,
      subject_type: args.caller.subjectType,
      feature: args.feature,
      provider: args.provider,
      model: args.model,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      cached_input_tokens: cachedTokens,
      cost_usd: Number(costUsd.toFixed(6)),
      status: args.status ?? "ok",
    });

    if (error) console.error("[metering] ledger insert failed:", error.message);
  } catch (err) {
    console.error("[metering] recordUsage failed:", (err as Error).message);
  }
}

export interface QuotaDecision {
  allowed: boolean;
  /** The cap that applied, when one did. */
  capUsd?: number;
  /** Month-to-date spend at decision time. */
  spentUsd?: number;
}

/**
 * Soft monthly spend cap, resolved user row → subject-type default row →
 * no cap. Month boundary is UTC first-of-month, matching the CRM store's
 * MTD math.
 *
 * Fails OPEN: any error here allows the call. Blocking a user because the
 * quota lookup broke would violate the never-break-the-feature rule above —
 * the cap is a budget guardrail, not a security boundary.
 */
export async function checkQuota(caller: Caller | null): Promise<QuotaDecision> {
  try {
    if (!caller) return { allowed: true }; // unattributed calls can't be capped

    const db = svc();
    const { data: rows, error } = await db
      .from("ai_quotas")
      .select("scope, scope_id, monthly_cost_cap_usd")
      .or(
        `and(scope.eq.user,scope_id.eq.${caller.userId}),and(scope.eq.default,scope_id.eq.${caller.subjectType})`,
      );
    if (error) throw error;

    const quota =
      (rows ?? []).find(r => r.scope === "user") ??
      (rows ?? []).find(r => r.scope === "default");
    if (!quota || quota.monthly_cost_cap_usd == null) return { allowed: true };
    const capUsd = Number(quota.monthly_cost_cap_usd);

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    // Sum in JS: per-user monthly row counts are small, and this avoids
    // PostgREST aggregate configuration. Rides the (user_id, created_at) index.
    const { data: usage, error: usageErr } = await db
      .from("ai_usage")
      .select("cost_usd")
      .eq("user_id", caller.userId)
      .eq("status", "ok")
      .gte("created_at", monthStart.toISOString());
    if (usageErr) throw usageErr;

    const spentUsd = (usage ?? []).reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);
    if (spentUsd >= capUsd) return { allowed: false, capUsd, spentUsd };
    return { allowed: true, capUsd, spentUsd };
  } catch (err) {
    console.error("[metering] checkQuota failed (allowing call):", (err as Error).message);
    return { allowed: true };
  }
}

/**
 * Model tier for a caller. Resolved server-side from subject type — never
 * from the request body, or a customer could ask for the expensive model.
 *
 * Inert today (all traffic is staff). Cross-provider routing (Claude for
 * staff) would need an Anthropic branch in nebius-chat or a separate
 * function; this seam covers model choice within one provider.
 */
export function tierFor(caller: Caller | null): "premium" | "standard" {
  return caller?.subjectType === "staff" ? "premium" : "standard";
}
