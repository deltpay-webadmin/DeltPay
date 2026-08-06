// Server-side MPA generation: application row → decrypted data → mapped
// field values → filled (optionally anchor-stamped) PDF. Shared by the
// mpa-application function (preview) and the docusign function (send-mpa).
// Deno-only (imports fill.ts / pdf-lib).

import { decryptJson } from "./crypto.ts";
import type { ApplicationData, PricingBundle, ProcessorChannel, SecureData } from "./schema.ts";
import { mapLuqra } from "./luqraMap.ts";
import { mapPaysafe } from "./paysafeMap.ts";
import { fillMpaPdf } from "./fill.ts";
import { anchorSpecFor } from "./anchors.ts";

export const MPA_TEMPLATE_BUCKET = "mpa-templates";
export const MPA_TEMPLATE_PATHS: Record<ProcessorChannel, string> = {
  Luqra: "luqra/mpa-v1.pdf",
  Paysafe: "paysafe/mpa-v1.pdf",
};

export interface MpaApplicationRow {
  id: string;
  org_id: string;
  submission_id: string;
  status: string;
  data: ApplicationData;
  secure: { v: 1; iv: string; ct: string } | null;
  pricing: PricingBundle | null;
}

export interface GenerateResult {
  pdf: Uint8Array;
  warnings: string[];
}

/**
 * `admin` is a service-role Supabase client (storage read + no RLS).
 * Returns an error string (never throws) for expected failure modes so
 * callers can surface them verbatim.
 */
export async function generateMpaPdf(
  admin: {
    storage: {
      from: (bucket: string) => {
        download: (path: string) => Promise<{ data: Blob | null; error: { message: string } | null }>;
      };
    };
  },
  app: MpaApplicationRow,
  channel: ProcessorChannel,
  opts: { withAnchors: boolean },
): Promise<GenerateResult | { error: string }> {
  const key = Deno.env.get("APP_ENCRYPTION_KEY");
  if (!key) return { error: "Encryption is not configured (APP_ENCRYPTION_KEY secret missing)" };
  if (!app.secure) return { error: "The application has no owner/banking details yet" };

  let secure: SecureData;
  try {
    secure = await decryptJson<SecureData>(app.secure, key);
  } catch {
    return { error: "Could not decrypt the application's secure data (key mismatch?)" };
  }

  const { data: blob, error: dlErr } = await admin.storage
    .from(MPA_TEMPLATE_BUCKET)
    .download(MPA_TEMPLATE_PATHS[channel]);
  if (dlErr || !blob) {
    return {
      error:
        `MPA template "${MPA_TEMPLATE_PATHS[channel]}" is missing from the ${MPA_TEMPLATE_BUCKET} bucket` +
        ` — upload it (see docs/mpa-boarding.md).`,
    };
  }
  const templateBytes = new Uint8Array(await blob.arrayBuffer());

  const full = { data: app.data, secure };
  const values =
    channel === "Luqra"
      ? mapLuqra(full, app.pricing?.luqra)
      : mapPaysafe(full, app.pricing?.paysafe);

  return await fillMpaPdf(templateBytes, values, {
    anchorSpec: opts.withAnchors ? anchorSpecFor(channel) : undefined,
  });
}

export function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

export function bytesFromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
