import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal, StaggerChildren, staggerItemVariants } from './MicroInteractions';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Why should I pick Delt?",
    answer: "You see every fee up front — no surprises on your statement. You get competitive processing rates, real people on the phone during business hours, and one place to handle payments, your website, and funding. Everything from the card reader on your counter to the software on your phone comes from us."
  },
  {
    question: "Are there any contracts or hidden fees?",
    answer: "No long-term contracts. You see every fee up front before you sign anything. You only pay the processing rates shown on our pricing page. Cancel anytime — no early termination fee."
  },
  {
    question: "Who is Delt for?",
    answer: "Delt is built for owner-run businesses — restaurants, retail shops, salons, auto shops, gyms, contractors, e-commerce stores. Whether you're a one-person shop or running a few locations, you get the same tools either way."
  },
  {
    question: "How fast does money hit my bank account?",
    answer: "Sales usually land in your bank account in 1–2 business days. If you do higher volume, we can set you up for next-day deposits."
  },
  {
    question: "Is there a monthly fee?",
    answer: "Our Essential plan has no monthly fee. Growth and Pro plans have a monthly fee that unlocks extras like Lens AI insights and priority support."
  },
  {
    question: "How long until my card reader shows up?",
    answer: "Your free card reader ships in 2–3 business days. Need it faster? Pick rush shipping at checkout and we'll get it to you sooner."
  },
  {
    question: "What kind of funding can I get?",
    answer: "Working capital that pays itself back as a small piece of your daily sales, plus standard small-business loans and lines of credit. Get approved fast and use the money for inventory, equipment, payroll, or a new location."
  },
  {
    question: "What are the processing rates?",
    answer: "Flat rate: 2.6% + $0.10 per swipe, tap, or dip in person. 2.9% + $0.30 for online orders. If you do higher volume, you can switch to our 0% Cash Discount program where the customer covers the card fee instead — and we'll quote custom rates above $100K/month."
  },
  {
    question: "Do I have to switch banks?",
    answer: "Nope. Keep the bank account you already use. Delt deposits into any U.S. bank or credit union."
  },
  {
    question: "Do you give volume discounts?",
    answer: "Yes. If you run over $100,000 a month in card sales, give our sales team a call and we'll put together custom pricing for you."
  },
  {
    question: "How does signing up work?",
    answer: "Takes a few minutes. Create your account, send us your basic business info (EIN, bank account, ID), and most owners get approved the same day. Your free card reader ships out right after."
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