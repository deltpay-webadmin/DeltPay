import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useRouteChangePixel } from '@/lib/pixel';
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import DeltMarquee from '@/app/components/DeltMarquee';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { CustomCursor } from '@/app/components/CustomCursor';
import { PageLoader, RouteTransitionLoader } from '@/app/components/PageLoader';
import { CookieConsent } from '@/app/components/CookieConsent';

/* Route components are code-split (React.lazy) so the initial load ships a
   small chunk instead of the whole ~2.2MB app. Each page fetches on demand,
   showing the branded <PageLoader/> during the brief fetch. Named exports are
   adapted to the default-export shape lazy() expects. */
const named = <T,>(p: Promise<T>, key: keyof T) =>
  p.then((m) => ({ default: (m as any)[key] }));

const HomePage = lazy(() => named(import('@/app/pages/HomePage'), 'HomePage'));
const PricingPage = lazy(() => named(import('@/app/pages/PricingPage'), 'PricingPage'));
const PaymentsPage = lazy(() => named(import('@/app/pages/PaymentsPage'), 'PaymentsPage'));
const DeltAiPage = lazy(() => named(import('@/app/pages/DeltAiPage'), 'DeltAiPage'));
const DeltAI = lazy(() => named(import('@/app/components/DeltAI'), 'DeltAI'));
const LensChatPage = lazy(() => named(import('@/app/pages/LensChatPage'), 'LensChatPage'));
const SandboxPage = lazy(() => named(import('@/app/pages/SandboxPage'), 'SandboxPage'));
const SignInPage = lazy(() => named(import('@/app/pages/SignInPage'), 'SignInPage'));
const SignUpPage = lazy(() => named(import('@/app/pages/SignUpPage'), 'SignUpPage'));
const ContactPage = lazy(() => named(import('@/app/pages/ContactPage'), 'ContactPage'));
const ContactSalesPage = lazy(() => named(import('@/app/pages/ContactSalesPage'), 'ContactSalesPage'));
const SupportPage = lazy(() => named(import('@/app/pages/SupportPage'), 'SupportPage'));
const BusinessTypesPage = lazy(() => named(import('@/app/pages/BusinessTypesPage'), 'BusinessTypesPage'));
const ProductsPage = lazy(() => named(import('@/app/pages/ProductsPage'), 'ProductsPage'));
const HardwarePage = lazy(() => named(import('@/app/pages/HardwarePage'), 'HardwarePage'));
const HardwareProductPage = lazy(() => named(import('@/app/pages/HardwareProductPage'), 'HardwareProductPage'));
const ShoppingCartPage = lazy(() => named(import('@/app/pages/ShoppingCartPage'), 'ShoppingCartPage'));
const NewBlogPage = lazy(() => named(import('@/app/pages/NewBlogPage'), 'NewBlogPage'));
const AboutUsPage = lazy(() => named(import('@/app/pages/AboutUsPage'), 'AboutUsPage'));
const ReviewsPage = lazy(() => named(import('@/app/pages/ReviewsPage'), 'ReviewsPage'));
const LensAIPage = lazy(() => named(import('@/app/pages/LensAIPage'), 'LensAIPage'));
const LensAIChatPage = lazy(() => named(import('@/app/pages/LensAIChatPage'), 'LensAIChatPage'));
const WebsiteBuilderDemo = lazy(() => named(import('@/app/pages/WebsiteBuilderDemo'), 'WebsiteBuilderDemo'));
const ApplicationPage = lazy(() => named(import('@/app/pages/ApplicationPage'), 'ApplicationPage'));
const OnboardingPage = lazy(() => named(import('@/app/pages/OnboardingPage'), 'OnboardingPage'));
const AboutPage = lazy(() => named(import('@/app/pages/AboutPage'), 'AboutPage'));
const CareersPage = lazy(() => named(import('@/app/pages/CareersPage'), 'CareersPage'));
const PrivacyPolicyPage = lazy(() => named(import('@/app/pages/PrivacyPolicyPage'), 'PrivacyPolicyPage'));
const TermsPage = lazy(() => named(import('@/app/pages/TermsPage'), 'TermsPage'));
const CaseStudiesPage = lazy(() => named(import('@/app/pages/CaseStudiesPage'), 'CaseStudiesPage'));
const HowItWorksPage = lazy(() => named(import('@/app/pages/HowItWorksPage'), 'HowItWorksPage'));
const HelpCenterPage = lazy(() => named(import('@/app/pages/HelpCenterPage'), 'HelpCenterPage'));
const WebsiteExamples = lazy(() => named(import('@/app/components/WebsiteExamples'), 'WebsiteExamples'));
const CapitalPage = lazy(() => named(import('@/app/pages/CapitalPage'), 'CapitalPage'));
const ResourcePage = lazy(() => named(import('@/app/pages/ResourcePage'), 'ResourcePage'));
const CalculatorPage = lazy(() => named(import('@/app/pages/CalculatorPage'), 'CalculatorPage'));
const GetAQuotePage = lazy(() => named(import('@/app/pages/GetAQuotePage'), 'GetAQuotePage'));
const NotFoundPage = lazy(() => named(import('@/app/pages/NotFoundPage'), 'NotFoundPage'));
const IndustryPage = lazy(() => named(import('@/app/pages/IndustryPage'), 'IndustryPage'));
const LensDemoPage = lazy(() => named(import('@/app/pages/LensDemoPage'), 'LensDemoPage'));
const InternationalUSDTPage = lazy(() => named(import('@/app/pages/InternationalUSDTPage'), 'InternationalUSDTPage'));
const HighRiskProcessingPage = lazy(() => named(import('@/app/pages/HighRiskProcessingPage'), 'HighRiskProcessingPage'));
const AuditPage = lazy(() => named(import('@/app/pages/AuditPage'), 'AuditPage'));

