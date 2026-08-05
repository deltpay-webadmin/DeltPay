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
 * Accepts either a single file { mediaType, dataBase64 } or a pre-rendered
 * page set { images: [{ mediaType, dataBase64 }] } — the CRM renders PDF
 * pages to JPEGs client-side (pdfjs) so the cheap vision model can read
 * statements without the Claude provider.
 *
 * Provider preference: NEBIUS_API_KEY (cheap, images/pages) is used whenever
 * the input is imagery; ANTHROPIC_API_KEY (claude-opus-5) is the fallback and
 * the only provider that reads raw PDF bytes directly.
 * Optional:
 *   NEBIUS_VISION_MODEL — default Qwen/Qwen2.5-VL-72B-Instruct
 */

import Anthropic from "npm:@anthropic-ai/sdk";
import { type Caller, checkQuota, recordUsage, resolveCaller } from "../_shared/metering.ts";

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
    downgradeLines: {
      type: "array",
      description:
        "Fee lines that indicate DOWNGRADED or non-qualified interchange, with their labels kept verbatim: EIRF, Standard, Non-Qualified, Mid-Qualified, Base Submission, key-entry surcharges, Data Rate I, 'NQ' suffixes, downgrade adjustments. Empty array if none appear. These lines ALSO belong in the fees array (inside 'Other' or their own line) — this is a spotlight, not a replacement",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Verbatim fee-line label from the statement" },
          amount: { type: "number", description: "Dollar amount for the period; 0 if the statement shows the tier but not a separable amount" },
        },
        required: ["label", "amount"],
        additionalProperties: false,
      },
    },
    pinDebitPresent: {
      type: "boolean",
      description:
        "true if the statement shows PIN debit / EFT network activity (Interlink, Maestro, Pulse, Star, NYCE, Accel, Shazam, Culiance — network fee lines or PIN debit summaries); false if the statement clearly itemizes card activity and shows none",
    },
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
    "chargebackCount", "downgradeLines", "pinDebitPresent", "fees", "confidence", "notes",
  ],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a senior merchant-processing statement analyst at Delt Pay. You read credit card processing statements from any US processor (First Data/Fiserv, Worldpay, TSYS, Heartland, Elavon, Global Payments, Square, Stripe, ISO white-labels, etc.) and extract the economics precisely.

