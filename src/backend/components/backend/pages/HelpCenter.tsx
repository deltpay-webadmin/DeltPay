import React, { useState } from 'react';
import {
  Search,
  X,
  Rocket,
  FileText,
  BarChart3,
  DollarSign,
  Send,
  BookOpen,
  CreditCard,
  Brain,
  ChevronDown,
  MessageCircle,
  Ticket,
  HelpCircle,
  ArrowRight,
  GraduationCap,
  ClipboardList,
  Landmark,
} from 'lucide-react';

// ── Types ──
interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface ArticleCard {
  icon: React.ElementType;
  title: string;
  description: string;
  content?: ArticleSection[];
}

interface FAQItem {
  question: string;
  answer: string;
}

// ── Data ──
const gettingStarted: ArticleCard[] = [
  {
    icon: Rocket,
    title: 'Setting Up Your Merchant Account',
    description: 'Learn how to create your merchant profile, connect bank accounts, and configure payment preferences.',
  },
  {
    icon: Send,
    title: 'Submitting Your First MCA Application',
    description: 'A step-by-step walkthrough of the application process, required documents, and what to expect.',
  },
  {
    icon: BarChart3,
    title: 'Understanding Your Dashboard',
    description: 'Navigate your dashboard to monitor deal status, payment schedules, and key performance metrics.',
  },
];

const forAgents: ArticleCard[] = [
  {
    icon: GraduationCap,
    title: 'Merchant Services 101',
    description: 'The vocabulary you need on every call — interchange, effective rate, cash discount, and where the money actually goes.',
    content: [
      {
        heading: 'Where the money goes on every card swipe',
        paragraphs: [
          'When a customer pays $100 by card, the merchant does not receive $100. Three parties take a cut before the deposit lands: the card-issuing bank (interchange — the largest piece, set by Visa/Mastercard), the card network (dues and assessments), and the processor (markup). Interchange plus assessments is the same for everyone; the processor markup is the only negotiable part — and it is where Delt competes.',
        ],
      },
      {
        heading: 'Effective rate — the only honest number',
        paragraphs: [
          'Effective rate = total fees ÷ total card volume for the month. It cuts through teaser quotes and hidden padding. When you review a prospect\u2019s statement, compute it first: total fees on the last page divided by total volume. Anything above ~3% on a standard retail mix usually means padding, and it is your opening.',
        ],
      },
      {
        heading: 'Cash discount vs. surcharge — know the difference',
        bullets: [
          'Cash discount: the merchant posts cash prices and adds a service fee on card payments. Legal in all 50 states when signage and receipts are compliant. This is Delt\u2019s core zero-cost program.',
          'Surcharge: an extra fee on credit cards only — capped (3–4%), never allowed on debit, banned or restricted in a few states. Do not use the words interchangeably with merchants.',
          'Either way, the merchant\u2019s effective processing cost approaches 0.00% — but the disclosure and signage rules differ. Delt supplies compliant signage; make sure it is actually displayed.',
        ],
      },
      {
        heading: 'Terms you will hear daily',
        bullets: [
          'MID — merchant identification number; one per processing account.',
          'Batch — the day\u2019s captured transactions submitted for settlement, usually at close of business.',
          'ADB / TIB — average daily balance and time in business; core underwriting inputs.',
          'Chargeback — a cardholder dispute; over 0.5% dispute rate risks card-network monitoring programs.',
          'PCI — the card-data security standard; non-validated merchants get charged monthly non-compliance fees by most processors.',
        ],
      },
    ],
  },
  {
    icon: DollarSign,
    title: 'How Commissions Work',
    description: 'Understand the commission structure, payout schedules, tiers, and how residuals factor into earnings.',
    content: [
      {
        heading: 'Two ways you get paid',
        paragraphs: [
          'Delt agents earn on both sides of the business: upfront commissions on funded capital deals, and monthly residuals on merchant processing. Upfront pays fast; residuals build the book that pays you every month for as long as the merchant processes with us.',
        ],
      },
      {
        heading: 'Upfront — capital deals',
        bullets: [
          'Paid as points on the funded amount (typical range 2–4 pts depending on tier and factor rate).',
          'Paid on the next semi-monthly payroll run after the deal funds.',
          'Renewals count — a merchant who has repaid 50%+ and re-ups generates a fresh commission.',
        ],
      },
      {
        heading: 'Residuals — processing',
        bullets: [
          'You earn a split of the net spread on every merchant in your book: Tier 1 = 50%, Tier 2 = 60%, Tier 3 = 70%.',
          'Paid on the 15th for the prior month\u2019s activity.',
          'Tier reviews happen quarterly based on funded volume and portfolio health (default rate under 8% keeps you tier-eligible).',
        ],
      },
      {
        heading: 'Clawbacks — read this twice',
        bullets: [
          'Merchant defaults within 90 days of funding: the upfront commission on that deal claws back on your next statement.',
          'Merchant closes or leaves within 6 months of boarding: residuals earned on that merchant in the final month may be reversed.',
          'Chargebacks driven by misrepresented products or pricing are charged back to the agent — sell it straight.',
        ],
      },
    ],
  },
  {
    icon: FileText,
    title: 'Submitting Applications',
    description: 'Best practices for submitting clean applications that move through underwriting quickly.',
    content: [
      {
        heading: 'The clean-file checklist',
        bullets: [
          'Signed application with accurate legal name, EIN, and ownership percentages (anyone at 25%+ must be listed).',
          'Bank connection via Plaid — this is the fastest path; underwriting scores directly off the live data.',
          'If the merchant will not link Plaid: last 3 months of complete business bank statements, every page, as PDFs.',
          'Voided check or bank letter matching the legal name.',
          'Driver\u2019s license, front, legible, not expired.',
          'Card processing statements (last 2 months) if the deal includes a processing switch.',
        ],
      },
      {
        heading: 'What kills deals in underwriting',
        bullets: [
          'Undisclosed existing MCA positions — DataMerch will find them; disclosure up front keeps the deal alive.',
          'Recent NSFs. One or two with an explanation can survive; a pattern cannot.',
          'Revenue numbers on the app that do not match the bank data. Plaid verifies everything — never inflate.',
          'PO boxes as business addresses, mismatched DBAs, expired IDs — fix before submitting, not after the decline.',
        ],
      },
      {
        heading: 'Speed tips',
        bullets: [
          'Submit before noon ET — same-day reviews go to files received in the morning.',
          'Flag seasonality in the notes (landscaper in February looks worse than it is).',
          'Set the requested amount realistically: max advance is roughly one month of gross revenue for first positions.',
        ],
      },
    ],
  },
  {
    icon: BookOpen,
    title: 'Reading Your Residual Statement',
    description: 'Decode your monthly residual statement — line items, clawbacks, and portfolio performance.',
    content: [
      {
        heading: 'The columns, left to right',
        bullets: [
          'Volume — the merchant\u2019s gross card volume for the month.',
          'Net revenue — what Delt actually earned on the account after interchange, assessments, and processor costs. This is the number your split applies to, not volume.',
          'Your split — your tier percentage of net revenue.',
          'Adjustments — clawbacks, equipment credits, chargeback losses, and PCI non-compliance recoveries.',
        ],
      },
      {
        heading: 'Why net revenue is smaller than you expect',
        paragraphs: [
          'A $100K-volume merchant at a 3.4% effective rate produces about $3,400 in gross fees — but interchange and network costs consume roughly 70–80% of that. Net revenue on that account might be $500–700, and your split applies to that. Zero-cost program merchants look different: the service fee funds the economics, so spreads per dollar of volume run higher and steadier.',
        ],
      },
      {
        heading: 'What to watch monthly',
        bullets: [
          'Attrition — merchants at $0 volume for two straight months are churning; call them before they cancel.',
          'Declining volume with rising chargebacks — the classic distress pattern, and Lens flags it. It hits your residuals before it hits our books.',
          'Adjustment lines you do not recognize — query them within 30 days via Team → Commissions.',
        ],
      },
    ],
  },
];

