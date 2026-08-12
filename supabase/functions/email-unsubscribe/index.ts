/**
 * Public unsubscribe endpoint — the opt-out half of CAN-SPAM compliance.
 *
 * Reached at https://www.deltpay.com/unsubscribe?e=<email>&t=<token>
 * (Vercel rewrites that path to this function — see vercel.json) so the link
 * in the email footer sits on our own domain.
 *
 *   GET   → confirmation page with a one-click button.
 *   POST  → performs the opt-out, renders the "you're off the list" page.
 *
 * Why GET doesn't unsubscribe directly: corporate link scanners and inbox
 * prefetchers follow every URL in an email. A GET that opts people out would
 * silently unsubscribe recipients who never clicked anything. The confirm
 * page costs one click and prevents that. Mail clients that support RFC 8058
 * one-click (the List-Unsubscribe-Post header we set on marketing sends)
 * POST straight here and skip the page entirely.
 *
 * Scope: writes email_suppressions with scope='marketing', so promotional
 * mail stops but transactional mail — application reminders, approval
 * notices, anything about an account they hold — keeps flowing. A blanket
 * opt-out would break the product for someone who only wanted the cross-sell
 * pitch to stop.
 *
 * Auth: the HMAC token in the URL (see _shared/suppression.ts). Without it
 * anyone could unsubscribe any address. Deployed with --no-verify-jwt — the
 * token is the auth.
 */

import {
  clearMarketingOptOut,
  logEmailEvent,
  suppress,
  verifyUnsubscribeToken,
} from "../_shared/suppression.ts";

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const REPLY_TO = () => Deno.env.get("LIFECYCLE_REPLY_TO") || "david@deltpay.com";

function page(opts: { title: string; body: string; status?: number }): Response {
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opts.title)} · Delt</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; background:#f4f6fb; font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#1a2333; }
  .wrap { max-width:520px; margin:0 auto; padding:48px 20px; }
  .card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(4,30,66,.08); }
  .bar { background:#041E42; padding:20px 28px; color:#fff; font-size:18px; font-weight:700; letter-spacing:.02em; }
  .inner { padding:28px; }
  h1 { margin:0 0 14px; font-size:21px; line-height:1.3; color:#041E42; }
  p { margin:0 0 14px; font-size:15px; line-height:1.6; }
  .muted { color:#8a93a8; font-size:13px; }
  button { font:inherit; cursor:pointer; border:0; padding:13px 26px; border-radius:10px;
           background:#041E42; color:#fff; font-weight:700; font-size:15px; }
  button.ghost { background:#fff; color:#041E42; border:1px solid #d8dfec; font-weight:600; }
  a { color:#4945FF; }
</style></head><body>
  <div class="wrap"><div class="card">
    <div class="bar">Delt</div>
    <div class="inner">${opts.body}</div>
  </div></div>
</body></html>`;
  return new Response(html, {
    status: opts.status ?? 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const invalidPage = () =>
  page({
    status: 400,
    title: "Link not valid",
    body: `<h1>That unsubscribe link isn't valid</h1>
      <p>It may have been truncated by your mail client when the message was forwarded.</p>
      <p>Email <a href="mailto:${esc(REPLY_TO())}">${esc(REPLY_TO())}</a> and we'll take you off the list by hand — same day, no questions.</p>`,
  });

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // Accept the address and token from either the query string (GET, and the
  // form's POST which preserves them) or a posted form body.
  let email = (url.searchParams.get("e") || "").trim().toLowerCase();
  let token = (url.searchParams.get("t") || "").trim();
  const campaign = (url.searchParams.get("c") || "").trim() || null;
  let resubscribe = url.searchParams.get("action") === "resubscribe";

  if (req.method === "POST") {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("form") || ct.includes("urlencoded")) {
      const form = await req.formData().catch(() => null);
      if (form) {
        email = String(form.get("e") ?? email).trim().toLowerCase();
        token = String(form.get("t") ?? token).trim();
        if (String(form.get("action") ?? "") === "resubscribe") resubscribe = true;
      }
    }
  } else if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("method not allowed", { status: 405 });
  }

  if (!email || !token || !(await verifyUnsubscribeToken(email, token))) {
    console.warn("[email-unsubscribe] rejected token for:", email.slice(0, 60));
    return invalidPage();
  }

  const hidden = `<input type="hidden" name="e" value="${esc(email)}"><input type="hidden" name="t" value="${esc(token)}">`;

  // ── GET: confirm first, so link scanners can't opt people out ───────────
  if (req.method === "GET" || req.method === "HEAD") {
    return page({
      title: "Unsubscribe",
      body: `<h1>Unsubscribe ${esc(email)}?</h1>
        <p>You'll stop getting promotional email from Delt — things like working-capital offers, referral invitations and renewal notices.</p>
        <p class="muted">You'll still receive email about your account: application links and reminders, approval or decline decisions, and anything tied to something you've signed up for. Those aren't marketing, and turning them off would break the product for you.</p>
        <form method="POST">${hidden}<button type="submit">Confirm unsubscribe</button></form>`,
    });
  }

  // ── POST: do it ─────────────────────────────────────────────────────────
  if (resubscribe) {
    const cleared = await clearMarketingOptOut(email);
    await logEmailEvent({
      recipient: email, event: "resubscribed", campaign, kind: "marketing",
      reason: cleared ? "re-subscribed via unsubscribe page" : "re-subscribe: no marketing opt-out on file",
    });
    return page({
      title: "You're back on",
      body: `<h1>You're back on the list</h1>
        <p>${esc(email)} will receive Delt offers again. Changed your mind? The unsubscribe link is in the footer of every one.</p>`,
    });
  }

  await suppress(email, "opt-out", campaign ? `unsubscribe:${campaign}` : "unsubscribe", "marketing");
  await logEmailEvent({
    recipient: email, event: "unsubscribed", campaign, kind: "marketing",
    reason: campaign ? `unsubscribed from ${campaign}` : "unsubscribed",
  });
  console.log(`[email-unsubscribe] marketing opt-out: ${email}${campaign ? ` (${campaign})` : ""}`);

  return page({
    title: "Unsubscribed",
    body: `<h1>Done — you're unsubscribed</h1>
      <p><strong>${esc(email)}</strong> won't get promotional email from Delt again. This takes effect immediately.</p>
      <p class="muted">Email about your account and applications still comes through, so nothing you've signed up for goes quiet.</p>
      <p class="muted">Unsubscribed by mistake?</p>
      <form method="POST">${hidden}<input type="hidden" name="action" value="resubscribe"><button class="ghost" type="submit">Undo — keep sending</button></form>`,
  });
});
