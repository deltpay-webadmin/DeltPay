/**
 * AI statement extraction for the Delt CRM Statement Analyzer.
 *
 * POST JSON { filename, mediaType, dataBase64 } — a merchant processing
 * statement (PDF or image). Claude reads the document and returns structured
 * extraction data (processor, volume, transactions, fee lines, chargebacks)
 * that the client-side interchange engine consumes.
 *
 * Auth: caller must be signed in (verify_jwt). Provider keys never leave
 * this function.
 *
 * Providers (first configured wins):
 *   ANTHROPIC_API_KEY — Claude (claude-opus-5). Reads PDFs and images.
 *   NEBIUS_API_KEY    — Nebius AI Studio vision model (cheaper). Images
 *                       only — PDF reading requires the Claude provider.
 * Optional:
 *   NEBIUS_VISION_MODEL — default Qwen/Qwen2.5-VL-72B-Instruct
 */

import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Structured-output schema: what the analyzer needs from a statement.
// additionalProperties:false + required everywhere → guaranteed shape.
const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    merchantName: {
      type: "string",
      description: "The merchant's business name (DBA preferred over legal name) as printed on the statement; empty string if not shown",
    },
    currentProcessor: {
      type: "string",
      description: "The processing company that issued the statement (e.g. 'First Data / Clover', 'Worldpay', 'Heartland')",
    },
    statementPeriod: {
      type: "string",
      description: "Statement month and year, e.g. 'March 2026'. If multiple months, the most recent complete month",
    },
    totalVolume: { type: "number", description: "Gross card sales volume for the period in dollars" },
    totalTransactions: { type: "number", description: "Total number of card transactions for the period" },
    avgTicket: { type: "number", description: "Average ticket in dollars (volume / transactions if not printed)" },
    effectiveRatePct: {
      type: "number",
      description: "All-in effective rate as a percentage: total processing cost / gross volume * 100",
    },
    currentMonthlyCost: {
      type: "number",
      description: "Total processing cost for the period in dollars — every fee the merchant paid (discount, per-item, monthly, PCI, statement, batch, surcharges, everything)",
    },
    chargebackCount: { type: "number", description: "Number of chargebacks/disputes in the period; 0 if none shown" },
    fees: {
      type: "array",
      description:
        "Fee breakdown covering the FULL processing cost. Group lines into canonical buckets where they fit: 'Discount Rate' (percentage-of-volume charges incl. interchange/tier charges), 'Transaction Fees' (per-item/auth fees), 'Monthly Fees', 'PCI Fees', 'Statement Fees', 'Batch Fees', and 'Other' (non-qualified surcharges, downgrades, misc). Amounts must sum to currentMonthlyCost",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          amount: { type: "number", description: "Dollar amount for the period" },
        },
        required: ["label", "amount"],
        additionalProperties: false,
      },
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "How confident the extraction is: high = clearly printed values; medium = some derived/inferred; low = poor scan or ambiguous statement",
    },
    notes: {
      type: "string",
      description: "One or two sentences on anything noteworthy: derived values, unreadable sections, unusual fee structures, multi-month statements",
    },
  },
  required: [
    "merchantName", "currentProcessor", "statementPeriod", "totalVolume",
    "totalTransactions", "avgTicket", "effectiveRatePct", "currentMonthlyCost",
    "chargebackCount", "fees", "confidence", "notes",
  ],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a senior merchant-processing statement analyst at Delt Pay. You read credit card processing statements from any US processor (First Data/Fiserv, Worldpay, TSYS, Heartland, Elavon, Global Payments, Square, Stripe, ISO white-labels, etc.) and extract the economics precisely.

