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

// ══════════════════════════════════════════════════════════════
// Lead-form reconciliation
// ══════════════════════════════════════════════════════════════
// Pulls the actual lead submissions (name/email/phone) from Meta's
// Lead Ads API and matches them against pipeline_leads, so the CRM
// can surface paid leads that never arrived (e.g. dropped by the
// Zapier hop) and import them.
//
// Requires the token to carry leads_retrieval + pages_show_list and
// the Facebook Page to be assigned to the system user — /me/accounts
// then hands us a page access token for the form reads.

function fieldValue(fieldData: { name?: string; values?: string[] }[], names: string[]): string | null {
  for (const want of names) {
    const hit = fieldData.find(f => (f.name || "").toLowerCase() === want);
    const v = hit?.values?.[0]?.trim();
    if (v) return v;
  }
  return null;
}

const normEmail = (e: string | null | undefined) => (e || "").trim().toLowerCase() || null;
const normPhone = (p: string | null | undefined) => {
  const digits = (p || "").replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : null;
};
const normName = (n: string | null | undefined) =>
  (n || "").trim().toLowerCase().replace(/\s+/g, " ") || null;

/** Pull every retrievable lead submission and reconcile against the CRM.
 * Meta retains lead data for 90 days, so this is inherently trailing-window. */
export async function syncMetaLeads(): Promise<{
  pages: number;
  forms: number;
  total: number;
  matched: number;
  missing: number;
}> {
  const { token, accountId } = await getCredential();
  const db = svc();

  // Pages assigned to the system user (each with its own page token).
  const acctResp = await graphGet("/me/accounts", token, {
    fields: "id,name,access_token",
    limit: "100",
  });
  const pages: { id: string; name: string | null; access_token: string }[] =
    (acctResp.data ?? []).filter((p: any) => p?.id && p?.access_token);
  if (!pages.length) {
    throw new Error(
      "No Facebook Page is visible to the token. In Business Settings → System users → Assign assets, add the Page your lead ads run under, then re-sync.",
    );
  }

  const rows: Record<string, unknown>[] = [];
  let formCount = 0;

  for (const page of pages) {
    // Forms on the page (paginated).
    let after: string | undefined;
    const forms: { id: string; name: string | null }[] = [];
    do {
      const params: Record<string, string> = { fields: "id,name,status", limit: "100" };
      if (after) params.after = after;
      const fp = await graphGet(`/${page.id}/leadgen_forms`, page.access_token, params);
      for (const f of fp.data ?? []) forms.push({ id: f.id, name: f.name ?? null });
      after = fp.paging?.cursors?.after && fp.paging?.next ? fp.paging.cursors.after : undefined;
    } while (after);
    formCount += forms.length;

    for (const form of forms) {
      let leadAfter: string | undefined;
      do {
        const params: Record<string, string> = {
          fields: "id,created_time,ad_id,ad_name,campaign_id,campaign_name,is_organic,field_data",
          limit: "100",
        };
        if (leadAfter) params.after = leadAfter;
        const lp = await graphGet(`/${form.id}/leads`, page.access_token, params);
        for (const l of lp.data ?? []) {
          const fd: { name?: string; values?: string[] }[] = l.field_data ?? [];
          const email = fieldValue(fd, ["email", "work_email", "correo_electrónico", "correo_electronico"]);
          const phone = fieldValue(fd, ["phone_number", "phone", "número_de_teléfono", "numero_de_telefono"]);
          const first = fieldValue(fd, ["first_name", "nombre"]);
          const last = fieldValue(fd, ["last_name", "apellidos", "apellido"]);
          const fullName =
            fieldValue(fd, ["full_name", "name", "nombre_completo"]) ||
            [first, last].filter(Boolean).join(" ") || null;
          rows.push({
            provider: "meta",
            lead_id: String(l.id),
            account_id: accountId,
            page_id: page.id,
            page_name: page.name,
            form_id: form.id,
            form_name: form.name,
            campaign_id: l.campaign_id ?? null,
            campaign_name: l.campaign_name ?? null,
            ad_id: l.ad_id ?? null,
            ad_name: l.ad_name ?? null,
            is_organic: Boolean(l.is_organic),
            created_time: l.created_time ?? null,
            full_name: fullName,
            email,
            phone,
            field_data: fd,
            synced_at: new Date().toISOString(),
          });
        }
        leadAfter = lp.paging?.cursors?.after && lp.paging?.next ? lp.paging.cursors.after : undefined;
      } while (leadAfter);
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db
      .from("ad_leads")
      .upsert(rows.slice(i, i + 500), { onConflict: "provider,lead_id" });
    if (error) throw new Error(`Storing lead forms failed: ${error.message}`);
  }

  const { matched, missing } = await reconcileMetaLeads();
  return { pages: pages.length, forms: formCount, total: rows.length, matched, missing };
}

/** Re-run CRM matching over everything in ad_leads. Cheap; pure DB. */
export async function reconcileMetaLeads(): Promise<{ matched: number; missing: number }> {
  const db = svc();
  const [{ data: adLeads, error: alErr }, { data: crm, error: plErr }] = await Promise.all([
    db.from("ad_leads").select("lead_id,email,phone,full_name").eq("provider", "meta"),
    db.from("pipeline_leads").select("id,external_id,contact_email,contact_phone,contact_name,business_name"),
  ]);
  if (alErr) throw new Error(alErr.message);
  if (plErr) throw new Error(plErr.message);

  const byExternal = new Map<string, string>();
  const byEmail = new Map<string, string>();
  const byPhone = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const p of crm ?? []) {
    if (p.external_id) byExternal.set(String(p.external_id), p.id);
    const e = normEmail(p.contact_email);
    if (e && !byEmail.has(e)) byEmail.set(e, p.id);
    const ph = normPhone(p.contact_phone);
    if (ph && !byPhone.has(ph)) byPhone.set(ph, p.id);
    for (const n of [normName(p.contact_name), normName(p.business_name)]) {
      if (n && !byName.has(n)) byName.set(n, p.id);
    }
  }

  let matched = 0;
  let missing = 0;
  for (const l of adLeads ?? []) {
    let hit: string | undefined;
    let basis: string | null = null;
    if ((hit = byExternal.get(`l:${l.lead_id}`))) basis = "lead_id";
    else if ((hit = l.email ? byEmail.get(normEmail(l.email)!) : undefined)) basis = "email";
    else if ((hit = l.phone ? byPhone.get(normPhone(l.phone) ?? "") : undefined)) basis = "phone";
    else if ((hit = l.full_name ? byName.get(normName(l.full_name)!) : undefined)) basis = "name";

    if (hit) matched++; else missing++;
    await db.from("ad_leads")
      .update({ matched_lead_id: hit ?? null, match_basis: basis })
      .eq("provider", "meta").eq("lead_id", l.lead_id);
  }
  return { matched, missing };
}

