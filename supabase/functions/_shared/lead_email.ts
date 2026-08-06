/**
 * Email a Plaid hosted-link invite to a lead, from inside the CRM.
 *
 * One server-side action does the whole flow so the pieces can't drift
 * apart: reuse-or-mint the hosted link, send the branded Resend email
 * (CTA + fallback link through the click-tracking redirect, open pixel),
 * record the 'sent' outreach event, stamp emailed_to/emailed_at on the
 * request row, append a lead timeline entry, and advance New → Contacted.
 *
 * Row scope: needPerm() checks the permission key but not row ownership,
 * and everything here runs on the service-role client (RLS bypass), so
 * agents are explicitly restricted to their own (or unassigned) leads —
 * mirroring the pipeline_leads_update RLS policy.
 */

import { createHostedLink, svc } from "./plaid.ts";
import { emailOk, renderConnectLinkEmail, sendResendEmail } from "./email.ts";
import type { AuthContext } from "./auth.ts";

export const CONNECT_LINK_CAMPAIGN = "crm-connect-link";

interface LeadRow {
  id: string;
  org_id: string;
  agent_id: string | null;
  business_name: string;
  contact_name: string | null;
  contact_email: string | null;
  stage: string;
  timeline: unknown;
}

type RouteResult = { status: number; body: Record<string, unknown> };

/** Load a lead and enforce agent row-scope (agents may only act on their
 * own or unassigned leads — admins/super_admins see everything). */
export async function loadLeadScoped(
  leadId: string,
  ctx: AuthContext,
): Promise<{ lead: LeadRow } | RouteResult> {
  const db = svc();
  const { data: lead, error } = await db
    .from("pipeline_leads")
    .select("id, org_id, agent_id, business_name, contact_name, contact_email, stage, timeline")
    .eq("id", leadId)
    .maybeSingle();
  if (error) return { status: 500, body: { ok: false, error: error.message } };
  if (!lead) return { status: 404, body: { ok: false, error: "Lead not found" } };
  if (lead.org_id !== ctx.orgId) {
    return { status: 404, body: { ok: false, error: "Lead not found" } };
  }
  if (ctx.role === "agent" && lead.agent_id && lead.agent_id !== ctx.agentId) {
    return { status: 403, body: { ok: false, error: "This lead is assigned to another agent" } };
  }
  return { lead: lead as LeadRow };
}

/** A timeline entry in the shape the CRM's Activity tab renders
 * (crmStore.TimelineItem: title/description/user/timestamp). `date`
 * carries the machine-readable ISO alongside the display string. */
export function timelineEntry(title: string, description: string, user = "System") {
  const now = new Date();
  return {
    title,
    description,
    user,
    timestamp: now.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
    }),
    date: now.toISOString(),
  };
}

/** Prepend entries to a lead's timeline jsonb (best-effort; newest first,
 * matching leadActions.addTimeline). */
export async function appendLeadTimeline(
  leadId: string,
  entries: ReturnType<typeof timelineEntry>[],
) {
  try {
    const db = svc();
    const { data: lead } = await db
      .from("pipeline_leads").select("timeline").eq("id", leadId).maybeSingle();
    const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    await db.from("pipeline_leads")
      .update({ timeline: [...entries, ...timeline] })
      .eq("id", leadId);
  } catch { /* best-effort */ }
}

/** The sender's identity for reply_to + the email signoff. */
async function resolveSender(ctx: AuthContext): Promise<{ email: string | null; name: string | null }> {
  const db = svc();
  let email: string | null = null;
  let name: string | null = null;
  try {
    if (ctx.agentId) {
      const { data: agent } = await db
        .from("agents").select("name, email").eq("id", ctx.agentId).maybeSingle();
      name = agent?.name ?? null;
      email = agent?.email ?? null;
    }
    if (!email || !name) {
      const { data: member } = await db
        .from("org_members").select("display_name, email")
        .eq("user_id", ctx.userId).maybeSingle();
      name = name || member?.display_name || null;
      email = email || member?.email || null;
    }
    if (!email) {
      const { data } = await db.auth.admin.getUserById(ctx.userId);
      email = data?.user?.email ?? null;
    }
  } catch { /* sender identity is cosmetic — never fail the send over it */ }
  return { email, name };
}

