/**
 * Email suppression, opt-out and the delivery/engagement event log.
 *
 * Two tables (migrations 20260812_01_email_health.sql + _02_email_tracking.sql):
 *   email_suppressions — addresses we must not auto-email, with a scope:
 *                          'all'       hard bounce / spam complaint — nothing
 *                          'marketing' unsubscribed — promotional mail only,
 *                                      transactional still flows
 *   email_events       — every send plus everything that happens to it:
 *                          sent / delivered / opened / clicked / unsubscribed /
 *                          bounced / complained / failed / delivery_delayed /
 *                          send_error
 *                        Fed by the senders (sent, send_error), the
 *                        resend-webhook (everything Resend reports) and the
 *                        email-unsubscribe function.
 *
 * Correlation: Resend returns an email_id on send. The sender writes the
 * `sent` row carrying that id + campaign code; the webhook looks the campaign
 * back up by id so opens/clicks land on the right funnel.
 *
 * Standalone on purpose (own client, no plaid.ts import) so it can be used
 * from plaid_notify.ts without an import cycle.
 */

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { suppressionBlocks } from "./unsubscribe_token.ts";

// Token minting lives in unsubscribe_token.ts (no DB import, so it's unit
// testable); re-exported here so callers have one place to import from.
export { unsubscribeToken, unsubscribeUrl, verifyUnsubscribeToken } from "./unsubscribe_token.ts";

function db(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

const norm = (email: string) => String(email || "").trim().toLowerCase();

/** What kind of mail is being sent — decides whether a marketing opt-out
 * applies and whether the send carries an unsubscribe link. */
export type MailKind = "transactional" | "marketing";

/**
 * True when this address must not receive this kind of mail.
 *
 * A hard bounce / complaint (scope 'all') blocks everything. An unsubscribe
 * (scope 'marketing') blocks only promotional sends — someone who opted out
 * of the cross-sell pitch still gets told their application was approved.
 *
 * Fails open: a suppression-check outage must never block transactional mail.
 */
export async function isSuppressed(email: string, kind: MailKind = "transactional"): Promise<boolean> {
  const e = norm(email);
  if (!e) return false;
  try {
    const { data } = await db()
      .from("email_suppressions")
      .select("scope")
      .eq("email", e)
      .maybeSingle();
    return suppressionBlocks(data?.scope, kind);
  } catch (err) {
    console.warn("[suppression] check failed (failing open):", err);
    return false;
  }
}

/**
 * Add or widen a suppression. Scope only ever widens — an address that
 * hard-bounced ('all') stays blocked for everything even if a later
 * unsubscribe ('marketing') arrives for it.
 */
export async function suppress(
  email: string,
  reason: string,
  sourceEvent?: string,
  scope: "all" | "marketing" = "all",
): Promise<void> {
  const e = norm(email);
  if (!e) return;
  try {
    const client = db();
    if (scope === "marketing") {
      const { data: existing } = await client
        .from("email_suppressions")
        .select("scope")
        .eq("email", e)
        .maybeSingle();
      if (existing?.scope === "all") return; // already blocked more broadly
    }
    await client
      .from("email_suppressions")
      .upsert({ email: e, reason, source_event: sourceEvent ?? null, scope }, { onConflict: "email" });
  } catch (err) {
    console.error("[suppression] upsert failed:", err);
  }
}

/** Remove a marketing opt-out (the "resubscribe" path). Never clears an
 * 'all' suppression — un-suppressing a hard bounce is a deliberate manual
 * act, done by deleting the row. */
export async function clearMarketingOptOut(email: string): Promise<boolean> {
  const e = norm(email);
  if (!e) return false;
  try {
    const { data } = await db()
      .from("email_suppressions")
      .delete()
      .eq("email", e)
      .eq("scope", "marketing")
      .select("email");
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error("[suppression] opt-out clear failed:", err);
    return false;
  }
}

export async function logEmailEvent(opts: {
  emailId?: string | null;
  recipient: string;
  /** sent | delivered | opened | clicked | unsubscribed | bounced |
   *  complained | failed | delivery_delayed | send_error */
  event: string;
  reason?: string | null;
  subject?: string | null;
  campaign?: string | null;
  variant?: string | null;
  linkUrl?: string | null;
  kind?: MailKind | null;
  payload?: unknown;
}): Promise<void> {
  try {
    await db().from("email_events").insert({
      email_id: opts.emailId ?? null,
      recipient: norm(opts.recipient),
      event: opts.event,
      reason: opts.reason ?? null,
      subject: opts.subject ?? null,
      campaign: opts.campaign ?? null,
      variant: opts.variant ?? null,
      link_url: opts.linkUrl ?? null,
      kind: opts.kind ?? null,
      payload: opts.payload ?? null,
    });
  } catch (err) {
    console.error("[suppression] event log failed:", err);
  }
}

/**
 * Campaign/variant/kind for a Resend email_id, read off the `sent` row the
 * sender wrote. Lets the webhook tag opens and clicks with the sequence they
 * belong to without Resend having to echo our metadata back.
 */
export async function contextForEmailId(
  emailId: string | null | undefined,
): Promise<{ campaign: string | null; variant: string | null; kind: MailKind | null }> {
  const empty = { campaign: null, variant: null, kind: null };
  if (!emailId) return empty;
  try {
    const { data } = await db()
      .from("email_events")
      .select("campaign, variant, kind")
      .eq("email_id", emailId)
      .eq("event", "sent")
      .limit(1)
      .maybeSingle();
    if (!data) return empty;
    return {
      campaign: data.campaign ?? null,
      variant: data.variant ?? null,
      kind: (data.kind as MailKind) ?? null,
    };
  } catch (err) {
    console.warn("[suppression] campaign lookup failed:", err);
    return empty;
  }
}
