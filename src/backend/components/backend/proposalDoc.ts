/**
 * Personalized merchant savings proposal — a paginated, print-ready document
 * built from the analyzed statement. Opened in a new window where the built-in
 * toolbar offers Present (full-screen walkthrough), Download, Save as PDF, and
 * Send (Outlook compose in the rep's own account).
 *
 * Fully bilingual: pass lang 'es' for a Spanish proposal (copy lives in the
 * EN/ES objects below).
 *
 * Branded with the real Delt lockup (inline SVG, same geometry as the CRM
 * sidebar logo) and the CRM's Inter typography / light-theme palette.
 *
 * Merchant-safe by construction: consumes ProgramQuote only, never
 * ProgramEconomics (see pricingPrograms.ts); qualification findings render
 * through the merchant-safe findingsCopy map only — the audit's rep-facing
 * strings never reach this document.
 */
import type { ProgramQuote } from './pricingPrograms';
import { termsToEs } from './i18n';
import type { ExtractedData } from './pages/BackendAnalysis';
import { auditQualification } from './interchangeAudit';
import type { MerchantCategory } from './interchangeRates';

/**
 * Official Delt lockup — same geometry as the CRM sidebar logo in
 * DeltBackendLayout.tsx (indigo mark + traced "Delt" letterforms). Inlined
 * so the downloaded proposal stays self-contained; letters are hard-coded to
 * dark ink for the white page (a standalone document has no theme context).
 */
const DELT_LOGO_SVG = `<svg viewBox="74 153 552 174" style="height:24px;width:auto;display:block" aria-label="Delt">
  <rect x="148.9" y="156.6" width="50.8" height="168.3" rx="17.2" fill="#4945FF"/>
  <circle cx="107.8" cy="274.1" r="33.3" fill="#4945FF"/>
  <g fill="#0B1730" transform="translate(208,153)">
    <path transform="translate(0.428,167.36)" d="M 80.28125 0 L 21.6875 0 L 21.6875 -159.390625 L 79.921875 -159.390625 C 92.503906 -159.390625 103.953125 -157.492188 114.265625 -153.703125 C 124.578125 -149.910156 133.441406 -144.5 140.859375 -137.46875 C 148.285156 -130.4375 153.988281 -122.054688 157.96875 -112.328125 C 161.957031 -102.597656 163.953125 -91.757812 163.953125 -79.8125 C 163.953125 -67.851562 161.957031 -56.972656 157.96875 -47.171875 C 153.988281 -37.367188 148.304688 -28.953125 140.921875 -21.921875 C 133.546875 -14.890625 124.738281 -9.476562 114.5 -5.6875 C 104.257812 -1.894531 92.851562 0 80.28125 0 Z M 42.078125 -140.875 L 42.078125 -18.75 L 79.8125 -18.75 C 92.851562 -18.75 104.082031 -21.226562 113.5 -26.1875 C 122.914062 -31.15625 130.179688 -38.1875 135.296875 -47.28125 C 140.421875 -56.382812 142.984375 -67.070312 142.984375 -79.34375 C 142.984375 -91.6875 140.421875 -102.46875 135.296875 -111.6875 C 130.179688 -120.90625 122.875 -128.070312 113.375 -133.1875 C 103.882812 -138.3125 92.539062 -140.875 79.34375 -140.875 Z M 42.078125 -140.875"/>
    <path transform="translate(160.05,167.36)" d="M 129.15625 -62.703125 C 129.15625 -61.679688 129.132812 -60.601562 129.09375 -59.46875 C 129.050781 -58.34375 128.953125 -56.6875 128.796875 -54.5 L 29.65625 -54.5 C 30.507812 -46.53125 32.847656 -39.613281 36.671875 -33.75 C 40.503906 -27.894531 45.3125 -23.382812 51.09375 -20.21875 C 56.875 -17.050781 63.046875 -15.46875 69.609375 -15.46875 C 77.660156 -15.46875 84.535156 -17.207031 90.234375 -20.6875 C 95.941406 -24.164062 100.125 -29.265625 102.78125 -35.984375 L 125.40625 -35.984375 C 123.6875 -30.515625 121.125 -25.394531 117.71875 -20.625 C 114.320312 -15.863281 110.21875 -11.703125 105.40625 -8.140625 C 100.601562 -4.585938 95.210938 -1.796875 89.234375 0.234375 C 83.265625 2.265625 76.878906 3.28125 70.078125 3.28125 C 61.410156 3.28125 53.382812 1.660156 46 -1.578125 C 38.613281 -4.828125 32.164062 -9.34375 26.65625 -15.125 C 21.15625 -20.90625 16.878906 -27.601562 13.828125 -35.21875 C 10.785156 -42.832031 9.265625 -51.015625 9.265625 -59.765625 C 9.265625 -68.515625 10.785156 -76.695312 13.828125 -84.3125 C 16.878906 -91.9375 21.15625 -98.640625 26.65625 -104.421875 C 32.164062 -110.203125 38.613281 -114.734375 46 -118.015625 C 53.382812 -121.296875 61.410156 -122.9375 70.078125 -122.9375 C 78.671875 -122.9375 86.582031 -121.332031 93.8125 -118.125 C 101.039062 -114.925781 107.289062 -110.515625 112.5625 -104.890625 C 117.84375 -99.265625 121.925781 -92.835938 124.8125 -85.609375 C 127.707031 -78.378906 129.15625 -70.742188 129.15625 -62.703125 Z M 30.59375 -72.3125 L 108.515625 -72.3125 C 108.203125 -76.53125 106.972656 -80.550781 104.828125 -84.375 C 102.679688 -88.207031 99.847656 -91.585938 96.328125 -94.515625 C 92.816406 -97.441406 88.773438 -99.742188 84.203125 -101.421875 C 79.628906 -103.109375 74.804688 -103.953125 69.734375 -103.953125 C 63.796875 -103.953125 58.128906 -102.738281 52.734375 -100.3125 C 47.347656 -97.894531 42.703125 -94.34375 38.796875 -89.65625 C 34.890625 -84.96875 32.15625 -79.1875 30.59375 -72.3125 Z M 30.59375 -72.3125"/>
    <path transform="translate(282.643,167.36)" d="M 39.5 0 L 19.34375 0 L 19.34375 -165.25 L 39.5 -165.25 Z M 39.5 0"/>
    <path transform="translate(327.545,167.36)" d="M 87.546875 0 L 65.515625 0 C 60.984375 0 56.488281 -0.582031 52.03125 -1.75 C 47.582031 -2.925781 43.539062 -5.078125 39.90625 -8.203125 C 36.269531 -11.328125 33.359375 -15.800781 31.171875 -21.625 C 28.984375 -27.445312 27.890625 -35.003906 27.890625 -44.296875 L 27.890625 -101.84375 L 1.296875 -101.84375 L 1.296875 -119.53125 L 27.890625 -119.53125 L 27.890625 -155.046875 L 48.046875 -155.171875 L 48.046875 -119.53125 L 87.546875 -119.53125 L 87.546875 -101.84375 L 48.046875 -101.84375 L 48.046875 -43.359375 C 48.046875 -37.816406 48.648438 -33.304688 49.859375 -29.828125 C 51.078125 -26.347656 52.71875 -23.691406 54.78125 -21.859375 C 56.851562 -20.023438 59.160156 -18.773438 61.703125 -18.109375 C 64.242188 -17.441406 66.84375 -17.109375 69.5 -17.109375 L 87.546875 -17.109375 Z M 87.546875 0"/>
  </g>
</svg>`;

