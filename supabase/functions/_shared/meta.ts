/**
 * ────────────────────────────────────────────────────────────
 * Meta (Facebook) Ads — Marketing API client
 * ────────────────────────────────────────────────────────────
 * Mirrors the Plaid module's shape: credentials live in a service-role-only
 * table (ad_credentials), connection metadata in ad_connections, and pulled
 * performance data lands in ad_insights_daily at campaign/day grain.
 *
 * The access token is a Meta system-user token (Business Settings → System
 * users → Generate token) with the ads_read permission, pasted by staff in
 * the Marketing Hub connect dialog. The browser sends it once over TLS to
 * the connect endpoint; after that it never leaves the server.
 */

import { svc } from "./plaid.ts";

const GRAPH = "https://graph.facebook.com/v23.0";

// ── Graph API plumbing ──

async function graphGet(
  path: string,
  token: string,
  params: Record<string, string> = {},
): Promise<any> {
  const url = new URL(`${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token);
  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    const e = json?.error ?? {};
    const msg = e.error_user_msg || e.message || `Meta API ${path} failed (${res.status})`;
    const err = new Error(msg) as Error & { meta?: unknown };
    err.meta = e;
    throw err;
  }
  return json;
}

function normalizeAccountId(raw: string): string {
  const digits = raw.trim().replace(/^act_/i, "");
  if (!/^\d+$/.test(digits)) {
    throw new Error("Ad account ID should look like act_1234567890 (or just the number).");
  }
  return `act_${digits}`;
}

/** Count leads from an insights row's actions array without double counting:
 * Meta's 'lead' action_type already aggregates form + website leads, so use
 * it when present and only fall back to summing the grouped subtypes. */
function leadsFromActions(actions: { action_type: string; value: string }[] | undefined): number {
  if (!actions?.length) return 0;
  const total = actions.find(a => a.action_type === "lead");
  if (total) return Number(total.value) || 0;
  return actions
    .filter(a => a.action_type === "leadgen_grouped" || a.action_type === "onsite_conversion.lead_grouped")
    .reduce((s, a) => s + (Number(a.value) || 0), 0);
}

async function getCredential(): Promise<{ token: string; accountId: string }> {
  const db = svc();
  const [{ data: cred }, { data: conn }] = await Promise.all([
    db.from("ad_credentials").select("access_token").eq("provider", "meta").maybeSingle(),
    db.from("ad_connections").select("account_id,status").eq("provider", "meta").maybeSingle(),
  ]);
  if (!cred?.access_token || !conn?.account_id) {
    throw new Error("Meta is not connected. Use Connect ad accounts first.");
  }
  return { token: cred.access_token, accountId: conn.account_id };
}

// ══════════════════════════════════════════════════════════════
// Public API (called from server routes)
// ══════════════════════════════════════════════════════════════

/** Validate the token + account, store the credential, and record the
 * connection. Returns account metadata (never the token). */
export async function connectMeta(
  accessToken: string,
  adAccountId: string,
  userId: string,
): Promise<{ account_id: string; account_name: string | null; currency: string | null }> {
  const accountId = normalizeAccountId(adAccountId);
  const token = accessToken.trim();
  if (!token) throw new Error("Access token is required.");

  // Two harmless validation calls: token identity, then account access.
  await graphGet("/me", token, { fields: "id,name" });
  const acct = await graphGet(`/${accountId}`, token, {
    fields: "name,currency,account_status",
  });

  const db = svc();
  const now = new Date().toISOString();
  const { error: connErr } = await db.from("ad_connections").upsert({
    provider: "meta",
    account_id: accountId,
    account_name: acct.name ?? null,
    currency: acct.currency ?? null,
    status: "active",
    error: null,
    connected_by: userId || null,
    updated_at: now,
  });
  if (connErr) throw new Error(`Saving connection failed: ${connErr.message}`);

  const { error: credErr } = await db.from("ad_credentials").upsert({
    provider: "meta",
    access_token: token,
  });
  if (credErr) throw new Error(`Saving credentials failed: ${credErr.message}`);

  return {
    account_id: accountId,
    account_name: acct.name ?? null,
    currency: acct.currency ?? null,
  };
}

/** Pull campaign/day insights for the trailing window and upsert them.
 * Returns row + campaign counts for the toast. */
export async function syncMeta(days = 90): Promise<{
  rows: number;
  campaigns: number;
  since: string;
  until: string;
}> {
  const { token, accountId } = await getCredential();
  const db = svc();

  const until = new Date();
  const since = new Date(until.getTime() - Math.min(Math.max(days, 1), 365) * 86400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const rows: Record<string, unknown>[] = [];
  const campaigns = new Set<string>();
  let after: string | undefined;

  try {
    do {
      const params: Record<string, string> = {
        level: "campaign",
        time_increment: "1",
        time_range: JSON.stringify({ since: fmt(since), until: fmt(until) }),
        fields: "campaign_id,campaign_name,spend,impressions,clicks,actions",
        limit: "500",
      };
      if (after) params.after = after;
      const page = await graphGet(`/${accountId}/insights`, token, params);
      for (const r of page.data ?? []) {
        campaigns.add(r.campaign_id);
        rows.push({
          provider: "meta",
          account_id: accountId,
          campaign_id: r.campaign_id,
          campaign_name: r.campaign_name ?? null,
          day: r.date_start,
          spend: Number(r.spend) || 0,
          impressions: Number(r.impressions) || 0,
          clicks: Number(r.clicks) || 0,
          leads: leadsFromActions(r.actions),
          synced_at: new Date().toISOString(),
        });
      }
      after = page.paging?.cursors?.after && page.paging?.next ? page.paging.cursors.after : undefined;
    } while (after);
  } catch (err) {
    // Record the failure on the connection so the UI can surface it.
    await db.from("ad_connections")
      .update({ status: "error", error: String((err as Error).message), updated_at: new Date().toISOString() })
      .eq("provider", "meta");
    throw err;
  }

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db
      .from("ad_insights_daily")
      .upsert(rows.slice(i, i + 500), { onConflict: "provider,account_id,campaign_id,day" });
    if (error) throw new Error(`Storing insights failed: ${error.message}`);
  }

  await db.from("ad_connections")
    .update({ status: "active", error: null, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("provider", "meta");

  return { rows: rows.length, campaigns: campaigns.size, since: fmt(since), until: fmt(until) };
}

/** Connection + data footprint for the status endpoint. Token never leaves. */
export async function adsStatus(): Promise<Record<string, unknown>> {
  const db = svc();
  const [{ data: conn }, { count }] = await Promise.all([
    db.from("ad_connections").select("provider,account_id,account_name,currency,status,error,last_synced_at").eq("provider", "meta").maybeSingle(),
    db.from("ad_insights_daily").select("*", { count: "exact", head: true }).eq("provider", "meta"),
  ]);
  return { meta: conn ?? null, insight_rows: count ?? 0 };
}

/** Drop the token and mark the connection disconnected. Insights are kept. */
export async function disconnectMeta(): Promise<void> {
  const db = svc();
  await db.from("ad_credentials").delete().eq("provider", "meta");
  await db.from("ad_connections")
    .update({ status: "disconnected", updated_at: new Date().toISOString() })
    .eq("provider", "meta");
}
