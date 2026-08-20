/**
 * DocuSign Connect webhook — signed contracts update themselves.
 *
 * Deployed with JWT verification DISABLED (DocuSign can't send Supabase auth
 * headers). Instead, every request is authenticated with DocuSign Connect's
 * HMAC signature: X-DocuSign-Signature-1 must equal
 * base64(HMAC-SHA256(raw_body, DOCUSIGN_CONNECT_HMAC_KEY)). Fails closed —
 * requests are rejected when the secret is unset or the signature mismatches.
 *
 * Setup (one-time, DocuSign admin → Connect):
 *   1. Add a Connect configuration pointing at
 *      https://<project>.supabase.co/functions/v1/docusign-connect
 *   2. Enable HMAC and store the generated key as the
 *      DOCUSIGN_CONNECT_HMAC_KEY function secret.
 *   3. Subscribe to envelope events: sent, delivered, completed, declined,
 *      voided. Use the JSON (REST v2.1) payload format ("Aggregate Messages
 *      per Envelope" / SIM is fine — both shapes are handled below).
 *
 * The nightly `docusign-sweep` job remains the safety net for missed events.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { applyEnvelopeStatus, getAccessToken, getAccount } from "../_shared/docusign_status.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * On envelope completion, pull the signed PDF from DocuSign and file it —
 * storage upload into deal-docs plus (when the contract is linked to a deal
 * submission) a deal_documents row with a kind-specific doc_kind, so it
 * appears in the deal's Documents panel via realtime. Every kind is
 * captured, MCA agreements included — the flagship document must never be
 * the one that goes unfiled. Failures log and never block the status
 * update; the nightly sweep re-fires status and this re-runs on the next
 * completed event or manual status refresh via applyEnvelopeStatus callers.
 */
const SIGNED_DOC_KIND: Record<string, string> = {
  deal_application: "signed_application",
  mca: "signed_mca",
  mpa: "signed_mpa",
};
const SIGNED_DOC_LABEL: Record<string, string> = {
  deal_application: "Signed Application",
  mca: "Signed MCA Agreement",
  mpa: "Signed MPA",
};

async function captureSignedApplication(contractId: string): Promise<void> {
  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: row } = await db
      .from("contracts")
      .select("id, kind, submission_id, envelope_id, org_id, merchant_name, signed_storage_path, status")
      .eq("id", contractId)
      .single();
    if (!row || !SIGNED_DOC_KIND[row.kind]) return;
    if (row.signed_storage_path || row.status !== "completed" || !row.envelope_id) return;

    const tok = await getAccessToken();
    if ("error" in tok) throw new Error(tok.error);
    const acct = await getAccount(tok.token);
    if ("error" in acct) throw new Error(acct.error);

    const res = await fetch(
      `${acct.baseUri}/v2.1/accounts/${acct.accountId}/envelopes/${row.envelope_id}/documents/combined`,
      { headers: { Authorization: `Bearer ${tok.token}` } },
    );
    if (!res.ok) throw new Error(`Signed document download failed: HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());

    // Path keyed by envelope so multiple kinds completing on one submission
    // never collide; contracts without a submission file under the contract id.
    const scope = row.submission_id ?? `contracts/${row.id}`;
    const path = `org/${row.org_id}/${scope}/signed-${row.kind}-${row.envelope_id}.pdf`;
    const { error: upErr } = await db.storage.from("deal-docs").upload(path, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    if (row.submission_id) {
      const { error: docErr } = await db.from("deal_documents").insert({
        org_id: row.org_id,
        submission_id: row.submission_id,
        doc_kind: SIGNED_DOC_KIND[row.kind],
        filename: `${SIGNED_DOC_LABEL[row.kind]} - ${row.merchant_name}.pdf`,
        storage_path: path,
        extract_status: "none",
        uploaded_by: "DocuSign",
      });
      if (docErr && !String(docErr.message).includes("duplicate")) {
        throw new Error(`deal_documents insert failed: ${docErr.message}`);
      }
    }

    await db.from("contracts").update({ signed_storage_path: path }).eq("id", row.id);
    console.log(`docusign-connect: captured ${SIGNED_DOC_LABEL[row.kind]} for contract ${row.id} → ${path}`);
  } catch (err) {
    console.error("docusign-connect: signed-document capture failed:", err);
  }
}

async function hmacBase64(key: string, payload: Uint8Array): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, payload.buffer as ArrayBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ ok: true, service: "docusign-connect", expects: "POST from DocuSign Connect" });
  }

  const hmacKey = Deno.env.get("DOCUSIGN_CONNECT_HMAC_KEY") ?? "";
  const raw = new Uint8Array(await req.arrayBuffer());

  if (!hmacKey) {
    console.error("docusign-connect: DOCUSIGN_CONNECT_HMAC_KEY is not set — rejecting");
    return json({ ok: false, error: "Webhook not configured" }, 401);
  }
  const given = req.headers.get("X-DocuSign-Signature-1") ?? "";
  const expected = await hmacBase64(hmacKey, raw);
  if (!given || !timingSafeEqual(given, expected)) {
    console.error("docusign-connect: HMAC signature mismatch — rejecting");
    return json({ ok: false, error: "Invalid signature" }, 401);
  }

  let body: any;
  try {
    body = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  try {
    // Two payload shapes, depending on the Connect config:
    //   REST/JSON:  { event: "envelope-completed", data: { envelopeId,
    //                 envelopeSummary: { status, completedDateTime } } }
    //   Aggregate:  { envelopeId, status, completedDateTime, ... }
    const data = body?.data ?? body;
    const envelopeId: string = String(data?.envelopeId ?? body?.envelopeId ?? "");
    const summary = data?.envelopeSummary ?? data;
    let status: string = String(summary?.status ?? "");
    if (!status && typeof body?.event === "string" && body.event.startsWith("envelope-")) {
      status = body.event.slice("envelope-".length);
    }
    const completedAt: string | null = summary?.completedDateTime ?? null;

    if (!envelopeId || !status) {
      console.warn("docusign-connect: payload missing envelopeId/status", { event: body?.event });
      return json({ ok: true, ignored: "missing envelopeId or status" });
    }

    const out = await applyEnvelopeStatus(envelopeId, status, completedAt);
    if (!out.updated) {
      console.log(`docusign-connect: unknown envelope ${envelopeId} — ignored`);
      return json({ ok: true, ignored: "unknown envelope" });
    }
    console.log(`docusign-connect: envelope ${envelopeId} → ${status} (contract ${out.contractId})`);
    if (status.toLowerCase() === "completed" && out.contractId) {
      await captureSignedApplication(out.contractId);
    }
    return json({ ok: true, contractId: out.contractId, status });
  } catch (err) {
    console.error("docusign-connect error", err);
    // 200 after successful auth so DocuSign doesn't disable the config;
    // the nightly sweep reconciles anything missed.
    return json({ ok: false, error: String(err) });
  }
});
