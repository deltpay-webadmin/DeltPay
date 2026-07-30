/**
 * DocuSign integration for the Delt CRM.
 *
 * Actions (POST JSON { action, ... }, called by staff from the CRM):
 *   • check-config — report which DocuSign secrets are set and whether a
 *     token can be minted (never returns the secrets themselves).
 *   • send         — render the MCA agreement from deal terms, create a
 *     DocuSign envelope (merchant signer + optional guarantor + optional
 *     Delt countersigner), and record it in public.contracts.
 *   • status       — poll the envelope's live status and sync the row.
 *   • void         — void an in-flight envelope and mark the row.
 *
 * Auth: caller must be signed in and pass is_staff(); writes to
 * public.contracts use the service-role client.
 *
 * Required function secrets:
 *   DOCUSIGN_INTEGRATION_KEY  — the app's integration key (client id)
 *   DOCUSIGN_USER_ID          — API user GUID to impersonate (JWT grant)
 *   DOCUSIGN_PRIVATE_KEY      — RSA private key PEM for the integration key
 *   DOCUSIGN_ENV              — 'demo' (default) or 'production'
 * Optional:
 *   DOCUSIGN_ACCOUNT_ID           — pin a specific account (default: user's default account)
 *   DOCUSIGN_COUNTERSIGNER_NAME   — Delt Pay countersigner (routing order 2)
 *   DOCUSIGN_COUNTERSIGNER_EMAIL
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { renderAgreementHtml, type AgreementTerms } from "./mca_agreement.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ── DocuSign OAuth (JWT grant) ────────────────────────────────

function oauthHost(): string {
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

async function getAccessToken(): Promise<{ token: string } | { error: string }> {
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

async function getAccount(token: string): Promise<{ accountId: string; baseUri: string } | { error: string }> {
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

// ── Envelope helpers ──────────────────────────────────────────

function signerTabs(prefix: string) {
  const a = (anchorString: string, extra: Record<string, string> = {}) => ({
    anchorString,
    anchorUnits: "pixels",
    anchorXOffset: "60",
    anchorYOffset: "-6",
    ...extra,
  });
  return {
    signHereTabs: [a(`/${prefix}_sig/`)],
    dateSignedTabs: [a(`/${prefix}_date/`)],
    fullNameTabs: [a(`/${prefix}_name/`)],
    textTabs: [{ ...a(`/${prefix}_title/`), tabLabel: `${prefix}_title`, width: 160, required: "false" }],
  };
}

/**
 * Collapse recipients that are the same human (same email + name) into one,
 * merging their signature tabs. Common case: the owner signs both the
 * merchant block and the personal-guarantor block — DocuSign rejects them
 * as duplicate recipients unless merged.
 */
function dedupeSigners(signers: any[]): any[] {
  const seen = new Map<string, any>();
  const out: any[] = [];
  for (const s of signers) {
    const key = `${String(s.email).trim().toLowerCase()}|${String(s.name).trim().toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, s);
      out.push(s);
      continue;
    }
    for (const tabKind of ["signHereTabs", "dateSignedTabs", "fullNameTabs", "textTabs"]) {
      existing.tabs[tabKind] = [...(existing.tabs[tabKind] ?? []), ...(s.tabs?.[tabKind] ?? [])];
    }
  }
  return out;
}

interface SendPayload {
  merchantId?: string;
  merchantName: string;
  dealId?: string;
  signerName: string;
  signerEmail: string;
  signerTitle?: string;
  guarantorName?: string;
  guarantorEmail?: string;
  terms: AgreementTerms;
  emailSubject?: string;
}

async function createEnvelope(
  baseUri: string,
  accountId: string,
  token: string,
  p: SendPayload,
): Promise<{ envelopeId: string } | { error: string }> {
  const html = renderAgreementHtml({ ...p.terms, hasGuarantor: Boolean(p.guarantorName && p.guarantorEmail) });
  const htmlBytes = new TextEncoder().encode(html);
  let binary = "";
  for (let i = 0; i < htmlBytes.length; i += 8192) {
    binary += String.fromCharCode(...htmlBytes.subarray(i, i + 8192));
  }
  const documentBase64 = btoa(binary);

  const signers: any[] = [
    {
      recipientId: "1",
      routingOrder: "1",
      name: p.signerName,
      email: p.signerEmail,
      roleName: "Merchant",
      tabs: signerTabs("mer"),
    },
  ];
  if (p.guarantorName && p.guarantorEmail) {
    signers.push({
      recipientId: "2",
      routingOrder: "1",
      name: p.guarantorName,
      email: p.guarantorEmail,
      roleName: "Guarantor",
      tabs: signerTabs("gua"),
    });
  }
  const csName = Deno.env.get("DOCUSIGN_COUNTERSIGNER_NAME");
  const csEmail = Deno.env.get("DOCUSIGN_COUNTERSIGNER_EMAIL");
  if (csName && csEmail) {
    signers.push({
      recipientId: "3",
      routingOrder: "2",
      name: csName,
      email: csEmail,
      roleName: "Purchaser",
      tabs: signerTabs("pur"),
    });
  }

  const envelope = {
    emailSubject: p.emailSubject || `Delt Pay MCA Agreement — ${p.merchantName}`,
    documents: [
      {
        documentId: "1",
        name: `DeltPay MCA Agreement - ${p.merchantName}.html`,
        fileExtension: "html",
        documentBase64,
      },
    ],
    recipients: { signers: dedupeSigners(signers) },
    status: "sent",
  };

  const res = await fetch(`${baseUri}/v2.1/accounts/${accountId}/envelopes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: `Envelope create failed: ${body?.message || body?.errorCode || `HTTP ${res.status}`}` };
  return { envelopeId: body.envelopeId as string };
}