/** Import unmatched Meta leads into pipeline_leads using the same id/
 * external_id convention as the Zapier-delivered rows, so future syncs
 * match them by lead_id. created_at keeps the original submission time
 * so pipeline aging is honest. */
export async function importMetaLeads(leadIds: string[]): Promise<{ imported: number; skipped: number }> {
  const db = svc();
  const { data: adLeads, error } = await db
    .from("ad_leads").select("*").eq("provider", "meta").in("lead_id", leadIds);
  if (error) throw new Error(error.message);

  let imported = 0;
  let skipped = 0;
  const now = new Date().toISOString();
  for (const l of adLeads ?? []) {
    if (l.matched_lead_id) { skipped++; continue; }
    const id = `lead-meta-l${l.lead_id}`;
    const name = l.full_name || l.email || `Meta lead ${l.lead_id}`;
    const products = /capital/i.test(l.form_name ?? "")
      ? ["Capital"]
      : /processing/i.test(l.form_name ?? "") ? ["Processing"] : [];
    const { error: insErr } = await db.from("pipeline_leads").insert({
      id,
      products,
      business_name: name,
      contact_name: l.full_name ?? null,
      contact_email: l.email ?? null,
      contact_phone: l.phone ?? null,
      source: "Meta Ads",
      stage: "New",
      status: "New",
      external_id: `l:${l.lead_id}`,
      created_at: l.created_time ?? now,
      timeline: [{
        date: now,
        event: `Recovered from Meta lead form${l.form_name ? ` “${l.form_name}”` : ""} by ad-spend reconciliation (submitted ${l.created_time ?? "unknown"}).`,
      }],
    });
    if (insErr) {
      // Unique violation → someone already holds this id; treat as matched.
      skipped++;
    } else {
      imported++;
    }
    await db.from("ad_leads")
      .update({ matched_lead_id: id, match_basis: insErr ? "lead_id" : "imported" })
      .eq("provider", "meta").eq("lead_id", l.lead_id);
  }
  return { imported, skipped };
}

/** Drop the token and mark the connection disconnected. Insights are kept. */
export async function disconnectMeta(): Promise<void> {
  const db = svc();
  await db.from("ad_credentials").delete().eq("provider", "meta");
  await db.from("ad_connections")
    .update({ status: "disconnected", updated_at: new Date().toISOString() })
    .eq("provider", "meta");
}
