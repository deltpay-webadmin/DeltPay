/**
 * Meta Pixel helper (Deltpay — Pixel ID 1594401858975809)
 *
 * The base pixel is injected in `index.html` and fires PageView on
 * first load. Because we use HashRouter (client-side routing), a
 * subsequent route change doesn't reload the page, so PageView won't
 * refire automatically. Call `useRouteChangePixel()` at the App root
 * to fire PageView on every route change.
 *
 * For conversion events, call the named helpers below at the
 * appropriate success handlers. All calls are guarded so they
 * no-op if the pixel script hasn't loaded (e.g. ad-blockers) —
 * they must never throw into the UI.
 *
 * Reference: https://developers.facebook.com/docs/meta-pixel/reference
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Standard events documented by Meta. Prefer these over custom events
// wherever possible — the ad optimization algorithm has priors for them.
export type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe';

interface EventParams {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number }>;
  num_items?: number;
  status?: string;
  [key: string]: unknown;
}

// The pixel is loaded from index.html and hangs a `fbq` function off
// `window`. We call it dynamically so a blocked or slow-loading pixel
// silently no-ops instead of breaking the page.
declare global {
  interface Window {
    fbq?: (
      command: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: EventParams,
    ) => void;
  }
}

/**
 * Fire a standard Meta Pixel event. Silently no-ops if the pixel
 * hasn't loaded (ad blockers, network failures, etc.).
 */
export function trackEvent(event: StandardEvent, params?: EventParams): void {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.fbq !== 'function') return;
    window.fbq('track', event, params);
  } catch {
    /* analytics must never throw */
  }
}

/**
 * Fire a custom event (only use when no standard event fits).
 */
export function trackCustom(name: string, params?: EventParams): void {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.fbq !== 'function') return;
    window.fbq('trackCustom', name, params);
  } catch {
    /* analytics must never throw */
  }
}

/**
 * Fires PageView on every route change. Mount once at App root.
 * The initial page load's PageView is already fired by the base
 * pixel snippet in index.html, so we skip the first render to
 * avoid a duplicate ping.
 */
export function useRouteChangePixel(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    // Skip the very first invocation — index.html already fired
    // PageView on hard load. All subsequent path changes should
    // fire a fresh PageView with the new path attached.
    if ((useRouteChangePixel as any)._first !== false) {
      (useRouteChangePixel as any)._first = false;
      return;
    }
    trackEvent('PageView', { content_name: pathname });
  }, [pathname]);
}

// ─── Named conversion helpers ──────────────────────────────────────
// Wrapping standard events in named helpers gives us:
//   1. One place to tune the default value/currency per event type
//   2. Type-safety at the call site
//   3. A grep target ("where does Lead fire?") for future audits
// ────────────────────────────────────────────────────────────────────

/**
 * Merchant application submitted (Deltpay's primary lead).
 * Default value is a placeholder LTV — tune once real merchant LTV
 * data is available.
 */
export function trackMerchantLead(extra?: EventParams): void {
  trackEvent('Lead', {
    value: 500,
    currency: 'USD',
    content_category: 'merchant_application',
    ...extra,
  });
}

/**
 * Bank verified via Plaid — merchant is one step from boarded.
 * Standing in for CompleteRegistration until we have a real
 * server-side "boarded" webhook (recommended follow-on: CAPI).
 */
export function trackMerchantOnboarded(extra?: EventParams): void {
  trackEvent('CompleteRegistration', {
    value: 500,
    currency: 'USD',
    status: 'bank_verified',
    content_category: 'merchant_application',
    ...extra,
  });
}

/** Contact-sales form submission — top of funnel qualified lead. */
export function trackContact(extra?: EventParams): void {
  trackEvent('Contact', { ...extra });
}

/** Get-a-quote submitted — mid-funnel intent. */
export function trackQuoteRequest(extra?: EventParams): void {
  trackEvent('Lead', {
    value: 250,
    currency: 'USD',
    content_category: 'quote_request',
    ...extra,
  });
}

/** Cart checkout click — hardware purchase intent. */
export function trackCheckout(cartValue: number, itemCount: number): void {
  trackEvent('InitiateCheckout', {
    value: cartValue,
    currency: 'USD',
    num_items: itemCount,
    content_category: 'hardware',
  });
}

/**
 * Homepage "See your custom rate" email captured — top-of-funnel lead.
 * Email-only, so a light placeholder value vs. a full application.
 */
export function trackRateCheck(extra?: EventParams): void {
  trackEvent('Lead', {
    value: 100,
    currency: 'USD',
    content_category: 'rate_check',
    ...extra,
  });
}

/**
 * Savings-calculator quote completed (email + real volume entered) — the
 * most qualified marketing lead. Value carries the visitor's own estimated
 * annual savings so Meta can optimize toward higher-value merchants.
 */
export function trackCalculatorQuote(annualSavings: number, extra?: EventParams): void {
  trackEvent('Lead', {
    value: Math.max(0, Math.round(annualSavings || 0)),
    currency: 'USD',
    content_category: 'calculator_quote',
    ...extra,
  });
}
