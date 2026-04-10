import { useState, useRef } from 'react';
import { Phone, MessageCircle, Users, Briefcase, Book, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function ContactSalesPage() {
  const navigate = useNavigate();
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

  // Refs for all form fields
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
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-advance logic
    if (e.target.tagName === 'SELECT' && value) {
      // For dropdowns, move to next field immediately when selected
      if (name === 'isMerchant') {
        monthlyVolumeRef.current?.focus();
      } else if (name === 'monthlyVolume') {
        messageRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<any>) => {
    // Move to next field on Enter key
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-[#F0F4FF] via-white to-[#E8ECFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#041E42] mb-6">
              Let's grow your <span className="text-[#4945FF]">business</span> together
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Connect with our sales team to explore how Delt can help you accept payments, manage your business, and increase revenue.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 bg-gradient-to-br from-[#F0F4FF] via-white to-[#E8ECFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Phone Contact */}
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#4945FF]/10 hover:border-[#4945FF]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4945FF] to-[#6366F1] rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform shadow-lg">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#041E42] mb-3">
                Schedule a call
              </h3>
              <p className="text-[#6B7280] mb-2">
                We'll call you within one business day
              </p>
              <p className="text-sm text-[#94A3B8] mb-4">
                Monday - Friday: 9am - 6pm ET
              </p>
              <button className="text-[#4945FF] font-semibold hover:underline">
                Request a call →
              </button>
            </div>

            {/* Live Demo */}
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#10B981]/10 hover:border-[#10B981]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#041E42] mb-3">
                Book a demo
              </h3>
              <p className="text-[#6B7280] mb-2">
                See Delt in action with a personalized walkthrough
              </p>
              <p className="text-sm text-[#94A3B8] mb-4">
                30-minute sessions available
              </p>
              <button className="text-[#10B981] font-semibold hover:underline">
                Schedule demo →
              </button>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#F59E0B]/10 hover:border-[#F59E0B]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform shadow-lg">
                <Book className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#041E42] mb-3">
                Explore resources
              </h3>
              <p className="text-[#6B7280] mb-2">
                Comprehensive guides and documentation
              </p>
              <p className="text-sm text-[#94A3B8] mb-4">
                Get started on your own
              </p>
              <button className="text-[#F59E0B] font-semibold hover:underline">
                View docs →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="py-20 bg-gradient-to-br from-[#F0F4FF] via-white to-[#E8ECFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Column - Additional Options */}
            <div>
              <h2 className="text-3xl font-bold text-[#041E42] mb-8">
                Looking for something else?
              </h2>

              {/* Careers */}
              <div className="mb-8 flex gap-4">
                <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#041E42] mb-2">
                    Careers
                  </h3>
                  <p className="text-[#6B7280]">
                    Join our team and help us build the future of payments
                  </p>
                </div>
              </div>

              {/* Partner Program */}
              <div className="mb-8 flex gap-4">
                <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#041E42] mb-2">
                    Partner with Delt
                  </h3>
                  <p className="text-[#6B7280]">
                    Become a partner and help businesses accept payments
                  </p>
                </div>
              </div>

              {/* Sales Inquiry */}
              <div className="mb-8 flex gap-4">
                <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#041E42] mb-2">
                    Sales team
                  </h3>
                  <p className="text-[#6B7280]">
                    Get expert guidance to find the right solution for your business
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-12 p-6 bg-white rounded-xl border border-[#E5E7EB]">
                <h4 className="font-semibold text-[#041E42] mb-4">Direct contact</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#4945FF]" />
                    <span className="text-[#6B7280]">1-800-DELT-PAY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-[#4945FF]" />
                    <span className="text-[#6B7280]">sales@delt.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-gradient-to-br from-[#F6F7FB] to-white rounded-2xl p-8 lg:p-10 shadow-lg border border-[#E5E7EB]">
              <h3 className="text-2xl font-bold text-[#041E42] mb-6">
                Get in touch
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#041E42] mb-2">
                      First Name
                    </label>
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
                    <label className="block text-sm font-medium text-[#041E42] mb-2">
                      Last Name
                    </label>
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">
                    Email address
                  </label>
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">
                    Phone number
                  </label>
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

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">
                    Company name
                  </label>
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

                {/* Are you a merchant */}
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

                {/* Monthly Volume */}
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

                {/* Message */}
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

                {/* Submit Button */}
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
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#041E42] mb-6">
              Trusted by businesses everywhere
            </h2>
            <p className="text-lg text-[#6B7280] mb-12">
              Join thousands of businesses that have switched to Delt for better rates, transparent pricing, and exceptional support.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-[#4945FF] mb-2">5K+</div>
                <div className="text-sm text-[#6B7280]">Businesses served</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#4945FF] mb-2">99.6%</div>
                <div className="text-sm text-[#6B7280]">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#4945FF] mb-2">24/7</div>
                <div className="text-sm text-[#6B7280]">Support</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#4945FF] mb-2">$1B+</div>
                <div className="text-sm text-[#6B7280]">Processed annually</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
