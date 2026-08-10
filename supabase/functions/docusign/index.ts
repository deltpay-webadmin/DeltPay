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
import { renderApplicationHtml } from "./deal_application.ts";
import { requirePerm, hasPerm } from "../_shared/auth.ts";
import { getAccessToken, getAccount, oauthHost, STATUS_MAP } from "../_shared/docusign_status.ts";
import { base64FromBytes, generateMpaPdf, type MpaApplicationRow } from "../_shared/mpa/generate.ts";
import { DATE1_ANCHOR, SIG1_ANCHOR } from "../_shared/mpa/anchors.ts";
import type { ApplicationData } from "../_shared/mpa/schema.ts";

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

/** Generic HTML → envelope path used by send-application (the MCA path keeps
 * its dedicated createEnvelope above). */
async function createEnvelopeFromHtml(
  baseUri: string,
  accountId: string,
  token: string,
  args: { html: string; docName: string; emailSubject: string; signers: any[] },
): Promise<{ envelopeId: string } | { error: string }> {
  const htmlBytes = new TextEncoder().encode(args.html);
  let binary = "";
  for (let i = 0; i < htmlBytes.length; i += 8192) {
    binary += String.fromCharCode(...htmlBytes.subarray(i, i + 8192));
  }
  const envelope = {
    emailSubject: args.emailSubject,
    documents: [{
      documentId: "1",
      name: args.docName,
      fileExtension: "html",
      documentBase64: btoa(binary),
    }],
    recipients: { signers: dedupeSigners(args.signers) },
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

/** Pre-filled PDF → envelope (the MPA path; documents are already rendered). */
async function createEnvelopeFromPdf(
  baseUri: string,
  accountId: string,
  token: string,
  args: { pdfBase64: string; docName: string; emailSubject: string; signers: any[] },
): Promise<{ envelopeId: string } | { error: string }> {
  const envelope = {
    emailSubject: args.emailSubject,
    documents: [{
      documentId: "1",
      name: args.docName,
      fileExtension: "pdf",
      documentBase64: args.pdfBase64,
    }],
    recipients: { signers: dedupeSigners(args.signers) },
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
  // merchants.edit (mirrors the contracts RLS policies). send-application is
  // agent-facing and gates on leads.create; ownership is checked in-handler.
  const neededPerm =
    action === "send" || action === "void" || action === "send-mpa" || action === "signing-url"
      ? "merchants.edit"
    : action === "send-application" ? "leads.create"
    : "merchants.view";
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

  // ── send-application: Delt merchant application from a deal submission ──
  if (action === "send-application") {
    const submissionId = body?.submissionId as string;
    if (!submissionId) return json({ error: "submissionId required" }, 400);

    const { data: sub, error: subErr } = await admin
      .from("deal_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();
    if (subErr || !sub) return json({ error: "Deal submission not found" }, 404);

    // Ownership: agents can only send on their own submissions; ops
    // (agents.edit) can send on any.
    if (!hasPerm(auth.ctx, "agents.edit") && sub.agent_id !== auth.ctx.agentId) {
      return json({ error: "You can only send applications for your own deals" }, 403);
    }

    const signerName = (body?.signerName as string) || sub.contact_name || sub.merchant_name;
    const signerEmail = (body?.signerEmail as string) || sub.email;
    if (!signerEmail) {
      return json({ error: "The merchant has no email on file — add one to the deal or provide signerEmail." }, 400);
    }

    const html = renderApplicationHtml({
      merchantName: sub.merchant_name,
      contactName: sub.contact_name ?? undefined,
      phone: sub.phone ?? undefined,
      email: signerEmail,
      vertical: sub.vertical ?? undefined,
      monthlyVolume: Number(sub.monthly_volume) || undefined,
      wantsPos: Boolean(sub.wants_pos),
      wantsCapital: Boolean(sub.wants_capital),
      agentName: sub.agent_name ?? undefined,
      applicationDate: new Date().toISOString().slice(0, 10),
    });

    const signers: any[] = [{
      recipientId: "1",
      routingOrder: "1",
      name: signerName,
      email: signerEmail,
      roleName: "Merchant",
      tabs: signerTabs("mer"),
    }];
    const csName = Deno.env.get("DOCUSIGN_COUNTERSIGNER_NAME");
    const csEmail = Deno.env.get("DOCUSIGN_COUNTERSIGNER_EMAIL");
    if (csName && csEmail) {
      signers.push({
        recipientId: "2",
        routingOrder: "2",
        name: csName,
        email: csEmail,
        roleName: "Delt Pay",
        tabs: signerTabs("pur"),
      });
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const env = await createEnvelopeFromHtml(acct.baseUri, acct.accountId, tok.token, {
      html,
      docName: `Delt Merchant Application - ${sub.merchant_name}.html`,
      emailSubject: (body?.emailSubject as string) || `Delt Pay Merchant Application — ${sub.merchant_name}`,
      signers,
    });
    if ("error" in env) return json({ error: env.error }, 400);

    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        kind: "deal_application",
        submission_id: submissionId,
        merchant_name: sub.merchant_name,
        signer_name: signerName,
        signer_email: signerEmail,
        terms: {},
        envelope_id: env.envelopeId,
        status: "sent",
        docusign_status: "sent",
        sent_at: new Date().toISOString(),
        created_by: auth.ctx.userId,
        org_id: sub.org_id,
      })
      .select("*")
      .single();
    if (insErr) {
      return json({ error: `Envelope ${env.envelopeId} was sent, but recording it failed: ${insErr.message}`, envelopeId: env.envelopeId }, 500);
    }
    return json({ ok: true, contract: row });
  }

  // ── send-mpa: fill the processor MPA PDF and open an envelope ──
  // mode 'embedded' (default): merchant signs in person on the iPad via a
  // recipient-view URL (clientUserId set, no DocuSign email). mode 'email':
  // classic remote signing for when the merchant isn't in the room.
  if (action === "send-mpa") {
    const applicationId = body?.applicationId as string;
    const mode = (body?.mode as string) === "email" ? "email" : "embedded";
    if (!applicationId) return json({ error: "applicationId required" }, 400);

    const { data: app } = await admin
      .from("merchant_applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();
    if (!app || app.org_id !== auth.ctx.orgId) return json({ error: "Application not found" }, 404);
    if (!["draft", "submitted"].includes(app.status)) {
      return json({ error: `Application is ${app.status}` }, 409);
    }

    const { data: sub } = await admin
      .from("deal_submissions")
      .select("*")
      .eq("id", app.submission_id)
      .maybeSingle();
    if (!sub) return json({ error: "Deal submission not found" }, 404);
    const channel = sub.channel as string;
    if (!["Luqra", "Paysafe"].includes(channel)) {
      return json({ error: "Set the boarding channel to Luqra or Paysafe first (Square uses the OrderOut portal)" }, 400);
    }

    const appData = app.data as ApplicationData;
    const owner1 = appData?.owners?.[0];
    const signerName = (body?.signerName as string) ||
      (owner1 ? `${owner1.firstName} ${owner1.lastName}`.trim() : "") ||
      sub.contact_name || sub.merchant_name;
    const signerEmail = (body?.signerEmail as string) || owner1?.email || sub.email;
    if (!signerEmail) {
      return json({ error: "No signer email on file — add the owner's email to the application." }, 400);
    }

    const generated = await generateMpaPdf(admin, app as MpaApplicationRow, channel as "Luqra" | "Paysafe", {
      withAnchors: true,
    });
    if ("error" in generated) return json({ error: generated.error }, 400);

    const anchorTab = (anchorString: string) => ({
      anchorString,
      anchorUnits: "pixels",
      anchorXOffset: "0",
      anchorYOffset: "0",
    });
    const merchantSigner: any = {
      recipientId: "1",
      routingOrder: "1",
      name: signerName,
      email: signerEmail,
      roleName: "Merchant",
      tabs: {
        signHereTabs: [anchorTab(SIG1_ANCHOR)],
        dateSignedTabs: [anchorTab(DATE1_ANCHOR)],
      },
    };
    // clientUserId marks the recipient as embedded/captive: DocuSign sends
    // no email and the signing session is fetched on demand (signing-url).
    if (mode === "embedded") merchantSigner.clientUserId = applicationId;

    // No Delt countersigner on processor MPAs: the counterparty approval
    // lines (LQ/Bank approval, Paysafe acceptance) belong to the processor
    // and are executed in their own boarding flow after submission.
    const signers: any[] = [merchantSigner];

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const env = await createEnvelopeFromPdf(acct.baseUri, acct.accountId, tok.token, {
      pdfBase64: base64FromBytes(generated.pdf),
      docName: `${channel} Merchant Application - ${sub.merchant_name}.pdf`,
      emailSubject: (body?.emailSubject as string) || `${channel} Merchant Processing Agreement — ${sub.merchant_name}`,
      signers,
    });
    if ("error" in env) return json({ error: env.error }, 400);

    const { data: contractRow, error: insErr } = await admin
      .from("contracts")
      .insert({
        kind: "mpa",
        submission_id: app.submission_id,
        merchant_name: sub.merchant_name,
        signer_name: signerName,
        signer_email: signerEmail,
        terms: { channel, mode, applicationId },
        envelope_id: env.envelopeId,
        status: "sent",
        docusign_status: "sent",
        sent_at: new Date().toISOString(),
        created_by: auth.ctx.userId,
        org_id: app.org_id,
      })
      .select("*")
      .single();
    if (insErr) {
      return json({ error: `Envelope ${env.envelopeId} was sent, but recording it failed: ${insErr.message}`, envelopeId: env.envelopeId }, 500);
    }
    return json({ ok: true, contract: contractRow, warnings: generated.warnings, mode });
  }

  // ── signing-url: on-demand embedded signing session (≈5-min TTL) ──
  // Called right before handing the iPad to the merchant; call again to
  // regenerate after expiry. The URL is never stored.
  if (action === "signing-url") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row } = await admin.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!row || row.org_id !== auth.ctx.orgId) return json({ error: "Contract not found" }, 404);
    if (row.kind !== "mpa" || !row.envelope_id) return json({ error: "Not an MPA envelope" }, 400);
    if (["completed", "voided", "declined"].includes(row.status)) {
      return json({ error: `Envelope is already ${row.status}` }, 400);
    }
    const applicationId = (row.terms as any)?.applicationId as string;
    if ((row.terms as any)?.mode !== "embedded" || !applicationId) {
      return json({ error: "This envelope was sent for remote (email) signing" }, 400);
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const returnUrl = (body?.returnUrl as string) || "https://deltpay.com/#/signing-complete";
    const res = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/views/recipient`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl,
          authenticationMethod: "none",
          email: row.signer_email,
          userName: row.signer_name,
          clientUserId: applicationId,
        }),
      },
    );
    const view = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: `Signing session failed: ${view?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true, url: view.url });
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
