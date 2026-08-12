/**
 * Unsubscribe link tokens.
 *
 * HMAC-SHA256 of the address under UNSUBSCRIBE_SECRET, base64url, truncated
 * to 32 chars (~192 bits — far past guessable). Stateless on purpose: no
 * token table to write on send, no expiry to explain to someone who opens a
 * six-month-old email and wants out. The address travels in the URL beside
 * the token, and the token is what makes it unforgeable — without it, anyone
 * could unsubscribe anyone.
 *
 * Split out from suppression.ts so it carries no database import and can be
 * unit-tested directly.
 */

const enc = new TextEncoder();

const norm = (email: string) => String(email || "").trim().toLowerCase();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Null when UNSUBSCRIBE_SECRET is unset — callers must treat that as
 * "cannot offer an unsubscribe" and skip the marketing send rather than
 * mail a link that will not work. */
export async function unsubscribeToken(email: string): Promise<string | null> {
  const secret = Deno.env.get("UNSUBSCRIBE_SECRET") || "";
  if (!secret) {
    console.error("[unsubscribe] UNSUBSCRIBE_SECRET not set — cannot mint unsubscribe tokens");
    return null;
  }
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(norm(email))));
  return b64url(mac).slice(0, 32);
}

/** Constant-time token check. */
export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  const expected = await unsubscribeToken(email);
  if (!expected || !token || expected.length !== token.length) return false;
  let out = 0;
  for (let i = 0; i < expected.length; i++) out |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return out === 0;
}

/** Public one-click unsubscribe URL. Fronted by deltpay.com/unsubscribe
 * (Vercel rewrite → the email-unsubscribe edge function) so the link in the
 * footer is on our own domain, not a supabase.co URL. */
export async function unsubscribeUrl(email: string, campaign?: string | null): Promise<string | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  const base = (Deno.env.get("UNSUBSCRIBE_BASE_URL")
    || `${(Deno.env.get("SITE_URL") || "https://www.deltpay.com").replace(/\/$/, "")}/unsubscribe`);
  const qs = new URLSearchParams({ e: norm(email), t: token });
  if (campaign) qs.set("c", campaign);
  return `${base}?${qs.toString()}`;
}

/**
 * Does this suppression row block this kind of mail?
 *
 * 'all' (hard bounce, spam complaint) blocks everything. 'marketing' (an
 * unsubscribe) blocks only promotional sends — someone who opted out of the
 * cross-sell pitch still gets told their application was approved.
 *
 * Pure, so the rule that decides whether mail goes out is testable on its own.
 */
export function suppressionBlocks(
  scope: string | null | undefined,
  kind: "transactional" | "marketing",
): boolean {
  if (!scope) return false;
  return scope === "all" || kind === "marketing";
}
