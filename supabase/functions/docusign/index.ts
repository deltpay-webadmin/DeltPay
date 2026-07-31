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
 * Auth: caller must hold merchants.view (check-config/status) or
 * merchants.edit (send/void) via _shared/auth.ts requirePerm; writes to
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
import { requirePerm } from "../_shared/auth.ts";
import { getAccessToken, getAccount, oauthHost, STATUS_MAP } from "../_shared/docusign_status.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ── DocuSign OAuth + status mapping live in ../_shared/docusign_status.ts ──

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
  const html = renderAgreementHtml({
    ...p.terms,
    noticeEmail: p.terms.noticeEmail ?? p.signerEmail,
    hasGuarantor: Boolean(p.guarantorName && p.guarantorEmail),
  });
  const htmlBytes = new TextEncoder().encode(html);
  let binary = "";
  for (let i = 0; i < htmlBytes.length; i += 8192) {
    binary += String.fromCharCode(...htmlBytes.subarray(i, i + 8192));
  }
  const documentBase64 = btoa(binary);

  // Exhibit B bank fields the CRM didn't supply become required text tabs,
  // so the merchant cannot execute the ACH authorization with a blank account.
  const merTabs = signerTabs("mer");
  const bankTab = (anchorString: string, tabLabel: string, width: number, required: string) => ({
    anchorString,
    anchorUnits: "pixels",
    anchorXOffset: "4",
    anchorYOffset: "-6",
    tabLabel,
    width,
    required,
  });
  if (!p.terms.bankName) merTabs.textTabs.push(bankTab("/mer_bank/", "bank_name", 220, "true"));
  if (!p.terms.bankRoutingNumber) merTabs.textTabs.push(bankTab("/mer_routing/", "bank_routing", 140, "true"));
  if (!p.terms.bankAccountNumber) merTabs.textTabs.push(bankTab("/mer_acct/", "bank_account", 160, "true"));
  if (!p.terms.bankAccountType) merTabs.textTabs.push(bankTab("/mer_accttype/", "bank_account_type", 140, "false"));

  const signers: any[] = [
    {
      recipientId: "1",
      routingOrder: "1",
      name: p.signerName,
      email: p.signerEmail,
      roleName: "Merchant",
      tabs: merTabs,
    },
  ];
  if (p.guarantorName && p.guarantorEmail) {
    const guaTabs = signerTabs("gua");
    guaTabs.textTabs.push({
      anchorString: "/gua_addr/",
      anchorUnits: "pixels",
      anchorXOffset: "60",
      anchorYOffset: "-6",
      tabLabel: "gua_address",
      width: 300,
      required: "false",
    });
    signers.push({
      recipientId: "2",
      routingOrder: "1",
      name: p.guarantorName,
      email: p.guarantorEmail,
      roleName: "Guarantor",
      tabs: guaTabs,
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

// ── Request handling ──────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = body?.action as string;

  // RBAC gate: reads need merchants.view, envelope mutations need
  // merchants.edit (mirrors the contracts RLS policies).
  const neededPerm = action === "send" || action === "void" ? "merchants.edit" : "merchants.view";
  const auth = await requirePerm(req.headers.get("Authorization") ?? undefined, neededPerm);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const admin = createClient(supabaseUrl, serviceKey);

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
        created_by: auth.ctx.userId,
        org_id: auth.ctx.orgId,
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
