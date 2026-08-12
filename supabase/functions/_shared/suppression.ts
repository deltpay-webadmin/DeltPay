/**
 * Email suppression + delivery-event log.
 *
 * Two tables (migration 20260812_01_email_health.sql):
 *   email_suppressions — addresses we must never auto-email again
 *                        (hard bounces, spam complaints). Checked by every
 *                        automated sender before sending.
 *   email_events       — bounces / complaints / failures / send errors,
 *                        fed by the resend-webhook function and by senders
 *                        that fail to hand off to Resend. Read by the
 *                        email-health-digest job.
 *
 * Standalone on purpose (own client, no plaid.ts import) so it can be used
 * from plaid_notify.ts without an import cycle.
 */

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

function db(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

const norm = (email: string) => String(email || "").trim().toLowerCase();

/** True when the address has hard-bounced or complained before. Fails open —
 * a suppression-check outage should never block transactional mail. */
export async function isSuppressed(email: string): Promise<boolean> {
  const e = norm(email);
  if (!e) return false;
  try {
    const { data } = await db()
      .from("email_suppressions")
      .select("email")
      .eq("email", e)
      .maybeSingle();
    return Boolean(data);
  } catch (err) {
    console.warn("[suppression] check failed (failing open):", err);
    return false;
  }
}

export async function suppress(email: string, reason: string, sourceEvent?: string): Promise<void> {
  const e = norm(email);
  if (!e) return;
  try {
    await db()
      .from("email_suppressions")
      .upsert({ email: e, reason, source_event: sourceEvent ?? null }, { onConflict: "email" });
  } catch (err) {
    console.error("[suppression] upsert failed:", err);
  }
}

export async function logEmailEvent(opts: {
  emailId?: string | null;
  recipient: string;
  event: string; // bounced | complained | failed | delivery_delayed | send_error
  reason?: string | null;
  subject?: string | null;
  payload?: unknown;
}): Promise<void> {
  try {
    await db().from("email_events").insert({
      email_id: opts.emailId ?? null,
      recipient: norm(opts.recipient),
      event: opts.event,
      reason: opts.reason ?? null,
      subject: opts.subject ?? null,
      payload: opts.payload ?? null,
    });
  } catch (err) {
    console.error("[suppression] event log failed:", err);
  }
}
