import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { trackMerchantLead } from '@/lib/pixel';
import { ArrowRight, Building2, User, DollarSign, CheckCircle2, ChevronDown } from 'lucide-react';
import logoWhite from 'figma:asset/419e83442bb1bf5965a966a8870b00dd4288dd57.png';
import stripeImage from 'figma:asset/6fe13f3e665435400e65aa6b6be0f4302bd8aac1.png';

const ACCENT = '#4945FF';
const TEXT_DARK = '#041E42';
const TEXT_GRAY = '#475569';
const BORDER = '#E3E8EE';
const SUCCESS = '#4945FF';

const BUSINESS_TYPES = [
  'Individual / Sole proprietor',
  'Company',
  'Non-profit',
  'Partnership',
];

const INDUSTRIES = [
  'Retail',
  'Restaurant / Food & beverage',
  'E-commerce',
  'Professional services',
  'Healthcare',
  'Software / Technology',
  'Education',
  'Other',
];

const MONTHLY_VOLUMES = [
  'Less than $10k',
  '$10k - $50k',
  '$50k - $250k',
  '$250k - $1M',
  'More than $1M',
];

export function SignUpPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
  const [industry, setIndustry] = useState('');
  const [industryOpen, setIndustryOpen] = useState(false);
  const [website, setWebsite] = useState('');

  // Step 2: Contact Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Processing Details
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [averageTicket, setAverageTicket] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const steps = [
    { number: 1, title: 'Business details' },
    { number: 2, title: 'Contact information' },
    { number: 3, title: 'Processing information' },
  ];

  const canProceedStep1 = businessName.length > 0 && businessType.length > 0 && industry.length > 0;
  const canProceedStep2 = firstName.length > 0 && lastName.length > 0 && email.includes('@') && phone.length >= 10;
  const canProceedStep3 = monthlyVolume.length > 0 && averageTicket.length > 0 && businessDescription.length > 0;

  const handleNext = () => {
    if (currentStep === 1 && canProceedStep1) setCurrentStep(2);
    else if (currentStep === 2 && canProceedStep2) setCurrentStep(3);
    else if (currentStep === 3 && canProceedStep3) {
      // Meta Pixel: signup completed — fires when the user clears the
      // final step, i.e. the same success gate as the UI's "submitted"
      // state. Category tags this as a signup lead (vs. quote / cart).
      trackMerchantLead({
        content_name: `${industry || 'unknown'}/${monthlyVolume || 'unknown'}`,
        content_category: 'merchant_signup',
      });
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <button onClick={() => navigate('/')} className="cursor-pointer mb-8">
            <img src={logoWhite} alt="Delt" className="h-10 object-contain brightness-0" />
          </button>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#00D924]/10">
              <CheckCircle2 size={32} className="text-[#00D924]" />
            </div>
            <h2 className="text-3xl font-semibold mb-3" style={{ color: TEXT_DARK }}>
              Application received
            </h2>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: TEXT_GRAY }}>
              We'll review your information and get back to you within 1-2 business days.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-md font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: ACCENT, color: 'white' }}
            >
              Return to home
            </button>
          </motion.div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, idx) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          currentStep === step.number
                            ? 'text-white'
                            : currentStep > step.number
                            ? 'text-white'
                            : 'text-[#8A94A6] bg-[#F6F9FC]'
                        }`}
                        style={
                          currentStep >= step.number
                            ? { backgroundColor: ACCENT }
                            : {}
                        }
                      >
                        {currentStep > step.number ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          currentStep === step.number
                            ? 'text-[#0A2540]'
                            : 'text-[#8A94A6]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className="flex-1 h-[2px] mx-4"
                        style={{
                          backgroundColor:
                            currentStep > step.number ? ACCENT : '#E3E8EE',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div>
              <AnimatePresence mode="wait">
                {/* Step 1: Business Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-semibold mb-2" style={{ color: TEXT_DARK }}>
                        Get started with Delt
                      </h1>
                    {/* Step 1 */}
                      <p className="text-base" style={{ color: TEXT_GRAY }}>
                        Complete this quick application to start processing payments
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Legal business name
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={e => setBusinessName(e.target.value)}
                          placeholder="Acme Inc."
                          className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                          style={{
                            borderColor: BORDER,
                            color: TEXT_DARK,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = BORDER;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Business type
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setBusinessTypeOpen(!businessTypeOpen)}
                            className="w-full px-3 py-2.5 rounded-md text-sm border text-left flex items-center justify-between cursor-pointer transition-colors"
                            style={{
                              borderColor: BORDER,
                              color: businessType ? TEXT_DARK : TEXT_GRAY,
                            }}
                          >
                            <span>{businessType || 'Select business type'}</span>
                            <ChevronDown size={16} className="text-[#8A94A6]" />
                          </button>
                          {businessTypeOpen && (
                            <div
                              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 py-1"
                              style={{ borderColor: BORDER }}
                            >
                              {BUSINESS_TYPES.map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setBusinessType(type);
                                    setBusinessTypeOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F6F9FC] transition-colors cursor-pointer"
                                  style={{ color: TEXT_DARK }}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Industry
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIndustryOpen(!industryOpen)}
                            className="w-full px-3 py-2.5 rounded-md text-sm border text-left flex items-center justify-between cursor-pointer transition-colors"
                            style={{
                              borderColor: BORDER,
                              color: industry ? TEXT_DARK : TEXT_GRAY,
                            }}
                          >
                            <span>{industry || 'Select industry'}</span>
                            <ChevronDown size={16} className="text-[#8A94A6]" />
                          </button>
                          {industryOpen && (
                            <div
                              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
                              style={{ borderColor: BORDER }}
                            >
                              {INDUSTRIES.map(ind => (
                                <button
                                  key={ind}
                                  type="button"
                                  onClick={() => {
                                    setIndustry(ind);
                                    setIndustryOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F6F9FC] transition-colors cursor-pointer"
                                  style={{ color: TEXT_DARK }}
                                >
                                  {ind}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Website <span className="font-normal text-[#8A94A6]">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={website}
                          onChange={e => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                          style={{
                            borderColor: BORDER,
                            color: TEXT_DARK,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = BORDER;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Contact Information */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-semibold mb-2" style={{ color: TEXT_DARK }}>
                        Contact information
                      </h2>
                      <p className="text-base" style={{ color: TEXT_GRAY }}>
                        Who should we contact about this account?
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                            First name
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="Jane"
                            className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                            style={{
                              borderColor: BORDER,
                              color: TEXT_DARK,
                            }}
                            onFocus={e => {
                              e.currentTarget.style.borderColor = ACCENT;
                              e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                            }}
                            onBlur={e => {
                              e.currentTarget.style.borderColor = BORDER;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                            Last name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Doe"
                            className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                            style={{
                              borderColor: BORDER,
                              color: TEXT_DARK,
                            }}
                            onFocus={e => {
                              e.currentTarget.style.borderColor = ACCENT;
                              e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                            }}
                            onBlur={e => {
                              e.currentTarget.style.borderColor = BORDER;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Email address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                          style={{
                            borderColor: BORDER,
                            color: TEXT_DARK,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = BORDER;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Phone number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e =>
                            setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))
                          }
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                          style={{
                            borderColor: BORDER,
                            color: TEXT_DARK,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = BORDER;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Processing Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-semibold mb-2" style={{ color: TEXT_DARK }}>
                        Processing information
                      </h2>
                      <p className="text-base" style={{ color: TEXT_GRAY }}>
                        Help us understand your payment needs
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Expected monthly processing volume
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setVolumeOpen(!volumeOpen)}
                            className="w-full px-3 py-2.5 rounded-md text-sm border text-left flex items-center justify-between cursor-pointer transition-colors"
                            style={{
                              borderColor: BORDER,
                              color: monthlyVolume ? TEXT_DARK : TEXT_GRAY,
                            }}
                          >
                            <span>{monthlyVolume || 'Select volume range'}</span>
                            <ChevronDown size={16} className="text-[#8A94A6]" />
                          </button>
                          {volumeOpen && (
                            <div
                              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 py-1"
                              style={{ borderColor: BORDER }}
                            >
                              {MONTHLY_VOLUMES.map(vol => (
                                <button
                                  key={vol}
                                  type="button"
                                  onClick={() => {
                                    setMonthlyVolume(vol);
                                    setVolumeOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F6F9FC] transition-colors cursor-pointer"
                                  style={{ color: TEXT_DARK }}
                                >
                                  {vol}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Average transaction size
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                            style={{ color: TEXT_GRAY }}
                          >
                            $
                          </span>
                          <input
                            type="text"
                            value={averageTicket}
                            onChange={e =>
                              setAverageTicket(e.target.value.replace(/[^0-9.]/g, ''))
                            }
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none"
                            style={{
                              borderColor: BORDER,
                              color: TEXT_DARK,
                            }}
                            onFocus={e => {
                              e.currentTarget.style.borderColor = ACCENT;
                              e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                            }}
                            onBlur={e => {
                              e.currentTarget.style.borderColor = BORDER;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>
                          Business description
                        </label>
                        <textarea
                          value={businessDescription}
                          onChange={e => setBusinessDescription(e.target.value)}
                          placeholder="Briefly describe what your business does and what you'll be selling..."
                          rows={4}
                          className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none resize-none"
                          style={{
                            borderColor: BORDER,
                            color: TEXT_DARK,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = BORDER;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep === 3 && (
                <p className="text-xs text-[#475569] mb-4 mt-6">By submitting, you acknowledge our <Link to="/privacy" className="underline text-[#4945FF]">Privacy Policy</Link> and agree to our <Link to="/terms" className="underline text-[#4945FF]">Terms of Service</Link>.</p>
              )}
              <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: BORDER }}>
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'opacity-0 pointer-events-none'
                      : 'hover:bg-[#F6F9FC]'
                  }`}
                  style={{ color: TEXT_DARK }}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="px-6 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: ACCENT,
                    color: 'white',
                  }}
                >
                  {currentStep === 3 ? 'Submit application' : 'Continue'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
