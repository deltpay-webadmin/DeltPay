import { MessageSquare, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { SupportChatbot } from '@/app/components/SupportChatbot';

export function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const faqs = [
    {
      question: 'How long does it take to set up my account?',
      answer: 'You can set up your Delt account in just a few minutes. Once verified, you can start accepting payments immediately.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major credit and debit cards, contactless payments, mobile wallets (Apple Pay, Google Pay), and more.'
    },
    {
      question: 'Are there any setup fees or monthly fees?',
      answer: 'Our Essential plan is completely free with no setup fees or monthly fees. You only pay per transaction.'
    },
    {
      question: 'How quickly will I receive my funds?',
      answer: 'Standard deposits arrive in 1-2 business days. With instant payouts, you can get your money in seconds.'
    },
    {
      question: 'Can I use Delt for online and in-person payments?',
      answer: 'Yes! Delt works seamlessly for both online payments through our API and in-person payments with our hardware.'
    },
    {
      question: 'How do I contact support?',
      answer: 'Our team is available Mon\u2013Fri 8 AM\u20138 PM EST and Saturday 9 AM\u20135 PM EST. Outside these hours, leave a message and we\'ll reply by the next business day.'
    }
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
            <p className="text-lg sm:text-xl text-[#475569] max-w-2xl mx-auto">
              Get technical support from our dedicated team. We're available to answer your questions and resolve any issues.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Live Chat */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-[#4945FF]" />
              </div>
              <h3 className="text-lg font-bold text-[#041E42] mb-3">Live Chat</h3>
              <p className="text-sm text-[#475569] mb-6 flex-grow leading-relaxed">
                Chat with our support team. Get fast answers during business hours.
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold mt-auto">
                Call Now <ArrowRight className="w-4 h-4" />
              </button>
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold mt-auto">
                Send Email <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="pb-20 bg-[#F6F7FB]">
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
              <p className="text-sm text-[#475569] pl-5">During business hours: average response under 2 minutes. Outside hours, we'll reply by next business day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F6F7FB]">
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

      {/* Trust Section */}
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
                <div className="text-4xl sm:text-5xl font-bold text-[#4945FF] mb-2">Mon–Sat</div>
                <div className="text-sm text-[#475569]">Support hours</div>
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