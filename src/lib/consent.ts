/**
 * Cookie consent system (Deltpay)
 * ────────────────────────────────────────────────────────────────
 * A tiny, framework-free consent core that:
 *   1. Persists the visitor's choice to localStorage.
 *   2. Broadcasts every decision as a `delt:cookie-consent` CustomEvent
 *      (detail: { choice, ts }) so any part of the app can react.
 *   3. Keeps the Meta Pixel gated via Meta's consent API — nothing is
 *      tracked until the visitor accepts (privacy-safe, opt-in).
 *   4. Exposes a small public API on `window.DeltConsent`.
 *
 * The *load-time* gate lives in index.html: it revokes consent before
 * the pixel can fire and only grants + fires a single PageView for a
 * returning, previously-accepted visitor. This module owns every
 * decision made *after* load (Accept / Decline / reopen), and shares a
 * `window.__deltPixelPageViewFired` flag with index.html so PageView
 * fires exactly once per session — no double-counting.
 *
 * Reference: https://developers.facebook.com/docs/meta-pixel/implementation/gdpr
 */

export type ConsentChoice = 'accepted' | 'declined';

export interface ConsentRecord {
  choice: ConsentChoice;
  /** epoch millis the decision was made */
  ts: number;
}

/** localStorage key. Versioned so the shape can evolve later. */
export const STORAGE_KEY = 'deltcap:cookie-consent:v1';

/** CustomEvent name fired on every decision. */
export const CONSENT_EVENT = 'delt:cookie-consent';

/** Internal event used to ask the banner UI to reopen. */
export const OPEN_EVENT = 'delt:cookie-open';

type ChangeListener = (record: ConsentRecord) => void;

declare global {
  interface Window {
    /** Set true once the first Meta PageView has fired (here or in index.html). */
    __deltPixelPageViewFired?: boolean;
    /** Public consent API. */
    DeltConsent?: {
      get(): ConsentChoice | null;
      set(choice: ConsentChoice): void;
      open(): void;
      onChange(cb: ChangeListener): () => void;
    };
  }
}

const isBrowser = typeof window !== 'undefined';

/** Read the stored consent record, or null if the visitor hasn't decided. */
export function getRecord(): ConsentRecord | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed && (parsed.choice === 'accepted' || parsed.choice === 'declined')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Read just the choice (`'accepted' | 'declined' | null`). */
export function getChoice(): ConsentChoice | null {
  return getRecord()?.choice ?? null;
}

// ─── Meta Pixel gating ──────────────────────────────────────────────
// All fbq calls are guarded so a blocked/slow pixel (ad-blockers) simply
// no-ops instead of throwing into the UI.

function fbqSafe(...args: unknown[]): void {
  try {
    if (!isBrowser) return;
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    if (typeof fbq !== 'function') return;
    fbq(...args);
  } catch {
    /* analytics must never throw */
  }
}

/**
 * Bring the tracker gating in line with a decision.
 *  - accepted → grant consent, and fire the initial PageView exactly
 *    once (guarded by __deltPixelPageViewFired so we never double-count
 *    with index.html's load-time PageView).
 *  - declined → revoke consent; the pixel holds everything.
 */
function syncTrackerGating(choice: ConsentChoice): void {
  if (choice === 'accepted') {
    fbqSafe('consent', 'grant');
    if (isBrowser && !window.__deltPixelPageViewFired) {
      fbqSafe('track', 'PageView');
      window.__deltPixelPageViewFired = true;
    }
  } else {
    fbqSafe('consent', 'revoke');
  }
}

/**
 * Persist a decision, broadcast it, and (via the internal listener
 * registered below) keep tracker gating in sync.
 */
export function setChoice(choice: ConsentChoice): void {
  if (!isBrowser) return;
  const record: ConsentRecord = { choice, ts: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* private-mode / quota — still broadcast so the UI updates */
  }
  window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_EVENT, { detail: record }));
}

/** Ask the banner UI to reopen so the visitor can change their mind. */
export function openBanner(): void {
  if (!isBrowser) return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/**
 * Subscribe to consent changes. Returns an unsubscribe function.
 */
export function onChange(cb: ChangeListener): () => void {
  if (!isBrowser) return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentRecord>).detail;
    if (detail) cb(detail);
  };
  window.addEventListener(CONSENT_EVENT, handler as EventListener);
  return () => window.removeEventListener(CONSENT_EVENT, handler as EventListener);
}

// ─── System-owned listener ──────────────────────────────────────────
// The system registers ITS OWN listener that keeps tracker gating in
// sync with every decision. This is deliberately separate from user
// subscriptions (onChange) so third-party code can't accidentally
// unsubscribe the gating.
let initialized = false;

export function initConsent(): void {
  if (!isBrowser || initialized) return;
  initialized = true;

  window.addEventListener(CONSENT_EVENT, (e: Event) => {
    const detail = (e as CustomEvent<ConsentRecord>).detail;
    if (detail?.choice) syncTrackerGating(detail.choice);
  });

  // Publish the public API.
  window.DeltConsent = {
    get: getChoice,
    set: setChoice,
    open: openBanner,
    onChange,
  };
}
