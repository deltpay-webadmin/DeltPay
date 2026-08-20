import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Building2, Mail, Phone, User, ShieldCheck } from 'lucide-react';
import { CapitalCrossSell } from '../components/CapitalCrossSell';
import { useHoneypot } from '../components/Honeypot';
import { serverFetch } from '../lib/supabase';
import { trackMerchantLead, trackMerchantOnboarded } from '@/lib/pixel';

export function ApplicationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'connect' | 'success'>('form');
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    businessType: 'llc',
  });
  const { honeypotField, honeypotValue } = useHoneypot();
  const [submitting, setSubmitting] = useState(false);
  // Plaid-hosted connect link minted by the CRM intake; null when the
  // intake call failed and we fall back to "we'll email your link".
  const [connectLink, setConnectLink] = useState<{
    url: string;
    expiration: string | null;
    emailed: boolean;
  } | null>(null);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Meta Pixel: application form submitted — merchant lead captured.
    // content_name carries the business type for reporting.
    trackMerchantLead({ content_name: formData.businessType });

    // Email the application to the team via the Vercel /api function.
    // Fire-and-forget: the CRM intake below is the system of record and
    // this stays as the safety net.
    fetch('/api/leads/application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        hp_extra_field: honeypotValue(),
      }),
    }).catch(() => { /* non-blocking */ });

    // Create/match the CRM lead and mint a Plaid-hosted bank-connect link.
    try {
      const res = await serverFetch('/apply/intake', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          businessName: formData.businessName,
          phone: formData.phone,
          businessType: formData.businessType,
          hp_extra_field: honeypotValue(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok && json.hosted_link_url) {
        setConnectLink({
          url: String(json.hosted_link_url),
          expiration: json.expiration ?? null,
          emailed: Boolean(json.emailed),
        });
      } else {
        setConnectLink(null);
      }
    } catch {
      setConnectLink(null);
    }
    setSubmitting(false);
    setStep('connect');
  };

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
              Welcome to Delt, {formData.fullName}! We've received your application.
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
                className="flex-1 border-2 border-[#041E42] text-[#041E42] px-8 py-3 rounded-md font-semibold hover:bg-[#080A28] hover:text-white transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'connect') {
    const expiresText = connectLink?.expiration
      ? new Date(connectLink.expiration).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
      : null;
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-[#4945FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-[#4945FF]" />
            </div>
            <h1 className="text-2xl font-bold text-[#041E42] mb-4">
              Application received — one step left
            </h1>
            {connectLink ? (
              <>
                <p className="text-[#475569] mb-8">
                  Securely connect your business bank account through Plaid to verify your
                  business. It takes about two minutes.
                  {connectLink.emailed && (
                    <> We also emailed this link to <strong className="text-[#041E42]">{formData.email}</strong> so you can finish later from any device.</>
                  )}
                  {expiresText && <> The link is valid until {expiresText}.</>}
                </p>
                <a
                  href={connectLink.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackMerchantOnboarded()}
                  className="inline-block bg-[#4945FF] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#3933CC] transition-all"
                >
                  Connect your bank securely
                </a>
                <button
                  onClick={() => setStep('success')}
                  className="block mx-auto mt-4 text-[#475569] hover:text-[#041E42] text-sm"
                >
                  I'll do this later
                </button>
              </>
            ) : (
              <>
                <p className="text-[#475569] mb-8">
                  We've received your application. Our team will email your secure
                  bank-connection link to <strong className="text-[#041E42]">{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => setStep('success')}
                  className="bg-[#4945FF] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#3933CC] transition-all"
                >
                  Continue
                </button>
              </>
            )}
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
              Get Started with Delt
            </h1>
            <p className="text-lg text-[#475569]">
              Complete this quick application to start processing payments
            </p>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {honeypotField}
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
              <p className="text-xs text-[#475569] mb-2">By submitting, you acknowledge our <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#4945FF]">Privacy Policy</a> and agree to our <a href="#/terms" target="_blank" rel="noopener noreferrer" className="underline text-[#4945FF]">Terms of Service</a>.</p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4945FF] text-white py-4 rounded-lg font-semibold hover:bg-[#3933CC] transition-all text-lg disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Continue to Bank Verification'}
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

          {/* MERCHANT → CAPITAL value loop. Plant the seed at high intent. */}
          <div className="mt-8">
            <CapitalCrossSell variant="card" />
          </div>
        </div>
      </section>
    </div>
  );
}
