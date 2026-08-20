import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal, StaggerChildren, staggerItemVariants } from './MicroInteractions';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Why should I choose Delt?",
    answer: "Delt offers transparent pricing with a full fee schedule disclosed upfront, competitive processing rates, and dedicated customer support during business hours. We provide everything you need to accept payments and grow your business, from hardware to software."
  },
  {
    question: "Are there any contracts or hidden fees?",
    answer: "No long-term contracts, and a full fee schedule disclosed before you accept any offer. You only pay the transparent processing rates shown on our pricing page. Cancel anytime with no penalties."
  },
  {
    question: "Who is Delt for?",
    answer: "Delt is designed for businesses of all sizes - from solo entrepreneurs and small businesses to large enterprises. Whether you're just starting out or scaling up, our solutions grow with you."
  },
  {
    question: "How long do funds take to be deposited?",
    answer: "Funds are typically deposited into your bank account within 1-2 business days. For high-volume businesses, we offer next-day deposit options."
  },
  {
    question: "Is there a monthly fee?",
    answer: "Our Essential plan has no monthly fee. Growth and Pro plans have monthly subscription fees that unlock advanced features like AI-powered analytics and priority support."
  },
  {
    question: "How long should I wait to get my payment hardware?",
    answer: "Free card readers ship within 2-3 business days via standard shipping. Expedited shipping options are available at checkout if you need your hardware sooner."
  },
  {
    question: "What type of funding options does Delt offer?",
    answer: "Delt Capital offers revenue-based financing sized to your card sales. Offers are subject to underwriting — once approved, use funds for inventory, equipment, or growth initiatives."
  },
  {
    question: "How much are the processing rates?",
    answer: "Our transparent pricing starts at 2.6% + $0.10 per transaction for in-person payments and 2.9% + $0.30 for online payments. Volume discounts are available for high-volume merchants."
  },
  {
    question: "Do I need to change banks?",
    answer: "No, you can use your existing bank account. Delt works with all major banks and credit unions in the US."
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Yes! If you process over $100,000 per month, contact our sales team for custom pricing and volume discounts tailored to your business."
  },
  {
    question: "How does signing up work?",
    answer: "Signing up takes just minutes. Create your account, verify your business information, and you'll be approved to start accepting payments right away. Your free card reader will ship immediately."
  }
];

function FAQAccordionItem({ faq, index, isOpen, onToggle }: { faq: FAQItem; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      variants={staggerItemVariants('up', 20)}
      className="border-b border-black/10"
    >
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left hover:text-[#4945FF] transition-colors group"
      >
        <span className="text-lg font-semibold text-[#0F1119] group-hover:text-[#4945FF] pr-4">
          {faq.question}
        </span>
        <motion.svg
          className="w-6 h-6 flex-shrink-0 text-[#4945FF]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-6 text-[#4A4D5C] leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-start">
          {/* Left — sticky heading block */}
          <ScrollReveal className="lg:sticky lg:top-24">
            <div className="dc-eyebrow dc-on-light" style={{ color: 'var(--dc-indigo)' }}>
              FAQ
            </div>
            <h2
              className="mt-5 dc-h2"
              style={{
                color: 'var(--dc-on-light)',
                fontSize: 'clamp(34px, 5vw, 56px)',
                lineHeight: 1.05,
                fontWeight: 600,
                letterSpacing: '-0.035em',
              }}
            >
              Your questions, answered
              <span style={{ color: 'var(--dc-indigo)' }}>.</span>
            </h2>
            <p
              className="mt-5 max-w-[420px] text-[16px] leading-[1.6]"
              style={{ color: 'var(--dc-on-light-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Everything you need to know about pricing, hardware, deposits, and
              getting set up. Still stuck? Our team replies fast.
            </p>
            <Link to="/get-a-quote" className="dc-btn-primary dc-lg mt-8">
              Ask a question
              <span aria-hidden style={{ marginLeft: 2 }}>→</span>
            </Link>
          </ScrollReveal>

          {/* Right — single-column accordion */}
          <StaggerChildren className="space-y-1" staggerDelay={0.05}>
            {faqData.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}