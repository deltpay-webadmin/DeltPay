/**
 * Plaid credential self-check.
 *
 * Reads the PLAID_* edge-function secrets and makes one harmless call
 * (institutions/get_by_id) to confirm the client_id/secret pair is valid
 * for the configured environment. Returns booleans + Plaid's error_code
 * only — never the secrets themselves.
 */

const HOSTS: Record<string, string> = {
  sandbox: "https://sandbox.plaid.com",
  development: "https://development.plaid.com",
  production: "https://production.plaid.com",
};

Deno.serve(async () => {
  const clientId = Deno.env.get("PLAID_CLIENT_ID") ?? "";
  const secret = Deno.env.get("PLAID_SECRET") ?? "";
  const env = (Deno.env.get("PLAID_ENV") ?? "sandbox").toLowerCase();
  const configured = Boolean(clientId && secret);

  const out: Record<string, unknown> = {
    configured,
    env,
    has_client_id: Boolean(clientId),
    has_secret: Boolean(secret),
    env_valid: env in HOSTS,
    credentials_valid: false,
  };

  if (configured && env in HOSTS) {
    try {
      const res = await fetch(`${HOSTS[env]}/institutions/get_by_id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          secret,
          institution_id: "ins_109508",
          country_codes: ["US"],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        out.credentials_valid = true;
        out.institution_test = json?.institution?.name ?? "ok";
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
