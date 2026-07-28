/**
 * Public Plaid webhook receiver.
 *
 * Deployed with JWT verification DISABLED — Plaid can't send Supabase
 * auth headers. It only reacts to webhook payloads for item_ids that
 * already exist in plaid_items (handlePlaidWebhook ignores everything
 * else), and it never returns data, so exposure is minimal.
 *
 * Configure this URL as the webhook in link-token creation (done
 * automatically by the server function) or in the Plaid dashboard:
 *   https://<project-ref>.supabase.co/functions/v1/plaid-webhook
 */
import { handlePlaidWebhook } from "../_shared/plaid.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true, service: "plaid-webhook" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const result = await handlePlaidWebhook(body);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[plaid-webhook] error", err);
    // Always 200 so Plaid doesn't disable the webhook over transient errors.
    return new Response(JSON.stringify({ ok: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});