export async function emailHostedLink(
  leadId: string,
  ctx: AuthContext,
  opts: { to?: string; note?: string } = {},
): Promise<RouteResult> {
  const db = svc();

  const scoped = await loadLeadScoped(leadId, ctx);
  if (!("lead" in scoped)) return scoped;
  const { lead } = scoped;

  const to = (opts.to ?? lead.contact_email ?? "").trim().toLowerCase();
  if (!to) {
    return { status: 400, body: { ok: false, error: "Lead has no email address — add one first." } };
  }
  if (!emailOk(to)) {
    return { status: 400, body: { ok: false, error: `"${to}" is not a valid email address.` } };
  }
  const note = (opts.note ?? "").trim().slice(0, 1000) || null;

  // Reuse the pending, unexpired request row; mint a fresh link otherwise.
  const { data: existing } = await db
    .from("plaid_link_requests")
    .select("link_token, hosted_link_url, tracking_id, expires_at, emailed_to, emailed_at")
    .eq("lead_id", leadId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Double-click / double-tap guard: same recipient within 2 minutes.
  if (
    existing?.emailed_at && existing.emailed_to === to &&
    Date.now() - new Date(existing.emailed_at).getTime() < 2 * 60_000
  ) {
    return {
      status: 200,
      body: { ok: true, duplicate: true, emailed_to: to, hosted_link_url: existing.hosted_link_url },
    };
  }

  let request = existing;
  let reused = Boolean(existing);
  if (!request) {
    const minted = await createHostedLink(leadId);
    const { data: fresh, error } = await db
      .from("plaid_link_requests")
      .select("link_token, hosted_link_url, tracking_id, expires_at, emailed_to, emailed_at")
      .eq("link_token", minted.link_token)
      .maybeSingle();
    if (error || !fresh) {
      return { status: 500, body: { ok: false, error: "Failed to record the connect link." } };
    }
    request = fresh;
    reused = false;
  }

  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const trackBase = `${base}/functions/v1/email-track`;
  const clickUrl = `${trackBase}/click?t=${request.tracking_id}`;
  const openPixelUrl = `${trackBase}/open?t=${request.tracking_id}`;

  const sender = await resolveSender(ctx);
  const { html, text } = renderConnectLinkEmail({
    businessName: lead.business_name,
    contactName: lead.contact_name,
    agentName: sender.name,
    clickUrl,
    openPixelUrl,
    expiresAt: request.expires_at,
    note,
  });

  await sendResendEmail({
    to,
    subject: `${lead.business_name} — connect your bank to complete your application`,
    html,
    text,
    ...(sender.email ? { replyTo: sender.email } : {}),
  });

  // Everything after the send is best-effort bookkeeping: the email is out,
  // so record what we can and never surface a 500 for a stats hiccup.
  const { error: evErr } = await db.from("outreach_events").insert({
    org_id: lead.org_id,
    lead_id: lead.id,
    lead_email: to,
    lead_name: lead.business_name,
    campaign: CONNECT_LINK_CAMPAIGN,
    channel: "email",
    event: "sent",
    meta: { tracking_id: request.tracking_id, sent_by: ctx.userId, reused },
  });
  if (evErr) console.error("connect-link email: outreach insert failed:", evErr.message);

  const { error: upErr } = await db
    .from("plaid_link_requests")
    .update({ emailed_to: to, emailed_at: new Date().toISOString() })
    .eq("link_token", request.link_token);
  if (upErr) console.error("connect-link email: request stamp failed:", upErr.message);

  const senderLabel = sender.name || sender.email || "System";
  const entries = [timelineEntry(
    "Connect link emailed",
    `Application & bank-connect link emailed to ${to} (valid 7 days).`,
    senderLabel,
  )];
  if (lead.stage === "New") {
    entries.unshift(timelineEntry(
      "Stage advanced to Contacted",
      "Connect link emailed to the prospect.",
      senderLabel,
    ));
    const { error: stErr } = await db
      .from("pipeline_leads").update({ stage: "Contacted" }).eq("id", leadId).eq("stage", "New");
    if (stErr) console.error("connect-link email: stage advance failed:", stErr.message);
  }
  await appendLeadTimeline(leadId, entries);

  return {
    status: 200,
    body: {
      ok: true,
      emailed_to: to,
      hosted_link_url: request.hosted_link_url,
      tracking_id: request.tracking_id,
      expires_at: request.expires_at,
      reused,
    },
  };
}