const STATUS_MAP: Record<string, string> = {
  sent: "sent",
  delivered: "delivered",
  completed: "completed",
  declined: "declined",
  voided: "voided",
};

// ── Request handling ──────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Staff gate: run is_staff() as the caller.
  const authHeader = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: isStaff, error: staffErr } = await asCaller.rpc("is_staff");
  if (staffErr || !isStaff) return json({ error: "Not authorized — staff only." }, 403);

  const admin = createClient(supabaseUrl, serviceKey);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = body?.action as string;

  // ── check-config ──
  if (action === "check-config") {
    const out: Record<string, unknown> = {
      env: (Deno.env.get("DOCUSIGN_ENV") ?? "demo").toLowerCase(),
      has_integration_key: Boolean(Deno.env.get("DOCUSIGN_INTEGRATION_KEY")),
      has_user_id: Boolean(Deno.env.get("DOCUSIGN_USER_ID")),
      has_private_key: Boolean(Deno.env.get("DOCUSIGN_PRIVATE_KEY")),
      has_countersigner: Boolean(Deno.env.get("DOCUSIGN_COUNTERSIGNER_EMAIL")),
      token_ok: false,
    };
    out.configured = out.has_integration_key && out.has_user_id && out.has_private_key;
    if (out.configured) {
      const tok = await getAccessToken();
      if ("token" in tok) {
        out.token_ok = true;
        const acct = await getAccount(tok.token);
        if ("accountId" in acct) out.account_id = acct.accountId;
        else out.account_error = acct.error;
      } else {
        out.token_error = tok.error;
      }
    }
    // One-time consent URL admins need to visit for JWT impersonation.
    const ik = Deno.env.get("DOCUSIGN_INTEGRATION_KEY");
    if (ik) {
      out.consent_url =
        `https://${oauthHost()}/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${ik}&redirect_uri=https://www.docusign.com`;
    }
    return json(out);
  }

  // ── send ──
  if (action === "send") {
    const p = body as SendPayload & { action: string };
    if (!p.merchantName || !p.signerName || !p.signerEmail || !p.terms) {
      return json({ error: "merchantName, signerName, signerEmail, and terms are required." }, 400);
    }
    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const env = await createEnvelope(acct.baseUri, acct.accountId, tok.token, p);
    if ("error" in env) return json({ error: env.error }, 400);

    const { data: userData } = await asCaller.auth.getUser();
    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        merchant_id: p.merchantId ?? null,
        merchant_name: p.merchantName,
        deal_id: p.dealId ?? null,
        signer_name: p.signerName,
        signer_email: p.signerEmail,
        signer_title: p.signerTitle ?? null,
        guarantor_name: p.guarantorName ?? null,
        guarantor_email: p.guarantorEmail ?? null,
        terms: p.terms,
        envelope_id: env.envelopeId,
        status: "sent",
        docusign_status: "sent",
        sent_at: new Date().toISOString(),
        created_by: userData?.user?.id ?? null,
      })
      .select("*")
      .single();
    if (insErr) {
      return json({ error: `Envelope ${env.envelopeId} was sent, but recording it failed: ${insErr.message}`, envelopeId: env.envelopeId }, 500);
    }
    return json({ ok: true, contract: row });
  }

  // ── status ──
  if (action === "status") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row, error: rowErr } = await admin.from("contracts").select("*").eq("id", contractId).single();
    if (rowErr || !row) return json({ error: "Contract not found" }, 404);
    if (!row.envelope_id) return json({ ok: true, contract: row });

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const res = await fetch(`${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}`, {
      headers: { Authorization: `Bearer ${tok.token}` },
    });
    const env = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: `Envelope lookup failed: ${env?.message || `HTTP ${res.status}`}` }, 400);

    const dsStatus = String(env.status || "").toLowerCase();
    const mapped = STATUS_MAP[dsStatus] ?? row.status;
    const patch: Record<string, unknown> = { docusign_status: dsStatus, status: mapped };
    if (mapped === "completed" && !row.completed_at) {
      patch.completed_at = env.completedDateTime || new Date().toISOString();
    }
    const { data: updated, error: updErr } = await admin
      .from("contracts").update(patch).eq("id", contractId).select("*").single();
    if (updErr) return json({ error: updErr.message }, 500);
    return json({ ok: true, contract: updated });
  }

  // ── void ──
  if (action === "void") {
    const contractId = body?.contractId as string;
    const reason = (body?.reason as string) || "Voided from Delt CRM";
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row, error: rowErr } = await admin.from("contracts").select("*").eq("id", contractId).single();
    if (rowErr || !row) return json({ error: "Contract not found" }, 404);
    if (!row.envelope_id) return json({ error: "Contract has no envelope to void" }, 400);
    if (["completed", "voided", "declined"].includes(row.status)) {
      return json({ error: `Contract is already ${row.status}` }, 400);
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const res = await fetch(`${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "voided", voidedReason: reason }),
    });
    if (!res.ok) {
      const env = await res.json().catch(() => ({}));
      return json({ error: `Void failed: ${env?.message || `HTTP ${res.status}`}` }, 400);
    }
    const { data: updated, error: updErr } = await admin
      .from("contracts")
      .update({ status: "voided", docusign_status: "voided" })
      .eq("id", contractId)
      .select("*")
      .single();
    if (updErr) return json({ error: updErr.message }, 500);
    return json({ ok: true, contract: updated });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
