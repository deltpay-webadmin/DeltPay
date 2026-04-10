import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal, StaggerChildren, staggerItemVariants } from './MicroInteractions';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Why should I choose Delt?",
    answer: "Delt offers transparent pricing with no hidden fees, industry-leading processing rates, and 24/7 customer support. We provide everything you need to accept payments and grow your business, from hardware to software."
  },
  {
    question: "Are there any contracts or hidden fees?",
    answer: "No contracts, no hidden fees. You only pay the transparent processing rates shown on our pricing page. Cancel anytime with no penalties."
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
    answer: "Delt offers business loans, lines of credit, and revenue-based financing options. Get approved quickly and access funds to invest in inventory, equipment, or growth initiatives."
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

  // Split FAQ items into two columns
  const leftColumnFAQs = faqData.filter((_, index) => index % 2 === 0);
  const rightColumnFAQs = faqData.filter((_, index) => index % 2 === 1);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0F1119]">
            FAQ<span className="text-[#4945FF]">.</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-1">
          {/* Left Column */}
          <StaggerChildren className="space-y-1" staggerDelay={0.06}>
            {leftColumnFAQs.map((faq, index) => {
              const actualIndex = index * 2;
              return (
                <FAQAccordionItem
                  key={actualIndex}
                  faq={faq}
                  index={actualIndex}
                  isOpen={openIndex === actualIndex}
                  onToggle={() => toggleFAQ(actualIndex)}
                />
              );
            })}
          </StaggerChildren>

          {/* Right Column */}
          <StaggerChildren className="space-y-1" staggerDelay={0.06}>
            {rightColumnFAQs.map((faq, index) => {
              const actualIndex = index * 2 + 1;
              return (
                <FAQAccordionItem
                  key={actualIndex}
                  faq={faq}
                  index={actualIndex}
                  isOpen={openIndex === actualIndex}
                  onToggle={() => toggleFAQ(actualIndex)}
                />
              );
            })}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}