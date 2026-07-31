import { useEffect } from 'react';
import type { OrgBranding } from './SessionContext';

/**
 * Per-tenant branding: paints the org's colors over the CRM design tokens.
 *
 * The CRM's whole palette hangs off --dp-accent (see
 * src/styles/backend-theme.css), so overriding it on the scope element
 * rebrands buttons, active nav, focus rings, and charts in one move.
 * Domain-based org resolution is future work — the org comes from the
 * signed-in user's membership.
 */
export function useOrgTheme(org: OrgBranding | null) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.delt-backend-scope');
    if (!el || !org) return;
    const { primaryColor, secondaryColor } = org;
    if (primaryColor) {
      el.style.setProperty('--dp-accent', primaryColor);
      // Soft fill + readable-on-dark text tint derived from the accent.
      el.style.setProperty('--dp-accent-soft', `color-mix(in srgb, ${primaryColor} 14%, transparent)`);
    }
    if (secondaryColor) {
      el.style.setProperty('--dp-brand-secondary', secondaryColor);
    }
    return () => {
      el.style.removeProperty('--dp-accent');
      el.style.removeProperty('--dp-accent-soft');
      el.style.removeProperty('--dp-brand-secondary');
    };
  }, [org?.primaryColor, org?.secondaryColor]);
}
