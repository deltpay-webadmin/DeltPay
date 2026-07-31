/**
 * Nebius AI Studio chat proxy for the Delt CRM.
 *
 * Generic OpenAI-compatible chat completion endpoint used by Delt Lens AI
 * (and any other CRM feature that wants a cheap open-source model).
 *
 * POST JSON {
 *   system?: string,
 *   messages: [{ role: 'user'|'assistant', content: string }],
 *   json?: boolean,          // request a JSON-object response
 *   maxTokens?: number,      // default 2048
 *   temperature?: number,    // default 0.3
 * }
 * → { content, model, usage }
 *
 * Auth: caller must be signed in (verify_jwt). The Nebius key never leaves
 * this function.
 *
 * Required function secrets:
 *   NEBIUS_API_KEY    — Nebius AI Studio API key
 * Every call is metered to the calling user (see _shared/metering.ts).
 *
 * Optional:
 *   NEBIUS_TEXT_MODEL          — premium chat model id. Defaults to
 *     Qwen3-235B-A22B-Instruct: a 235B MoE (22B active) chosen for
 *     structured-data reasoning and strict JSON compliance, which is what
 *     Lens needs. Non-thinking variant keeps chat latency low.
 *   NEBIUS_TEXT_MODEL_STANDARD — cheaper model for customer traffic.
 *     Falls back to the premium model until one is chosen.
 */

import { checkQuota, recordUsage, resolveCaller, tierFor } from "../_shared/metering.ts";

const NEBIUS_URL = "https://api.studio.nebius.com/v1/chat/completions";
const DEFAULT_TEXT_MODEL = "Qwen/Qwen3-235B-A22B-Instruct-2507";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

interface ChatBody {
  system?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const apiKey = Deno.env.get("NEBIUS_API_KEY");
  if (!apiKey) return json({ error: "not_configured", message: "NEBIUS_API_KEY secret is not set" }, 503);

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) return json({ error: "missing_messages" }, 400);
  if (messages.some(m => (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string")) {
    return json({ error: "invalid_messages" }, 400);
  }

  // Identify the caller for metering, and pick the model tier from what they
  // are (staff vs customer) — never from the request body.
  const caller = await resolveCaller(req);
  const premiumModel = Deno.env.get("NEBIUS_TEXT_MODEL") ?? DEFAULT_TEXT_MODEL;
  const model = tierFor(caller) === "premium"
    ? premiumModel
    : (Deno.env.get("NEBIUS_TEXT_MODEL_STANDARD") ?? premiumModel);

  // Soft monthly budget: over-cap callers get a 402 and a zero-token
  // 'blocked' ledger row so the attempt stays visible in the CRM.
  const quota = await checkQuota(caller);
  if (!quota.allowed) {
    await recordUsage({
      caller,
      feature: "lens_chat",
      provider: "nebius",
      model,
      inputTokens: 0,
      outputTokens: 0,
      status: "blocked",
    });
    return json({
      error: "quota_exceeded",
      message: `Monthly AI budget of $${quota.capUsd} reached for this account.`,
    }, 402);
  }

  try {
    const upstream = await fetch(NEBIUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(body.maxTokens ?? 2048, 8192),
        temperature: body.temperature ?? 0.3,
        ...(body.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          ...(body.system ? [{ role: "system", content: body.system }] : []),
          ...messages,
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("[nebius-chat]", upstream.status, errText.slice(0, 500));
      if (upstream.status === 401) return json({ error: "bad_api_key", message: "NEBIUS_API_KEY is invalid" }, 502);
      if (upstream.status === 429) return json({ error: "rate_limited", message: "Nebius rate limit hit — retry shortly" }, 429);
      return json({ error: "upstream_error", message: `Nebius returned ${upstream.status}` }, 502);
    }

    const data = await upstream.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return json({ error: "empty_response" }, 502);

    const usage = {
      input_tokens: data?.usage?.prompt_tokens ?? 0,
      output_tokens: data?.usage?.completion_tokens ?? 0,
    };
    // Log the model the provider actually served, not the one requested.
    const servedModel = data.model ?? model;
    await recordUsage({
      caller,
      feature: "lens_chat",
      provider: "nebius",
      model: servedModel,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
    });

    return json({ content, model: servedModel, usage });
  } catch (err) {
    const e = err as { message?: string };
    console.error("[nebius-chat]", e.message);
    return json({ error: "chat_failed", message: e.message ?? "unknown" }, 502);
  }
});
