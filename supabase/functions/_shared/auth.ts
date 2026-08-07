/**
 * Unified authn/authz for edge functions.
 *
 * Resolves the caller's JWT to an AuthContext (org, RBAC role, agent link,
 * allowed permission set from public.role_permissions) so routes can enforce
 * the same matrix RLS enforces — replacing the old binary verifyStaff().
 *
 * Cron/webhook paths that carry no user JWT authenticate with verifyCronSecret
 * (shared-secret header, timing-safe compare against the CRON_SECRET function
 * secret; fails closed when the secret is unset).
 */

import { createClient } from "npm:@supabase/supabase-js@2";

/** Service-role client (RLS bypass) — kept local so this module has no
 * dependency on the heavyweight plaid.ts bundle. */
function svc() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export type OrgRole = "super_admin" | "admin" | "agent" | "viewer";

export interface AuthContext {
  userId: string;
  orgId: string;
  role: OrgRole;
  agentId: string | null;
  perms: Set<string>;
}

export type AuthFailure = { ok: false; status: number; error: string };
export type AuthSuccess = { ok: true; ctx: AuthContext };

/** JWT → active org membership → allowed permission set. */
export async function requireUser(authHeader: string | undefined): Promise<AuthSuccess | AuthFailure> {
  const token = (authHeader ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Missing Authorization token" };

  const db = svc();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: "Sign in required" };

  const { data: member } = await db
    .from("org_members")
    .select("org_id, role, agent_id, status")
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!member) return { ok: false, status: 403, error: "Staff access required" };

  const { data: rows } = await db
    .from("role_permissions")
    .select("perm")
    .eq("org_id", member.org_id)
    .eq("role", member.role)
    .eq("allowed", true);

  return {
    ok: true,
    ctx: {
      userId: data.user.id,
      orgId: member.org_id as string,
      role: member.role as OrgRole,
      agentId: (member.agent_id as string | null) ?? null,
      perms: new Set((rows ?? []).map((r: { perm: string }) => r.perm)),
    },
  };
}

export function hasPerm(ctx: AuthContext, perm: string): boolean {
  return ctx.role === "super_admin" || ctx.perms.has(perm);
}

/** requireUser + a specific permission key. */
export async function requirePerm(
  authHeader: string | undefined,
  perm: string,
): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireUser(authHeader);
  if (!auth.ok) return auth;
  if (!hasPerm(auth.ctx, perm)) {
    return { ok: false, status: 403, error: `Missing permission: ${perm}` };
  }
  return auth;
}

function timingSafeEqual(expected: string, given: string): boolean {
  if (!expected) return false; // fail closed when unconfigured
  const enc = new TextEncoder();
  const a = enc.encode(expected);
  const b = enc.encode(given);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Timing-safe compare of the x-cron-secret header against the shared
 * cron secret.
 *
 * Source of truth is the Postgres vault entry `cron_secret` — the same
 * value public.invoke_job() sends — fetched via the service-role-only
 * public.cron_secret() RPC and cached for the life of the isolate. The
 * CRON_SECRET env secret still works as an override/fallback so a
 * mismatch between the two stores can never silently disable every
 * scheduled job again (which is exactly what happened before this fix:
 * pg_cron POSTs answered 403 for a week while job_run_details said
 * "succeeded"). Fails closed when neither source yields a secret. */
let vaultCronSecret: string | null = null;

export async function verifyCronSecret(req: Request): Promise<boolean> {
  const header = req.headers.get("x-cron-secret") ?? "";
  if (!header) return false;
  const env = Deno.env.get("CRON_SECRET") ?? "";
  if (env && timingSafeEqual(env, header)) return true;
  if (vaultCronSecret == null) {
    try {
      const { data, error } = await svc().rpc("cron_secret");
      if (!error && typeof data === "string" && data) vaultCronSecret = data;
    } catch (err) {
      console.error("verifyCronSecret: vault lookup failed:", err);
    }
  }
  return Boolean(vaultCronSecret) && timingSafeEqual(vaultCronSecret!, header);
}

/** Timing-safe compare of the x-apply-secret header against
 * APPLY_EXCHANGE_SECRET — the gate for the public applicant-side Plaid
 * exchange route called server-to-server by deltcapital.com. */
export function verifyApplySecret(req: Request): boolean {
  return timingSafeEqual(
    Deno.env.get("APPLY_EXCHANGE_SECRET") ?? "",
    req.headers.get("x-apply-secret") ?? "",
  );
}
