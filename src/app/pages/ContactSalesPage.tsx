import { useState, useRef } from 'react';
import { Phone, MessageCircle, Users, Briefcase, Book, ArrowLeft, Mail, Check, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProductCrossSell } from '../components/ProductCrossSell';

function SuccessPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[#4945FF]/10 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-[#4945FF]" />
      </div>
      <h3 className="text-2xl font-bold text-[#041E42] mb-3">Thanks — we'll be in touch within 1 business day.</h3>
      <p className="text-[#475569] max-w-sm">A Delt specialist will reach out to the email you provided.</p>
    </div>
  );
}

export function ContactSalesPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    monthlyVolume: '',
    isMerchant: '',
    message: ''
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
    setSubmitted(true);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — navy on-palette */}
      <section className="relative overflow-hidden bg-[#041E42] text-white">
        {/* Glow accent */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#4945FF]/25 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#4945FF]/15 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-14 lg:pb-28">
          <button
            onClick={() => navigate(-1)}
            className="mb-10 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/80 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#4945FF]" />
              Talk to sales
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Let's grow your business <span className="text-[#4945FF]">together.</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              Chat with a specialist to size up Delt for your business. No hard sell — just
              honest answers, real pricing, and a clear path to go live.
            </p>
          </div>
        </div>
      </section>

      {/* Three ways to connect — on-palette cards */}
      <section className="relative bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Schedule a call */}
            <div className="group bg-white rounded-2xl p-8 border border-[#041E42]/10 hover:border-[#4945FF]/40 hover:shadow-[0_24px_60px_-24px_rgba(73,69,255,0.35)] transition-all duration-300">
              <div className="w-14 h-14 bg-[#041E42] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4945FF] transition-colors">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#041E42] mb-2">Schedule a call</h3>
              <p className="text-[#475569] mb-4">We'll call you back within one business day.</p>
              <p className="text-sm text-[#94A3B8] mb-6">Mon–Fri · 9am–6pm ET</p>
              <button className="inline-flex items-center gap-2 text-[#4945FF] font-semibold hover:gap-3 transition-all">
                Request a call <span aria-hidden>→</span>
              </button>
            </div>

            {/* Book a demo */}
            <div className="group bg-[#041E42] rounded-2xl p-8 text-white border border-[#041E42] hover:shadow-[0_24px_60px_-24px_rgba(4,30,66,0.6)] transition-all duration-300">
              <div className="w-14 h-14 bg-[#4945FF] rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Book a demo</h3>
              <p className="text-white/70 mb-4">See Delt in a 30-minute personalized walkthrough.</p>
              <p className="text-sm text-white/50 mb-6">Flexible times, same or next day.</p>
              <button className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all">
                Schedule demo <span aria-hidden>→</span>
              </button>
            </div>

            {/* Resources */}
            <div className="group bg-white rounded-2xl p-8 border border-[#041E42]/10 hover:border-[#4945FF]/40 hover:shadow-[0_24px_60px_-24px_rgba(73,69,255,0.35)] transition-all duration-300">
              <div className="w-14 h-14 bg-[#041E42] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4945FF] transition-colors">
                <Book className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#041E42] mb-2">Explore the docs</h3>
              <p className="text-[#475569] mb-4">Browse guides, API references, and playbooks.</p>
              <p className="text-sm text-[#94A3B8] mb-6">Built for operators and builders.</p>
              <button className="inline-flex items-center gap-2 text-[#4945FF] font-semibold hover:gap-3 transition-all">
                View docs <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Form + side panel */}
      <section className="py-20 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 max-w-6xl mx-auto">
            {/* Left — what to expect + direct contact */}
            <div>
              <div className="text-sm font-semibold text-[#4945FF] uppercase tracking-wider mb-3">
                What to expect
              </div>
              <h2 className="text-4xl font-bold text-[#041E42] mb-6 leading-tight">
                A short call.<br />A real answer.
              </h2>
              <p className="text-lg text-[#475569] mb-10">
                Tell us a little about your business and we'll show you exactly what Delt will cost,
                how fast you can go live, and where you'll save money.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'Transparent pricing — no surprise fees',
                  'Go live in less than a day',
                  'Dedicated specialist for your industry',
                  'Cancel anytime, no long-term contracts',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4945FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#4945FF]" strokeWidth={3} />
                    </div>
                    <span className="text-[#041E42]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Direct contact */}
              <div className="rounded-2xl border border-[#041E42]/10 bg-white p-6">
                <div className="text-xs font-semibold text-[#4945FF] uppercase tracking-wider mb-4">
                  Direct contact
                </div>
                <div className="space-y-3">
                  <a href="tel:1-800-335-8729" className="flex items-center gap-3 text-[#041E42] hover:text-[#4945FF] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#041E42]/5 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-[#4945FF]" />
                    </div>
                    <span className="font-medium">1-800-DELT-PAY</span>
                  </a>
                  <a href="mailto:sales@delt.com" className="flex items-center gap-3 text-[#041E42] hover:text-[#4945FF] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#041E42]/5 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-[#4945FF]" />
                    </div>
                    <span className="font-medium">sales@delt.com</span>
                  </a>
                </div>
              </div>

              {/* More options */}
              <div className="mt-10 space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#041E42]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#041E42]">Careers</h4>
                    <p className="text-sm text-[#475569]">Join the team building the future of payments.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#041E42]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#041E42]">Partner with Delt</h4>
                    <p className="text-sm text-[#475569]">Agencies, ISOs, and referral partners welcome.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-[0_24px_60px_-24px_rgba(4,30,66,0.18)] border border-[#041E42]/8">
              <h3 className="text-2xl font-bold text-[#041E42] mb-2">Get in touch</h3>
              <p className="text-[#475569] mb-8">A specialist will reach out within one business day.</p>

              {submitted ? <SuccessPanel /> : <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
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
                      className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">Work email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, phoneRef)}
                    placeholder="john@company.com"
                    required
                    className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#041E42] mb-2">Phone</label>
                    <input
                      ref={phoneRef}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, companyRef)}
                      placeholder="(555) 123-4567"
                      required
                      className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#041E42] mb-2">Company</label>
                    <input
                      ref={companyRef}
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, isMerchantRef)}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                    />
                  </div>
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
                    className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes, currently processing</option>
                    <option value="no">No, just getting started</option>
                    <option value="exploring">Exploring options</option>
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
                    className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all"
                  >
                    <option value="">Select a range</option>
                    <option value="0-10k">$0 – $10,000</option>
                    <option value="10k-50k">$10,000 – $50,000</option>
                    <option value="50k-100k">$50,000 – $100,000</option>
                    <option value="100k-250k">$100,000 – $250,000</option>
                    <option value="250k+">$250,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">
                    How can we help? <span className="text-[#94A3B8] font-normal">(optional)</span>
                  </label>
                  <textarea
                    ref={messageRef}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your business…"
                    rows={4}
                    className="w-full px-4 py-3 bg-[#F6F7FB] border border-[#041E42]/10 rounded-lg text-[#041E42] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/10 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3933CC] hover:shadow-[0_16px_40px_-12px_rgba(73,69,255,0.6)] transition-all font-semibold text-lg"
                >
                  Submit
                </button>

                <p className="text-xs text-center text-[#94A3B8]">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>}
            </div>
          </div>
        </div>
      </section>

      {/* Honest trust stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Built for operators, not spreadsheets</h2>
            <p className="text-lg text-[#475569]">
              We're a young company with a straightforward promise: fair pricing, fast setup, and
              humans who actually answer the phone.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { big: '<1 Day', small: 'Go live', sub: 'Speed' },
              { big: '$847', small: 'Avg. monthly savings', sub: 'Savings' },
              { big: '$50M', small: 'Capital deployed', sub: 'Scale' },
              { big: '97%', small: 'Merchant retention', sub: 'Reliability' },
            ].map((s) => (
              <div key={s.small} className="text-center">
                <div className="text-5xl font-bold text-[#4945FF] mb-2">{s.big}</div>
                <div className="text-[#041E42] font-semibold">{s.small}</div>
                <div className="text-xs text-[#94A3B8] uppercase tracking-wider mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell at bottom for continuity */}
      <ProductCrossSell
        eyebrow="Explore the platform"
        title="Everything you need to run your business"
        subtitle="Payments, capital, websites, and AI — all under one roof."
      />
    </div>
  );
}
