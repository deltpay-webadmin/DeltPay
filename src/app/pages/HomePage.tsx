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
import DeltMarquee from '@/app/components/DeltMarquee';
import { CapitalCrossSell } from '@/app/components/CapitalCrossSell';

export function HomePage() {
  return (
    <div className="relative">
      <JuspayHero />
      {/* Wave 5 — email capture beneath hero */}
      <EmailCaptureBar />
      {/* Globe + headline stats (restored from original homepage) */}
      <GlobeStats />
      <SeeItInAction />
      <ScrollRevealText />
      <FeatureShowcase />
      {/* Legacy processor vs Delt comparison — moved here, after the product showcase */}
      <ByTheNumbers />
      {/* Merchant Services → Capital value loop */}
      <CapitalCrossSell variant="full" theme="light" />
      {/* Wave 2 — Made for how you actually work (industry panel) */}
      <IndustryPanel />
      <ResultsBento />
      <SpotlightTestimonial />
      <FinalCTA />
      <DeltMarquee />
    </div>
  );
}
