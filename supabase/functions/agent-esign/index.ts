/**
 * Agent onboarding e-sign for the Delt CRM.
 *
 * One DocuSign envelope per agent: Agreement + Schedule A (fee schedule) +
 * Schedule B (comp plan) + Substitute W-9 + ACH authorization. Merchant
 * paper (MCA / DLT-APP / MPA) lives in the `docusign` function; this one
 * owns contracts of kind 'agent_agreement' only.
 *
 * Actions (POST JSON { action, ... }, called by staff from the CRM):
 *   • send            — render the packet, open the envelope (agent signs by
 *     email with required W-9 + ACH tabs; Delt countersigns embedded at
 *     routing order 2), record it in public.contracts.
 *   • status          — poll the envelope's live status and sync the row.
 *   • resend          — re-trigger DocuSign's email to pending recipients.
 *   • countersign-url — mint the embedded Delt countersignature session.
 *
 * W-9 and ACH values live only in the DocuSign envelope — they are never
 * written back to the database. Auth mirrors the docusign function:
 * send/resend need agents.edit, status needs merchants.view, countersign
 * needs contracts.countersign.
 *
 * Uses the same DOCUSIGN_* function secrets as the docusign function.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { requirePerm } from "../_shared/auth.ts";
import { getAccessToken, getAccount, STATUS_MAP, syncCountersign } from "../_shared/docusign_status.ts";
import { renderAgentAgreementHtml } from "./agent_agreement.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/** Reminders + hard expiry: nudge every 2 days, expire at 14 with a 3-day warning. */
const ENVELOPE_NOTIFICATION = {
  useAccountDefaults: "false",
  reminders: { reminderEnabled: "true", reminderDelay: "2", reminderFrequency: "2" },
  expirations: { expireEnabled: "true", expireAfter: "14", expireWarn: "3" },
};

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
  const neededPerm =
    action === "send" || action === "resend" ? "agents.edit"
    : action === "countersign-url" ? "contracts.countersign"
    : "merchants.view";
  const auth = await requirePerm(req.headers.get("Authorization") ?? undefined, neededPerm);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const admin = createClient(supabaseUrl, serviceKey);

  /** Load an agent_agreement contract in the caller's org, or respond 404. */
  const loadContract = async (contractId: string) => {
    const { data: row } = await admin.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!row || row.org_id !== auth.ctx.orgId || row.kind !== "agent_agreement") return null;
    return row;
  };

  // ── send ──
  if (action === "send") {
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
    const a = (anchorString: string) => ({
      anchorString,
      anchorUnits: "pixels",
      anchorXOffset: "60",
      anchorYOffset: "-6",
    });
    const fieldTab = (anchorString: string, tabLabel: string, width: number, required: string) => ({
      anchorString,
      anchorUnits: "pixels",
      anchorXOffset: "4",
      anchorYOffset: "-6",
      tabLabel,
      width,
      required,
    });
    const agentSigner = {
      recipientId: "1",
      routingOrder: "1",
      name: agentName,
      email: agentEmail,
      roleName: "Agent",
      tabs: {
        // Two sign-heres: the agreement's signature page and the W-9
        // certification (the IRS requires its own penalties-of-perjury
        // signature). W-9 + ACH values live in the envelope only.
        signHereTabs: [a("/agt_sig/"), a("/w9_sig/")],
        dateSignedTabs: [a("/agt_date/"), a("/w9_date/")],
        fullNameTabs: [a("/agt_name/")],
        textTabs: [
          fieldTab("/agt_addr/", "agent_address", 320, "true"),
          fieldTab("/agt_bank/", "ach_bank_name", 220, "true"),
          fieldTab("/agt_accttype/", "ach_account_type", 140, "true"),
          fieldTab("/agt_routing/", "ach_routing", 140, "true"),
          fieldTab("/agt_acct/", "ach_account", 160, "true"),
          fieldTab("/agt_acctname/", "ach_name_on_account", 260, "true"),
          fieldTab("/w9_name/", "w9_name", 300, "true"),
          fieldTab("/w9_biz/", "w9_business_name", 280, "false"),
          fieldTab("/w9_class/", "w9_tax_classification", 220, "true"),
          fieldTab("/w9_addr/", "w9_address", 340, "true"),
          fieldTab("/w9_tin/", "w9_tin", 180, "true"),
        ],
      },
    };
    // Captive countersigner: no DocuSign email — the CRM's "Countersign now"
    // button (countersign-url) drives execution after the agent signs.
    const csSigner = {
      recipientId: "2",
      routingOrder: "2",
      name: countersigner.name,
      email: countersigner.email,
      roleName: "Delt Pay LLC",
      clientUserId: `${embedKey}:cs`,
      tabs: {
        signHereTabs: [a("/del_sig/")],
        dateSignedTabs: [a("/del_date/")],
        fullNameTabs: [a("/del_name/")],
        textTabs: [{ ...a("/del_title/"), tabLabel: "del_title", width: 160, required: "false" }],
      },
    };

    const html = renderAgentAgreementHtml({ agentName, agentEmail });
    const htmlBytes = new TextEncoder().encode(html);
    let binary = "";
    for (let i = 0; i < htmlBytes.length; i += 8192) {
      binary += String.fromCharCode(...htmlBytes.subarray(i, i + 8192));
    }
    const envelope = {
      emailSubject: (body?.emailSubject as string) || `Delt Pay Agent Agreement — ${agentName}`,
      documents: [{
        documentId: "1",
        name: `Delt Pay Agent Agreement - ${agentName}.html`,
        fileExtension: "html",
        documentBase64: btoa(binary),
      }],
      recipients: { signers: [agentSigner, csSigner] },
      notification: ENVELOPE_NOTIFICATION,
      status: "sent",
    };
    const envRes = await fetch(`${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
    const envBody = await envRes.json().catch(() => ({}));
    if (!envRes.ok) {
      return json({ error: `Envelope create failed: ${envBody?.message || envBody?.errorCode || `HTTP ${envRes.status}`}` }, 400);
    }

    const { data: row, error: insErr } = await admin
      .from("contracts")
      .insert({
        kind: "agent_agreement",
        mode: "email",
        merchant_name: agentName,
        signer_name: agentName,
        signer_email: agentEmail,
        terms: { embedKey, countersigner, agentId: (body?.agentId as string) ?? null },
        envelope_id: envBody.envelopeId as string,
        status: "sent",
        docusign_status: "sent",
        sent_at: new Date().toISOString(),
        created_by: auth.ctx.userId,
        org_id: auth.ctx.orgId,
      })
      .select("*")
      .single();
    if (insErr) {
      return json({ error: `Envelope ${envBody.envelopeId} was sent, but recording it failed: ${insErr.message}`, envelopeId: envBody.envelopeId }, 500);
    }
    return json({ ok: true, contract: row, mode: "email" });
  }

  // ── status ──
  if (action === "status") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const row = await loadContract(contractId);
    if (!row) return json({ error: "Contract not found" }, 404);
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
    if (mapped === "completed" && !row.countersigned_at) {
      try {
        await syncCountersign(contractId);
      } catch { /* best-effort */ }
    }
    const { data: updated } = await admin.from("contracts").select("*").eq("id", contractId).single();
    return json({ ok: true, contract: updated });
  }

  // ── resend ──
  if (action === "resend") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const row = await loadContract(contractId);
    if (!row) return json({ error: "Contract not found" }, 404);
    if (!row.envelope_id) return json({ error: "Contract has no envelope" }, 400);
    if (["completed", "voided", "declined"].includes(row.status)) {
      return json({ error: `Envelope is ${row.status}` }, 400);
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
      const b = await res.json().catch(() => ({}));
      return json({ error: `Resend failed: ${b?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true });
  }

  // ── countersign-url: embedded Delt countersignature (routing order 2) ──
  if (action === "countersign-url") {
    const contractId = body?.contractId as string;
    if (!contractId) return json({ error: "contractId required" }, 400);
    const row = await loadContract(contractId);
    if (!row) return json({ error: "Contract not found" }, 404);
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
    const pending = recSigners
      .filter((s) => String(s.routingOrder) === "1")
      .filter((s) => String(s.status).toLowerCase() !== "completed");
    if (pending.length > 0) {
      return json({
        error: `Waiting on ${pending.map((s) => s.name).join(", ")} — the agent must sign first.`,
      }, 409);
    }
    const cs = recSigners.find((s) => String(s.routingOrder) === "2");
    if (!cs) return json({ error: "This envelope has no Delt countersigner recipient" }, 400);

    const returnUrl = (body?.returnUrl as string) || "https://deltpay.com/#/signing-complete";
    const res = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/views/recipient`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${tok.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl,
          authenticationMethod: "none",
          email: cs.email,
          userName: cs.name,
          clientUserId: cs.clientUserId,
        }),
      },
    );
    const view = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: `Countersign session failed: ${view?.message || `HTTP ${res.status}`}` }, 400);
    }
    return json({ ok: true, url: view.url });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
