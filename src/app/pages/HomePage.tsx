import { JuspayHero } from '@/app/components/JuspayHero';
import { ByTheNumbers } from '@/app/components/ByTheNumbers';
import { GlobeStats } from '@/app/components/GlobeStats';
import { ResultsBento } from '@/app/components/ResultsBento';
import { FeatureShowcase } from '@/app/components/FeatureShowcase';
import { SeeItInAction } from '@/app/components/SeeItInAction';
import { FinalCTA } from '@/app/components/FinalCTA';
import { ScrollRevealText } from '@/app/components/ScrollRevealText';
import { SpotlightTestimonial } from '@/app/components/SpotlightTestimonial';
import { IndustryPanel } from '@/app/components/IndustryPanel';
import { EmailCaptureBar } from '@/app/components/EmailCaptureBar';
import { CapitalCrossSell } from '@/app/components/CapitalCrossSell';
import { FAQ } from '@/app/components/FAQ';
import { RiveraStatementProof } from '@/app/components/RiveraStatementProof';
// DeltMarquee was previously rendered here; it now lives in App.tsx
// AFTER <Footer /> so the animation sits below the footer.

/* HomePage — section arc follows the Plaid editorial cadence:
   1. Hero (with David + built-with partner ledger)
   2. Email capture
   3. Globe / scale proof  (desktop)
   4. SeeItInAction dashboard preview
   5. IndustryPanel — "made for how you work"
   6. ByTheNumbers — legacy vs Delt
   7. RiveraStatementProof — concrete merchant statement diff
   8. CapitalCrossSell — payments → capital loop
   9. ScrollRevealText — editorial pause
   10. FeatureShowcase — product surface area
   11. ResultsBento — fake-dashboard bento (desktop only)
   12. SpotlightTestimonial
   13. FAQ
   14. FinalCTA */

export function HomePage() {
  return (
    <div className="relative">
      <JuspayHero />

      {/* Wave 5 — email capture beneath hero */}
      <EmailCaptureBar />

      {/* Mobile-only tight trust line (replaces decorative globe section on mobile) */}
      <div
        className="md:hidden px-6 py-10 text-center"
        style={{ background: '#080A28', color: '#fff' }}
      >
        <div
          className="text-[11px] tracking-[0.18em] uppercase"
          style={{
            fontFamily: 'var(--dc-font-mono)',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          — TRUSTED WORLDWIDE
        </div>
        <div
          className="mt-3 text-2xl font-semibold"
          style={{
            fontFamily: 'var(--dc-font-display)',
            letterSpacing: '-0.02em',
            color: '#fff',
          }}
        >
          10,000+ merchants run on Delt.
        </div>
      </div>

      {/* Globe + headline stats — desktop only (heavy decorative globe) */}
      <div className="hidden md:block">
        <GlobeStats />
      </div>

      {/* Desktop dashboard preview — hidden on mobile (unreadable when shrunk) */}
      <div className="hidden md:block">
        <SeeItInAction />
      </div>

      {/* Wave 2 — Made for how you actually work (industry panel) */}
      <IndustryPanel />

      {/* Legacy processor vs Delt comparison — has mobile-stacked alt inside */}
      <ByTheNumbers />

      {/* Concrete proof: real merchant statement diff (Rivera Auto Detail).
          Lives between the comparative numbers and the capital cross-sell
          so the visitor sees abstract savings → specific line items →
          what those savings unlock (capital). */}
      <RiveraStatementProof />

      {/* Merchant Services → Capital value loop */}
      <CapitalCrossSell variant="full" theme="light" />

      {/* Scroll-reveal headline — desktop only (purely decorative on mobile) */}
      <div className="hidden md:block">
        <ScrollRevealText />
      </div>

      {/* Feature showcase (website mockups, dashboards) — desktop only */}
      <div className="hidden md:block">
        <FeatureShowcase />
      </div>

      {/* Bento of fake dashboard tiles — desktop only (decorative) */}
      <div className="hidden md:block">
        <ResultsBento />
      </div>

      <SpotlightTestimonial />

      {/* FAQ split layout (light) */}
      <FAQ />

      <FinalCTA />
    </div>
  );
}
