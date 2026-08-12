/**
 * Unified merchant application (MPA) API.
 *
 * One endpoint serves both contexts:
 *   • Staff context — Carlos/agents filling the wizard inside the CRM (the
 *     primary flow: merchant sits next to them, then signs on the iPad).
 *     Authenticated via the caller's JWT (_shared/auth.ts); agents may only
 *     touch applications on their own deal submissions, ops (agents.edit)
 *     touch any.
 *   • Merchant context — the tokenized public link (/#/apply/mpa/:token).
 *     The body carries `token`; only sha256(token) is stored. Any lookup
 *     failure returns a uniform 404 so the endpoint is not an oracle.
 *
 * All DB access uses the service-role client; merchant_applications has no
 * anon RLS on purpose. Sensitive fields (SSNs, DOBs, license numbers, bank
 * numbers) live in a single AES-256-GCM blob (`secure`) encrypted with the
 * APP_ENCRYPTION_KEY secret; every response passes through toClientShape()
 * which never includes `secure`. The UI renders `masks` (last-4s) instead.
 *
 * Actions: create, get, save, submit, upload-doc, save-pricing, preview-mpa,
 * packet, mark-boarded, create-link, void-link, self-start.
 *
 *   • self-start (public, unauthenticated) — the hybrid-onboarding entry:
 *     low-volume merchants coming out of the deltpay.com quote flow create
 *     their own deal submission + application draft and receive a tokenized
 *     wizard link immediately, instead of waiting for a rep to send one.
 *     Guarded by honeypot fields, a volume-tier allowlist, and a global
 *     hourly rate cap on website-sourced submissions.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { hasPerm, requireUser, type AuthContext } from "../_shared/auth.ts";
import {
  buildMasks,
  emptySecureData,
  mergeSecure,
  validateForSubmit,
  type ApplicationData,
  type PricingBundle,
  type SecureData,
} from "../_shared/mpa/schema.ts";
import { decryptJson, encryptJson, newToken, sha256Hex } from "../_shared/mpa/crypto.ts";
import { dp2ApplicationLink, dp7Submitted, sendLifecycle } from "../_shared/lifecycle.ts";
import { notifyStaff } from "../_shared/plaid_notify.ts";

const SITE_URL = () => (Deno.env.get("SITE_URL") || "https://www.deltpay.com").replace(/\/$/, "");
const FROM_SYSTEM = () => Deno.env.get("LIFECYCLE_FROM_SYSTEM") || "DeltPay <noreply@deltpay.com>";
import { base64FromBytes, generateMpaPdf, type MpaApplicationRow } from "../_shared/mpa/generate.ts";
import { squarePacketText } from "../_shared/mpa/packet.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const NOT_FOUND = () => json({ error: "Application not found" }, 404);

type Ctx =
  | { kind: "staff"; auth: AuthContext }
  | { kind: "merchant" };

/** What any client (staff or merchant) is allowed to see of a row. */
function toClientShape(row: Record<string, unknown>, ctx: Ctx, submission?: Record<string, unknown> | null) {
  const base = {
    id: row.id,
    submissionId: row.submission_id,
    status: row.status,
    currentStep: row.current_step,
    data: row.data,
    masks: row.masks,
    submittedAt: row.submitted_at,
    submission: submission
      ? { merchantName: submission.merchant_name, contactName: submission.contact_name }
      : undefined,
  };
  if (ctx.kind === "merchant") return base;
  return {
    ...base,
    pricing: row.pricing,
    boardedAt: row.boarded_at,
    hasLink: Boolean(row.token_hash),
    linkExpiresAt: row.token_expires_at,
    updatedAt: row.updated_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const action = body?.action as string;

  // ── self-start (public): quote-flow merchants open their own application ──
  if (action === "self-start") {
    const WEBSITE_AGENT = "Website — Self-serve";
    const clean = (v: unknown, max = 200) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";
    const name = clean(body?.name);
    const business = clean(body?.business) || name;
    const email = clean(body?.email, 254).toLowerCase();
    const phone = clean(body?.phone, 40);
    const volume = clean(body?.volume, 40);
    // Honeypot tripped → pretend success, create nothing.
    if (clean(body?.company_website) || clean(body?.hp_extra_field)) {
      return json({ ok: true });
    }
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "A valid name and email are required" }, 400);
    }
    // Self-serve is only offered for the lower volume tiers; larger
    // merchants go through the assisted quote path.
    const VOLUME_EST: Record<string, number> = { under10k: 5_000, "10k_50k": 30_000 };
    if (!(volume in VOLUME_EST)) {
      return json({ error: "Self-serve onboarding is not available for this volume" }, 400);
    }
    // Cheap global throttle: cap website-sourced submissions per hour.
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await admin
      .from("deal_submissions")
      .select("id", { count: "exact", head: true })
      .eq("agent_name", WEBSITE_AGENT)
      .gte("created_at", hourAgo);
    if ((count ?? 0) >= 20) {
      return json({ error: "We're receiving a lot of applications right now — our team will email your secure link shortly." }, 429);
    }
    // Single-tenant org resolution: default_org_id(), falling back to the
    // first org row (matches the set_org_id() trigger's own coalesce).
    let orgId: string | null = null;
    const { data: defOrg } = await admin.rpc("default_org_id");
    if (typeof defOrg === "string" && defOrg) orgId = defOrg;
    if (!orgId) {
      const { data: orgs } = await admin.from("orgs").select("id").order("created_at").limit(1);
      orgId = orgs?.[0]?.id ?? null;
    }
    if (!orgId) return json({ error: "Organization is not configured" }, 500);

    const { data: sub, error: subErr } = await admin
      .from("deal_submissions")
      .insert({
        org_id: orgId,
        agent_name: WEBSITE_AGENT,
        merchant_name: business,
        contact_name: name,
        email,
        phone: phone || null,
        monthly_volume: VOLUME_EST[volume],
        notes: `Self-serve application started from the deltpay.com quote flow (${volume}).`,
      })
      .select("*")
      .single();
    if (subErr) return json({ error: subErr.message }, 500);

    const seed: Partial<ApplicationData> = {
      business: {
        legalName: business,
        dba: business,
        phone,
        email,
        contactFirstName: name.split(/\s+/)[0] ?? "",
        contactLastName: name.split(/\s+/).slice(1).join(" "),
      } as ApplicationData["business"],
    };
    const token = newToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
    const linkUrl = `${SITE_URL()}/apply/mpa/${token}`;
    const { error: appErr } = await admin
      .from("merchant_applications")
      .insert({
        org_id: orgId,
        submission_id: sub.id,
        data: seed,
        token_hash: tokenHash,
        token_expires_at: expiresAt,
        applicant_email: email,
        // Stored (same convention as plaid_link_requests.hosted_link_url)
        // so the DP-4/5/6 stall reminders can carry the resume link.
        link_url: linkUrl,
        link_sent_at: new Date().toISOString(),
      });
    if (appErr) return json({ error: appErr.message }, 500);
    // DP-2: email the link too — self-starters lose the on-screen link the
    // moment the tab closes; this is what makes the draft recoverable.
    const tpl = dp2ApplicationLink({ firstName: name.split(/\s+/)[0], businessName: business, url: linkUrl });
    sendLifecycle({ to: email, from: FROM_SYSTEM(), subject: tpl.subject, html: tpl.html, campaign: "DP-2", kind: "transactional" }).catch(() => {});
    // The raw token is returned exactly once and never stored.
    return json({ ok: true, path: `/apply/mpa/${token}`, expiresAt });
  }

  // ── Resolve context: token (merchant) or JWT (staff) ──
  let ctx: Ctx;
  let row: any = null;

  if (typeof body?.token === "string" && body.token) {
    const tokenHash = await sha256Hex(body.token);
    const { data } = await admin
      .from("merchant_applications")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (!data) return NOT_FOUND();
    if (!data.token_expires_at || new Date(data.token_expires_at).getTime() < Date.now()) return NOT_FOUND();
    if (!["draft", "submitted"].includes(data.status)) return NOT_FOUND();
    ctx = { kind: "merchant" };
    row = data;
    // Merchant context may only use these actions.
    if (!["get", "save", "submit", "upload-doc"].includes(action)) {
      return json({ error: `Action not available: ${action}` }, 403);
    }
  } else {
    const auth = await requireUser(req.headers.get("Authorization") ?? undefined);
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    ctx = { kind: "staff", auth: auth.ctx };
  }

  const staff = ctx.kind === "staff" ? ctx.auth : null;

  /** Staff: load application + enforce org/ownership. */
  async function loadForStaff(applicationId: string): Promise<{ row: any } | Response> {
    const { data } = await admin.from("merchant_applications").select("*").eq("id", applicationId).maybeSingle();
    if (!data || data.org_id !== staff!.orgId) return NOT_FOUND();
    if (!hasPerm(staff!, "agents.edit")) {
      const { data: sub } = await admin
        .from("deal_submissions")
        .select("agent_id")
        .eq("id", data.submission_id)
        .maybeSingle();
      if (!sub || sub.agent_id !== staff!.agentId) {
        return json({ error: "You can only work on applications for your own deals" }, 403);
      }
    }
    return { row: data };
  }

  async function loadSubmission(submissionId: string) {
    const { data } = await admin.from("deal_submissions").select("*").eq("id", submissionId).maybeSingle();
    return data;
  }

  const encryptionKey = Deno.env.get("APP_ENCRYPTION_KEY") ?? "";

  // ── create (staff): idempotent draft for a submission ──
  if (action === "create") {
    if (!staff) return NOT_FOUND();
    if (!hasPerm(staff, "leads.create") && !hasPerm(staff, "agents.edit")) {
      return json({ error: "Missing permission: leads.create" }, 403);
    }
    const submissionId = body?.submissionId as string;
    if (!submissionId) return json({ error: "submissionId required" }, 400);
    const sub = await loadSubmission(submissionId);
    if (!sub || sub.org_id !== staff.orgId) return json({ error: "Deal submission not found" }, 404);
    if (!hasPerm(staff, "agents.edit") && sub.agent_id !== staff.agentId) {
      return json({ error: "You can only start applications for your own deals" }, 403);
    }
    const { data: existing } = await admin
      .from("merchant_applications")
      .select("*")
      .eq("submission_id", submissionId)
      .neq("status", "void")
      .maybeSingle();
    if (existing) return json({ ok: true, application: toClientShape(existing, ctx, sub) });

    // Seed the draft with what the deal already knows.
    const seed: Partial<ApplicationData> = {
      business: {
        legalName: sub.merchant_name ?? "",
        dba: sub.merchant_name ?? "",
        ein: "",
        ownershipType: "",
        taxExempt: false,
        establishedDate: "",
        stateIncorporated: "",
        numberOfLocations: "1",
        phone: sub.phone ?? "",
        email: sub.email ?? "",
        website: "",
        customerServicePhone: "",
        customerServiceEmail: "",
        contactFirstName: (sub.contact_name ?? "").split(/\s+/)[0] ?? "",
        contactLastName: (sub.contact_name ?? "").split(/\s+/).slice(1).join(" "),
      } as ApplicationData["business"],
    };
    const { data: created, error: insErr } = await admin
      .from("merchant_applications")
      .insert({
        org_id: sub.org_id,
        submission_id: submissionId,
        data: seed,
        created_by: staff.userId,
      })
      .select("*")
      .single();
    if (insErr) return json({ error: insErr.message }, 500);
    return json({ ok: true, application: toClientShape(created, ctx, sub) });
  }

  // ── Everything below operates on an existing row ──
  if (ctx.kind === "staff") {
    const applicationId = body?.applicationId as string;
    if (!applicationId) return json({ error: "applicationId required" }, 400);
    const loaded = await loadForStaff(applicationId);
    if (loaded instanceof Response) return loaded;
    row = loaded.row;
  }

  const submission = await loadSubmission(row.submission_id);

  // ── get ──
  if (action === "get") {
    return json({ ok: true, application: toClientShape(row, ctx, submission) });
  }

  // ── save: merge data + optional partial secure update ──
  if (action === "save") {
    if (ctx.kind === "merchant" && row.status !== "draft") {
      return json({ error: "This application has already been submitted" }, 409);
    }
    if (ctx.kind === "staff" && ["boarded", "void"].includes(row.status)) {
      return json({ error: `Application is ${row.status} and can no longer be edited` }, 409);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.data !== undefined) patch.data = body.data;
    if (typeof body.currentStep === "number") patch.current_step = body.currentStep;

    if (body.secureUpdate !== undefined) {
      if (!encryptionKey) return json({ error: "Encryption is not configured (APP_ENCRYPTION_KEY)" }, 500);
      let existing: SecureData = emptySecureData();
      if (row.secure) {
        try {
          existing = await decryptJson<SecureData>(row.secure, encryptionKey);
        } catch {
          return json({ error: "Could not decrypt existing secure data (key mismatch?)" }, 500);
        }
      }
      const merged = mergeSecure(existing, body.secureUpdate as Partial<SecureData>);
      patch.secure = await encryptJson(merged, encryptionKey);
      patch.masks = buildMasks(merged);
    }

    const { data: updated, error: updErr } = await admin
      .from("merchant_applications")
      .update(patch)
      .eq("id", row.id)
      .select("*")
      .single();
    if (updErr) return json({ error: updErr.message }, 500);
    return json({ ok: true, application: toClientShape(updated, ctx, submission) });
  }

  // ── submit: full validation, lock (merchant) ──
  if (action === "submit") {
    if (!encryptionKey) return json({ error: "Encryption is not configured (APP_ENCRYPTION_KEY)" }, 500);
    if (!row.secure) return json({ error: "Owner and banking details are incomplete" }, 400);
    let secure: SecureData;
    try {
      secure = await decryptJson<SecureData>(row.secure, encryptionKey);
    } catch {
      return json({ error: "Could not decrypt secure data (key mismatch?)" }, 500);
    }
    const problems = validateForSubmit({ data: row.data as ApplicationData, secure });
    if (problems.length > 0) return json({ error: "Application is incomplete", problems }, 422);

    const patch: Record<string, unknown> = {
      status: "submitted",
      submitted_at: row.submitted_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // A merchant link is single-shot: submitting expires it.
    if (ctx.kind === "merchant") patch.token_expires_at = new Date().toISOString();
    const { data: updated, error: updErr } = await admin
      .from("merchant_applications")
      .update(patch)
      .eq("id", row.id)
      .select("*")
      .single();
    if (updErr) return json({ error: updErr.message }, 500);
    // DP-7 + internal alert — exactly once per application.
    if (!updated.submit_notified_at) {
      const merchantName = (submission?.merchant_name as string) || "your business";
      const contactFirst = String(submission?.contact_name || "").trim().split(/\s+/)[0] || "";
      const to = String(updated.applicant_email || submission?.email || "").trim();
      if (to) {
        const tpl = dp7Submitted({ firstName: contactFirst, businessName: merchantName });
        sendLifecycle({ to, from: FROM_SYSTEM(), subject: tpl.subject, html: tpl.html, campaign: "DP-7", kind: "transactional" }).catch(() => {});
      }
      notifyStaff(
        `📥 MPA submitted: ${merchantName}`,
        `<p style="font-family:sans-serif;font-size:14px;">Merchant application for <b>${merchantName}</b> was just submitted${ctx.kind === "merchant" ? " by the merchant (self-serve link)" : " from the staff wizard"}. Open the CRM → Deals to review and push to the processor.</p>`,
      ).catch(() => {});
      await admin.from("merchant_applications").update({ submit_notified_at: new Date().toISOString() }).eq("id", updated.id);
    }
    return json({ ok: true, application: toClientShape(updated, ctx, submission) });
  }

  // ── upload-doc: voided check / ID into the deal-docs bucket ──
  if (action === "upload-doc") {
    const kind = body?.kind as string;
    const filename = (body?.filename as string) || "upload";
    const contentBase64 = body?.contentBase64 as string;
    if (!["voided_check", "drivers_license", "other"].includes(kind)) {
      return json({ error: "kind must be voided_check, drivers_license, or other" }, 400);
    }
    if (!contentBase64) return json({ error: "contentBase64 required" }, 400);
    const bytes = Uint8Array.from(atob(contentBase64), (c) => c.charCodeAt(0));
    if (bytes.length > 8 * 1024 * 1024) return json({ error: "File too large (8 MB max)" }, 413);

    const safeName = filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
    const path = `org/${row.org_id}/${row.submission_id}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await admin.storage.from("deal-docs").upload(path, bytes, {
      contentType: (body?.contentType as string) || "application/octet-stream",
    });
    if (upErr) return json({ error: `Upload failed: ${upErr.message}` }, 500);
    const { data: doc, error: insErr } = await admin
      .from("deal_documents")
      .insert({
        org_id: row.org_id,
        submission_id: row.submission_id,
        doc_kind: kind,
        filename: safeName,
        storage_path: path,
        uploaded_by: ctx.kind === "merchant" ? "Merchant (application link)" : "Staff (MPA wizard)",
      })
      .select("id")
      .single();
    if (insErr) return json({ error: insErr.message }, 500);
    return json({ ok: true, documentId: doc.id });
  }

  // ── Staff-only actions from here on ──
  if (!staff) return NOT_FOUND();

  // ── save-pricing: store processor pricing + set the boarding channel ──
  if (action === "save-pricing") {
    if (!hasPerm(staff, "merchants.edit")) return json({ error: "Missing permission: merchants.edit" }, 403);
    const channel = body?.channel as string;
    if (!["Luqra", "Paysafe"].includes(channel)) return json({ error: "channel must be Luqra or Paysafe" }, 400);
    const pricing = (row.pricing ?? {}) as PricingBundle;
    if (channel === "Luqra") pricing.luqra = body?.pricing;
    else pricing.paysafe = body?.pricing;
    const { data: updated, error: updErr } = await admin
      .from("merchant_applications")
      .update({ pricing, updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .select("*")
      .single();
    if (updErr) return json({ error: updErr.message }, 500);
    await admin.from("deal_submissions").update({ channel }).eq("id", row.submission_id);
    return json({ ok: true, application: toClientShape(updated, ctx, submission) });
  }

  // ── preview-mpa: filled PDF (no signature anchors) for review ──
  if (action === "preview-mpa") {
    if (!hasPerm(staff, "merchants.edit")) return json({ error: "Missing permission: merchants.edit" }, 403);
    const channel = body?.channel as string;
    if (!["Luqra", "Paysafe"].includes(channel)) return json({ error: "channel must be Luqra or Paysafe" }, 400);
    const result = await generateMpaPdf(admin, row as MpaApplicationRow, channel as "Luqra" | "Paysafe", {
      withAnchors: false,
    });
    if ("error" in result) return json({ error: result.error }, 400);
    return json({ ok: true, pdfBase64: base64FromBytes(result.pdf), warnings: result.warnings });
  }

  // ── packet: Square/OrderOut boarding packet text ──
  if (action === "packet") {
    if (!hasPerm(staff, "merchants.edit")) return json({ error: "Missing permission: merchants.edit" }, 403);
    const includeSensitive = body?.includeSensitive === true;
    let secure: SecureData | undefined;
    if (includeSensitive) {
      if (!encryptionKey) return json({ error: "Encryption is not configured (APP_ENCRYPTION_KEY)" }, 500);
      if (!row.secure) return json({ error: "The application has no owner/banking details yet" }, 400);
      try {
        secure = await decryptJson<SecureData>(row.secure, encryptionKey);
      } catch {
        return json({ error: "Could not decrypt secure data (key mismatch?)" }, 500);
      }
    }
    const text = squarePacketText(row.data as ApplicationData, row.masks, { includeSensitive, secure });
    return json({ ok: true, packet: text });
  }

  // ── mark-boarded (Square path has no envelope to complete) ──
  if (action === "mark-boarded") {
    if (!hasPerm(staff, "merchants.edit")) return json({ error: "Missing permission: merchants.edit" }, 403);
    const { data: updated, error: updErr } = await admin
      .from("merchant_applications")
      .update({ status: "boarded", boarded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .select("*")
      .single();
    if (updErr) return json({ error: updErr.message }, 500);
    return json({ ok: true, application: toClientShape(updated, ctx, submission) });
  }

  // ── create-link / void-link: merchant self-serve link (v1.5) ──
  if (action === "create-link") {
    if (!hasPerm(staff, "leads.create") && !hasPerm(staff, "agents.edit")) {
      return json({ error: "Missing permission: leads.create" }, 403);
    }
    const expiresDays = Math.min(Math.max(Number(body?.expiresDays) || 14, 1), 60);
    const token = newToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 3600 * 1000).toISOString();
    const applicantEmail = ((body?.applicantEmail as string) ?? "").trim().toLowerCase() || null;
    const linkUrl = `${SITE_URL()}/apply/mpa/${token}`;
    const { error: updErr } = await admin
      .from("merchant_applications")
      .update({
        token_hash: tokenHash,
        token_expires_at: expiresAt,
        applicant_email: applicantEmail,
        link_url: linkUrl,
        link_sent_at: new Date().toISOString(),
        reminder_count: 0,
        last_reminder_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (updErr) return json({ error: updErr.message }, 500);
    // DP-2: deliver the link by email when the rep provided an address —
    // a fresh link resets the reminder sequence above.
    if (applicantEmail) {
      const merchantName = (submission?.merchant_name as string) || "your business";
      const contactFirst = String(submission?.contact_name || "").trim().split(/\s+/)[0] || "";
      const tpl = dp2ApplicationLink({ firstName: contactFirst, businessName: merchantName, url: linkUrl });
      sendLifecycle({ to: applicantEmail, from: FROM_SYSTEM(), subject: tpl.subject, html: tpl.html, campaign: "DP-2", kind: "transactional" }).catch(() => {});
    }
    // The raw token is returned exactly once and never stored.
    return json({ ok: true, token, path: `/apply/mpa/${token}`, expiresAt });
  }

  if (action === "void-link") {
    const { error: updErr } = await admin
      .from("merchant_applications")
      .update({ token_hash: null, token_expires_at: null, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) return json({ error: updErr.message }, 500);
    return json({ ok: true });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