export interface ProposalInput {
  extracted: ExtractedData;
  programs: ProgramQuote[];
  /** Program to lead with — the merchant's selection or the recommendation. */
  focusKey: ProgramQuote['key'] | null;
  /**
   * Merchant category for the qualification findings page. When set, the
   * statement audit runs and merchant-worthy findings render as a page;
   * omitted → the findings page is skipped entirely.
   */
  category?: MerchantCategory;
  /** Name of the rep preparing the proposal, when known. */
  preparedBy?: string;
  /**
   * Signed-in rep's email. Send opens Outlook Web compose with this as the
   * login_hint, so each rep lands in their own Outlook account.
   */
  preparedByEmail?: string;
  /** Document language. Defaults to English. */
  lang?: 'en' | 'es';
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Safely embed a string as a JS literal inside the generated <script>. */
const js = (s: string) => JSON.stringify(s).replace(/</g, '\\u003c');
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface ProposalCopy {
  docTitle: string;
  heroTitle: string;
  preparedExclusivelyFor: string;
  estAnnualSavingsWith: (program: string) => string;
  heroLine: (pct: number, name: string, monthly: string | null) => string;
  preparedFor: string;
  preparedBy: string;
  basedOnStatement: (period: string, processor: string) => string;
  coverDisclaimer: string;
  executiveSummary: string;
  executiveBody: (a: {
    name: string; period: string; processor: string; volume: string; txns: string;
    monthlyCost: string; rate: number; program: string; newCost: string; savings: string;
  }) => string;
  whereMoneyGoes: string;
  monthlyVolume: string;
  effectiveRate: string;
  monthlyCost: string;
  annualCost: string;
  feeOnStatement: string;
  amount: string;
  calloutMeaning: (name: string) => string;
  calloutChargebacks: (n: number) => string;
  findingsTitle: string;
  findingsIntro: (name: string) => string;
  /**
   * Merchant-safe copy per audit finding id. Findings whose id is absent are
   * skipped — the audit's rep-facing title/detail/action strings must never
   * reach this document. `labels` carries the statement's own downgrade
   * fee-line labels (may be empty).
   */
  findingsCopy: Partial<Record<string, { h: string; p: (a: { name: string; labels: string }) => string }>>;
  findingsSavesLabel: string;
  findingsDisclaimer: string;
  socialTitle: string;
  testimonials: { quote: string; name: string; role: string; business: string; location: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  pricingOptions: string;
  pricingIntro: (name: string) => string;
  recommendedFor: (name: string) => string;
  youdPay: string;
  youdSave: string;
  sameAsToday: string;
  perMo: string;
  perYr: string;
  annualCostCompare: string;
  today: string;
  with: string;
  year1Savings: string;
  threeYearSavings: string;
  everyMonth: string;
  cdNote: (name: string, fee: string) => string;
  howWorks: (program: string) => string;
  whyDelt: string;
  whyItems: { h: string; p: string }[];
  platformTitle: string;
  platformIntro: (name: string) => string;
  platformItems: { h: string; p: string }[];
  capitalTitle: string;
  capitalIntro: (name: string) => string;
  capitalPoints: { h: string; p: string }[];
  capitalPrequalLabel: string;
  capitalPrequalLine: (name: string, amount: string) => string;
  capitalDisclaimer: string;
  nextSteps: string;
  stepsIntro: (name: string) => string;
  steps: { b: string; rest: string }[];
  whatWeNeed: string;
  needItems: string[];
  signature: (name: string) => string;
  date: string;
  footerLeft: (name: string) => string;
  footerRight: (date: string) => string;
  programNames: Record<ProgramQuote['key'], string>;
  programTaglines: Record<ProgramQuote['key'], string>;
  howItWorks: Record<ProgramQuote['key'], string[]>;
  toolbar: { present: string; download: string; pdf: string; send: string };
  presentHint: string;
  mailSubject: (name: string) => string;
  mailBody: (a: { current: string; program: string; newCost: string; savings: string; rate: number; signoff: string }) => string;
  teamSignoff: string;
}

const EN: ProposalCopy = {
  docTitle: 'Savings Proposal',
  heroTitle: 'Payment Savings<br>Proposal',
  preparedExclusivelyFor: 'Prepared exclusively for',
  estAnnualSavingsWith: p => `Estimated annual savings with ${p}`,
  heroLine: (pct, name, monthly) => `${pct}% less than ${name} pays today${monthly ? ` — ${monthly} back every month` : ''}`,
  preparedFor: 'Prepared for',
  preparedBy: 'Prepared by',
  basedOnStatement: (period, processor) =>
    `${period ? `Based on the ${period} statement` : 'Based on your processing statement'}${processor ? ` from ${processor}` : ''}`,
  coverDisclaimer: 'Estimates are based on the statement provided. Actual results depend on card mix and processing volume.',
  executiveSummary: 'Executive Summary',
  executiveBody: a => `
    We reviewed ${a.name}'s ${a.period ? a.period + ' ' : ''}processing statement${a.processor ? ` from ${a.processor}` : ''} line by line.
    On ${a.volume} of monthly card volume across ${a.txns} transactions,
    ${a.name} is paying <strong>${a.monthlyCost} per month</strong> in processing costs — an effective rate of
    <strong>${a.rate}%</strong>. Under the recommended <strong>${a.program}</strong> program, we estimate that cost drops to
    <strong>${a.newCost} per month</strong>, keeping <strong class="green">${a.savings}</strong> in the business every year.`,
  whereMoneyGoes: 'Where the Money Goes Today',
  monthlyVolume: 'Monthly volume',
  effectiveRate: 'Effective rate',
  monthlyCost: 'Monthly cost',
  annualCost: 'Annual cost',
  feeOnStatement: 'Fee on your statement',
  amount: 'Amount',
  calloutMeaning: name =>
    `<strong>What this means for ${name}:</strong> every one of these line items is negotiable — most shrink dramatically or disappear under the programs on the next page.`,
  calloutChargebacks: n =>
    ` We also noted ${n} chargeback${n === 1 ? '' : 's'} this period; Delt includes dispute-response tooling at no extra cost.`,
  findingsTitle: 'What We Found in Your Statement',
  findingsIntro: name =>
    `Beyond the headline rate, we checked how ${name}'s transactions are actually clearing on the card networks. A few things on this statement are costing more than they should — all of them fixable.`,
  findingsCopy: {
    'downgrade-lines': {
      h: 'Penalty-rate charges on your statement',
      p: ({ name, labels }) => labels
        ? `Lines like ${labels} are charges from transactions clearing at the card networks' most expensive penalty tiers — not the rates ${name} qualifies for. Under Delt, these shrink dramatically or disappear.`
        : `Some of ${name}'s transactions are clearing at the card networks' most expensive penalty tiers — not the rates the business qualifies for. Under Delt, these charges shrink dramatically or disappear.`,
    },
    'pin-debit-missing': {
      h: 'Debit cards are taking the expensive route',
      p: ({ name }) =>
        `This statement shows no PIN-network debit activity — every debit card ${name} accepts is routing through the higher-cost path today. Delt terminals route debit the smart way automatically, with no change at the counter.`,
    },
    'nonqual-pricing': {
      h: 'Your rate sits at penalty levels',
      p: ({ name }) =>
        `${name}'s effective rate is up at the level the card networks reserve for non-qualified transactions. Delt's programs replace this pricing outright — it is the biggest part of the savings in this proposal.`,
    },
    'b2b-enhanced-data': {
      h: 'Business cards are missing built-in discounts',
      p: ({ name }) =>
        `Commercial cards qualify for meaningfully lower rates when extra order data travels with each transaction. Delt terminals and gateways send that data automatically, so ${name} captures those discounts without lifting a finger.`,
    },
  },
  findingsSavesLabel: 'Est. reduction',
  findingsDisclaimer:
    'Figures are estimates from this statement and are already reflected in the savings shown in this proposal — they are part of the story, not an extra on top.',
  socialTitle: 'Merchants Already on Delt',
  testimonials: [
    { quote: "Switching to Delt Payments took an afternoon. We went from T+3 settlements to same-day deposits and haven't looked back.", name: 'Carlos Mendez', role: 'Owner', business: 'Northside Auto', location: 'Denver, CO' },
    { quote: "The Capital offer popped up in my dashboard. I applied at 9am and had the funds clearing by 3pm. I've never experienced anything like it with a bank.", name: 'Dmitri Volkov', role: 'Proprietor', business: 'Oak & Ember', location: 'Chicago, IL' },
    { quote: "Chargebacks used to eat 2 hours a week. With Delt's evidence-builder and auto-responses, we handle them in 10 minutes.", name: 'Fatima Nkosi', role: 'Operations Lead', business: 'Atlas Apothecary', location: 'Atlanta, GA' },
  ],
  faqTitle: 'Common Questions',
  faqs: [
    { q: 'Will my customers push back on a service fee?', a: 'The program is a discount for paying cash, not a penalty for cards — the same model gas stations have used for decades. In well-run programs customer attrition measures under 1%, and the clear signage Delt provides does the explaining for you.' },
    { q: 'Is cash discounting legal?', a: 'Yes — legal in all 50 states when structured as dual pricing with proper disclosure. Delt handles the compliant signage and receipt formatting, and keeps them current with card-network rules.' },
    { q: 'Is switching complicated?', a: 'No. Delt programs the equipment, handles the paperwork, and trains your team. Most merchants switch with zero downtime — you take payments the same day the terminal arrives.' },
    { q: "What if I'm under contract with my current processor?", a: 'Bring us the contract — many are month-to-month with a cancellation fee dressed up as a term. In most cases the first month or two of savings covers any fee, and your Delt contact will do that math with you before you commit.' },
    { q: 'Will I lose sales?', a: 'The data says no: merchants on well-run programs see under 1% change in card behavior. Customers care about the product and the service — and cash payers get a better price.' },
  ],
  pricingOptions: 'Your Pricing Options',
  pricingIntro: name => `Three ways forward — all three cost less than today. The highlighted program is our recommendation for ${name}.`,
  recommendedFor: name => `Recommended for ${name}`,
  youdPay: "You'd pay",
  youdSave: "You'd save",
  sameAsToday: 'Same as today',
  perMo: '/mo',
  perYr: '/yr',
  annualCostCompare: 'Annual Cost: Today vs. Delt',
  today: 'Today',
  with: 'With',
  year1Savings: 'Year 1 savings',
  threeYearSavings: '3-year savings',
  everyMonth: 'Every month',
  cdNote: (name, fee) =>
    `With Cash Discount, the ${fee} service fee is paid by card-paying customers — ${name}'s own cost is the flat program fee shown above.`,
  howWorks: p => `How ${p} Works`,
  whyDelt: 'Why Merchants Choose Delt',
  whyItems: [
    { h: 'No rate creep', p: 'Your pricing is locked to your program — there is no percentage rate to quietly go up over time.' },
    { h: 'Transparent statements', p: 'One page you can read, not twelve pages of line items. What you see is what you pay.' },
    { h: 'Compliance handled', p: 'Signage, receipt formatting, and card-network rules are set up and kept current for you.' },
    { h: 'Real support', p: 'Setup, hardware, and day-to-day questions handled by people, not ticket queues.' },
  ],
  platformTitle: 'One Platform to Run, Grow, and Fund the Business',
  platformIntro: name =>
    `Lower processing costs are the start, not the whole story. Delt is built as one platform, so as ${name} grows, the tools are already in place — no new vendors, no new logins, no integration projects.`,
  platformItems: [
    { h: 'Lens AI', p: 'An AI analyst built into your dashboard. Ask questions about your business in plain English — best-selling items, slow days, month-over-month trends — and get answers grounded in your live sales data.' },
    { h: 'Point of Sale & Hardware', p: 'Modern terminals and full KORONA POS systems arrive pre-configured for your counter. Inventory, staff permissions, and end-of-day reports included — plugged in and taking payments the day they arrive.' },
    { h: 'Websites & Online Ordering', p: 'A professional website with payments built in, launched for you. Take orders, deposits, and bookings online with the same transparent pricing as your counter.' },
    { h: 'Dispute & Chargeback Tooling', p: 'When a customer disputes a charge, Delt assembles the evidence and files the response for you — included with every program at no extra cost.' },
  ],
  capitalTitle: 'Delt Capital: Funding When You Want It',
  capitalIntro: name =>
    `Processing with Delt does more than cut costs — it builds a funding relationship. Delt Capital advances ${name} working capital based on real card sales, not a bank formula: no business plan, no pitch deck, no weeks of waiting.`,
  capitalPoints: [
    { h: '$1,000 to $300,000', p: 'Funding sized to your actual processing volume — for equipment, inventory, renovations, a second location, or simply smoothing a slow season.' },
    { h: 'One fixed fee', p: 'No compounding interest, no application fees, no prepayment penalties, no late fees. The cost is agreed up front and never changes.' },
    { h: 'Repayment that flexes with sales', p: 'Repay automatically as a small percentage of daily card sales — busy weeks pay down more, slow weeks pay down less. No fixed monthly payment shock.' },
    { h: 'Fast, credit-safe application', p: 'Checking your offer takes minutes and does not affect your credit score. Pre-qualified merchants are often funded the next business day.' },
  ],
  capitalPrequalLabel: 'Delt Capital pre-qualification',
  capitalPrequalLine: (name, amount) =>
    `Based on the card volume in this statement, ${name} could pre-qualify for up to <strong>${amount}</strong> once processing with Delt.`,
  capitalDisclaimer: 'Delt Capital loans are issued by Delt Banking Partners, member FDIC. Actual offers depend on underwriting and processing history.',
  nextSteps: 'Next Steps',
  stepsIntro: name =>
    `Switching processors sounds disruptive; with Delt it isn't. Here is exactly what happens after ${name} accepts, and how long each step takes.`,
  steps: [
    { b: 'Accept this proposal', rest: ' — sign the acceptance below or reply to your Delt contact. The pricing in this document is locked for 30 days.' },
    { b: 'Short application (about 10 minutes)', rest: ' — basic business details; we prepare the paperwork from the statement already on file.' },
    { b: 'Approval within 1–2 business days', rest: ' — underwriting runs on our side; your Delt contact keeps you posted at every step.' },
    { b: 'Setup and go-live', rest: ' — equipment and compliant signage arrive configured, and your team gets a walkthrough. Most merchants switch with zero downtime.' },
    { b: '30-day savings review', rest: ' — your Delt contact sits down with your first Delt statement and this proposal, side by side, to confirm the savings landed.' },
  ],
  whatWeNeed: 'What We Need From You',
  needItems: [
    'This proposal, signed below (an email confirmation works too)',
    'Basic business details — legal name, EIN, and ownership information',
    'A voided check or bank letter for deposit setup',
    'A government-issued ID for the signer',
    'Your processing statement — already on file from this analysis',
  ],
  signature: name => `Signature — ${name}`,
  date: 'Date',
  footerLeft: name => `Savings proposal — ${name}`,
  footerRight: date => `Prepared by Delt · ${date}`,
  programNames: { cash_discount: 'Cash Discount', flat_rate: 'Flat Rate', interchange_plus: 'Interchange-Plus' },
  programTaglines: {
    cash_discount: 'Customers cover the service fee — your processing cost drops to the program fee.',
    flat_rate: 'One predictable rate on every transaction, statement simplicity.',
    interchange_plus: 'Pass-through interchange with a transparent Delt margin.',
  },
  howItWorks: {
    cash_discount: [
      'Your posted prices stay exactly the same. Customers who pay by card see a small service fee on their receipt, with clear signage provided by Delt.',
      'That fee covers the cost of card acceptance, so the processing fees you pay today go away. Your only cost is a flat monthly program fee.',
      'Delt handles compliant signage, receipt formatting, and setup end to end. Cash-paying customers automatically pay the lower price.',
    ],
    flat_rate: [
      'You pay one simple rate plus a few cents per transaction — the same on every card, every time.',
      'No tiers, no line-item surcharges, no surprises. Your statement becomes one line you can actually read.',
      'Your rate is locked to your business profile — no rate creep over time.',
    ],
    interchange_plus: [
      'Every card has a wholesale cost set by the card networks, called interchange. You pay that at true cost, with no markup hidden inside it.',
      'Delt adds one small, transparent margin on top — you see exactly what the networks charge and exactly what Delt earns.',
      'When the networks lower a rate, the savings pass straight through to you.',
    ],
  },
  toolbar: { present: '▶ Present', download: '⬇ Download', pdf: '🖨 Save as PDF', send: '✉ Send' },
  presentHint: '← → to navigate · Esc to exit',
  mailSubject: name => `Your Delt savings proposal — ${name}`,
  mailBody: a => [
    'Hi,', '',
    'Thank you for sharing your processing statement. We went through it line by line, and the numbers are worth a look:', '',
    `• Today: ${a.current}/month in processing costs (${a.rate}% effective rate)`,
    `• With Delt ${a.program}: ${a.newCost}/month`,
    `• Estimated savings: ${a.savings} per year`, '',
    'Your full proposal is attached (it opens in any browser). Happy to walk through it together whenever works for you.', '',
    a.signoff,
  ].join('\n'),
  teamSignoff: 'The Delt Team',
};

const ES_COPY: ProposalCopy = {
  docTitle: 'Propuesta de Ahorro',
  heroTitle: 'Propuesta de Ahorro<br>en Procesamiento de Pagos',
  preparedExclusivelyFor: 'Preparada exclusivamente para',
  estAnnualSavingsWith: p => `Ahorro anual estimado con ${p}`,
  heroLine: (pct, name, monthly) => `${pct}% menos de lo que ${name} paga hoy${monthly ? ` — ${monthly} de vuelta a su bolsillo cada mes` : ''}`,
  preparedFor: 'Preparada para',
  preparedBy: 'Preparada por',
  basedOnStatement: (period, processor) =>
    `${period ? `Basada en el estado de cuenta de ${period}` : 'Basada en su estado de cuenta de procesamiento'}${processor ? ` de ${processor}` : ''}`,
  coverDisclaimer: 'Las cifras son estimaciones basadas en el estado de cuenta proporcionado. Los resultados reales dependen de la mezcla de tarjetas y el volumen procesado.',
  executiveSummary: 'Resumen Ejecutivo',
  executiveBody: a => `
    Revisamos línea por línea el estado de cuenta${a.period ? ` de ${a.period}` : ''}${a.processor ? ` de ${a.processor}` : ''} de ${a.name}.
    Sobre ${a.volume} de volumen mensual en tarjetas a través de ${a.txns} transacciones,
    ${a.name} está pagando <strong>${a.monthlyCost} al mes</strong> en costos de procesamiento — una tasa efectiva del
    <strong>${a.rate}%</strong>. Con el programa recomendado <strong>${a.program}</strong>, estimamos que ese costo baja a
    <strong>${a.newCost} al mes</strong>, dejando <strong class="green">${a.savings}</strong> en su negocio cada año.`,
  whereMoneyGoes: 'A Dónde Se Va el Dinero Hoy',
  monthlyVolume: 'Volumen mensual',
  effectiveRate: 'Tasa efectiva',
  monthlyCost: 'Costo mensual',
  annualCost: 'Costo anual',
  feeOnStatement: 'Cargo en su estado de cuenta',
  amount: 'Monto',
  calloutMeaning: name =>
    `<strong>Qué significa esto para ${name}:</strong> cada una de estas líneas es negociable — la mayoría se reduce drásticamente o desaparece con los programas de la siguiente página.`,
  calloutChargebacks: n =>
    ` También notamos ${n} contracargo${n === 1 ? '' : 's'} en este período; Delt incluye herramientas de respuesta a disputas sin costo adicional.`,
  findingsTitle: 'Qué Encontramos en Su Estado de Cuenta',
  findingsIntro: name =>
    `Más allá de la tasa general, revisamos cómo se están liquidando realmente las transacciones de ${name} en las redes de tarjetas. Varias cosas en este estado de cuenta cuestan más de lo que deberían — y todas tienen solución.`,
  findingsCopy: {
    'downgrade-lines': {
      h: 'Cargos con tarifa de castigo en su estado de cuenta',
      p: ({ name, labels }) => labels
        ? `Líneas como ${labels} son cargos de transacciones que se liquidaron en los niveles de castigo más caros de las redes de tarjetas — no en las tasas que ${name} merece. Con Delt, estos cargos se reducen drásticamente o desaparecen.`
        : `Parte de las transacciones de ${name} se está liquidando en los niveles de castigo más caros de las redes de tarjetas — no en las tasas que el negocio merece. Con Delt, estos cargos se reducen drásticamente o desaparecen.`,
    },
    'pin-debit-missing': {
      h: 'Sus tarjetas de débito toman la ruta cara',
      p: ({ name }) =>
        `Este estado de cuenta no muestra actividad de débito por redes PIN — cada tarjeta de débito que ${name} acepta viaja hoy por la ruta más costosa. Las terminales Delt enrutan el débito de forma inteligente automáticamente, sin cambiar nada en el mostrador.`,
    },
    'nonqual-pricing': {
      h: 'Su tasa está en niveles de castigo',
      p: ({ name }) =>
        `La tasa efectiva de ${name} está en el nivel que las redes reservan para transacciones no calificadas. Los programas de Delt reemplazan ese esquema por completo — es la mayor parte del ahorro de esta propuesta.`,
    },
    'b2b-enhanced-data': {
      h: 'Sus tarjetas empresariales pierden descuentos',
      p: ({ name }) =>
        `Las tarjetas comerciales califican para tasas bastante más bajas cuando cada transacción viaja con datos adicionales del pedido. Las terminales y pasarelas de Delt envían esos datos automáticamente, así que ${name} captura esos descuentos sin mover un dedo.`,
    },
  },
  findingsSavesLabel: 'Reducción est.',
  findingsDisclaimer:
    'Las cifras son estimaciones basadas en este estado de cuenta y ya están reflejadas en el ahorro de esta propuesta — son parte de la historia, no un extra.',
  socialTitle: 'Comercios que Ya Usan Delt',
  testimonials: [
    { quote: 'Cambiarnos a Delt Payments tomó una tarde. Pasamos de liquidaciones a 3 días a depósitos el mismo día, y no hemos mirado atrás.', name: 'Carlos Mendez', role: 'Propietario', business: 'Northside Auto', location: 'Denver, CO' },
    { quote: 'La oferta de Capital apareció en mi panel. Apliqué a las 9 de la mañana y a las 3 de la tarde los fondos ya estaban en camino. Nunca viví algo así con un banco.', name: 'Dmitri Volkov', role: 'Propietario', business: 'Oak & Ember', location: 'Chicago, IL' },
    { quote: 'Los contracargos nos comían 2 horas por semana. Con el armado de evidencia y las respuestas automáticas de Delt, los resolvemos en 10 minutos.', name: 'Fatima Nkosi', role: 'Jefa de Operaciones', business: 'Atlas Apothecary', location: 'Atlanta, GA' },
  ],
  faqTitle: 'Preguntas Frecuentes',
  faqs: [
    { q: '¿Mis clientes se molestarán por una tarifa de servicio?', a: 'El programa es un descuento por pagar en efectivo, no un castigo por usar tarjeta — el mismo modelo que las gasolineras usan hace décadas. En programas bien administrados la pérdida de clientes es menor al 1%, y la señalización clara que Delt provee explica todo por usted.' },
    { q: '¿El descuento por efectivo es legal?', a: 'Sí — es legal en los 50 estados cuando se estructura como doble precio con la divulgación adecuada. Delt se encarga de la señalización y los recibos en cumplimiento, y los mantiene al día con las reglas de las redes.' },
    { q: '¿Cambiarse es complicado?', a: 'No. Delt programa el equipo, maneja el papeleo y capacita a su personal. La mayoría de los comercios cambia sin interrupciones — usted cobra el mismo día que llega la terminal.' },
    { q: '¿Y si tengo contrato con mi procesador actual?', a: 'Tráiganos el contrato — muchos son mes a mes con una cuota de cancelación disfrazada de plazo. En la mayoría de los casos, el ahorro del primer o segundo mes cubre cualquier cuota, y su contacto de Delt hace esa cuenta con usted antes de comprometerse.' },
    { q: '¿Perderé ventas?', a: 'Los datos dicen que no: los comercios con programas bien administrados ven menos del 1% de cambio en el comportamiento con tarjeta. A los clientes les importa el producto y el servicio — y quien paga en efectivo obtiene mejor precio.' },
  ],
  pricingOptions: 'Sus Opciones de Precios',
  pricingIntro: name => `Tres caminos posibles — los tres cuestan menos que hoy. El programa resaltado es nuestra recomendación para ${name}.`,
  recommendedFor: name => `Recomendado para ${name}`,
  youdPay: 'Usted pagaría',
  youdSave: 'Usted ahorraría',
  sameAsToday: 'Igual que hoy',
  perMo: '/mes',
  perYr: '/año',
  annualCostCompare: 'Costo Anual: Hoy vs. Delt',
  today: 'Hoy',
  with: 'Con',
  year1Savings: 'Ahorro año 1',
  threeYearSavings: 'Ahorro a 3 años',
  everyMonth: 'Cada mes',
  cdNote: (name, fee) =>
    `Con Descuento por Efectivo, la tarifa de servicio de ${fee} la pagan los clientes que usan tarjeta — el costo propio de ${name} es solo la cuota fija del programa mostrada arriba.`,
  howWorks: p => `Cómo Funciona ${p}`,
  whyDelt: 'Por Qué los Comercios Eligen Delt',
  whyItems: [
    { h: 'Sin aumentos escondidos', p: 'Su precio queda fijado a su programa — no hay una tasa porcentual que suba silenciosamente con el tiempo.' },
    { h: 'Estados de cuenta transparentes', p: 'Una página que se puede leer, no doce páginas de cargos. Lo que ve es lo que paga.' },
    { h: 'Cumplimiento incluido', p: 'La señalización, el formato de recibos y las reglas de las redes de tarjetas quedan configurados y actualizados por usted.' },
    { h: 'Soporte de verdad', p: 'Instalación, equipos y dudas del día a día atendidos por personas, no por filas de tickets.' },
  ],
  platformTitle: 'Una Sola Plataforma para Operar, Crecer y Financiar su Negocio',
  platformIntro: name =>
    `Bajar los costos de procesamiento es el comienzo, no toda la historia. Delt está construido como una sola plataforma, así que cuando ${name} crezca, las herramientas ya estarán listas — sin nuevos proveedores, sin nuevas contraseñas, sin proyectos de integración.`,
  platformItems: [
    { h: 'Lens AI', p: 'Un analista de inteligencia artificial integrado en su panel. Haga preguntas sobre su negocio en lenguaje natural — productos más vendidos, días lentos, tendencias mes a mes — y reciba respuestas basadas en sus ventas reales.' },
    { h: 'Punto de Venta y Equipos', p: 'Terminales modernas y sistemas KORONA POS completos llegan preconfigurados para su mostrador. Inventario, permisos de personal y reportes de cierre incluidos — listos para cobrar el mismo día que llegan.' },
    { h: 'Sitios Web y Pedidos en Línea', p: 'Un sitio web profesional con pagos integrados, lanzado por nosotros. Reciba pedidos, depósitos y reservas en línea con los mismos precios transparentes que en su mostrador.' },
    { h: 'Herramientas contra Contracargos', p: 'Cuando un cliente disputa un cargo, Delt arma la evidencia y presenta la respuesta por usted — incluido en todos los programas sin costo adicional.' },
  ],
  capitalTitle: 'Delt Capital: Financiamiento Cuando Lo Necesite',
  capitalIntro: name =>
    `Procesar con Delt hace más que bajar costos — construye una relación de financiamiento. Delt Capital adelanta capital de trabajo a ${name} basándose en sus ventas reales con tarjeta, no en una fórmula bancaria: sin plan de negocios, sin presentaciones, sin semanas de espera.`,
  capitalPoints: [
    { h: 'De $1,000 a $300,000', p: 'Financiamiento a la medida de su volumen real de procesamiento — para equipo, inventario, remodelaciones, una segunda ubicación o simplemente cubrir una temporada baja.' },
    { h: 'Una sola tarifa fija', p: 'Sin interés compuesto, sin cargos por solicitud, sin penalidades por pago anticipado, sin cargos por mora. El costo se acuerda desde el inicio y nunca cambia.' },
    { h: 'Pagos que se ajustan a sus ventas', p: 'Se paga automáticamente como un pequeño porcentaje de las ventas diarias con tarjeta — las semanas buenas abonan más, las lentas abonan menos. Sin sustos de pago fijo mensual.' },
    { h: 'Solicitud rápida y sin riesgo crediticio', p: 'Consultar su oferta toma minutos y no afecta su puntaje de crédito. Los comercios precalificados suelen recibir los fondos al siguiente día hábil.' },
  ],
  capitalPrequalLabel: 'Precalificación de Delt Capital',
  capitalPrequalLine: (name, amount) =>
    `Según el volumen con tarjeta de este estado de cuenta, ${name} podría precalificar hasta por <strong>${amount}</strong> al procesar con Delt.`,
  capitalDisclaimer: 'Los préstamos de Delt Capital son emitidos por Delt Banking Partners, miembro FDIC. Las ofertas reales dependen de la evaluación crediticia y del historial de procesamiento.',
  nextSteps: 'Próximos Pasos',
  stepsIntro: name =>
    `Cambiar de procesador suena complicado; con Delt no lo es. Esto es exactamente lo que sucede después de que ${name} acepta, y cuánto toma cada paso.`,
  steps: [
    { b: 'Acepte esta propuesta', rest: ' — firme la aceptación abajo o responda a su contacto de Delt. Los precios de este documento quedan garantizados por 30 días.' },
    { b: 'Solicitud corta (unos 10 minutos)', rest: ' — datos básicos del negocio; nosotros preparamos el papeleo con el estado de cuenta que ya tenemos.' },
    { b: 'Aprobación en 1–2 días hábiles', rest: ' — la evaluación corre por nuestra cuenta; su contacto de Delt le informa en cada paso.' },
    { b: 'Instalación y puesta en marcha', rest: ' — el equipo y la señalización llegan configurados, y su personal recibe una capacitación. La mayoría de los comercios cambia sin interrupciones.' },
    { b: 'Revisión de ahorro a los 30 días', rest: ' — su contacto de Delt compara su primer estado de cuenta de Delt con esta propuesta, lado a lado, para confirmar que el ahorro se cumplió.' },
  ],
  whatWeNeed: 'Qué Necesitamos de Usted',
  needItems: [
    'Esta propuesta firmada abajo (una confirmación por correo también sirve)',
    'Datos básicos del negocio — razón social, EIN e información de los dueños',
    'Un cheque anulado o carta bancaria para configurar los depósitos',
    'Identificación oficial de quien firma',
    'Su estado de cuenta de procesamiento — ya lo tenemos gracias a este análisis',
  ],
  signature: name => `Firma — ${name}`,
  date: 'Fecha',
  footerLeft: name => `Propuesta de ahorro — ${name}`,
  footerRight: date => `Preparada por Delt · ${date}`,
  programNames: { cash_discount: 'Descuento por Efectivo', flat_rate: 'Tarifa Fija', interchange_plus: 'Intercambio Plus' },
  programTaglines: {
    cash_discount: 'Sus clientes cubren la tarifa de servicio — su costo de procesamiento baja a la cuota del programa.',
    flat_rate: 'Una sola tasa predecible en cada transacción, simplicidad total en su estado de cuenta.',
    interchange_plus: 'Intercambio a costo real con un margen transparente de Delt.',
  },
  howItWorks: {
    cash_discount: [
      'Sus precios publicados quedan exactamente iguales. Los clientes que pagan con tarjeta ven una pequeña tarifa de servicio en su recibo, con señalización clara provista por Delt.',
      'Esa tarifa cubre el costo de aceptar tarjetas, así que las comisiones que usted paga hoy desaparecen. Su único costo es una cuota mensual fija del programa.',
      'Delt se encarga de la señalización, los recibos y la instalación de principio a fin. Los clientes que pagan en efectivo pagan automáticamente el precio más bajo.',
    ],
    flat_rate: [
      'Usted paga una sola tasa simple más unos centavos por transacción — igual en cada tarjeta, todas las veces.',
      'Sin niveles, sin recargos por línea, sin sorpresas. Su estado de cuenta se convierte en una línea que sí se puede leer.',
      'Su tasa queda fijada a su perfil de negocio — sin aumentos con el tiempo.',
    ],
    interchange_plus: [
      'Cada tarjeta tiene un costo mayorista fijado por las redes, llamado intercambio. Usted lo paga a costo real, sin márgenes escondidos.',
      'Delt agrega un solo margen pequeño y transparente — usted ve exactamente lo que cobran las redes y exactamente lo que gana Delt.',
      'Cuando las redes bajan una tasa, el ahorro pasa directo a usted.',
    ],
  },
  toolbar: { present: '▶ Presentar', download: '⬇ Descargar', pdf: '🖨 Guardar PDF', send: '✉ Enviar' },
  presentHint: '← → para navegar · Esc para salir',
  mailSubject: name => `Su propuesta de ahorro de Delt — ${name}`,
  mailBody: a => [
    'Hola,', '',
    'Gracias por compartir su estado de cuenta de procesamiento. Lo revisamos línea por línea y los números merecen su atención:', '',
    `• Hoy: ${a.current}/mes en costos de procesamiento (tasa efectiva del ${a.rate}%)`,
    `• Con Delt ${a.program}: ${a.newCost}/mes`,
    `• Ahorro estimado: ${a.savings} al año`, '',
    'Su propuesta completa va adjunta (se abre en cualquier navegador). Con gusto la repasamos juntos cuando le convenga.', '',
    a.signoff,
  ].join('\n'),
  teamSignoff: 'El Equipo Delt',
};

export function buildProposalHtml(input: ProposalInput): string {
  const { extracted: ex, programs, focusKey, preparedBy, preparedByEmail, lang = 'en', category } = input;
  const L = lang === 'es' ? ES_COPY : EN;
  const requested = programs.find(p => p.key === focusKey) ?? programs[0];
  // The document narrates savings on every page — a $0-savings focus reads as
  // broken in front of a merchant, so fall back to the best-savings program.
  const bestSavings = programs.reduce<ProgramQuote | null>(
    (b, p) => (p.annualSavings > (b?.annualSavings ?? 0) ? p : b), null,
  );
  const focus = requested && requested.annualSavings <= 0 && bestSavings ? bestSavings : requested;
  if (!focus) return '';

  const name = esc(ex.merchantName);
  const today = new Date().toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const monthlySavings = Math.max(0, ex.currentMonthlyCost - focus.monthlyCost);
  const currentAnnual = Math.round(ex.currentMonthlyCost * 12);
  const maxFee = Math.max(...ex.fees.map(f => f.amount), 1);
  const maxCost = Math.max(currentAnnual, focus.annualCost, 1);
  const focusName = L.programNames[focus.key];
  // Indicative Delt Capital pre-qualification: roughly one month of card
  // volume, within the program's $1k–$300k band (marked indicative in copy).
  const capitalUpTo = Math.min(300_000, Math.max(5_000, Math.round(ex.totalVolume / 1000) * 1000));

  const fileName = `Delt-Proposal-${ex.merchantName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Merchant'}-${new Date().toISOString().slice(0, 10)}.html`;
  const mailSubject = L.mailSubject(ex.merchantName);
  const mailBody = L.mailBody({
    current: fmt(ex.currentMonthlyCost),
    program: focusName,
    newCost: fmt(focus.monthlyCost),
    savings: fmtWhole(focus.annualSavings),
    rate: ex.effectiveRatePct,
    signoff: preparedBy ? `${preparedBy}\nDelt` : L.teamSignoff,
  });

  const feeRows = ex.fees.map(f => `
    <tr>
      <td>${esc(f.label)}</td>
      <td class="num">${fmt(f.amount)}</td>
      <td class="barcell"><div class="bar gray" style="width:${Math.max(2, Math.round((f.amount / maxFee) * 100))}%"></div></td>
    </tr>`).join('');

  const programCards = programs.map(p => `
    <div class="program ${p.key === focus.key ? 'focus' : ''}">
      ${p.key === focus.key ? '<div class="pill">' + esc(L.recommendedFor(ex.merchantName)) + '</div>' : ''}
      <h3>${esc(L.programNames[p.key])}</h3>
      <p class="tagline">${esc(L.programTaglines[p.key])}</p>
      <p class="terms">${esc(lang === 'es' ? termsToEs(p.terms) : p.terms)}</p>
      <div class="split">
        <div><span class="lbl">${esc(L.youdPay)}</span><span class="val">${fmt(p.monthlyCost)}${L.perMo}</span></div>
        <div><span class="lbl">${esc(L.youdSave)}</span><span class="val ${p.annualSavings > 0 ? 'green' : ''}">${p.annualSavings > 0 ? fmtWhole(p.annualSavings) + L.perYr : esc(L.sameAsToday)}</span></div>
      </div>
    </div>`).join('');

  const steps = L.howItWorks[focus.key].map((s, i) => `
    <div class="step"><div class="stepnum">${i + 1}</div><p>${esc(s)}</p></div>`).join('');

  const footer = `<div class="footer"><span>${L.footerLeft(name)}</span><span>${L.footerRight(today)}</span></div>`;

  // ── Qualification findings, merchant-safe ──
  // Only finding ids present in L.findingsCopy render; the audit's rep-facing
  // title/detail/action strings never reach this document. History rows are
  // normalized upstream, but guard the optional fields anyway.
  const findings = category
    ? auditQualification({
        fees: ex.fees ?? [],
        downgradeLines: ex.downgradeLines ?? [],
        pinDebitPresent: ex.pinDebitPresent ?? null,
        notes: ex.notes ?? '',
        totalVolume: ex.totalVolume,
        totalTransactions: ex.totalTransactions,
        avgTicket: ex.avgTicket,
        effectiveRatePct: ex.effectiveRatePct,
        currentMonthlyCost: ex.currentMonthlyCost,
      }, category)
    : [];
  const dgLabels = (ex.downgradeLines ?? []).map(l => l.label).slice(0, 3).join(', ');
  const findingCards = findings.map(f => {
    const copy = L.findingsCopy[f.id];
    if (!copy) return '';
    const save = f.estAnnualRecovery !== null && f.estAnnualRecovery > 0
      ? `<span class="save">${esc(L.findingsSavesLabel)} ~${fmtWhole(f.estAnnualRecovery)}${L.perYr}</span>`
      : '';
    return `<div class="finding">${save}<h4>${esc(copy.h)}</h4><p>${esc(copy.p({ name: ex.merchantName, labels: dgLabels }))}</p></div>`;
  }).join('');
  const findingsPage = findingCards ? `
<!-- ── Page: what we found in the statement ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.findingsTitle)}</h2>
  <div class="rule"></div>
  <p>${esc(L.findingsIntro(ex.merchantName))}</p>
  ${findingCards}
  <div class="callout">${esc(L.findingsDisclaimer)}</div>
  ${footer}
</div>` : '';

  const quoteCards = L.testimonials.map(t => `
    <div class="quote"><p class="q">“${esc(t.quote)}”</p><p class="who">${esc(t.name)} · ${esc(t.role)}, ${esc(t.business)} — ${esc(t.location)}</p></div>`).join('');
  const faqBlocks = L.faqs.map(f => `
    <div class="faq"><h4>${esc(f.q)}</h4><p>${esc(f.a)}</p></div>`).join('');

  const whyCells = L.whyItems.map(w => `<div><h4>${esc(w.h)}</h4><p>${esc(w.p)}</p></div>`).join('\n    ');
  const platformCells = L.platformItems.map(w => `<div><h4>${esc(w.h)}</h4><p>${esc(w.p)}</p></div>`).join('\n    ');
  const capitalCells = L.capitalPoints.map(w => `<div><h4>${esc(w.h)}</h4><p>${esc(w.p)}</p></div>`).join('\n    ');
  const nextSteps = L.steps.map((s, i) =>
    `<div class="step"><div class="stepnum">${i + 1}</div><p><strong>${esc(s.b)}</strong>${esc(s.rest)}</p></div>`).join('\n  ');
  const needList = L.needItems.map(n => `<li>${esc(n)}</li>`).join('\n    ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${L.docTitle} — ${name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body {
    /* CRM typography (backend-theme.css): Inter, system stack as the
       offline/print fallback for the downloaded standalone file. */
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #3A4763; font-size: 13px; line-height: 1.55;
    font-variant-numeric: tabular-nums lining-nums;
  }
  @page { size: letter; margin: 0; }
  .page {
    width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.75in;
    page-break-after: always; position: relative; background: #fff;
  }
  .page:last-child { page-break-after: auto; }
  @media screen { .page { box-shadow: 0 1px 8px rgba(0,0,0,0.12); margin: 16px auto; } body { background: #eef0f3; } }

  .brand svg { height: 24px; width: auto; display: block; }
  h1 { font-size: 40px; line-height: 1.1; color: #0B1730; letter-spacing: -0.02em; margin: 18px 0 6px; }
  h2 { font-size: 19px; color: #0B1730; letter-spacing: -0.02em; margin-bottom: 4px; }
  .rule { height: 3px; width: 44px; background: #2E6BFF; border-radius: 2px; margin: 10px 0 16px; }
  .muted { color: #6b7280; }
  .small { font-size: 11px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .green { color: #149655; }

  /* Cover */
  .cover { display: flex; flex-direction: column; }
  .cover .hero {
    margin-top: 26px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px;
    padding: 26px; text-align: center;
  }
  .cover .hero .big { font-size: 46px; font-weight: 800; color: #149655; }
  .prepared { display: flex; gap: 14px; margin-top: 26px; }
  .prepared > div { flex: 1; background: #f0f5ff; border-radius: 10px; padding: 14px 16px; }
  .prepared .lbl { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 4px; }
  .prepared .who { font-size: 15px; font-weight: 700; color: #0B1730; }
  .coverfoot { margin-top: auto; padding-top: 24px; font-size: 11px; color: #9ca3af; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; padding: 7px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
  th.num { text-align: right; }
  td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; }
  .barcell { width: 45%; }
  .bar { height: 9px; border-radius: 4px; }
  .bar.gray { background: #9ca3af; }
  .bar.blue { background: #2E6BFF; }

  .callout { background: #f0f5ff; border-left: 3px solid #2E6BFF; border-radius: 0 8px 8px 0; padding: 12px 14px; margin: 14px 0; }

  /* Stat grid */
  .stats { display: flex; gap: 12px; margin: 14px 0; }
  .stats > div { flex: 1; background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
  .stats .lbl { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 3px; }
  .stats .val { font-size: 17px; font-weight: 700; color: #0B1730; }

  /* Programs */
  .programs { display: flex; gap: 12px; margin: 14px 0; align-items: stretch; }
  .program { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; }
  .program.focus { border: 2px solid #2E6BFF; background: #f7faff; }
  .program .pill { align-self: flex-start; background: #2E6BFF; color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; border-radius: 99px; padding: 3px 9px; margin-bottom: 8px; }
  .program h3 { font-size: 14px; margin-bottom: 4px; }
  .program .tagline { font-size: 11px; color: #6b7280; }
  .program .terms { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; background: #f3f4f6; border-radius: 6px; padding: 5px 8px; margin: 10px 0; }
  .program .split { display: flex; gap: 10px; margin-top: auto; padding-top: 10px; border-top: 1px solid #eef0f3; }
  .program .split > div { flex: 1; }
  .program .lbl { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  .program .val { font-size: 12px; font-weight: 700; }

  /* Cost comparison bars */
  .compare { margin: 14px 0; }
  .compare .row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
  .compare .lbl { width: 170px; font-size: 12px; }
  .compare .track { flex: 1; }
  .compare .amount { width: 80px; font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
  .compare .bar { height: 20px; border-radius: 5px; }

  /* Steps */
  .step { display: flex; gap: 12px; margin: 12px 0; }
  .stepnum { width: 24px; height: 24px; border-radius: 50%; background: #2E6BFF; color: #fff; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* Why Delt */
  .why { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .why > div { background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
  .why h4 { font-size: 12px; margin-bottom: 3px; }
  .why p { font-size: 11px; color: #6b7280; }

  /* Delt Capital */
  .capital { background: #f7faff; border: 1px solid #dbe5ff; border-radius: 12px; padding: 16px 18px; margin: 14px 0; }
  .capital .why { margin: 12px 0 0; }
  .capital .why > div { background: #fff; }
  .prequal { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; margin-top: 12px; }
  .prequal .lbl { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #149655; margin-bottom: 3px; }

  /* Findings */
  .finding { border: 1px solid #E0E6F0; border-radius: 10px; padding: 13px 16px; margin: 11px 0; }
  .finding h4 { font-size: 13px; color: #0B1730; margin-bottom: 4px; }
  .finding p { font-size: 11.5px; color: #3A4763; }
  .finding .save { float: right; background: #ecfdf5; border: 1px solid #a7f3d0; color: #149655; font-weight: 800; font-size: 11px; border-radius: 99px; padding: 3px 10px; margin-left: 10px; white-space: nowrap; }

  /* Testimonials */
  .quote { background: #f9fafb; border: 1px solid #eef0f3; border-radius: 10px; padding: 13px 16px; margin: 10px 0; }
  .quote .q { font-style: italic; font-size: 12px; color: #3A4763; }
  .quote .who { margin-top: 6px; font-size: 11px; font-weight: 600; color: #61708C; }

  /* FAQ */
  .faq { margin: 11px 0; }
  .faq h4 { font-size: 12.5px; color: #0B1730; margin-bottom: 3px; }
  .faq p { font-size: 11.5px; color: #3A4763; }

  /* Checklist */
  ul.check { list-style: none; margin: 10px 0; }
  ul.check li { padding: 6px 0 6px 26px; position: relative; border-bottom: 1px solid #f3f4f6; }
  ul.check li:last-child { border-bottom: none; }
  ul.check li:before { content: '✓'; position: absolute; left: 4px; color: #149655; font-weight: 800; }

  /* Acceptance */
  .sig { display: flex; gap: 24px; margin-top: 28px; }
  .sig > div { flex: 1; }
  .sigline { border-bottom: 1px solid #9ca3af; height: 34px; margin-bottom: 5px; }
  .footer { position: absolute; bottom: 0.45in; left: 0.75in; right: 0.75in; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; border-top: 1px solid #eef0f3; padding-top: 8px; }

  /* ── Screen-only toolbar (Present / Download / PDF / Send) ── */
  .toolbar {
    position: fixed; top: 14px; right: 16px; z-index: 50;
    display: flex; gap: 8px; align-items: center;
  }
  .toolbar button {
    font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
    border-radius: 8px; padding: 8px 14px; border: 1px solid #d1d5db;
    background: #fff; color: #374151; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    display: flex; align-items: center; gap: 6px;
  }
  .toolbar button:hover { background: #f9fafb; }
  .toolbar button.primary { background: #2E6BFF; border-color: #2E6BFF; color: #fff; }
  .toolbar button.primary:hover { background: #2458E6; }

  /* ── Presentation mode: one page at a time, scaled to the screen ── */
  body.present { background: #0f1115 !important; overflow: hidden; }
  body.present .page { display: none; margin: 0; box-shadow: none; }
  body.present .page.active {
    display: block; position: fixed; top: calc(50% - 30px); left: 50%;
    transform: translate(-50%, -50%) scale(var(--pscale, 1));
    border-radius: 4px; box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  }
  body.present .toolbar { display: none; }
  .pnav {
    display: none; position: fixed; z-index: 60; left: 0; right: 0; bottom: 22px;
    justify-content: center; align-items: center; gap: 14px;
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  body.present .pnav { display: flex; }
  .pnav button {
    font: inherit; font-size: 16px; font-weight: 700; cursor: pointer;
    width: 40px; height: 40px; border-radius: 50%; border: none;
    background: rgba(255,255,255,0.14); color: #fff;
  }
  .pnav button:hover { background: rgba(255,255,255,0.28); }
  .pnav .counter { color: rgba(255,255,255,0.75); font-size: 13px; min-width: 52px; text-align: center; }
  .pnav .hint { color: rgba(255,255,255,0.45); font-size: 11px; }
  @media print { .toolbar, .pnav { display: none !important; } body.present .page { display: block; position: static; transform: none; } }
</style>
</head>
<body>

<div class="toolbar">
  <button class="primary" onclick="startPresent()">${L.toolbar.present}</button>
  <button onclick="downloadProposal()">${L.toolbar.download}</button>
  <button onclick="window.print()">${L.toolbar.pdf}</button>
  <button onclick="sendProposal()">${L.toolbar.send}</button>
</div>

<div class="pnav">
  <button onclick="step(-1)">‹</button>
  <span class="counter" id="pcounter"></span>
  <button onclick="step(1)">›</button>
  <span class="hint">${L.presentHint}</span>
</div>

<!-- ── Page 1: Cover ── -->
<div class="page cover">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h1>${L.heroTitle}</h1>
  <p class="muted">${esc(L.preparedExclusivelyFor)} <strong>${name}</strong></p>
  <div class="hero">
    <p class="muted small" style="text-transform:uppercase;letter-spacing:0.08em;">${esc(L.estAnnualSavingsWith(focusName))}</p>
    <div class="big">${fmtWhole(focus.annualSavings)}</div>
    <p class="green" style="font-weight:700;">${esc(L.heroLine(focus.savingsPct, ex.merchantName, monthlySavings > 0 ? fmtWhole(monthlySavings) : null))}</p>
  </div>
  <div class="prepared">
    <div>
      <span class="lbl">${esc(L.preparedFor)}</span>
      <span class="who">${name}</span>
      <p class="muted small">${esc(L.basedOnStatement(ex.statementPeriod, ex.currentProcessor))}</p>
    </div>
    <div>
      <span class="lbl">${esc(L.preparedBy)}</span>
      <span class="who">${preparedBy ? esc(preparedBy) : 'Delt'}</span>
      <p class="muted small">${today}</p>
    </div>
  </div>
  <p class="coverfoot">${esc(L.coverDisclaimer)}</p>
</div>

<!-- ── Page 2: Where you are today ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.executiveSummary)}</h2>
  <div class="rule"></div>
  <p>${L.executiveBody({
    name, period: esc(ex.statementPeriod), processor: esc(ex.currentProcessor),
    volume: fmtWhole(ex.totalVolume), txns: ex.totalTransactions.toLocaleString(),
    monthlyCost: fmt(ex.currentMonthlyCost), rate: ex.effectiveRatePct,
    program: esc(focusName), newCost: fmt(focus.monthlyCost), savings: fmtWhole(focus.annualSavings),
  })}</p>

  <h2 style="margin-top:24px;">${esc(L.whereMoneyGoes)}</h2>
  <div class="rule"></div>
  <div class="stats">
    <div><span class="lbl">${esc(L.monthlyVolume)}</span><span class="val">${fmtWhole(ex.totalVolume)}</span></div>
    <div><span class="lbl">${esc(L.effectiveRate)}</span><span class="val">${ex.effectiveRatePct}%</span></div>
    <div><span class="lbl">${esc(L.monthlyCost)}</span><span class="val">${fmt(ex.currentMonthlyCost)}</span></div>
    <div><span class="lbl">${esc(L.annualCost)}</span><span class="val">${fmtWhole(currentAnnual)}</span></div>
  </div>
  <table>
    <thead><tr><th>${esc(L.feeOnStatement)}</th><th class="num">${esc(L.amount)}</th><th></th></tr></thead>
    <tbody>${feeRows}</tbody>
  </table>
  <div class="callout">
    ${L.calloutMeaning(name)}${ex.chargebackCount > 0 ? L.calloutChargebacks(ex.chargebackCount) : ''}
  </div>
  ${footer}
</div>
${findingsPage}
<!-- ── Page 3: Proposed solutions ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.pricingOptions)}</h2>
  <div class="rule"></div>
  <p>${esc(L.pricingIntro(ex.merchantName))}</p>
  <div class="programs">${programCards}</div>

  <h2 style="margin-top:20px;">${esc(L.annualCostCompare)}</h2>
  <div class="rule"></div>
  <div class="compare">
    <div class="row">
      <div class="lbl">${esc(L.today)}${ex.currentProcessor ? ` (${esc(ex.currentProcessor)})` : ''}</div>
      <div class="track"><div class="bar gray" style="width:${Math.max(3, Math.round((currentAnnual / maxCost) * 100))}%"></div></div>
      <div class="amount">${fmtWhole(currentAnnual)}</div>
    </div>
    <div class="row">
      <div class="lbl">${esc(L.with)} ${esc(focusName)}</div>
      <div class="track"><div class="bar blue" style="width:${Math.max(3, Math.round((focus.annualCost / maxCost) * 100))}%"></div></div>
      <div class="amount">${fmtWhole(focus.annualCost)}</div>
    </div>
  </div>
  <div class="stats">
    <div><span class="lbl">${esc(L.year1Savings)}</span><span class="val green">${fmtWhole(focus.annualSavings)}</span></div>
    <div><span class="lbl">${esc(L.threeYearSavings)}</span><span class="val green">${fmtWhole(Math.round(monthlySavings * 36))}</span></div>
    <div><span class="lbl">${esc(L.everyMonth)}</span><span class="val green">${fmtWhole(monthlySavings)}</span></div>
  </div>
  ${focus.key === 'cash_discount' ? `<p class="muted small">${esc(L.cdNote(ex.merchantName, focus.terms.split(' ')[0] ?? ''))}</p>` : ''}
  ${footer}
</div>

<!-- ── Page 4: How the program works + why Delt ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.howWorks(focusName))}</h2>
  <div class="rule"></div>
  ${steps}

  <h2 style="margin-top:20px;">${esc(L.whyDelt)}</h2>
  <div class="rule"></div>
  <div class="why">
    ${whyCells}
  </div>
  ${footer}
</div>

<!-- ── Page 5: The Delt platform + Delt Capital ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.platformTitle)}</h2>
  <div class="rule"></div>
  <p>${esc(L.platformIntro(ex.merchantName))}</p>
  <div class="why">
    ${platformCells}
  </div>

  <div class="capital">
    <h2>${esc(L.capitalTitle)}</h2>
    <div class="rule"></div>
    <p>${esc(L.capitalIntro(ex.merchantName))}</p>
    <div class="why">
      ${capitalCells}
    </div>
    <div class="prequal">
      <span class="lbl">${esc(L.capitalPrequalLabel)}</span>
      ${L.capitalPrequalLine(name, fmtWhole(capitalUpTo))}
    </div>
    <p class="muted small" style="margin-top:8px;">${esc(L.capitalDisclaimer)}</p>
  </div>
  ${footer}
</div>

<!-- ── Page: merchants on Delt + common questions ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.socialTitle)}</h2>
  <div class="rule"></div>
  ${quoteCards}

  <h2 style="margin-top:20px;">${esc(L.faqTitle)}</h2>
  <div class="rule"></div>
  ${faqBlocks}
  ${footer}
</div>

<!-- ── Page: Next steps + what we need + acceptance ── -->
<div class="page">
  <div class="brand">${DELT_LOGO_SVG}</div>
  <h2 style="margin-top:14px;">${esc(L.nextSteps)}</h2>
  <div class="rule"></div>
  <p>${esc(L.stepsIntro(ex.merchantName))}</p>
  ${nextSteps}

  <h2 style="margin-top:20px;">${esc(L.whatWeNeed)}</h2>
  <div class="rule"></div>
  <ul class="check">
    ${needList}
  </ul>

  <div class="sig">
    <div><div class="sigline"></div><p class="small muted">${esc(L.signature(ex.merchantName))}</p></div>
    <div><div class="sigline"></div><p class="small muted">${esc(L.date)}</p></div>
  </div>
  ${footer}
</div>

<script>
var FILENAME = ${js(fileName)};
var MAIL_SUBJECT = ${js(mailSubject)};
var MAIL_BODY = ${js(mailBody)};
var SENDER_EMAIL = ${js(preparedByEmail ?? '')};

var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
var idx = 0;

function fitPage() {
  // .page is 8.5in × 11in → 816 × 1056 CSS px at 96dpi.
  var s = Math.min(window.innerWidth / 856, (window.innerHeight - 90) / 1056);
  document.documentElement.style.setProperty('--pscale', String(Math.max(0.2, s)));
}

function show(i) {
  idx = Math.max(0, Math.min(pages.length - 1, i));
  pages.forEach(function (p, n) { p.classList.toggle('active', n === idx); });
  var c = document.getElementById('pcounter');
  if (c) c.textContent = (idx + 1) + ' / ' + pages.length;
}

function step(d) { show(idx + d); }

function startPresent() {
  document.body.classList.add('present');
  fitPage();
  show(0);
  var el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
}

function endPresent() {
  document.body.classList.remove('present');
  pages.forEach(function (p) { p.classList.remove('active'); });
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
}

document.addEventListener('fullscreenchange', function () {
  // Leaving browser fullscreen (Esc) also leaves presentation mode.
  if (!document.fullscreenElement && document.body.classList.contains('present')) endPresent();
});

document.addEventListener('keydown', function (e) {
  if (!document.body.classList.contains('present')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
  else if (e.key === 'Escape') endPresent();
});

document.addEventListener('click', function (e) {
  if (!document.body.classList.contains('present')) return;
  // Click on the page itself advances; toolbar/nav buttons keep their own
  // handlers (the Present click itself bubbles here, so exclude the toolbar).
  if (e.target.closest && (e.target.closest('.pnav') || e.target.closest('.toolbar'))) return;
  step(1);
});

window.addEventListener('resize', function () {
  if (document.body.classList.contains('present')) fitPage();
});

function downloadProposal() {
  var wasPresenting = document.body.classList.contains('present');
  if (wasPresenting) endPresent();
  var html = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
  var blob = new Blob([html], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sendProposal() {
  // Download the file so it can be attached, then open Outlook Web compose in
  // the rep's own account (login_hint routes to the signed-in CRM user's
  // mailbox when the browser holds several Microsoft accounts).
  downloadProposal();
  var url = 'https://outlook.office.com/mail/deeplink/compose'
    + '?subject=' + encodeURIComponent(MAIL_SUBJECT)
    + '&body=' + encodeURIComponent(MAIL_BODY)
    + (SENDER_EMAIL ? '&login_hint=' + encodeURIComponent(SENDER_EMAIL) : '');
  var win = window.open(url, '_blank');
  if (!win) {
    // Pop-up blocked — fall back to the default mail client.
    window.location.href = 'mailto:?subject=' + encodeURIComponent(MAIL_SUBJECT) + '&body=' + encodeURIComponent(MAIL_BODY);
  }
}
</script>

</body>
</html>`;
}

/**
 * Open the proposal in a new window. Its built-in toolbar offers Present
 * (full-screen walkthrough), Download, Save as PDF, and Send.
 */
export function openProposalPdf(input: ProposalInput): boolean {
  const html = buildProposalHtml(input);
  if (!html) return false;
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = `${input.lang === 'es' ? 'Propuesta de Ahorro' : 'Savings Proposal'} — ${input.extracted.merchantName}`;
  win.focus();
  return true;
}