Rules:
- Extract only what the document supports; derive avgTicket and effectiveRatePct arithmetically when not printed.
- currentMonthlyCost is the merchant's TOTAL cost of acceptance for the period: discount/interchange charges, per-item fees, monthly/service fees, PCI, statement, batch, regulatory, non-qualified surcharges — everything. Do not include equipment leases or cash advance repayments; note them in notes if present.
- The fees array must reconcile: its amounts sum to currentMonthlyCost (within rounding). Use the canonical bucket labels where lines fit; keep genuinely distinct charges as their own labeled lines.
- Tiered statements often bury downgrade surcharges in vague lines — put those in 'Other' and mention them in notes.
- If the document is not a merchant processing statement, set confidence to "low" and explain in notes.`;

// ── Nebius fallback: vision extraction for image statements ──
const NEBIUS_URL = "https://api.studio.nebius.com/v1/chat/completions";

async function extractWithNebius(
  apiKey: string,
  mediaType: string,
  dataBase64: string,
  filename: string,
): Promise<Response> {
  const model = Deno.env.get("NEBIUS_VISION_MODEL") ?? "Qwen/Qwen2.5-VL-72B-Instruct";
  const upstream = await fetch(NEBIUS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${dataBase64}` } },
            {
              type: "text",
              text:
                `Extract the processing economics from this merchant statement (file: ${filename}). ` +
                `Respond with ONLY a JSON object matching this schema (all fields required):\n` +
                JSON.stringify(EXTRACTION_SCHEMA),
            },
          ],
        },
      ],
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    console.error("[analyze-statement:nebius]", upstream.status, errText.slice(0, 500));
    if (upstream.status === 401) return json({ error: "bad_api_key", message: "NEBIUS_API_KEY is invalid" }, 502);
    if (upstream.status === 429) return json({ error: "rate_limited", message: "Nebius rate limit hit — retry shortly" }, 429);
    return json({ error: "extraction_failed", message: `Nebius returned ${upstream.status}` }, 502);
  }

  const data = await upstream.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return json({ error: "empty_response" }, 502);

  let extraction: Record<string, unknown>;
  try {
    extraction = JSON.parse(content);
  } catch {
    return json({ error: "extraction_failed", message: "Model returned malformed JSON" }, 502);
  }
  // Open-source JSON mode has no schema enforcement — validate the essentials.
  if (typeof extraction.totalVolume !== "number" || !Array.isArray(extraction.fees) ||
      typeof extraction.currentMonthlyCost !== "number") {
    return json({ error: "extraction_failed", message: "Extraction missing required fields" }, 502);
  }

  return json({
    extraction,
    model: data.model ?? model,
    usage: {
      input_tokens: data?.usage?.prompt_tokens ?? 0,
      output_tokens: data?.usage?.completion_tokens ?? 0,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const nebiusKey = Deno.env.get("NEBIUS_API_KEY");
  if (!anthropicKey && !nebiusKey) {
    return json({ error: "not_configured", message: "Set ANTHROPIC_API_KEY (PDFs + images) or NEBIUS_API_KEY (images) to enable extraction" }, 503);
  }

  let body: { filename?: string; mediaType?: string; dataBase64?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { filename = "statement", mediaType = "application/pdf", dataBase64 } = body;
  if (!dataBase64) return json({ error: "missing_file" }, 400);
  // The Messages API caps requests at 32MB; leave headroom for the rest of the body.
  if (dataBase64.length > 28_000_000) return json({ error: "file_too_large", message: "Statement exceeds 20MB" }, 413);

  const isPdf = mediaType === "application/pdf";
  const isImage = /^image\/(png|jpeg|webp|gif)$/.test(mediaType);
  if (!isPdf && !isImage) return json({ error: "unsupported_media_type", message: mediaType }, 415);

  // Provider resolution: Claude when configured (reads PDFs natively);
  // otherwise the cheaper Nebius vision model, which handles images only.
  if (!anthropicKey) {
    if (isPdf) {
      return json({
        error: "pdf_requires_claude",
        message: "PDF statements need the Claude provider (ANTHROPIC_API_KEY). Upload a statement photo/screenshot, or configure Claude.",
      }, 415);
    }
    try {
      return await extractWithNebius(nebiusKey!, mediaType, dataBase64, filename);
    } catch (err) {
      const e = err as { message?: string };
      console.error("[analyze-statement:nebius]", e.message);
      return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
    }
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  const fileBlock = isPdf
    ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: dataBase64 } }
    : { type: "image" as const, source: { type: "base64" as const, media_type: mediaType as "image/png", data: dataBase64 } };

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      // Safety classifiers can decline; route declined requests to the
      // recommended fallback model server-side instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: EXTRACTION_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            {
              type: "text",
              text: `Extract the processing economics from this merchant statement (file: ${filename}).`,
            },
          ],
        },
      ],
    } as never);

    if (response.stop_reason === "refusal") {
      return json({ error: "refused", message: "The model declined to process this document" }, 422);
    }
    if (response.stop_reason === "max_tokens") {
      return json({ error: "truncated", message: "Extraction output was truncated" }, 502);
    }

    const text = response.content.find((b: { type: string }) => b.type === "text") as { text: string } | undefined;
    if (!text?.text) return json({ error: "empty_response" }, 502);

    const extraction = JSON.parse(text.text);
    return json({
      extraction,
      model: response.model,
      usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
    });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    console.error("[analyze-statement]", e.status, e.message);
    if (e.status === 401) return json({ error: "bad_api_key", message: "ANTHROPIC_API_KEY is invalid" }, 502);
    if (e.status === 429) return json({ error: "rate_limited", message: "Anthropic rate limit hit — retry shortly" }, 429);
    return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
  }
});
