import { HashRouter, Routes, Route } from 'react-router';
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { HomePage } from '@/app/pages/HomePage';
import { PricingPage } from '@/app/pages/PricingPage';
import { PaymentsPage } from '@/app/pages/PaymentsPage';
import { DeltAiPage } from '@/app/pages/DeltAiPage';
import { DeltAI } from '@/app/components/DeltAI';
import { LensChatPage } from '@/app/pages/LensChatPage';
import { SandboxPage } from '@/app/pages/SandboxPage';
import { SignInPage } from '@/app/pages/SignInPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { ContactSalesPage } from '@/app/pages/ContactSalesPage';
import { SupportPage } from '@/app/pages/SupportPage';
import { BusinessTypesPage } from '@/app/pages/BusinessTypesPage';
import { ProductsPage } from '@/app/pages/ProductsPage';
import { ShoppingCartPage } from '@/app/pages/ShoppingCartPage';
import { BlogPage } from '@/app/pages/BlogPage';
import { NewBlogPage } from '@/app/pages/NewBlogPage';
import { WhatsNewPage } from '@/app/pages/WhatsNewPage';
import { AboutUsPage } from '@/app/pages/AboutUsPage';
import { ReviewsPage } from '@/app/pages/ReviewsPage';
import { LensAIPage } from '@/app/pages/LensAIPage';
import { WebsiteBuilderDemo } from '@/app/pages/WebsiteBuilderDemo';
import { ApplicationPage } from '@/app/pages/ApplicationPage';
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
import { CalculatorPage } from '@/app/pages/CalculatorPage';
import { GetAQuotePage } from '@/app/pages/GetAQuotePage';
import { IndustryPage } from '@/app/pages/IndustryPage';
import { LensDemoPage } from '@/app/pages/LensDemoPage';
import { InternationalUSDTPage } from '@/app/pages/InternationalUSDTPage';
import { HighRiskProcessingPage } from '@/app/pages/HighRiskProcessingPage';
import { ChargebackManagementPage } from '@/app/pages/ChargebackManagementPage';

/* App root - v2 */
export default function App() {
  return (
    <>
      <CustomCursor />
      <HashRouter>
        <ScrollToTop />
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
          <Route path="/website-builder" element={<WebsiteBuilderDemo />} />
          <Route path="*" element={
            <div className="min-h-screen bg-white relative">
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/apply" element={<ApplicationPage />} />
                <Route path="/whats-new" element={<WhatsNewPage />} />
                <Route path="/blog" element={<NewBlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact-sales" element={<ContactSalesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/business-types" element={<BusinessTypesPage />} />
                <Route path="/products" element={<ProductsPage />} />
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
                <Route path="/solutions/chargeback-management" element={<ChargebackManagementPage />} />
              </Routes>
              <Footer />
            </div>
          } />
        </Routes>
      </HashRouter>
    </>
  );
}