const forMerchants: ArticleCard[] = [
  {
    icon: Landmark,
    title: 'How MCAs Work for the Company',
    description: 'Internal breakdown of MCA economics — factor rates, borrowing costs, profit splits, and how Delt generates revenue per deal.',
  },
  {
    icon: GraduationCap,
    title: 'Training Merchants on Products',
    description: 'Scripts, objection handling, and walkthrough guides for educating merchants on MCA, residuals, and leasing products.',
  },
  {
    icon: ClipboardList,
    title: 'Standard Operating Procedures',
    description: 'Step-by-step SOPs for deal intake, document collection, underwriting handoff, funding, and post-funding support.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'How long does underwriting take?',
    answer: 'Most applications are reviewed within 24–48 hours of submission. Complex deals involving higher amounts or additional documentation may take up to 72 hours. You can track real-time progress in the Pipeline under the Underwriting stage.',
  },
  {
    question: 'What happens when a merchant defaults on an MCA?',
    answer: 'When a merchant misses consecutive ACH payments, the system flags the deal as delinquent. The assigned agent is notified immediately. After 3 failed attempts, the deal enters collections status. Agents should proactively monitor the SLA alerts in the Pipeline and coordinate with the merchant before it reaches this stage.',
  },
  {
    question: 'How do I move a lead through the pipeline stages?',
    answer: 'Navigate to Pipeline → Leads and select the lead. In the detail panel, use the stage dropdown to advance the lead (e.g., from "Contacted" to "Underwriting"). Each stage has SLA timers — if a lead sits too long, you\'ll see a breach alert. You can also drag cards between columns in Kanban view.',
  },
  {
    question: 'How are residual commissions calculated?',
    answer: 'Residuals are calculated monthly based on the net processing volume of merchants in your portfolio. The standard rate is a percentage of the spread, paid on the 15th of each month for the prior month\'s activity. Clawbacks may apply if a merchant terminates within the first 6 months. View your full breakdown under Team → Commissions.',
  },
  {
    question: 'What is a factor rate and how does it differ from an interest rate?',
    answer: 'A factor rate is a fixed multiplier (e.g., 1.35) applied to the funded amount to determine total repayment. Unlike interest rates, factor rates don\'t compound — the cost is locked at funding. For example, a $100K advance at 1.35 means $135K total repayment. Understanding this distinction is critical when explaining costs to merchants.',
  },
];

