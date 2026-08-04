/**
 * Plaid credential self-check.
 *
 * Reads the PLAID_* edge-function secrets and makes one harmless call
 * (institutions/get, count 1 — read-only, valid in sandbox AND production)
 * to confirm the client_id/secret pair is valid for the configured
 * environment. Returns booleans + Plaid's error_code only — never the
 * secrets themselves.
 */

import { plaidConfig } from "../_shared/plaid.ts";

Deno.serve(async () => {
  const cfg = plaidConfig();

  const out: Record<string, unknown> = {
    configured: cfg.configured,
    env: cfg.env,
    env_valid: cfg.envValid,
    env_source: cfg.envSource,
    has_client_id: Boolean(cfg.clientId),
    has_secret: Boolean(cfg.secret),
    redirect_uri_set: Boolean(cfg.redirectUri),
    credentials_valid: false,
  };

  if (cfg.configured && cfg.envValid) {
    try {
      const res = await fetch(`${cfg.host}/institutions/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: cfg.clientId,
          secret: cfg.secret,
          count: 1,
          offset: 0,
          country_codes: ["US"],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        out.credentials_valid = true;
        out.institution_test = json?.institutions?.[0]?.name ?? "ok";
      } else {
        out.credentials_valid = false;
        out.plaid_error_code = json?.error_code ?? `HTTP_${res.status}`;
        out.plaid_error_type = json?.error_type ?? null;
      }
    } catch (err) {
      out.credentials_valid = false;
      out.plaid_error_code = "NETWORK_ERROR";
      out.detail = String(err);
    }
  }

  return new Response(JSON.stringify(out), {
    headers: { "Content-Type": "application/json" },
  });
});
