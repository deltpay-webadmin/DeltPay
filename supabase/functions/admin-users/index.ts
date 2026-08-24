/**
 * Admin users API — real agent/staff onboarding.
 *
 * Replaces the old Agents-page modal that only pushed into local React
 * state (the "onboarded" agent vanished on refresh). One action:
 *
 *   invite  { name, email, role, split? }
 *     • role 'agent'  — requires agents.create; creates the public.agents
 *       row, the org_members row linking it, and emails an invite link.
 *     • other roles   — requires roles.edit; org_members row + invite only.
 *
 * The invite link comes from auth.admin.generateLink (no Supabase SMTP
 * dependency) and is delivered through the existing Resend lifecycle
 * channel; if Resend is unconfigured we fall back to inviteUserByEmail
 * so the project's auth mailer takes over. Membership rows are written
 * with status 'active' — the same convention _shared/auth.requireUser
 * and RLS check — so access works the moment the invitee sets a password.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { hasPerm, requireUser } from "../_shared/auth.ts";
import { sendLifecycle } from "../_shared/lifecycle.ts";

const SITE_URL = () => (Deno.env.get("SITE_URL") || "https://www.deltpay.com").replace(/\/$/, "");
const FROM_SYSTEM = () => Deno.env.get("LIFECYCLE_FROM_SYSTEM") || "DeltPay <noreply@deltpay.com>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const VALID_ROLES = new Set(["admin", "agent", "viewer"]);

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

  if (body?.action !== "invite") return json({ error: "Unknown action" }, 400);

  const auth = await requireUser(req.headers.get("Authorization") ?? undefined);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const ctx = auth.ctx;

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "agent");
  const split = body?.split === null || body?.split === undefined ? null : Number(body.split);

  if (!name) return json({ error: "Name is required" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "A valid email is required" }, 400);
  if (!VALID_ROLES.has(role)) return json({ error: "Invalid role" }, 400);
  if (split !== null && (Number.isNaN(split) || split < 0 || split > 1)) {
    return json({ error: "Split must be a fraction between 0 and 1" }, 400);
  }

  const neededPerm = role === "agent" ? "agents.create" : "roles.edit";
  if (!hasPerm(ctx, neededPerm)) {
    return json({ error: `Missing permission: ${neededPerm}` }, 403);
  }

  // ── 1. Create the auth user + invite link (no password yet) ──
  const redirectTo = `${SITE_URL()}/#/dashboard`;
  let userId: string | null = null;
  let actionLink: string | null = null;

  const gen = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo, data: { display_name: name } },
  });
  if (!gen.error && gen.data?.user) {
    userId = gen.data.user.id;
    actionLink = gen.data.properties?.action_link ?? null;
  } else {
    const msg = gen.error?.message ?? "";
    if (!/already|exists|registered/i.test(msg)) {
      return json({ error: `Couldn't create the invite: ${msg || "unknown error"}` }, 500);
    }
    // The auth user already exists (e.g. re-invite) — find them and continue.
    const { data: pages } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = pages?.users?.find((u) => (u.email ?? "").toLowerCase() === email);
    if (!existing) return json({ error: "A user with this email already exists but could not be resolved" }, 409);
    userId = existing.id;
    const relink = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
    actionLink = relink.data?.properties?.action_link ?? null;
  }

  // ── 2. agents row (agent role only) ──
  let agentId: string | null = null;
  if (role === "agent") {
    const { data: existingAgent } = await admin
      .from("agents")
      .select("id")
      .eq("org_id", ctx.orgId)
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .maybeSingle();
    if (existingAgent) {
      agentId = existingAgent.id;
      await admin.from("agents").update({ name, email, user_id: userId, split, status: "active" }).eq("id", agentId);
    } else {
      const { data: agentRow, error: agentErr } = await admin
        .from("agents")
        .insert({ org_id: ctx.orgId, name, email, user_id: userId, split, status: "active" })
        .select("id")
        .single();
      if (agentErr || !agentRow) return json({ error: `Agent record failed: ${agentErr?.message}` }, 500);
      agentId = agentRow.id;
    }
  }

  // ── 3. org_members row (status 'active' = requireUser/RLS convention) ──
  const { data: existingMember } = await admin
    .from("org_members")
    .select("user_id, role")
    .eq("org_id", ctx.orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingMember) {
    await admin
      .from("org_members")
      .update({ role, agent_id: agentId, display_name: name, email, status: "active" })
      .eq("org_id", ctx.orgId)
      .eq("user_id", userId);
  } else {
    const { error: memberErr } = await admin.from("org_members").insert({
      org_id: ctx.orgId,
      user_id: userId,
      role,
      agent_id: agentId,
      display_name: name,
      email,
      status: "active",
    });
    if (memberErr) return json({ error: `Membership failed: ${memberErr.message}` }, 500);
  }

  // ── 4. Deliver the invite ──
  let emailSent = false;
  if (actionLink) {
    emailSent = await sendLifecycle({
      to: email,
      from: FROM_SYSTEM(),
      subject: "You're invited to the DeltPay CRM",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px 0;color:#1a1a2e">
          <h2 style="margin:0 0 12px">Welcome to DeltPay, ${name.split(" ")[0]}</h2>
          <p style="margin:0 0 16px;line-height:1.55">
            You've been invited to the DeltPay CRM${role === "agent" ? " as a sales agent" : ""}.
            Click below to set your password and sign in.
          </p>
          <p style="margin:0 0 24px">
            <a href="${actionLink}" style="display:inline-block;background:#2E6BFF;color:#fff;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:8px">
              Accept invite
            </a>
          </p>
          <p style="margin:0;font-size:12px;color:#6b7280">
            This link expires after first use. If you weren't expecting this email you can ignore it.
          </p>
        </div>`,
    });
  }
  if (!emailSent) {
    // Fall back to the auth mailer (works when project SMTP is configured).
    const inv = await admin.auth.admin.inviteUserByEmail(email, { redirectTo, data: { display_name: name } });
    emailSent = !inv.error;
  }

  return json({
    ok: true,
    userId,
    agentId,
    emailSent,
    // Surface the link so the admin can hand it over directly if email fails.
    inviteLink: emailSent ? undefined : actionLink,
  });
});
