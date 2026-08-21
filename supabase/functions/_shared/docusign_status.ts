/**
 * DocuSign OAuth (JWT grant) + envelope status shared between the `docusign`
 * action function, the `docusign-connect` webhook, and the nightly
 * `docusign-sweep` job. Factored out of docusign/index.ts.
 */

import { createClient } from "npm:@supabase/supabase-js@2";

/** Service-role client (RLS bypass) — local so webhook/sweep bundles stay
 * independent of the heavyweight plaid.ts module. */
function svc() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export function oauthHost(): string {
  return (Deno.env.get("DOCUSIGN_ENV") ?? "demo").toLowerCase() === "production"
    ? "account.docusign.com"
    : "account-d.docusign.com";
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64urlJson = (obj: unknown) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

/** Wrap a PKCS#1 RSAPrivateKey DER in a PKCS#8 PrivateKeyInfo envelope. */
function pkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
  const derLen = (n: number): number[] => {
    if (n < 0x80) return [n];
    const bytes: number[] = [];
    let v = n;
    while (v > 0) { bytes.unshift(v & 0xff); v >>= 8; }
    return [0x80 | bytes.length, ...bytes];
  };
  // AlgorithmIdentifier for rsaEncryption (1.2.840.113549.1.1.1) + NULL params
  const algId = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const octet = [0x04, ...derLen(pkcs1.length), ...pkcs1];
  const version = [0x02, 0x01, 0x00];
  const inner = [...version, ...algId, ...octet];
  return new Uint8Array([0x30, ...derLen(inner.length), ...inner]);
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const isPkcs1 = pem.includes("RSA PRIVATE KEY");
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  let der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  if (isPkcs1) der = pkcs1ToPkcs8(der);
  return crypto.subtle.importKey(
    "pkcs8",
    der.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function getAccessToken(): Promise<{ token: string } | { error: string }> {
  const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY") ?? "";
  const userId = Deno.env.get("DOCUSIGN_USER_ID") ?? "";
  const privateKeyPem = Deno.env.get("DOCUSIGN_PRIVATE_KEY") ?? "";
  if (!integrationKey || !userId || !privateKeyPem) {
    return { error: "DocuSign is not configured — set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, and DOCUSIGN_PRIVATE_KEY." };
  }
  const host = oauthHost();
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlJson({ alg: "RS256", typ: "JWT" });
  const payload = b64urlJson({
    iss: integrationKey,
    sub: userId,
    aud: host,
    iat: now,
    exp: now + 3600,
    scope: "signature impersonation",
  });
  let signature: string;
  try {
    const key = await importPrivateKey(privateKeyPem);
    const sig = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(`${header}.${payload}`),
    );
    signature = b64url(new Uint8Array(sig));
  } catch (err) {
    return { error: `Invalid DOCUSIGN_PRIVATE_KEY: ${String(err)}` };
  }
  const res = await fetch(`https://${host}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${payload}.${signature}`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = body?.error === "consent_required"
      ? "Consent required — open the one-time consent URL for this integration key (see the Contracts page setup note)."
      : body?.error_description || body?.error || `HTTP ${res.status}`;
    return { error: `DocuSign token request failed: ${reason}` };
  }
  return { token: body.access_token as string };
}

export async function getAccount(token: string): Promise<{ accountId: string; baseUri: string } | { error: string }> {
  const res = await fetch(`https://${oauthHost()}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: `DocuSign userinfo failed: HTTP ${res.status}` };
  const accounts: any[] = body?.accounts ?? [];
  const wanted = Deno.env.get("DOCUSIGN_ACCOUNT_ID");
  const account = wanted
    ? accounts.find((a) => a.account_id === wanted)
    : accounts.find((a) => a.is_default) ?? accounts[0];
  if (!account) return { error: wanted ? `Account ${wanted} not found for this user.` : "No DocuSign accounts on this user." };
  return { accountId: account.account_id, baseUri: `${account.base_uri}/restapi` };
}

export const STATUS_MAP: Record<string, string> = {
  sent: "sent",
  delivered: "delivered",
  completed: "completed",
  declined: "declined",
  voided: "voided",
};

/**
 * Stamp countersigned_at/countersigner_email on a contract when the Delt
 * countersigner (routing order 2, role Purchaser / "Delt Pay") has completed.
 * Reads the envelope's live recipients; a no-op when the countersigner is
 * still pending or the row is already stamped.
 */
export async function syncCountersign(contractId: string): Promise<{ countersigned: boolean }> {
  const db = svc();
  const { data: row } = await db
    .from("contracts")
    .select("id, kind, envelope_id, countersigned_at")
    .eq("id", contractId)
    .maybeSingle();
  if (!row || row.countersigned_at || !row.envelope_id) return { countersigned: Boolean(row?.countersigned_at) };
  if (!["mca", "deal_application", "agent_agreement"].includes(row.kind)) return { countersigned: false };

  const tok = await getAccessToken();
  if ("error" in tok) return { countersigned: false };
  const acct = await getAccount(tok.token);
  if ("error" in acct) return { countersigned: false };

  const res = await fetch(
    `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/recipients`,
    { headers: { Authorization: `Bearer ${tok.token}` } },
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { countersigned: false };
  const purchaser = (body?.signers ?? []).find((s: any) => String(s.routingOrder) === "2");
  if (!purchaser || String(purchaser.status).toLowerCase() !== "completed") {
    return { countersigned: false };
  }
  await db
    .from("contracts")
    .update({
      countersigned_at: purchaser.signedDateTime || new Date().toISOString(),
      countersigner_email: purchaser.email ?? null,
    })
    .eq("id", row.id);
  return { countersigned: true };
}

/**
 * Update a contracts row from a DocuSign envelope status. Shared by the
 * status action, the Connect webhook, and the nightly sweep.
 * Unknown envelope ids are a silent no-op ({ updated: false }).
 */
export async function applyEnvelopeStatus(
  envelopeId: string,
  dsStatus: string,
  completedAt?: string | null,
): Promise<{ updated: boolean; contractId?: string }> {
  const db = svc();
  const { data: row } = await db
    .from("contracts")
    .select("id, kind, status, completed_at, countersigned_at")
    .eq("envelope_id", envelopeId)
    .maybeSingle();
  if (!row) return { updated: false };

  const normalized = dsStatus.toLowerCase();
  const mapped = STATUS_MAP[normalized] ?? row.status;
  const patch: Record<string, unknown> = {
    docusign_status: normalized,
    status: mapped,
    last_error: null,
  };
  if (mapped === "completed" && !row.completed_at) {
    patch.completed_at = completedAt || new Date().toISOString();
  }
  const { error } = await db.from("contracts").update(patch).eq("id", row.id);
  if (error) throw new Error(`contracts update failed for ${row.id}: ${error.message}`);

  // A completed MCA/application envelope means every recipient — including
  // the routing-order-2 Delt countersigner — has signed; stamp the executed
  // state so the funding gate can rely on it. Best-effort: the status action
  // and the sweep re-run this until it lands.
  if (mapped === "completed" && !row.countersigned_at && ["mca", "deal_application", "agent_agreement"].includes(row.kind)) {
    try {
      await syncCountersign(row.id as string);
    } catch (err) {
      console.error(`syncCountersign failed for contract ${row.id}:`, err);
    }
  }
  return { updated: true, contractId: row.id as string };
}

/**
 * Poll every in-flight envelope (status sent/delivered) and sync the rows.
 * Used by the nightly cron sweep as the safety net behind the Connect
 * webhook. Caps work per run; nightly reruns pick up the rest.
 */
export async function sweepInFlightEnvelopes(cap = 50): Promise<{
  checked: number;
  updated: number;
  errors: number;
}> {
  const db = svc();
  const { data: rows, error } = await db
    .from("contracts")
    .select("id, envelope_id, status, completed_at")
    .in("status", ["sent", "delivered"])
    .not("envelope_id", "is", null)
    .order("sent_at", { ascending: true })
    .limit(cap);
  if (error) throw new Error(`contracts query failed: ${error.message}`);
  if (!rows?.length) return { checked: 0, updated: 0, errors: 0 };

  const tok = await getAccessToken();
  if ("error" in tok) throw new Error(tok.error);
  const acct = await getAccount(tok.token);
  if ("error" in acct) throw new Error(acct.error);

  let updated = 0;
  let errors = 0;
  for (const row of rows) {
    try {
      const res = await fetch(
        `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}`,
        { headers: { Authorization: `Bearer ${tok.token}` } },
      );
      const env = await res.json().catch(() => ({}));
      if (!res.ok) {
        errors++;
        await db.from("contracts")
          .update({ last_error: `Envelope lookup failed: ${env?.message || `HTTP ${res.status}`}` })
          .eq("id", row.id);
        continue;
      }
      const out = await applyEnvelopeStatus(
        String(row.envelope_id),
        String(env.status || ""),
        env.completedDateTime,
      );
      if (out.updated) updated++;
    } catch (err) {
      errors++;
      console.error(`docusign sweep error for contract ${row.id}:`, err);
    }
  }
  return { checked: rows.length, updated, errors };
}