Rules:
- Extract only what the document supports; derive avgTicket and effectiveRatePct arithmetically when not printed.
- currentMonthlyCost is the merchant's TOTAL cost of acceptance for the period: discount/interchange charges, per-item fees, monthly/service fees, PCI, statement, batch, regulatory, non-qualified surcharges — everything. Do not include equipment leases or cash advance repayments; note them in notes if present.
- The fees array must reconcile: its amounts sum to currentMonthlyCost (within rounding). Use the canonical bucket labels where lines fit; keep genuinely distinct charges as their own labeled lines.
- Tiered statements often bury downgrade surcharges in vague lines — put those in 'Other' and mention them in notes.
- Hunt for downgrade evidence: EIRF, Standard, Non-Qualified/NQ, Mid-Qualified, Base Submission, key-entry surcharges, Data Rate I, downgrade adjustments. List each such line verbatim in downgradeLines (as well as in fees). An empty downgradeLines array means you looked and found none.
- Determine pinDebitPresent from EFT/PIN network evidence: Interlink, Maestro, Pulse, Star, NYCE, Accel, Shazam network lines or PIN debit summaries. If the statement itemizes card activity and shows none, report false.
- If the document is not a merchant processing statement, set confidence to "low" and explain in notes.`;

// ── Nebius fallback: vision extraction for image statements ──
const NEBIUS_URL = "https://api.studio.nebius.com/v1/chat/completions";

interface PageImage {
  mediaType: string;
  dataBase64: string;
}

async function extractWithNebius(
  apiKey: string,
  images: PageImage[],
  filename: string,
  caller: Caller | null,
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
            ...images.map(img => ({
              type: "image_url",
              image_url: { url: `data:${img.mediaType};base64,${img.dataBase64}` },
            })),
            {
              type: "text",
              text:
                `Extract the processing economics from this merchant statement ` +
                `(file: ${filename}, ${images.length} page${images.length > 1 ? "s" : ""}). ` +
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

  const usage = {
    input_tokens: data?.usage?.prompt_tokens ?? 0,
    output_tokens: data?.usage?.completion_tokens ?? 0,
  };
  const servedModel = data.model ?? model;
  await recordUsage({
    caller,
    feature: "statement_analyzer",
    provider: "nebius",
    model: servedModel,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
  });

  return json({ extraction, model: servedModel, usage });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const nebiusKey = Deno.env.get("NEBIUS_API_KEY");
  if (!anthropicKey && !nebiusKey) {
    return json({ error: "not_configured", message: "Set ANTHROPIC_API_KEY (PDFs + images) or NEBIUS_API_KEY (images) to enable extraction" }, 503);
  }

  let body: {
    filename?: string;
    mediaType?: string;
    dataBase64?: string;
    images?: PageImage[];
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { filename = "statement", mediaType = "application/pdf", dataBase64 } = body;
  // Pre-rendered page set (the CRM converts PDFs to JPEGs client-side).
  const images: PageImage[] | null =
    Array.isArray(body.images) && body.images.length
      ? body.images
          .filter(i => i && typeof i.dataBase64 === "string" && /^image\/(png|jpeg|webp|gif)$/.test(i.mediaType))
          .slice(0, 8)
      : null;

  if (!images && !dataBase64) return json({ error: "missing_file" }, 400);
  // The Messages API caps requests at 32MB; leave headroom for the rest of the body.
  const totalBytes = images
    ? images.reduce((sum, i) => sum + i.dataBase64.length, 0)
    : (dataBase64?.length ?? 0);
  if (totalBytes > 28_000_000) return json({ error: "file_too_large", message: "Statement exceeds 20MB" }, 413);

  const isPdf = !images && mediaType === "application/pdf";
  const isImage = !!images || /^image\/(png|jpeg|webp|gif)$/.test(mediaType);
  if (!isPdf && !isImage) return json({ error: "unsupported_media_type", message: mediaType }, 415);

  // Nebius (cheap) serves anything that's imagery; Claude handles raw PDFs
  // and is the fallback when Nebius isn't configured.
  const pageImages: PageImage[] | null =
    images ?? (isImage && dataBase64 ? [{ mediaType, dataBase64 }] : null);
  const useNebius = Boolean(nebiusKey && pageImages);

  // Identify the caller so every extraction lands in the usage ledger.
  const caller = await resolveCaller(req);

  // Soft monthly budget: over-cap callers get a 402 and a zero-token
  // 'blocked' ledger row. Checked once, before provider branching, against
  // the provider/model that would serve the request.
  const quota = await checkQuota(caller);
  if (!quota.allowed) {
    await recordUsage({
      caller,
      feature: "statement_analyzer",
      provider: useNebius ? "nebius" : "anthropic",
      model: useNebius
        ? (Deno.env.get("NEBIUS_VISION_MODEL") ?? "Qwen/Qwen2.5-VL-72B-Instruct")
        : "claude-opus-5",
      inputTokens: 0,
      outputTokens: 0,
      status: "blocked",
    });
    return json({
      error: "quota_exceeded",
      message: `Monthly AI budget of $${quota.capUsd} reached for this account.`,
    }, 402);
  }

  if (useNebius) {
    try {
      return await extractWithNebius(nebiusKey!, pageImages!, filename, caller);
    } catch (err) {
      const e = err as { message?: string };
      console.error("[analyze-statement:nebius]", e.message);
      return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
    }
  }

  if (!anthropicKey) {
    // No Nebius-compatible input and no Claude key: raw PDF with Nebius-only config.
    return json({
      error: "pdf_requires_claude",
      message: "This PDF couldn't be rendered to images for the Nebius provider, and ANTHROPIC_API_KEY is not set. Re-upload as a photo/screenshot, or configure Claude.",
    }, 415);
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  const fileBlocks = pageImages
    ? pageImages.map(img => ({
        type: "image" as const,
        source: { type: "base64" as const, media_type: img.mediaType as "image/png", data: img.dataBase64 },
      }))
    : [{ type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: dataBase64! } }];

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
            ...fileBlocks,
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
    const usage = {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    };
    // response.model is authoritative — server-side fallbacks may have
    // served this on a different model than the one requested.
    await recordUsage({
      caller,
      feature: "statement_analyzer",
      provider: "anthropic",
      model: response.model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cachedInputTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
    });

    return json({ extraction, model: response.model, usage });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    console.error("[analyze-statement]", e.status, e.message);
    if (e.status === 401) return json({ error: "bad_api_key", message: "ANTHROPIC_API_KEY is invalid" }, 502);
    if (e.status === 429) return json({ error: "rate_limited", message: "Anthropic rate limit hit — retry shortly" }, 429);
    return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
  }
});
