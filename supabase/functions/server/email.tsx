// Lightweight Resend email helper for the edge function.
// Talks to the Resend REST API directly via fetch — no npm dependency needed.
//
// Env / secrets (set in Supabase → Edge Functions → Manage secrets):
//   RESEND_API_KEY  — required for sending; without it, sends are skipped.
//   EMAIL_FROM      — default from-address, e.g. `DeltPay <hello@yourdomain.com>`.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "DeltPay <onboarding@resend.dev>";

// True when a Resend API key is configured. Used by the health endpoint so the
// key can be verified without ever exposing its value.
export const isEmailConfigured = (): boolean => {
  const key = Deno.env.get("RESEND_API_KEY");
  return typeof key === "string" && key.trim().length > 0;
};

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// Sends an email via Resend. Never throws — logs and returns { ok:false, error }
// on failure, matching the error style of the existing endpoints.
export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey || apiKey.trim().length === 0) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  const from = input.from || Deno.env.get("EMAIL_FROM") || DEFAULT_FROM;

  const payload: Record<string, unknown> = {
    from,
    to: input.to,
    subject: input.subject,
  };
  if (input.html) payload.html = input.html;
  if (input.text) payload.text = input.text;
  if (input.replyTo) payload.reply_to = input.replyTo;

  if (!payload.html && !payload.text) {
    return { ok: false, error: "Email must include html or text content." };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as Record<string, unknown>));

    if (!res.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        `Resend responded with ${res.status}`;
      console.error("sendEmail failed", res.status, message);
      return { ok: false, error: message };
    }

    return { ok: true, id: typeof data.id === "string" ? data.id : undefined };
  } catch (err) {
    console.error("sendEmail error", err);
    return { ok: false, error: "Failed to reach the email service." };
  }
};
