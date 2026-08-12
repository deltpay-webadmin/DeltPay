/**
 * Resend delivery webhook — the deliverability safety net.
 *
 * Subscribed events (configured in the Resend dashboard/API):
 *   email.bounced           → log + suppress (permanent bounces)
 *   email.complained        → log + suppress (spam complaint = never again)
 *   email.failed            → log
 *   email.delivery_delayed  → log
 *
 * Suppressed addresses are skipped by every automated sender (lifecycle
 * jobs, Plaid reminders, DeltCapital lifecycle) so sequences can never
 * hammer a dead inbox and burn the fresh domain reputation.
 *
 * Security: Svix-signed (Resend's webhook transport). RESEND_WEBHOOK_SECRET
 * (whsec_…) must be set as a function secret; verification fails closed.
 * Deployed with --no-verify-jwt — the Svix signature is the auth.
 */

import { isSuppressed, logEmailEvent, suppress } from "../_shared/suppression.ts";

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

  for (const to of recipients) {
    await logEmailEvent({ emailId, recipient: to, event: h.event, reason, subject, payload: evt });
    if (h.suppressReason && !transient && !(await isSuppressed(to))) {
      await suppress(to, h.suppressReason, type);
      console.log(`[resend-webhook] suppressed ${to} (${h.suppressReason})`);
    }
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
