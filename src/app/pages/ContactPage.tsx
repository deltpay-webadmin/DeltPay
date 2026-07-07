import { MessageSquare, Phone, Mail, Clock, ArrowRight, Send, Users, Briefcase } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SupportChatbot } from '@/app/components/SupportChatbot';

type Tab = 'sales' | 'support';

export function ContactPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('support');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Determine initial tab from URL hash or path
  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash === 'sales' || location.pathname === '/contact-sales') {
      setActiveTab('sales');
    } else if (hash === 'support' || location.pathname === '/support') {
      setActiveTab('support');
    }
  }, [location]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    monthlyVolume: '',
    isMerchant: '',
    message: '',
  });

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const isMerchantRef = useRef<HTMLSelectElement>(null);
  const monthlyVolumeRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Email the contact lead to the team (fire-and-forget; UI unaffected).
    fetch('/api/leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact', ...formData, source: '/contact' }),
    }).catch(() => {});
    setFormSubmitted(true);
    // Clear every field so the form never re-shows the previous submission.
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      company: '', monthlyVolume: '', isMerchant: '', message: '',
    });
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (e.target.tagName === 'SELECT' && value) {
      if (name === 'isMerchant') monthlyVolumeRef.current?.focus();
      else if (name === 'monthlyVolume') messageRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<any>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const faqs = [
    {
      question: 'How long does it take to set up my account?',
      answer: 'You can set up your Delt account in just a few minutes. Once verified, you can start accepting payments immediately.',
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major credit and debit cards, contactless payments, mobile wallets (Apple Pay, Google Pay), and more.',
    },
    {
      question: 'Are there any setup fees or monthly fees?',
      answer: 'Our Essential plan is completely free with no setup fees or monthly fees. You only pay per transaction.',
    },
    {
      question: 'How quickly will I receive my funds?',
      answer: 'Standard deposits arrive in 1-2 business days. With instant payouts, you can get your money in seconds.',
    },
    {
      question: 'Can I use Delt for online and in-person payments?',
      answer: 'Yes! Delt works seamlessly for both online payments through our API and in-person payments with our hardware.',
    },
    {
      question: 'How do I contact support?',
      answer: "Our team is available Mon\u2013Fri 8 AM\u20138 PM EST and Saturday 9 AM\u20135 PM EST. Outside these hours, leave a message and we'll reply by the next business day.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-24 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#041E42] mb-6">
              We're here to <span className="text-[#4945FF]">help</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#475569] max-w-2xl mx-auto mb-10">
              Whether you need technical support or want to explore how Delt can grow your business, our team is ready.
            </p>

            {/* Tab Toggle */}
            <div className="inline-flex bg-white rounded-xl p-1.5 border border-[#E5E7EB] shadow-sm">
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-8 py-3 rounded-lg font-semibold text-base transition-all ${
                  activeTab === 'sales'
                    ? 'bg-[#4945FF] text-white shadow-md'
                    : 'text-[#475569] hover:text-[#041E42]'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-8 py-3 rounded-lg font-semibold text-base transition-all ${
                  activeTab === 'support'
                    ? 'bg-[#4945FF] text-white shadow-md'
                    : 'text-[#475569] hover:text-[#041E42]'
                }`}
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUPPORT TAB ==================== */}
      {activeTab === 'support' && (
        <>
          {/* Contact Methods */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                {/* Live Chat */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Live Chat</h3>
                  <p className="text-sm text-[#475569] mb-6 flex-grow leading-relaxed">
                    Chat with our support team during business hours.
                  </p>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold"
                  >
                    Start Chat <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Call Us */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Call Us</h3>
                  <p className="text-sm text-[#475569] mb-4 leading-relaxed">
                    Speak directly with a support specialist. We're here to help you resolve any issue.
                  </p>
                  <a
                    href="tel:+18647293358"
                    className="block text-center w-full py-2 text-[#4945FF] font-bold text-base hover:underline transition-all mb-2"
                  >
                    (864) 729-3358
                  </a>
                  <a href="tel:+18647293358" className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold mt-auto">
                    Call Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Email Us */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Email Us</h3>
                  <p className="text-sm text-[#475569] mb-4 leading-relaxed">
                    Send us a detailed message and we'll get back to you within 24 hours.
                  </p>
                  <a
                    href="mailto:support@delt.com"
                    className="block text-center w-full py-2 text-[#4945FF] font-bold text-base hover:underline transition-all mb-2"
                  >
                    support@delt.com
                  </a>
                  <a href="mailto:support@delt.com" className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold mt-auto">
                    Send Email <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Support Hours */}
          <section className="pb-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto bg-[#F6F7FB] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="w-6 h-6 text-[#041E42]" />
                  <h3 className="text-xl font-bold text-[#041E42]">Support Hours</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#041E42] font-semibold text-sm">Monday - Friday</span>
                    <span className="text-[#475569] text-sm">8:00 AM - 8:00 PM EST</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#041E42] font-semibold text-sm">Saturday</span>
                    <span className="text-[#475569] text-sm">9:00 AM - 5:00 PM EST</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#041E42] font-semibold text-sm">Sunday</span>
                    <span className="text-[#475569] text-sm">Closed</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 bg-[#4945FF] rounded-full animate-pulse"></div>
                    <span className="text-[#041E42] font-semibold text-sm">We're Online Now</span>
                  </div>
                  <p className="text-sm text-[#475569] pl-5">During business hours, average response under 2 minutes.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                {/* Left-aligned title like sister site */}
                <h2 className="text-[#041E42] mb-10" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: -0.5 }}>
                  FAQ<span className="text-[#4945FF]">.</span>
                </h2>

                {/* 2-column grid layout */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-0">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-[#041E42]/10">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full py-5 flex items-center justify-between text-left group"
                      >
                        <span className="text-[#041E42] pr-6" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{faq.question}</span>
                        <span
                          className={`text-xl text-[#4945FF]/60 flex-shrink-0 transition-transform ${
                            openFaqIndex === index ? 'rotate-45' : ''
                          }`}
                          style={{ fontWeight: 300 }}
                        >
                          +
                        </span>
                      </button>
                      {openFaqIndex === index && (
                        <div className="pb-5 pr-10">
                          <p className="text-[#041E42]/55 leading-relaxed" style={{ fontSize: '0.875rem' }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ==================== SALES TAB ==================== */}
      {activeTab === 'sales' && (
        <>
          {/* Contact Methods for Sales */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
                {/* Schedule a Call */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Schedule a Call</h3>
                  <p className="text-sm text-[#475569] mb-4 leading-relaxed flex-grow">
                    We'll call you within one business day to discuss your needs.
                  </p>
                  <p className="text-xs text-[#94A3B8] mb-4">Monday - Friday: 9am - 6pm ET</p>
                  <button onClick={() => navigate('/contact-sales')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold">
                    Request a Call <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Book a Demo */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Book a Demo</h3>
                  <p className="text-sm text-[#475569] mb-4 leading-relaxed flex-grow">
                    See Delt in action with a personalized walkthrough of our platform.
                  </p>
                  <p className="text-xs text-[#94A3B8] mb-4">30-minute sessions available</p>
                  <button onClick={() => navigate('/contact-sales')} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold">
                    Schedule Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Email Sales */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Email Sales</h3>
                  <p className="text-sm text-[#475569] mb-4 leading-relaxed flex-grow">
                    Get expert guidance to find the right solution for your business.
                  </p>
                  <a
                    href="mailto:sales@delt.com"
                    className="block text-center w-full py-2 text-[#4945FF] font-bold text-base hover:underline transition-all mb-2"
                  >
                    sales@delt.com
                  </a>
                  <a href="mailto:support@delt.com" className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold mt-auto">
                    Send Email <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Sales Contact Form */}
          <section className="py-20 bg-[#F6F7FB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Left Column */}
                <div>
                  <h2 className="text-3xl font-bold text-[#041E42] mb-3">Let's grow your business together</h2>
                  <p className="text-[#475569] mb-10 leading-relaxed">
                    Connect with our team to explore how Delt can help you accept payments, manage your business, and increase revenue.
                  </p>

                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#041E42] mb-1">Careers</h3>
                        <p className="text-sm text-[#475569]">
                          Join our team and help us build the future of payments
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#041E42] mb-1">Partner with Delt</h3>
                        <p className="text-sm text-[#475569]">
                          Become a partner and help businesses accept payments
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact */}
                  <div className="mt-12 p-6 bg-white rounded-xl border border-[#E5E7EB]">
                    <h4 className="font-semibold text-[#041E42] mb-4">Direct contact</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#4945FF]" />
                        <span className="text-[#475569]">1-800-DELT-PAY</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Send className="w-4 h-4 text-[#4945FF]" />
                        <span className="text-[#475569]">sales@delt.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg border border-[#E5E7EB]">
                  <h3 className="text-2xl font-bold text-[#041E42] mb-6">Get in touch</h3>

                  {formSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-[#4945FF]/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-[#4945FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-[#041E42] mb-2">Thank you!</h4>
                      <p className="text-[#475569]">We'll be in touch within one business day.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" onChange={handleChange} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#041E42] mb-2">First Name</label>
                          <input
                            ref={firstNameRef}
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onKeyPress={(e) => handleKeyPress(e, lastNameRef)}
                            placeholder="John"
                            required
                            className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#041E42] mb-2">Last Name</label>
                          <input
                            ref={lastNameRef}
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            onKeyPress={(e) => handleKeyPress(e, emailRef)}
                            placeholder="Doe"
                            required
                            className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">Email address</label>
                        <input
                          ref={emailRef}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onKeyPress={(e) => handleKeyPress(e, phoneRef)}
                          placeholder="john@company.com"
                          required
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">Phone number</label>
                        <input
                          ref={phoneRef}
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onKeyPress={(e) => handleKeyPress(e, companyRef)}
                          placeholder="(555) 123-4567"
                          required
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">Company name</label>
                        <input
                          ref={companyRef}
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          onKeyPress={(e) => handleKeyPress(e, isMerchantRef)}
                          placeholder="Acme Inc."
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">
                          Are you currently accepting payments?
                        </label>
                        <select
                          ref={isMerchantRef}
                          name="isMerchant"
                          value={formData.isMerchant}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        >
                          <option value="">Select an option</option>
                          <option value="yes">Yes, I'm currently processing payments</option>
                          <option value="no">No, I'm just getting started</option>
                          <option value="exploring">I'm exploring my options</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">
                          Monthly processing volume
                        </label>
                        <select
                          ref={monthlyVolumeRef}
                          name="monthlyVolume"
                          value={formData.monthlyVolume}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        >
                          <option value="">Select volume range</option>
                          <option value="0-10k">$0 - $10,000</option>
                          <option value="10k-50k">$10,000 - $50,000</option>
                          <option value="50k-100k">$50,000 - $100,000</option>
                          <option value="100k-250k">$100,000 - $250,000</option>
                          <option value="250k+">$250,000+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#041E42] mb-2">
                          How can we help? (optional)
                        </label>
                        <textarea
                          ref={messageRef}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your business needs..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#041E42] placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-6 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] hover:shadow-lg transition-all font-semibold text-lg"
                      >
                        Submit
                      </button>

                      <p className="text-xs text-center text-[#94A3B8]">
                        By submitting this form, you agree to our privacy policy and terms of service
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Trust Section (shared) */}
      <section className="py-20 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#041E42] mb-4">
              Trusted by businesses everywhere
            </h2>
            <p className="text-lg text-[#475569] mb-12">
              Join thousands of businesses that rely on Delt for payments and support.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#4945FF] mb-2">5K+</div>
                <div className="text-sm text-[#475569]">Businesses served</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#4945FF] mb-2">99.6%</div>
                <div className="text-sm text-[#475569]">Uptime</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#4945FF] mb-2">Mon-Sat</div>
                <div className="text-sm text-[#475569]">Support available</div>
                <div className="text-xs text-[#475569] mt-1">During business hours, average response under 2 minutes.</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#4945FF] mb-2">$1B+</div>
                <div className="text-sm text-[#475569]">Processed annually</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <SupportChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}