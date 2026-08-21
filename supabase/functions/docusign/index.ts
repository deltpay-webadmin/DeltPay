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
import { renderDltAppHtml, type DltAppFields } from "./deal_application.ts";
import { renderAgentAgreementHtml } from "./agent_agreement.ts";
import { requirePerm, hasPerm, type AuthContext } from "../_shared/auth.ts";
import { getAccessToken, getAccount, oauthHost, STATUS_MAP, syncCountersign } from "../_shared/docusign_status.ts";
import { base64FromBytes, generateMpaPdf, type MpaApplicationRow } from "../_shared/mpa/generate.ts";
import { DATE1_ANCHOR, DATE2_ANCHOR, SIG1_ANCHOR, SIG2_ANCHOR } from "../_shared/mpa/anchors.ts";
import type { ApplicationData, SecureData } from "../_shared/mpa/schema.ts";
import { decryptJson } from "../_shared/mpa/crypto.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ── DocuSign OAuth + status mapping live in ../_shared/docusign_status.ts ──

// ── Envelope helpers ──────────────────────────────────────────

/** Reminders + hard expiry on every envelope: nudge every 2 days, expire at
 * 14 with a 3-day warning — the paper equivalent of the MPA link lifecycle. */
const ENVELOPE_NOTIFICATION = {
  useAccountDefaults: "false",
  reminders: { reminderEnabled: "true", reminderDelay: "2", reminderFrequency: "2" },
  expirations: { expireEnabled: "true", expireAfter: "14", expireWarn: "3" },
};

/**
 * Deterministic embedded-recipient keys. A fresh embedKey (uuid) is minted at
 * send time and stored in the contract's terms; each embedded recipient's
 * clientUserId derives from it, so signing-url / countersign-url can re-mint
 * recipient views for the life of the envelope.
 */
const embedClientId = (embedKey: string, role: "mer" | "gua" | "rep" | "cs") => `${embedKey}:${role}`;

/** The Delt countersigner: org setting first, env secrets as fallback. */
async function resolveCountersigner(
  admin: ReturnType<typeof createClient>,
  orgId: string,
): Promise<{ name: string; email: string } | null> {
  const { data } = await admin
    .from("org_esign_settings")
    .select("countersigner_name, countersigner_email")
    .eq("org_id", orgId)
    .maybeSingle();
  const name = (data?.countersigner_name as string) || Deno.env.get("DOCUSIGN_COUNTERSIGNER_NAME") || "";
  const email = (data?.countersigner_email as string) || Deno.env.get("DOCUSIGN_COUNTERSIGNER_EMAIL") || "";
  return name && email ? { name, email } : null;
}

