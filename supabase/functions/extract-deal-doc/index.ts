/**
 * AI field extraction for deal-submission documents (agent boarding packets).
 *
 * POST JSON { docKind, filename, mediaType, dataBase64 } or a pre-rendered
 * page set { docKind, filename, images: [{ mediaType, dataBase64 }] }.
 * docKind ∈ voided_check | drivers_license | statement — each has its own
 * structured-output schema. The extracted fields feed the ops Boarding
 * Packet in the Agent Desk so nothing gets re-keyed by hand.
 *
 * Auth: caller must be signed in (verify_jwt). Provider keys never leave
 * this function. Provider routing, size caps, metering, and error codes
 * mirror analyze-statement: Nebius serves imagery when configured; Claude
 * (claude-opus-5) reads raw PDFs and is the fallback.
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

const CONFIDENCE = {
  type: "string",
  enum: ["high", "medium", "low"],
  description: "high = clearly legible printed values; medium = partially inferred; low = poor scan or wrong document type",
} as const;

const NOTES = {
  type: "string",
  description: "One or two sentences on anything noteworthy: unreadable fields, ambiguity, or if the document is not what docKind claims",
} as const;

// Per-document-kind structured-output schemas. Flat, all-required,
// additionalProperties:false — instructions live in field descriptions.
const SCHEMAS: Record<string, { schema: Record<string, unknown>; label: string }> = {
  voided_check: {
    label: "voided business check",
    schema: {
      type: "object",
      properties: {
        bank_name: { type: "string", description: "Bank name printed on the check; empty string if not shown" },
        routing_number: { type: "string", description: "9-digit ABA routing number from the MICR line (first group). Digits only" },
        account_number: { type: "string", description: "Bank account number from the MICR line (second group). Digits only" },
        account_holder: { type: "string", description: "Business or personal name printed on the check" },
        confidence: CONFIDENCE,
        notes: NOTES,
      },
      required: ["bank_name", "routing_number", "account_number", "account_holder", "confidence", "notes"],
      additionalProperties: false,
    },
  },
  drivers_license: {
    label: "US driver's license or state ID",
    schema: {
      type: "object",
      properties: {
        full_name: { type: "string", description: "Full legal name as printed" },
        date_of_birth: { type: "string", description: "DOB in YYYY-MM-DD format" },
        address_line: { type: "string", description: "Street address line" },
        city: { type: "string" },
        state: { type: "string", description: "Two-letter state code" },
        zip: { type: "string" },
        license_number: { type: "string", description: "License/ID number as printed" },
        expiration: { type: "string", description: "Expiration date in YYYY-MM-DD format; empty string if not shown" },
        confidence: CONFIDENCE,
        notes: NOTES,
      },
      required: ["full_name", "date_of_birth", "address_line", "city", "state", "zip", "license_number", "expiration", "confidence", "notes"],
      additionalProperties: false,
    },
  },
  statement: {
    label: "merchant card-processing statement",
    schema: {
      type: "object",
      properties: {
        current_processor: { type: "string", description: "Processing company that issued the statement" },
        monthly_volume: { type: "number", description: "Gross card sales volume for the period in dollars" },
        transaction_count: { type: "number", description: "Total card transactions for the period; 0 if not shown" },
        effective_rate_pct: { type: "number", description: "All-in effective rate percentage: total processing cost / gross volume * 100; 0 if not derivable" },
        confidence: CONFIDENCE,
        notes: NOTES,
      },
      required: ["current_processor", "monthly_volume", "transaction_count", "effective_rate_pct", "confidence", "notes"],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are a merchant-boarding operations specialist at Delt Pay. You read documents merchants submit with their applications (voided checks, driver's licenses, processing statements) and extract the exact fields the boarding team keys into processor portals.

Rules:
- Extract only what the document supports. Use empty string (or 0 for numbers) for fields the document does not show, and say so in notes.
- Transcribe identifiers (routing/account/license numbers) digit-for-digit; never guess digits. If any digit is unreadable, lower confidence and flag it in notes.
- If the document is not the kind claimed, set confidence to "low" and explain in notes.`;

const NEBIUS_URL = "https://api.studio.nebius.com/v1/chat/completions";

interface PageImage {
  mediaType: string;
  dataBase64: string;
}

async function extractWithNebius(
  apiKey: string,
  images: PageImage[],
  filename: string,
  kindLabel: string,
  schema: Record<string, unknown>,
  caller: Caller | null,
): Promise<Response> {
  const model = Deno.env.get("NEBIUS_VISION_MODEL") ?? "Qwen/Qwen2.5-VL-72B-Instruct";
  const upstream = await fetch(NEBIUS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
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
                `Extract the boarding fields from this ${kindLabel} (file: ${filename}). ` +
                `Respond with ONLY a JSON object matching this schema (all fields required):\n` +
                JSON.stringify(schema),
            },
          ],
        },
      ],
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    console.error("[extract-deal-doc:nebius]", upstream.status, errText.slice(0, 500));
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
  // JSON mode has no schema enforcement — confidence is the one universal field.
  if (typeof extraction.confidence !== "string") {
    return json({ error: "extraction_failed", message: "Extraction missing required fields" }, 502);
  }

  const usage = {
    input_tokens: data?.usage?.prompt_tokens ?? 0,
    output_tokens: data?.usage?.completion_tokens ?? 0,
  };
  const servedModel = data.model ?? model;
  await recordUsage({
    caller,
    feature: "deal_doc_extractor",
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
    docKind?: string;
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

  const { filename = "document", mediaType = "application/pdf", dataBase64 } = body;
  const kind = SCHEMAS[body.docKind ?? ""];
  if (!kind) {
    return json({ error: "unsupported_doc_kind", message: `docKind must be one of: ${Object.keys(SCHEMAS).join(", ")}` }, 400);
  }

  const images: PageImage[] | null =
    Array.isArray(body.images) && body.images.length
      ? body.images
          .filter(i => i && typeof i.dataBase64 === "string" && /^image\/(png|jpeg|webp|gif)$/.test(i.mediaType))
          .slice(0, 8)
      : null;

  if (!images && !dataBase64) return json({ error: "missing_file" }, 400);
  const totalBytes = images
    ? images.reduce((sum, i) => sum + i.dataBase64.length, 0)
    : (dataBase64?.length ?? 0);
  if (totalBytes > 28_000_000) return json({ error: "file_too_large", message: "Document exceeds 20MB" }, 413);

  const isPdf = !images && mediaType === "application/pdf";
  const isImage = !!images || /^image\/(png|jpeg|webp|gif)$/.test(mediaType);
  if (!isPdf && !isImage) return json({ error: "unsupported_media_type", message: mediaType }, 415);

  const pageImages: PageImage[] | null =
    images ?? (isImage && dataBase64 ? [{ mediaType, dataBase64 }] : null);
  const useNebius = Boolean(nebiusKey && pageImages);

  const caller = await resolveCaller(req);
  const quota = await checkQuota(caller);
  if (!quota.allowed) {
    await recordUsage({
      caller,
      feature: "deal_doc_extractor",
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
      return await extractWithNebius(nebiusKey!, pageImages!, filename, kind.label, kind.schema, caller);
    } catch (err) {
      const e = err as { message?: string };
      console.error("[extract-deal-doc:nebius]", e.message);
      return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
    }
  }

  if (!anthropicKey) {
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
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: kind.schema } },
      messages: [
        {
          role: "user",
          content: [
            ...fileBlocks,
            {
              type: "text",
              text: `Extract the boarding fields from this ${kind.label} (file: ${filename}).`,
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
    await recordUsage({
      caller,
      feature: "deal_doc_extractor",
      provider: "anthropic",
      model: response.model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cachedInputTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
    });

    return json({ extraction, model: response.model, usage });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    console.error("[extract-deal-doc]", e.status, e.message);
    if (e.status === 401) return json({ error: "bad_api_key", message: "ANTHROPIC_API_KEY is invalid" }, 502);
    if (e.status === 429) return json({ error: "rate_limited", message: "Anthropic rate limit hit — retry shortly" }, 429);
    return json({ error: "extraction_failed", message: e.message ?? "unknown" }, 502);
  }
});