/* Renders the brand marquee BELOW the global footer, but only on the
   home route — preserving the original "single instance on ‘/’" behavior
   while moving the visual to its new position under the footer. */
function PostFooterMarquee() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return <DeltMarquee />;
}

/* Fires Meta Pixel PageView on every route change. The initial
   PageView is fired by the base pixel snippet in index.html, so
   this hook explicitly skips the first render to avoid duplicates. */
function PixelRouteTracker() {
  useRouteChangePixel();
  return null;
}

/* App root - v2 */
export default function App() {
  return (
    <>
      <CustomCursor />
      <HashRouter>
        <ScrollToTop />
        <PixelRouteTracker />
        {/* Branded loading moment on every page change (not just chunk fetches). */}
        <RouteTransitionLoader />
        {/* Cookie consent banner + system (EN/ES). Inside the router so its
            "Cookie & Privacy Policy" link can SPA-navigate to /privacy. */}
        <CookieConsent />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/dashboard" element={<SandboxPage />} />
          <Route path="/demo" element={<SandboxPage />} />
          <Route path="/get-a-quote" element={<GetAQuotePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/delt-ai-chat" element={<DeltAI />} />
          <Route path="/lens-chat" element={<LensChatPage />} />
          <Route path="/lens-ai/chat" element={<LensAIChatPage />} />
          <Route path="/website-builder" element={<WebsiteBuilderDemo />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-white relative">
              <Navigation />
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                {/* Legacy application form — retired. All onboarding now
                    flows through the "What features do you need?" quiz. Any
                    remaining/bookmarked /apply links land there. */}
                <Route path="/apply" element={<Navigate to="/get-a-quote" replace />} />
                <Route path="/whats-new" element={<Navigate to="/blog" replace />} />
                <Route path="/blog" element={<NewBlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact-sales" element={<ContactSalesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/business-types" element={<BusinessTypesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/hardware" element={<HardwarePage />} />
                <Route path="/hardware/:slug" element={<HardwareProductPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/about-legacy" element={<AboutPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/lens-ai" element={<LensAIPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/help-center" element={<HelpCenterPage />} />
                <Route path="/website-examples" element={<WebsiteExamples />} />
                <Route path="/delt-ai" element={<DeltAiPage />} />
                <Route path="/capital" element={<CapitalPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/industries/:slug" element={<IndustryPage />} />
                <Route path="/lens-demo" element={<LensDemoPage />} />
                <Route path="/solutions/international-usdt" element={<InternationalUSDTPage />} />
                <Route path="/solutions/high-risk-processing" element={<HighRiskProcessingPage />} />
                {/* Capital "More for your business" cards — each links to a
                    full editorial article rendered by ResourcePage. */}
                <Route path="/resources/:slug" element={<ResourcePage />} />
                {/* Final fallback — branded 404 so unknown URLs degrade
                    gracefully instead of rendering an empty body. */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </Suspense>
              <Footer />
              {/* DeltMarquee renders BELOW the footer, on the home page only
                  (matching the prior single-instance placement). Pulled out
                  of HomePage so it sits after <Footer /> in the DOM. */}
              <PostFooterMarquee />
            </div>
          } />
        </Routes>
        </Suspense>
      </HashRouter>
    </>
  );
}