// ── Sub-components ──
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
  );
}

function Card({ card, onOpen }: { card: ArticleCard; onOpen?: (card: ArticleCard) => void }) {
  const Icon = card.icon;
  const readable = !!card.content;
  return (
    <div
      onClick={readable ? () => onOpen?.(card) : undefined}
      className={`bg-white rounded-[8px] border border-gray-200 p-6 transition-all group ${
        readable ? 'cursor-pointer hover:border-brand/30 hover:shadow-[0_2px_12px_rgba(67,24,255,0.06)]' : ''
      }`}
    >
      <div className="w-10 h-10 bg-brand/[0.06] rounded-[8px] flex items-center justify-center mb-4 group-hover:bg-brand/10 transition-colors">
        <Icon className="w-5 h-5 text-brand" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{card.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>
      {readable ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand group-hover:text-brand-hover transition-colors">
          Read
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400">Coming soon</span>
      )}
    </div>
  );
}

// ── Article reader ──
function ArticleView({ article, onBack }: { article: ArticleCard; onBack: () => void }) {
  const Icon = article.icon;
  return (
    <div className="px-8 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover transition-colors mb-6"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        All articles
      </button>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-brand/[0.06] rounded-[8px] flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{article.title}</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">{article.description}</p>
      <div className="space-y-7 max-w-2xl">
        {article.content?.map((section, i) => (
          <section key={i}>
            {section.heading && <h2 className="text-[15px] font-bold text-gray-900 mb-2.5">{section.heading}</h2>}
            {section.paragraphs?.map((para, j) => (
              <p key={j} className="text-sm text-gray-600 leading-relaxed mb-3">{para}</p>
            ))}
            {section.bullets && (
              <ul className="space-y-2">
                {section.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-400">
        Questions this article didn&rsquo;t answer? Contact the operations team from the Help Center home.
      </div>
    </div>
  );
}

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-[8px] overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 pr-4">{item.question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// Main Component
// ════════════════════════════════════════
export function HelpCenter({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [openArticle, setOpenArticle] = useState<ArticleCard | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(prev => (prev === index ? null : index));
  };

  // Simple search filter
  const q = searchQuery.toLowerCase().trim();
  const filterCards = (cards: ArticleCard[]) =>
    q ? cards.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) : cards;
  const filterFAQs = (items: FAQItem[]) =>
    q ? items.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)) : items;

  const filteredGettingStarted = filterCards(gettingStarted);
  const filteredForAgents = filterCards(forAgents);
  const filteredForMerchants = filterCards(forMerchants);
  const filteredFAQs = filterFAQs(faqs);
  const hasResults = filteredGettingStarted.length > 0 || filteredForAgents.length > 0 || filteredForMerchants.length > 0 || filteredFAQs.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-canvas-muted shadow-2xl flex flex-col">
        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 px-8 pt-7 pb-6 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand/[0.08] rounded-[8px] flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-brand" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-[6px] transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides, and FAQs..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          {openArticle ? (
            <ArticleView article={openArticle} onBack={() => setOpenArticle(null)} />
          ) : (
          <div className="px-8 py-8 space-y-10">
            {!hasResults && q && (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
                <p className="text-sm text-gray-500">Try a different search term or browse the sections below.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm font-medium text-brand hover:text-brand-hover"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Getting Started */}
            {filteredGettingStarted.length > 0 && (
              <section>
                <SectionHeader title="Getting Started" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {filteredGettingStarted.map(card => (
                    <Card key={card.title} card={card} onOpen={setOpenArticle} />
                  ))}
                </div>
              </section>
            )}

            {/* For Agents */}
            {filteredForAgents.length > 0 && (
              <section>
                <SectionHeader title="For Agents" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {filteredForAgents.map(card => (
                    <Card key={card.title} card={card} onOpen={setOpenArticle} />
                  ))}
                </div>
              </section>
            )}

            {/* For Merchants */}
            {filteredForMerchants.length > 0 && (
              <section>
                <SectionHeader title="Industry Knowledge & SOPs" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {filteredForMerchants.map(card => (
                    <Card key={card.title} card={card} onOpen={setOpenArticle} />
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {filteredFAQs.length > 0 && (
              <section>
                <SectionHeader title="Frequently Asked Questions" />
                <div className="space-y-2.5 mt-4">
                  {filteredFAQs.map((faq, i) => {
                    const originalIndex = faqs.indexOf(faq);
                    return (
                      <FAQAccordion
                        key={originalIndex}
                        item={faq}
                        isOpen={openFAQ === originalIndex}
                        onToggle={() => toggleFAQ(originalIndex)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Still need help? */}
            {!q && (
              <section>
                <div className="bg-white rounded-[8px] border border-gray-200 p-8 text-center">
                  <div className="w-12 h-12 bg-brand/[0.06] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1.5">Still need help?</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    Can't find what you're looking for? Our support team is available Monday–Friday, 9 AM–6 PM EST.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Contact Support
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Submit a Ticket
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}