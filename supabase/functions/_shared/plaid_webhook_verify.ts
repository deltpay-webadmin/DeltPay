/**
 * Plaid webhook signature verification.
 *
 * Plaid signs every webhook with an ES256 JWT in the Plaid-Verification
 * header. Verification: fetch the signing JWK from
 * /webhook_verification_key/get by the JWT's kid, verify the signature and
 * iat freshness, then compare SHA-256(raw request body) against the
 * request_body_sha256 claim.
 * https://plaid.com/docs/api/webhooks/webhook-verification/
 */

import {
  decodeProtectedHeader,
  importJWK,
  jwtVerify,
  type JWK,
} from "npm:jose@5";
import { plaidConfig } from "./plaid.ts";

type PlaidJWK = JWK & { expired_at: number | null };

// kid → JWK cache. Module-level, so it persists for the lifetime of the
// edge-function isolate; a cold start just refetches.
const keyCache = new Map<string, PlaidJWK>();

async function fetchKey(kid: string): Promise<PlaidJWK | null> {
  const cfg = plaidConfig();
  if (!cfg.configured || !cfg.envValid) return null;
  const res = await fetch(`${cfg.host}/webhook_verification_key/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: cfg.clientId, secret: cfg.secret, key_id: kid }),
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.key ?? null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyPlaidWebhook(
  jwtHeader: string | null,
  rawBody: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!jwtHeader) return { ok: false, reason: "missing Plaid-Verification header" };

  let kid: string | undefined;
  let alg: string | undefined;
  try {
    ({ kid, alg } = decodeProtectedHeader(jwtHeader));
  } catch {
    return { ok: false, reason: "malformed JWT" };
  }
  if (alg !== "ES256") return { ok: false, reason: `unexpected alg ${alg}` };
  if (!kid) return { ok: false, reason: "missing kid" };

  // The cache lives for the isolate's lifetime and Plaid rotates signing
  // keys, so a cached entry can go stale. On a cache hit that is expired
  // or fails signature verification, refetch the key once before failing.
  let jwk = keyCache.get(kid);
  let fromCache = Boolean(jwk);
  if (!jwk) {
    jwk = (await fetchKey(kid)) ?? undefined;
    if (!jwk) return { ok: false, reason: `unknown key id ${kid}` };
    keyCache.set(kid, jwk);
  }

  const refetch = async (): Promise<boolean> => {
    if (!fromCache) return false;
    fromCache = false; // one refetch attempt per verification
    const fresh = await fetchKey(kid!);
    if (!fresh) return false;
    keyCache.set(kid!, fresh);
    jwk = fresh;
    return true;
  };

  if (jwk.expired_at != null && !(await refetch())) {
    return { ok: false, reason: "signing key expired" };
  }
  if (jwk!.expired_at != null) return { ok: false, reason: "signing key expired" };

  const verify = (key: PlaidJWK) =>
    importJWK(key, "ES256").then((k) =>
      jwtVerify(jwtHeader, k, {
        maxTokenAge: "5 minutes",
        clockTolerance: "30 seconds",
      }),
    );

  let payload: Record<string, unknown>;
  try {
    ({ payload } = await verify(jwk!));
  } catch (err) {
    if (await refetch()) {
      try {
        ({ payload } = await verify(jwk!));
      } catch (err2) {
        return { ok: false, reason: `signature/claims invalid: ${(err2 as Error).message}` };
      }
    } else {
      return { ok: false, reason: `signature/claims invalid: ${(err as Error).message}` };
    }
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawBody),
  );
  const bodyHex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (!timingSafeEqual(bodyHex, String(payload.request_body_sha256 ?? ""))) {
    return { ok: false, reason: "body hash mismatch" };
  }
  return { ok: true };
}

/**
 * Enforcement mode: PLAID_WEBHOOK_VERIFY=enforce|log|off overrides the
 * default of enforce in production, log-only in sandbox (so curl-simulated
 * payloads keep working during development).
 */
export function webhookVerifyMode(): "enforce" | "log" | "off" {
  const raw = (Deno.env.get("PLAID_WEBHOOK_VERIFY") ?? "").toLowerCase();
  if (raw === "enforce" || raw === "log" || raw === "off") return raw;
  return plaidConfig().env === "production" ? "enforce" : "log";
}
