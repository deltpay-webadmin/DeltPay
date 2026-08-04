/**
 * Public Plaid webhook receiver.
 *
 * Deployed with JWT verification DISABLED — Plaid can't send Supabase
 * auth headers. Authenticity is checked instead via Plaid's own webhook
 * signature (Plaid-Verification header, ES256 JWT + body hash — see
 * _shared/plaid_webhook_verify.ts). Enforcement defaults to hard-reject
 * in production and log-only in sandbox; override with the
 * PLAID_WEBHOOK_VERIFY secret (enforce|log|off).
 *
 * Configure this URL as the webhook in link-token creation (done
 * automatically by the server function) or in the Plaid dashboard:
 *   https://<project-ref>.supabase.co/functions/v1/plaid-webhook
 */
import { handlePlaidWebhook } from "../_shared/plaid.ts";
import { verifyPlaidWebhook, webhookVerifyMode } from "../_shared/plaid_webhook_verify.ts";

const JSON_HEADERS = { "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true, service: "plaid-webhook" }), {
      headers: JSON_HEADERS,
    });
  }
  try {
    // Raw body first — the signature covers the exact bytes Plaid sent.
    const raw = await req.text();
    const mode = webhookVerifyMode();
    if (mode !== "off") {
      const verdict = await verifyPlaidWebhook(req.headers.get("plaid-verification"), raw);
      if (!verdict.ok) {
        console.warn(`[plaid-webhook] verification failed (${mode}): ${verdict.reason}`);
        if (mode === "enforce") {
          return new Response(JSON.stringify({ ok: false, error: "verification failed" }), {
            status: 401,
            headers: JSON_HEADERS,
          });
        }
      }
    }
    let body: Record<string, unknown> = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
    const result = await handlePlaidWebhook(body);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error("[plaid-webhook] error", err);
    // Always 200 so Plaid doesn't disable the webhook over transient errors.
    return new Response(JSON.stringify({ ok: false }), {
      headers: JSON_HEADERS,
    });
  }
});
