import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Building2, Mail, Phone, User } from 'lucide-react';
import { CapitalCrossSell } from '../components/CapitalCrossSell';
import { trackMerchantLead } from '@/lib/pixel';
import { selfStartApplication, tierForVolumeLabel } from '@/app/lib/selfStart';

const VOLUME_OPTIONS = [
  { value: 'Under $10k', label: 'Under $10k / month' },
  { value: '$10k – $50k', label: '$10k – $50k / month' },
  { value: '$50k – $250k', label: '$50k – $250k / month' },
  { value: '$250k – $1M', label: '$250k – $1M / month' },
  { value: '$1M+', label: '$1M+ / month' },
];

export function ApplicationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    businessType: 'llc',
    monthlyVolume: 'Under $10k',
  });
  const [selfServeStatus, setSelfServeStatus] = useState<'none' | 'loading' | 'ready' | 'failed'>('none');
  const [selfServePath, setSelfServePath] = useState<string | null>(null);

  const selfServeTier = tierForVolumeLabel(formData.monthlyVolume);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Meta Pixel: application form submitted — merchant lead captured.
    trackMerchantLead({ content_name: formData.businessType });

    // Email the application to the team via the Vercel /api function.
    // Fire-and-forget so the success screen shows without waiting on delivery.
    fetch('/api/leads/application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        monthlyVolume: formData.monthlyVolume,
      }),
    }).catch(() => { /* non-blocking */ });

    // Lower-volume merchants open the real MPA application immediately;
    // identity and banking are collected securely inside that wizard.
    if (selfServeTier) {
      setSelfServeStatus('loading');
      selfStartApplication({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        business: formData.businessName,
        volume: selfServeTier,
      }).then(res => {
        if (res.ok && res.path) {
          setSelfServePath(res.path);
          setSelfServeStatus('ready');
        } else {
          setSelfServeStatus('failed');
        }
      });
    }
    setStep('success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (step === 'success') {
    const selfServe = selfServeTier !== null;
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-[#4945FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#4945FF]" />
            </div>
            <h1 className="text-3xl font-bold text-[#041E42] mb-4">
              {selfServe ? 'One step left — your application' : 'Thanks — we received your details'}
            </h1>
            <p className="text-lg text-[#475569] mb-8">
              {selfServe ? (
                <>Finish your merchant application now, {formData.fullName.split(' ')[0]} — it takes about 10 minutes
                and saves as you go. We also emailed the secure link to {formData.email}.</>
              ) : (
                <>Our team will review your volume and reach out to {formData.email} within 1 business day
                with a tailored setup.</>
              )}
            </p>
            {selfServe && selfServeStatus !== 'failed' && (
              <button
                onClick={() => selfServePath && navigate(selfServePath)}
                disabled={selfServeStatus !== 'ready'}
                className="w-full bg-[#4945FF] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#3933CC] transition-all text-lg disabled:opacity-60 mb-6 inline-flex items-center justify-center gap-2"
              >
                {selfServeStatus === 'ready' ? 'Start my application' : 'Preparing your secure application…'}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            {selfServeStatus === 'failed' && (
              <p className="text-sm text-[#475569] mb-6">
                We couldn't open the application here, so we'll email you a secure link shortly.
              </p>
            )}
            <div className="bg-[#F6F7FB] rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#041E42] mb-4">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    {selfServe
                      ? 'Complete the application — identity and banking are collected securely there'
                      : 'A payments specialist reviews your volume and pricing fit'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    Underwriting decision within 1 business day of a complete application
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#475569]">
                    Your Delt Reader ships once approved — start processing the day it lands
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
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

              {/* Monthly Volume */}
              <div>
                <label htmlFor="monthlyVolume" className="block text-sm font-semibold text-[#041E42] mb-2">
                  Monthly Card Volume *
                </label>
                <select
                  id="monthlyVolume"
                  name="monthlyVolume"
                  required
                  value={formData.monthlyVolume}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#4945FF] focus:outline-none transition-colors"
                >
                  {VOLUME_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-[#F6F7FB] rounded-lg p-4 border-l-4 border-[#4945FF]">
                <p className="text-sm text-[#475569]">
                  <strong className="text-[#041E42]">Next step:</strong> After submitting this form,
                  you'll open your secure merchant application — identity and banking details are
                  collected there, and your progress saves as you go.
                </p>
              </div>

              {/* Privacy consent */}
              <p className="text-xs text-[#475569] mb-2">By submitting, you acknowledge our <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#4945FF]">Privacy Policy</a> and agree to our <a href="#/terms" target="_blank" rel="noopener noreferrer" className="underline text-[#4945FF]">Terms of Service</a>.</p>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#4945FF] text-white py-4 rounded-lg font-semibold hover:bg-[#3933CC] transition-all text-lg"
              >
                Continue
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
