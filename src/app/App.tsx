import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import DeltMarquee from '@/app/components/DeltMarquee';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { HomePage } from '@/app/pages/HomePage';
import { PricingPage } from '@/app/pages/PricingPage';
import { PaymentsPage } from '@/app/pages/PaymentsPage';
import { DeltAiPage } from '@/app/pages/DeltAiPage';
import { DeltAI } from '@/app/components/DeltAI';
import { LensChatPage } from '@/app/pages/LensChatPage';
import { SandboxPage } from '@/app/pages/SandboxPage';
import { SignInPage } from '@/app/pages/SignInPage';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { ContactSalesPage } from '@/app/pages/ContactSalesPage';
import { SupportPage } from '@/app/pages/SupportPage';
import { BusinessTypesPage } from '@/app/pages/BusinessTypesPage';
import { ProductsPage } from '@/app/pages/ProductsPage';
import { HardwarePage } from '@/app/pages/HardwarePage';
import { HardwareProductPage } from '@/app/pages/HardwareProductPage';
import { ShoppingCartPage } from '@/app/pages/ShoppingCartPage';
import { BlogPage } from '@/app/pages/BlogPage';
import { NewBlogPage } from '@/app/pages/NewBlogPage';
import { AboutUsPage } from '@/app/pages/AboutUsPage';
import { ReviewsPage } from '@/app/pages/ReviewsPage';
import { LensAIPage } from '@/app/pages/LensAIPage';
import { LensAIChatPage } from '@/app/pages/LensAIChatPage';
import { WebsiteBuilderDemo } from '@/app/pages/WebsiteBuilderDemo';
import { ApplicationPage } from '@/app/pages/ApplicationPage';
import { OnboardingPage } from '@/app/pages/OnboardingPage';
import { AboutPage } from '@/app/pages/AboutPage';
import { CareersPage } from '@/app/pages/CareersPage';
import { PrivacyPolicyPage } from '@/app/pages/PrivacyPolicyPage';
import { TermsPage } from '@/app/pages/TermsPage';
import { CaseStudiesPage } from '@/app/pages/CaseStudiesPage';
import { HowItWorksPage } from '@/app/pages/HowItWorksPage';
import { HelpCenterPage } from '@/app/pages/HelpCenterPage';
import { WebsiteExamples } from '@/app/components/WebsiteExamples';
import { CustomCursor } from '@/app/components/CustomCursor';
import { CapitalPage } from '@/app/pages/CapitalPage';
import { ResourcePage } from '@/app/pages/ResourcePage';
import { CalculatorPage } from '@/app/pages/CalculatorPage';
import { GetAQuotePage } from '@/app/pages/GetAQuotePage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { IndustryPage } from '@/app/pages/IndustryPage';
import { LensDemoPage } from '@/app/pages/LensDemoPage';
import { InternationalUSDTPage } from '@/app/pages/InternationalUSDTPage';
import { HighRiskProcessingPage } from '@/app/pages/HighRiskProcessingPage';
import { AuditPage } from '@/app/pages/AuditPage';

/* Renders the brand marquee BELOW the global footer, but only on the
   home route — preserving the original "single instance on ‘/’" behavior
   while moving the visual to its new position under the footer. */
function PostFooterMarquee() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return <DeltMarquee />;
}

/* App root - v2 */
export default function App() {
  return (
    <>
      <CustomCursor />
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/sandbox" element={<SandboxPage />} />
          {/* Authenticated Delt back-office CRM (Supabase-gated). */}
          <Route path="/dashboard" element={<DashboardPage />} />
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
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/apply" element={<ApplicationPage />} />
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
              <Footer />
              {/* DeltMarquee renders BELOW the footer, on the home page only
                  (matching the prior single-instance placement). Pulled out
                  of HomePage so it sits after <Footer /> in the DOM. */}
              <PostFooterMarquee />
            </div>
          } />
        </Routes>
      </HashRouter>
    </>
  );
}