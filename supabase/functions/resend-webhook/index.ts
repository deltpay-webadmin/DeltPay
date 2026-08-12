/**
 * Resend delivery webhook — deliverability safety net *and* engagement feed.
 *
 * Subscribed events (configured in the Resend dashboard/API — enabling the
 * engagement three is what turns every sequence into a measurable funnel):
 *   email.delivered         → log
 *   email.opened            → log            (tracking pixel)
 *   email.clicked           → log + link_url (tracked link)
 *   email.bounced           → log + suppress (permanent bounces)
 *   email.complained        → log + suppress (spam complaint = never again)
 *   email.failed            → log
 *   email.delivery_delayed  → log
 *
 * Open and click tracking must also be switched on for the domain in Resend
 * (Domains → Tracking); without it these events never fire.
 *
 * Campaign attribution: the sender writes a `sent` row carrying Resend's
 * email_id plus the blueprint code, and every later event for that id
 * inherits it — so opens and clicks roll up per sequence without depending
 * on Resend echoing our metadata back.
 *
 * Suppressed addresses are skipped by every automated sender (lifecycle
 * jobs, Plaid reminders, DeltCapital lifecycle) so sequences can never
 * hammer a dead inbox and burn the fresh domain reputation.
 *
 * Security: Svix-signed (Resend's webhook transport). RESEND_WEBHOOK_SECRET
 * (whsec_…) must be set as a function secret; verification fails closed.
 * Deployed with --no-verify-jwt — the Svix signature is the auth.
 */

import { contextForEmailId, isSuppressed, logEmailEvent, suppress } from "../_shared/suppression.ts";

const enc = new TextEncoder();

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

/** Svix scheme: HMAC-SHA256(base64Secret, `${id}.${timestamp}.${body}`),
 * compared against any of the space-separated `v1,<base64>` signatures. */
async function verifySvix(req: Request, body: string): Promise<boolean> {
  const secretRaw = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";
  if (!secretRaw) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set — rejecting");
    return false;
  }
  const id = req.headers.get("svix-id") || "";
  const ts = req.headers.get("svix-timestamp") || "";
  const sigHeader = req.headers.get("svix-signature") || "";
  if (!id || !ts || !sigHeader) return false;
  // Reject stale timestamps (>5 min) — standard replay protection.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const secretB64 = secretRaw.startsWith("whsec_") ? secretRaw.slice(6) : secretRaw;
  const secretBytes = Uint8Array.from(atob(secretB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(`${id}.${ts}.${body}`)));

  for (const part of sigHeader.split(/\s+/)) {
    const [version, sig] = part.split(",", 2);
    if (version !== "v1" || !sig) continue;
    try {
      const given = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
      if (timingSafeEqual(mac, given)) return true;
    } catch (_) { /* malformed base64 — try next */ }
  }
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const body = await req.text();
  if (!(await verifySvix(req, body))) return new Response("invalid signature", { status: 401 });

  let evt: any = {};
  try { evt = JSON.parse(body); } catch (_) { return new Response("bad json", { status: 400 }); }

  const type = String(evt?.type || "");
  const data = evt?.data ?? {};
  const recipients: string[] = Array.isArray(data?.to) ? data.to : (data?.to ? [data.to] : []);
  const emailId = data?.email_id || data?.id || null;
  const subject = data?.subject || null;

  const handled: Record<string, { event: string; suppressReason?: string }> = {
    "email.delivered": { event: "delivered" },
    "email.opened": { event: "opened" },
    "email.clicked": { event: "clicked" },
    "email.bounced": { event: "bounced", suppressReason: "hard bounce" },
    "email.complained": { event: "complained", suppressReason: "spam complaint" },
    "email.failed": { event: "failed" },
    "email.delivery_delayed": { event: "delivery_delayed" },
  };
  const h = handled[type];
  if (!h) return new Response(JSON.stringify({ ok: true, ignored: type }), { status: 200 });

  // Transient bounces (mailbox full, greylisting) are logged but not
  // suppressed — only permanent bounces kill the address.
  const bounceType = String(data?.bounce?.type || data?.bounce?.subType || "").toLowerCase();
  const transient = h.event === "bounced" && bounceType.includes("transient");
  const reason = data?.bounce?.message || data?.failed?.reason || data?.reason || bounceType || null;
  // Resend puts the followed URL on click events (shape has varied across
  // payload versions — check both).
  const linkUrl = h.event === "clicked"
    ? (data?.click?.link || data?.link || data?.url || null)
    : null;

  // Inherit campaign/variant/kind from the `sent` row this event belongs to.
  const ctx = await contextForEmailId(emailId);

  for (const to of recipients) {
    await logEmailEvent({
      emailId, recipient: to, event: h.event, reason, subject,
      campaign: ctx.campaign, variant: ctx.variant, kind: ctx.kind,
      linkUrl, payload: evt,
    });
    // Skip only if already blocked for *everything* — the 'transactional'
    // check is true exactly when scope='all'. Someone carrying a narrower
    // marketing opt-out who then hard-bounces still gets widened to 'all'.
    if (h.suppressReason && !transient && !(await isSuppressed(to, "transactional"))) {
      await suppress(to, h.suppressReason, type, "all");
      console.log(`[resend-webhook] suppressed ${to} (${h.suppressReason})`);
    }
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
