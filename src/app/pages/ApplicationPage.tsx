import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Check, Building2, Mail, Phone, User } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';

const LEAD_LABELS: Record<string, { label: string; sub: string }> = {
  'MS+CAP-Switcher': {
    label: 'Bundled offer — Processing + Capital',
    sub: "You're switching processors and tapping Capital. We'll set up both in one application.",
  },
  'CAP-Only': {
    label: 'Capital-only application',
    sub: "We won't touch your processor. Quick verification — funded in 24–48 hours.",
  },
  'MS+CAP-NewMerchant': {
    label: 'New merchant onboarding',
    sub: 'Processing first — Capital pre-approval activates after ~30–60 days of volume.',
  },
  'Existing-Customer-Upsell': {
    label: 'Existing Delt customer',
    sub: "We'll route you through the customer flow to pre-fill your Capital offer.",
  },
};

export function ApplicationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // CRM lead tag + qualifying answers passed in from /get-funded
  const lead = searchParams.get('lead') || '';
  const accepts = searchParams.get('accepts') || '';
  const switchTo = searchParams.get('switch') || '';
  const volume = searchParams.get('volume') || '';
  const avg = searchParams.get('avg') || '';
  const rate = searchParams.get('rate') || '';
  const leadInfo = useMemo(() => LEAD_LABELS[lead] || null, [lead]);

  // Funnel guard: anyone hitting /apply without a lead tag gets routed back
  // through /get-funded so we capture the qualifying questions for CRM.
  useEffect(() => {
    if (!lead) {
      navigate('/get-funded', { replace: true });
    }
  }, [lead, navigate]);

  const [step, setStep] = useState<'form' | 'plaid' | 'success'>('form');
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    businessType: 'llc',
    // CRM tagging fields (carried forward to backend on submit)
    leadTag: lead,
    acceptsCards: accepts,
    openToSwitch: switchTo,
    monthlyVolume: volume,
    avgTicket: avg,
    currentRate: rate,
  });
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production, you would call your backend to create a link_token
    // For demo purposes, we'll use a placeholder token
    const mockLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(7);
    setLinkToken(mockLinkToken);
    setStep('plaid');
  };

  // Plaid Link callbacks
  const onSuccess = useCallback((public_token: string) => {
    setPublicToken(public_token);
    // In production, you would send this public_token to your backend
    // to exchange it for an access_token
    setTimeout(() => {
      setStep('success');
    }, 500);
  }, []);

  const onExit = useCallback(() => {
    // User exited Plaid Link flow
    setStep('form');
  }, []);

  // Plaid Link configuration
  const config = {
    token: linkToken || '',
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Auto-open Plaid when token is ready
  useState(() => {
    if (linkToken && ready && step === 'plaid') {
      open();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-[#4945FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#4945FF]" />
            </div>
            <h1 className="text-3xl font-bold text-[#041E42] mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-[#475569] mb-8">
              Welcome to Delt, {formData.fullName}! We've received your application and verified your bank account.
            </p>
            <div className="bg-[#F6F7FB] rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#041E42] mb-4">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    Our team will review your application within 1 business day (Mon–Fri, excluding holidays)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    You'll receive your Delt Reader at {formData.email}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    Start processing payments immediately with $0 monthly fees
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-[#4945FF] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#3933CC] transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-[#041E42] text-[#041E42] px-8 py-3 rounded-md font-semibold hover:bg-[#041E42] hover:text-white transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'plaid') {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-[#4945FF]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Building2 className="w-10 h-10 text-[#4945FF]" />
            </div>
            <h1 className="text-2xl font-bold text-[#041E42] mb-4">
              Connecting to Your Bank...
            </h1>
            <p className="text-[#475569] mb-8">
              Please complete the bank verification process in the popup window.
            </p>
            <button
              onClick={() => open()}
              disabled={!ready}
              className="bg-[#4945FF] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#3933CC] transition-all disabled:opacity-50"
            >
              {ready ? 'Open Bank Connection' : 'Loading...'}
            </button>
            <button
              onClick={() => setStep('form')}
              className="block mx-auto mt-4 text-[#475569] hover:text-[#041E42] text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#041E42] mb-3">
              {leadInfo ? leadInfo.label : 'Get Started with Delt'}
            </h1>
            <p className="text-lg text-[#475569]">
              {leadInfo ? leadInfo.sub : 'Complete this quick application to start processing payments'}
            </p>
            {leadInfo && (
              <button
                type="button"
                onClick={() => navigate('/get-funded')}
                className="mt-3 text-sm text-[#4945FF] hover:underline"
              >
                ← Change my answers
              </button>
            )}
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Business Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-[#475569]" />
                  </div>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                    placeholder="Your Business LLC"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#475569]" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#475569]" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                    placeholder="john@yourbusiness.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-[#475569]" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label htmlFor="businessType" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Business Type *
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                >
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="sole-proprietor">Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                  <option value="nonprofit">Nonprofit</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-[#F6F7FB] rounded-lg p-4 border-l-4 border-[#4945FF]">
                <p className="text-sm text-[#475569]">
                  <strong className="text-[#041E42]">Next step:</strong> After submitting this form, 
                  you'll securely connect your bank account using Plaid to verify your business.
                </p>
              </div>

              {/* Plaid Consent */}
              <div className="bg-[#F6F7FB] border border-[#4945FF]/15 rounded-lg p-4 text-sm text-[#475569] mb-4">By continuing, you authorize Delt and our bank-verification partner Plaid to access your bank account information. See <a href="https://plaid.com/legal/#consumers" target="_blank" rel="noopener" className="underline text-[#4945FF]">Plaid's Privacy Policy</a>.</div>

              {/* Privacy consent */}
              <p className="text-xs text-[#475569] mb-2">By submitting, you acknowledge our <a href="/privacy" className="underline text-[#4945FF]">Privacy Policy</a> and agree to our <a href="/terms" className="underline text-[#4945FF]">Terms of Service</a>.</p>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#4945FF] text-white py-4 rounded-lg font-semibold hover:bg-[#3933CC] transition-all text-lg"
              >
                Continue to Bank Verification
              </button>

              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-8 pt-4 text-sm text-[#475569]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4945FF]" />
                  <span>Secure & Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4945FF]" />
                  <span>Transparent Fees</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
