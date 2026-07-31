// ── Shared AI error handling ──
// supabase.functions.invoke() surfaces any non-2xx as a FunctionsHttpError
// whose JSON body lives on `error.context` (a Response) — NOT on `data`.
// Reading `data.error` therefore never fires for a real failure, which is how
// a 429 or a future 402 quota rejection would reach the user as the useless
// "Edge Function returned a non-2xx status code".

/** Carries the edge function's machine-readable error code. */
export class AIError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.status = status;
  }

  /**
   * True when the feature simply isn't set up. This is the ONLY case where
   * falling back to demo content is honest — every other failure has to be
   * shown, or the UI presents made-up numbers as a real answer.
   */
  get isNotConfigured(): boolean {
    return this.code === 'not_configured' || this.code === 'supabase_unconfigured';
  }

  /** Reserved for the quota enforcement build; the UI branch exists already. */
  get isQuotaExceeded(): boolean {
    return this.code === 'quota_exceeded' || this.status === 402;
  }
}

/** Recover the structured {error, message} body from an invoke() failure. */
export async function unwrapInvokeError(error: unknown): Promise<AIError> {
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.error) {
        return new AIError(body.error, body.message ?? body.error, ctx.status);
      }
    } catch {
      // Body wasn't JSON — fall through to the generic error.
    }
  }
  const message = (error as { message?: string })?.message ?? 'edge function error';
  return new AIError('invoke_failed', message, ctx?.status);
}
