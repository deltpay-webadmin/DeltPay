/**
 * Public email-engagement tracker for CRM-sent connect-link invites.
 *
 *   GET /email-track/open?t=<tracking_id>   → 1×1 GIF, logs 'opened'
 *   GET /email-track/click?t=<tracking_id>  → 302 to the Plaid hosted
 *                                             link, logs 'clicked'
 *
 * verify_jwt = false (config.toml): email clients send no Authorization
 * header. The tracking_id is an unguessable uuid minted per link request
 * (plaid_link_requests.tracking_id); unknown or malformed tokens write
 * nothing and return the same output as valid ones (pixel) or a redirect
 * to the site (click), so the endpoint is neither a validity oracle nor
 * an open redirect — the click target always comes from our own DB row.
 * The pixel must NEVER error: a broken image in the invite is worse than
 * a lost stat, so every failure path still returns the GIF.
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const CAMPAIGN = "crm-connect-link";
const FALLBACK_URL = Deno.env.get("SITE_ORIGIN") || "https://deltpay.com";

// 1×1 transparent GIF.
const PIXEL = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (ch) => ch.charCodeAt(0),
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function svc() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function gif(): Response {
  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, max-age=0",
    },
  });
}

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store, no-cache, max-age=0" },
  });
}

/** Resolve the tracking token to its link request + lead, or null. */
async function resolve(trackingId: string) {
  const db = svc();
  const { data: req } = await db
    .from("plaid_link_requests")
    .select("lead_id, hosted_link_url, emailed_to, status")
    .eq("tracking_id", trackingId)
    .maybeSingle();
  if (!req?.lead_id) return null;
  const { data: lead } = await db
    .from("pipeline_leads")
    .select("id, org_id, business_name, contact_email")
    .eq("id", req.lead_id)
    .maybeSingle();
  if (!lead) return null;
  return { req, lead };
}

async function logEvent(
  event: "opened" | "clicked",
  trackingId: string,
  found: NonNullable<Awaited<ReturnType<typeof resolve>>>,
  ua: string,
) {
  const { error } = await svc().from("outreach_events").insert({
    org_id: found.lead.org_id,
    lead_id: found.lead.id,
    lead_email: found.req.emailed_to ?? found.lead.contact_email,
    lead_name: found.lead.business_name,
    campaign: CAMPAIGN,
    channel: "email",
    event,
    meta: { tracking_id: trackingId, ua: ua.slice(0, 300) },
  });
  if (error) console.error(`email-track ${event} insert failed:`, error.message);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const kind = url.pathname.endsWith("/click") ? "click"
    : url.pathname.endsWith("/open") ? "open"
    : null;
  const token = (url.searchParams.get("t") ?? "").trim().toLowerCase();
  const valid = kind !== null && UUID_RE.test(token);

  if (kind === "open" || kind === null) {
    // Pixel path: identical response for every outcome.
    if (valid) {
      try {
        const found = await resolve(token);
        if (found) await logEvent("opened", token, found, req.headers.get("user-agent") ?? "");
      } catch (err) {
        console.error("email-track open failed:", err);
      }
    }
    return gif();
  }

  // Click path: always land the prospect somewhere sensible. Expired rows
  // still redirect to the Plaid URL — its hosted page explains expiry —
  // and the CRM shows "expired — resend" from the request row.
  let target = FALLBACK_URL;
  if (valid) {
    try {
      const found = await resolve(token);
      if (found?.req.hosted_link_url) {
        await logEvent("clicked", token, found, req.headers.get("user-agent") ?? "");
        target = found.req.hosted_link_url;
      }
    } catch (err) {
      console.error("email-track click failed:", err);
    }
  }
  return redirect(target);
});