/** The submitting rep's identity: explicit body fields, else the caller. */
async function resolveRep(
  admin: ReturnType<typeof createClient>,
  ctx: AuthContext,
  body: { repName?: string; repEmail?: string },
): Promise<{ name: string; email: string } | null> {
  if (body.repName && body.repEmail) return { name: body.repName, email: body.repEmail };
  let name = "";
  let email = "";
  if (ctx.agentId) {
    const { data: agent } = await admin
      .from("agents")
      .select("name, email")
      .eq("id", ctx.agentId)
      .maybeSingle();
    name = (agent?.name as string) || "";
    email = (agent?.email as string) || "";
  }
  if (!email) {
    const { data } = await admin.auth.admin.getUserById(ctx.userId);
    email = data?.user?.email ?? "";
    if (!name) name = (data?.user?.user_metadata?.name as string) || email.split("@")[0] || "";
  }
  return email ? { name: name || email, email } : null;
}

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
  leadId?: string;
  submissionId?: string;
  mode?: "email" | "embedded";
  useBankOnFile?: boolean;
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
  opts: {
    mode: "email" | "embedded";
    embedKey: string;
    countersigner: { name: string; email: string };
  },
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

  const embedded = opts.mode === "embedded";
  const merchantSigner: any = {
    recipientId: "1",
    routingOrder: "1",
    name: p.signerName,
    email: p.signerEmail,
    roleName: "Merchant",
    tabs: merTabs,
  };
  if (embedded) merchantSigner.clientUserId = embedClientId(opts.embedKey, "mer");
  const signers: any[] = [merchantSigner];
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
    const guarantorSigner: any = {
      recipientId: "2",
      routingOrder: "1",
      name: p.guarantorName,
      email: p.guarantorEmail,
      roleName: "Guarantor",
      tabs: guaTabs,
    };
    if (embedded) guarantorSigner.clientUserId = embedClientId(opts.embedKey, "gua");
    signers.push(guarantorSigner);
  }
  // The Purchaser (Delt Pay LLC) countersignature at routing order 2. Always
  // embedded/captive: DocuSign sends the countersigner no email — the CRM's
  // "Countersign now" button (countersign-url) drives execution.
  signers.push({
    recipientId: "3",
    routingOrder: "2",
    name: opts.countersigner.name,
    email: opts.countersigner.email,
    roleName: "Purchaser",
    clientUserId: embedClientId(opts.embedKey, "cs"),
    tabs: signerTabs("pur"),
  });

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
    notification: ENVELOPE_NOTIFICATION,
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
    notification: ENVELOPE_NOTIFICATION,
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
    notification: ENVELOPE_NOTIFICATION,
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
    action === "send" || action === "void" || action === "send-mpa" || action === "signing-url" || action === "resend"
      ? "merchants.edit"
    : action === "send-application" ? "leads.create"
    : action === "send-agent-agreement" ? "agents.edit"
    : action === "countersign-url" ? "contracts.countersign"
    : action === "decision-memo" ? "underwriting.approve"
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
      has_countersigner: Boolean(await resolveCountersigner(admin, auth.ctx.orgId)),
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
    const mode: "email" | "embedded" = p.mode === "embedded" ? "embedded" : "email";

    // The MCA is not executed until Delt Pay countersigns — a countersigner
    // identity is mandatory, not optional.
    const countersigner = await resolveCountersigner(admin, auth.ctx.orgId);
    if (!countersigner) {
      return json({
        error: "Set the Delt countersigner (Settings → E-Sign, or the DOCUSIGN_COUNTERSIGNER_* secrets) before sending an MCA agreement.",
      }, 400);
    }

    // Exhibit B bank prefill: decrypt the designated account server-side from
    // the linked merchant application's secure blob. Plaintext never reaches
    // the browser and never lands in the stored terms — only masked last-4s.
    const terms: AgreementTerms = { ...p.terms };
    let bankMask: { bankName?: string; routingLast4?: string; accountLast4?: string } | null = null;
    if (p.useBankOnFile !== false && p.submissionId && !terms.bankAccountNumber) {
      const key = Deno.env.get("APP_ENCRYPTION_KEY");
      if (key) {
        const { data: app } = await admin
          .from("merchant_applications")
          .select("data, secure")
          .eq("submission_id", p.submissionId)
          .neq("status", "void")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (app?.secure) {
          try {
            const secure = await decryptJson<SecureData>(app.secure as any, key);
            if (secure.bank?.accountNumber) {
              const appData = app.data as ApplicationData;
              terms.bankName = terms.bankName || appData?.bank?.bankName || undefined;
              terms.bankRoutingNumber = secure.bank.routingNumber;
              terms.bankAccountNumber = secure.bank.accountNumber;
              terms.bankAccountType = terms.bankAccountType ||
                (appData?.bank?.accountType === "savings" ? "Savings" : "Checking");
              bankMask = {
                bankName: terms.bankName,
                routingLast4: secure.bank.routingNumber.slice(-4),
                accountLast4: secure.bank.accountNumber.slice(-4),
              };
            }
          } catch {
            // Key mismatch → fall through to merchant-typed bank tabs.
          }
        }
      }
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const embedKey = crypto.randomUUID();
    const env = await createEnvelope(acct.baseUri, acct.accountId, tok.token, { ...p, terms }, {
      mode,
      embedKey,
      countersigner,
    });
    if ("error" in env) return json({ error: env.error }, 400);

    // Stored terms carry masks only — strip the decrypted bank fields.
    const storedTerms: Record<string, unknown> = {
      ...p.terms,
      embedKey,
      countersigner,
      bankRoutingNumber: undefined,
      bankAccountNumber: undefined,
      ...(bankMask ? { bankOnFile: bankMask } : {}),
    };

    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        merchant_id: p.merchantId ?? null,
        merchant_name: p.merchantName,
        deal_id: p.dealId ?? null,
        lead_id: p.leadId ?? null,
        submission_id: p.submissionId ?? null,
        mode,
        signer_name: p.signerName,
        signer_email: p.signerEmail,
        signer_title: p.signerTitle ?? null,
        guarantor_name: p.guarantorName ?? null,
        guarantor_email: p.guarantorEmail ?? null,
        terms: storedTerms,
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
    return json({ ok: true, contract: row, mode });
  }

  // ── send-agent-agreement: agent onboarding paper, one envelope ──
  // Agreement + Schedule A (buy rates) + Schedule B (comp) + ACH authorization.
  // Agent signs by email (routing 1) with required ACH text tabs; Delt
  // countersigns embedded (routing 2) via the existing countersign-url flow.
  // Banking details stay inside the DocuSign envelope — never synced to the DB.
  if (action === "send-agent-agreement") {
    const agentName = (body?.agentName as string)?.trim();
    const agentEmail = (body?.agentEmail as string)?.trim();
    if (!agentName || !agentEmail) return json({ error: "agentName and agentEmail are required." }, 400);

    const countersigner = await resolveCountersigner(admin, auth.ctx.orgId);
    if (!countersigner) {
      return json({
        error: "Set the Delt countersigner (Settings → E-Sign, or the DOCUSIGN_COUNTERSIGNER_* secrets) before sending an agent agreement.",
      }, 400);
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const embedKey = crypto.randomUUID();
    const a = (anchorString: string, extra: Record<string, string> = {}) => ({
      anchorString,
      anchorUnits: "pixels",
      anchorXOffset: "60",
      anchorYOffset: "-6",
      ...extra,
    });
    const achTab = (anchorString: string, tabLabel: string, width: number, required: string) => ({
      anchorString,
      anchorUnits: "pixels",
      anchorXOffset: "4",
      anchorYOffset: "-6",
      tabLabel,
      width,
      required,
    });
    const agentSigner: any = {
      recipientId: "1",
      routingOrder: "1",
      name: agentName,
      email: agentEmail,
      roleName: "Agent",
      tabs: {
        signHereTabs: [a("/agt_sig/")],
        dateSignedTabs: [a("/agt_date/")],
        fullNameTabs: [a("/agt_name/")],
        textTabs: [
          { ...achTab("/agt_addr/", "agent_address", 320, "true") },
          achTab("/agt_bank/", "ach_bank_name", 220, "true"),
          achTab("/agt_accttype/", "ach_account_type", 140, "true"),
          achTab("/agt_routing/", "ach_routing", 140, "true"),
          achTab("/agt_acct/", "ach_account", 160, "true"),
          achTab("/agt_acctname/", "ach_name_on_account", 260, "true"),
        ],
      },
    };
    const csSigner: any = {
      recipientId: "2",
      routingOrder: "2",
      name: countersigner.name,
      email: countersigner.email,
      roleName: "Delt Pay LLC",
      clientUserId: embedClientId(embedKey, "cs"),
      tabs: {
        signHereTabs: [a("/del_sig/")],
        dateSignedTabs: [a("/del_date/")],
        fullNameTabs: [a("/del_name/")],
        textTabs: [{ ...a("/del_title/"), tabLabel: "del_title", width: 160, required: "false" }],
      },
    };

    const env = await createEnvelopeFromHtml(acct.baseUri, acct.accountId, tok.token, {
      html: renderAgentAgreementHtml({ agentName, agentEmail }),
      docName: `Delt Pay Agent Agreement - ${agentName}.html`,
      emailSubject: (body?.emailSubject as string) || `Delt Pay Agent Agreement — ${agentName}`,
      signers: [agentSigner, csSigner],
    });
    if ("error" in env) return json({ error: env.error }, 400);

    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        kind: "agent_agreement",
        mode: "email",
        merchant_name: agentName,
        signer_name: agentName,
        signer_email: agentEmail,
        terms: { embedKey, countersigner, agentId: (body?.agentId as string) ?? null },
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
    return json({ ok: true, contract: row, mode: "email" });
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
    const mode: "email" | "embedded" = (body?.mode as string) === "embedded" ? "embedded" : "email";

    // Section H requires the submitting rep's signature alongside the owner's.
    const rep = await resolveRep(admin, auth.ctx, body ?? {});
    if (!rep) return json({ error: "Could not resolve the submitting rep's email for the rep signature." }, 400);

    // Prefill from everything the spine already knows: the linked MPA
    // application (full EIN, owners, masks) and the lead's KYB intake
    // (financial snapshot, funding request) — last-4s only for identifiers
    // the paper doesn't need in the clear.
    const { data: mpaApp } = await admin
      .from("merchant_applications")
      .select("data, masks")
      .eq("submission_id", submissionId)
      .neq("status", "void")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    let lead: any = null;
    if (sub.lead_id) {
      const { data } = await admin
        .from("pipeline_leads")
        .select("business_name, industry, monthly_sales, amount_requested, kyb")
        .eq("id", sub.lead_id)
        .maybeSingle();
      lead = data;
    }
    const { data: docs } = await admin
      .from("deal_documents")
      .select("doc_kind, filename")
      .eq("submission_id", submissionId);

    const appData = (mpaApp?.data ?? null) as ApplicationData | null;
    const masks = (mpaApp?.masks ?? null) as {
      owners?: Array<{ ssnLast4: string; dobYear: string }>;
    } | null;
    const kyb = lead?.kyb ?? null;
    const owner1 = appData?.owners?.[0] ?? null;
    const num = (s: unknown) => parseFloat(String(s ?? "").replace(/[^0-9.]/g, "")) || undefined;
    const maskSsn = (last4?: string) => (last4 ? `•••-••-${last4}` : undefined);
    const docKinds = new Set((docs ?? []).map((d: any) => d.doc_kind as string));
    const extraDocs = (docs ?? [])
      .filter((d: any) => !["voided_check", "drivers_license", "statement", "signed_application"].includes(d.doc_kind))
      .map((d: any) => String(d.filename))
      .slice(0, 8);

    const fields: DltAppFields = {
      dateSubmitted: new Date().toISOString().slice(0, 10),
      repName: rep.name,
      repEmail: rep.email,
      repPhone: (body?.repPhone as string) || undefined,
      amountRequested: num(body?.amountRequested) ?? num(kyb?.funding?.amount) ?? num(lead?.amount_requested),
      desiredTerm: (body?.desiredTerm as string) || undefined,
      useOfFunds: (body?.useOfFunds as string) || kyb?.funding?.useOfFunds || undefined,
      legalName: appData?.business?.legalName || kyb?.business?.legalName || sub.merchant_name,
      dba: appData?.business?.dba || kyb?.business?.dba || undefined,
      ein: appData?.business?.ein
        ? appData.business.ein.replace(/^(\d{2})(\d{7})$/, "$1-$2")
        : (kyb?.business?.taxIdLast4 ? `••-•••${kyb.business.taxIdLast4}` : undefined),
      legalStructure: appData?.business?.ownershipType || kyb?.business?.structure || undefined,
      stateOfIncorporation: appData?.business?.stateIncorporated || kyb?.business?.stateOfIncorporation || undefined,
      businessStartDate: appData?.business?.establishedDate
        ? `${appData.business.establishedDate}-01`
        : (kyb?.business?.yearFounded ? `${kyb.business.yearFounded}-01-01` : undefined),
      industry: sub.vertical || kyb?.business?.industry || lead?.industry || undefined,
      businessPhone: appData?.business?.phone || kyb?.business?.phone || sub.phone || undefined,
      website: appData?.business?.website || kyb?.business?.website || undefined,
      businessAddress: appData
        ? [appData.locationAddress?.line1, appData.locationAddress?.city, appData.locationAddress?.state, appData.locationAddress?.zip]
            .filter(Boolean).join(", ")
        : (kyb?.business
            ? [kyb.business.addressLine1, kyb.business.city, kyb.business.state, kyb.business.postalCode].filter(Boolean).join(", ")
            : undefined),
      businessEmail: appData?.business?.email || sub.email || undefined,
      avgMonthlyRevenue: num(kyb?.processing?.monthlyVolume) ?? num(lead?.monthly_sales) ?? num(sub.monthly_volume),
      monthlyCardVolume: num(appData?.profile?.monthlyVolume) ?? num(sub.monthly_volume),
      owner1FirstName: owner1?.firstName || kyb?.representative?.firstName || undefined,
      owner1LastName: owner1?.lastName || kyb?.representative?.lastName || undefined,
      owner1EquityPct: owner1 ? Number(owner1.equityPct) || undefined : kyb?.representative?.ownershipPct || undefined,
      owner1SsnMasked: maskSsn(masks?.owners?.[0]?.ssnLast4 ?? kyb?.representative?.ssnLast4),
      owner1DobMasked: masks?.owners?.[0]?.dobYear || undefined,
      owner1CellPhone: owner1?.cellPhone || kyb?.representative?.phone || sub.phone || undefined,
      owner1Email: owner1?.email || kyb?.representative?.email || signerEmail,
      owner1HomeAddress: owner1
        ? [owner1.homeAddress, owner1.city, owner1.state, owner1.zip].filter(Boolean).join(", ")
        : undefined,
      hasSecondOwner: (appData?.owners?.length ?? 0) > 1 || undefined,
      owner2FirstName: appData?.owners?.[1]?.firstName,
      owner2LastName: appData?.owners?.[1]?.lastName,
      owner2EquityPct: appData?.owners?.[1] ? Number(appData.owners[1].equityPct) || undefined : undefined,
      owner2SsnMasked: maskSsn(masks?.owners?.[1]?.ssnLast4),
      owner2Email: appData?.owners?.[1]?.email,
      brokerNotes: (body?.brokerNotes as string) || sub.notes || undefined,
      attachments: {
        bankStatements: docKinds.has("statement"),
        photoId: docKinds.has("drivers_license"),
        voidedCheck: docKinds.has("voided_check"),
        additional: extraDocs,
      },
      applicationId: String(submissionId).slice(0, 8).toUpperCase(),
    };

    const html = renderDltAppHtml(fields);

    const embedKey = crypto.randomUUID();
    const ownerSigner: any = {
      recipientId: "1",
      routingOrder: "1",
      name: signerName,
      email: signerEmail,
      roleName: "Owner",
      tabs: signerTabs("own1"),
    };
    const repSigner: any = {
      recipientId: "2",
      routingOrder: "1",
      name: rep.name,
      email: rep.email,
      roleName: "Broker/ISO Representative",
      tabs: signerTabs("rep"),
    };
    if (mode === "embedded") {
      ownerSigner.clientUserId = embedClientId(embedKey, "mer");
      repSigner.clientUserId = embedClientId(embedKey, "rep");
    }
    const signers: any[] = [ownerSigner, repSigner];

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const env = await createEnvelopeFromHtml(acct.baseUri, acct.accountId, tok.token, {
      html,
      docName: `Delt Capital Funding Application - ${sub.merchant_name}.html`,
      emailSubject: (body?.emailSubject as string) || `Delt Capital Funding Application — ${sub.merchant_name}`,
      signers,
    });
    if ("error" in env) return json({ error: env.error }, 400);

    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        kind: "deal_application",
        submission_id: submissionId,
        lead_id: sub.lead_id ?? null,
        mode,
        merchant_name: sub.merchant_name,
        signer_name: signerName,
        signer_email: signerEmail,
        terms: { embedKey, rep },
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
    return json({ ok: true, contract: row, mode });
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
    const embedKey = crypto.randomUUID();
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
    if (mode === "embedded") merchantSigner.clientUserId = embedClientId(embedKey, "mer");

    // The rep signs their own stops — the Luqra final-execution agent line
    // and the Paysafe Section V site-survey certification. Always embedded:
    // the rep signs from the CRM, never by email round-trip.
    const rep = await resolveRep(admin, auth.ctx, body ?? {});
    const repSigner: any = rep
      ? {
          recipientId: "2",
          routingOrder: "1",
          name: rep.name,
          email: rep.email,
          roleName: "Sales Representative",
          clientUserId: embedClientId(embedKey, "rep"),
          tabs: {
            signHereTabs: [anchorTab(SIG2_ANCHOR)],
            dateSignedTabs: [anchorTab(DATE2_ANCHOR)],
          },
        }
      : null;

    // No Delt countersigner on processor MPAs: the counterparty approval
    // lines (LQ/Bank approval, Paysafe acceptance) belong to the processor
    // and are executed in their own boarding flow after submission.
    const signers: any[] = repSigner ? [merchantSigner, repSigner] : [merchantSigner];

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
        lead_id: sub.lead_id ?? null,
        mode,
        merchant_name: sub.merchant_name,
        signer_name: signerName,
        signer_email: signerEmail,
        terms: { channel, mode, applicationId, embedKey, ...(rep ? { rep } : {}) },
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
  // Any embedded envelope, any kind. `recipient` picks who signs: 'signer'
  // (default — the merchant/owner), 'guarantor', or 'rep'. Called right
  // before handing over the iPad; call again to regenerate after expiry.
  if (action === "signing-url") {
    const contractId = body?.contractId as string;
    const recipient = (body?.recipient as string) || "signer";
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row } = await admin.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!row || row.org_id !== auth.ctx.orgId) return json({ error: "Contract not found" }, 404);
    if (!row.envelope_id) return json({ error: "Contract has no envelope" }, 400);
    if (["completed", "voided", "declined"].includes(row.status)) {
      return json({ error: `Envelope is already ${row.status}` }, 400);
    }
    const terms = (row.terms ?? {}) as any;
    const embedKey = terms.embedKey as string | undefined;
    const legacyMpaKey = row.kind === "mpa" ? (terms.applicationId as string | undefined) : undefined;
    const isEmbedded = row.mode === "embedded" || terms.mode === "embedded";
    // The rep recipient on an MPA is always embedded, even on email envelopes.
    if (!isEmbedded && !(row.kind === "mpa" && recipient === "rep")) {
      return json({ error: "This envelope was sent for remote (email) signing" }, 400);
    }

    let userName: string;
    let email: string;
    let clientUserId: string;
    if (recipient === "guarantor") {
      if (!row.guarantor_name || !row.guarantor_email) return json({ error: "No guarantor on this envelope" }, 400);
      if (!embedKey) return json({ error: "This envelope predates guarantor embedded signing — resend it" }, 400);
      userName = row.guarantor_name;
      email = row.guarantor_email;
      clientUserId = embedClientId(embedKey, "gua");
    } else if (recipient === "rep") {
      const rep = terms.rep as { name: string; email: string } | undefined;
      if (!rep || !embedKey) return json({ error: "No rep signer on this envelope" }, 400);
      userName = rep.name;
      email = rep.email;
      clientUserId = embedClientId(embedKey, "rep");
    } else {
      userName = row.signer_name;
      email = row.signer_email;
      clientUserId = embedKey ? embedClientId(embedKey, "mer") : (legacyMpaKey ?? "");
      if (!clientUserId) return json({ error: "This envelope has no embedded signer" }, 400);
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
        body: JSON.stringify({ returnUrl, authenticationMethod: "none", email, userName, clientUserId }),
      },
    );
    const view = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: `Signing session failed: ${view?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true, url: view.url });
  }

  // ── countersign-url: embedded Delt countersignature (routing order 2) ──
  // 409 until every routing-order-1 recipient has completed. Legacy
  // envelopes whose countersigner was an email recipient get a resend
  // instead of a view URL.
  if (action === "countersign-url") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row } = await admin.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!row || row.org_id !== auth.ctx.orgId) return json({ error: "Contract not found" }, 404);
    if (!["mca", "deal_application", "agent_agreement"].includes(row.kind)) {
      return json({ error: "Only MCA agreements, funding applications, and agent agreements carry a Delt countersignature" }, 400);
    }
    if (!row.envelope_id) return json({ error: "Contract has no envelope" }, 400);
    if (row.countersigned_at) return json({ error: "Already countersigned" }, 409);
    if (["voided", "declined"].includes(row.status)) {
      return json({ error: `Envelope is ${row.status}` }, 400);
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const recRes = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/recipients`,
      { headers: { Authorization: `Bearer ${tok.token}` } },
    );
    const recBody = await recRes.json().catch(() => ({}));
    if (!recRes.ok) return json({ error: `Recipient lookup failed: HTTP ${recRes.status}` }, 400);
    const recSigners: any[] = recBody?.signers ?? [];
    const merchantSide = recSigners.filter((s) => String(s.routingOrder) === "1");
    const pending = merchantSide.filter((s) => String(s.status).toLowerCase() !== "completed");
    if (pending.length > 0) {
      return json({
        error: `Waiting on ${pending.map((s) => s.name).join(", ")} — the merchant side must sign first.`,
      }, 409);
    }
    const purchaser = recSigners.find((s) => String(s.routingOrder) === "2");
    if (!purchaser) return json({ error: "This envelope has no Delt countersigner recipient" }, 400);

    if (!purchaser.clientUserId) {
      // Legacy email-routed countersigner: nudge the email instead.
      await fetch(
        `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/recipients?resend_envelope=true`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ signers: [] }),
        },
      );
      return json({ ok: true, resent: true, email: purchaser.email });
    }

    const returnUrl = (body?.returnUrl as string) || "https://deltpay.com/#/signing-complete";
    const res = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/views/recipient`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl,
          authenticationMethod: "none",
          email: purchaser.email,
          userName: purchaser.name,
          clientUserId: purchaser.clientUserId,
        }),
      },
    );
    const view = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: `Countersign session failed: ${view?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true, url: view.url });
  }

  // ── resend: re-trigger DocuSign's email to pending recipients ──
  if (action === "resend") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const { data: row } = await admin.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!row || row.org_id !== auth.ctx.orgId) return json({ error: "Contract not found" }, 404);
    if (!row.envelope_id) return json({ error: "Contract has no envelope" }, 400);
    if (!["sent", "delivered"].includes(row.status)) {
      return json({ error: `Envelope is ${row.status} — only in-flight envelopes can be resent` }, 400);
    }

    const tok = await getAccessToken();
    if ("error" in tok) return json({ error: tok.error }, 400);
    const acct = await getAccount(tok.token);
    if ("error" in acct) return json({ error: acct.error }, 400);

    const res = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/recipients?resend_envelope=true`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ signers: [] }),
      },
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return json({ error: `Resend failed: ${errBody?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true });
  }

  // ── decision-memo: file the underwriting decision on the deal ──
  // The signed DLT-APP's decision box is intentionally blank (executed at
  // intake); this generates the internal memo PDF into deal-docs instead.
  if (action === "decision-memo") {
    const submissionId = body?.submissionId as string;
    if (!submissionId) return json({ error: "submissionId required" }, 400);
    const { data: sub } = await admin
      .from("deal_submissions")
      .select("id, org_id, merchant_name")
      .eq("id", submissionId)
      .maybeSingle();
    if (!sub || sub.org_id !== auth.ctx.orgId) return json({ error: "Deal submission not found" }, 404);

    const decision = body?.decision === "Declined" ? "Declined" : "Approved";
    const { renderDecisionMemoPdf } = await import("./decision_memo.ts");
    const pdf = await renderDecisionMemoPdf({
      merchantName: sub.merchant_name,
      applicationId: (body?.applicationId as string) || undefined,
      underwriter: (body?.underwriter as string) || undefined,
      decision,
      decidedAt: new Date().toISOString().slice(0, 10),
      approvedAmount: Number(body?.approvedAmount) || undefined,
      factorRate: Number(body?.factorRate) || undefined,
      paybackAmount: Number(body?.paybackAmount) || undefined,
      termMonths: Number(body?.termMonths) || undefined,
      paymentFrequency: (body?.paymentFrequency as string) || undefined,
      holdbackPct: Number(body?.holdbackPct) || undefined,
      tier: (body?.tier as string) || undefined,
      compositeScore: Number(body?.compositeScore) || undefined,
      stipulations: (body?.stipulations as string) || undefined,
      declineReason: (body?.declineReason as string) || undefined,
    });

    const path = `org/${sub.org_id}/${sub.id}/decision-memo-${Date.now()}.pdf`;
    const { error: upErr } = await admin.storage.from("deal-docs").upload(path, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) return json({ error: `Memo upload failed: ${upErr.message}` }, 500);
    const { error: docErr } = await admin.from("deal_documents").insert({
      org_id: sub.org_id,
      submission_id: sub.id,
      doc_kind: "decision_memo",
      filename: `Decision Memo (${decision}) - ${sub.merchant_name}.pdf`,
      storage_path: path,
      extract_status: "none",
      uploaded_by: "Underwriting",
    });
    if (docErr) return json({ error: `deal_documents insert failed: ${docErr.message}` }, 500);
    return json({ ok: true, path });
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
    const { error: updErr } = await admin
      .from("contracts").update(patch).eq("id", contractId).select("id").single();
    if (updErr) return json({ error: updErr.message }, 500);
    if (mapped === "completed" && !row.countersigned_at && ["mca", "deal_application"].includes(row.kind)) {
      try {
        await syncCountersign(contractId);
      } catch { /* best-effort; the sweep retries */ }
    }
    const { data: updated } = await admin.from("contracts").select("*").eq("id", contractId).single();
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
