/**
 * ────────────────────────────────────────────────────────────
 * Delt Merchant Services Training — curriculum content
 * ────────────────────────────────────────────────────────────
 * The written syllabus behind the agent Training page. Six modules from
 * "how a card swipe actually works" to the Delt-specific playbook. Each
 * lesson carries a knowledge check; passing marks it complete in
 * training_progress. Content is industry-general where it teaches the
 * trade and Delt-specific where it teaches our programs.
 *
 * Compliance note: surcharge/cash-discount rules vary by state and change;
 * lessons teach the framework and tell agents to confirm current rules with
 * ops before advising a merchant.
 */

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index into options. */
  answer: number;
}

export interface TrainingLesson {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  lessons: TrainingLesson[];
}

/** Fraction of quiz questions that must be correct to pass a lesson. */
export const PASS_RATIO = 2 / 3;

export function gradeQuiz(
  answers: (number | null)[],
  quiz: QuizQuestion[],
): { correct: number; total: number; passed: boolean } {
  const total = quiz.length;
  const correct = quiz.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  return { correct, total, passed: correct >= Math.ceil(total * PASS_RATIO) };
}

export const CURRICULUM: TrainingModule[] = [
  {
    id: 'm1',
    title: 'How Card Payments Actually Work',
    description: 'The players, the money flow, and why merchants pay what they pay.',
    lessons: [
      {
        id: 'm1-l1',
        title: 'The five players in every transaction',
        minutes: 6,
        paragraphs: [
          'Every card payment involves five parties. The cardholder (the customer), the issuer (the bank that gave them the card and takes the credit risk), the card network (Visa, Mastercard, Discover, Amex — the rails the transaction rides on), the acquirer/processor (the company that accepts the payment on the merchant’s behalf and settles the money), and the merchant. Delt sits on the acquiring side: we arrange processing for the merchant through our processing partners.',
          'Why this matters to you as a seller: the merchant’s "processing fee" is not one fee — it’s three stacked layers. The issuer gets interchange, the network gets assessments, and the acquirer/processor gets a markup. Only that last layer is negotiable. When a competitor says "I’ll cut your rate in half," they can only be talking about the markup — interchange and assessments are the same for everyone.',
          'When you can explain to a merchant which part of their bill is fixed cost and which part is the processor’s profit, you instantly separate yourself from every rep who just waves a rate at them. That credibility is the foundation of the Delt pitch.',
        ],
        keyPoints: [
          'Five players: cardholder, issuer, network, acquirer/processor, merchant.',
          'Interchange goes to the issuer; assessments go to the network; markup goes to the processor.',
          'Only the processor markup is negotiable — interchange and assessments are the same for everyone.',
          'Delt operates on the acquiring side, arranging processing through partner processors.',
        ],
        quiz: [
          { q: 'Which fee layer is actually negotiable when a merchant switches processors?', options: ['Interchange', 'Network assessments', 'The processor markup', 'None of them'], answer: 2 },
          { q: 'Who receives interchange?', options: ['The card network', 'The issuing bank', 'The processor', 'The merchant’s bank'], answer: 1 },
          { q: 'Delt operates on which side of a transaction?', options: ['Issuing', 'Acquiring', 'Network', 'Cardholder'], answer: 1 },
        ],
      },
      {
        id: 'm1-l2',
        title: 'Authorization, clearing, and settlement',
        minutes: 6,
        paragraphs: [
          'A card payment happens in three phases. Authorization: at the moment of sale, the terminal sends the transaction to the processor, which routes it through the network to the issuer; the issuer approves or declines in about a second, checking funds, fraud signals, and card status. Nothing has moved yet — an authorization is a hold, not money.',
          'Clearing: at the end of the day the merchant "batches out," submitting the day’s authorizations for processing. The network sorts every transaction to the right issuer and calculates what everyone owes. Settlement: the issuer sends the money (minus interchange), the network takes its assessment, the processor takes its markup, and the merchant receives the net deposit — typically the next business day.',
          'Two practical consequences you will use in the field. First, batching late delays the merchant’s deposit — a surprisingly common complaint you can fix in five minutes by checking their auto-batch time. Second, the gap between authorization and settlement is where risk lives: refunds, voids, and chargebacks all play out against this timeline, which is why underwriting cares about what a merchant sells and how they deliver it.',
        ],
        keyPoints: [
          'Authorization is a hold; no money moves until clearing and settlement.',
          'Merchants batch out daily; late batching delays their deposit.',
          'Settlement nets out interchange, assessments, and markup before the merchant is paid.',
          'The auth-to-settlement gap is where refunds, voids, and chargebacks live.',
        ],
        quiz: [
          { q: 'When does money actually move to the merchant?', options: ['At authorization', 'At settlement', 'When the cardholder pays their bill', 'Instantly on swipe'], answer: 1 },
          { q: 'A merchant complains deposits arrive a day late. The first thing to check is:', options: ['Their pricing plan', 'Their auto-batch time', 'Their bank', 'Their card mix'], answer: 1 },
          { q: 'An authorization is best described as:', options: ['A completed payment', 'A hold on funds', 'A settlement', 'A chargeback'], answer: 1 },
        ],
      },
      {
        id: 'm1-l3',
        title: 'Interchange: the wholesale cost of cards',
        minutes: 7,
        paragraphs: [
          'Interchange is the wholesale price of accepting a card, set by the networks and paid to the issuer. It is not one rate — there are hundreds of interchange categories, priced by card type (debit is cheapest, premium rewards and commercial cards are most expensive), by how the card is presented (card-present swiped/dipped/tapped is cheaper than keyed or online), and by merchant category and data quality.',
          'The pattern to remember: more risk or more rewards means higher interchange. A regulated debit card dipped in person might cost a fraction of a percent plus a few cents. A keyed-in corporate rewards card can cost close to three percent. The same $100 sale can carry very different wholesale costs depending on the card the customer happens to pull out.',
          'This is why "what’s your rate?" is an unanswerable question and why tiered pricing hides so much. It is also the engine behind Delt’s statement analyzer: it reads a merchant’s statement, reconstructs what interchange should have cost, and shows what the processor padded on top. You don’t need to memorize categories — you need to understand the pattern well enough to explain the analyzer’s findings with confidence.',
        ],
        keyPoints: [
          'Interchange is set by networks, paid to issuers, and non-negotiable.',
          'Debit < standard credit < rewards < commercial; card-present < keyed/online.',
          'The same sale costs different amounts depending on the card presented.',
          'The Delt analyzer reconstructs true interchange to expose processor padding.',
        ],
        quiz: [
          { q: 'Which transaction generally carries the LOWEST interchange?', options: ['Keyed-in rewards credit', 'Online corporate card', 'In-person regulated debit', 'Recurring billing credit'], answer: 2 },
          { q: 'Interchange rates are set by:', options: ['Each processor', 'The card networks', 'The federal government', 'The merchant’s bank'], answer: 1 },
          { q: 'Why is "what’s your rate?" hard to answer honestly?', options: ['Rates are secret', 'Cost varies by card type and entry method', 'Networks change rates daily', 'Merchants can’t see their statements'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'm2',
    title: 'Pricing Models & Reading a Statement',
    description: 'Interchange-plus, flat rate, tiered, cash discount — and how to find the truth on a statement.',
    lessons: [
      {
        id: 'm2-l1',
        title: 'The four pricing models',
        minutes: 8,
        paragraphs: [
          'Interchange-plus passes the true interchange cost through and adds a transparent markup (for example, interchange + 0.25% + $0.10). It is the most honest model and the easiest to audit — the merchant can see exactly what the processor earns. Flat rate (the Square/Stripe model) charges one blended rate on everything; simple, but the merchant overpays on cheap cards like debit to subsidize the pricing simplicity.',
          'Tiered pricing buckets transactions into "qualified," "mid-qualified," and "non-qualified" tiers. The advertised rate is the qualified tier; the processor decides what qualifies, and the expensive tiers are where margins hide. If a statement shows tier language and a wide spread between tiers, the merchant is almost certainly overpaying — this is the model the analyzer exposes most dramatically.',
          'Cash discount / dual pricing posts a cash price and a card price: card-paying customers cover a service fee and the merchant’s effective processing cost goes to zero. This is Delt’s flagship program. It is legal in all 50 states when structured and disclosed correctly — as a discount for cash off a posted price, not a hidden penalty for cards. Surcharging (adding a fee on credit cards specifically) is a different, more regulated thing: it is capped by network rules, never allowed on debit, and restricted in a small number of states. Delt structures programs compliantly and provides the signage — your job is to represent the program accurately, never to improvise the compliance details.',
        ],
        keyPoints: [
          'Interchange-plus is transparent; tiered pricing is where margins hide.',
          'Flat rate trades simplicity for overpayment on cheap cards.',
          'Cash discount = discount off a posted price; legal in all 50 states when disclosed properly.',
          'Surcharging is a different, more regulated model — capped, never on debit, restricted in some states. Confirm current rules with ops.',
        ],
        quiz: [
          { q: 'Which pricing model lets a merchant see exactly what the processor earns?', options: ['Tiered', 'Flat rate', 'Interchange-plus', 'Bundled'], answer: 2 },
          { q: 'In tiered pricing, the advertised rate is usually:', options: ['The average of all tiers', 'The qualified tier only', 'The non-qualified tier', 'A legal maximum'], answer: 1 },
          { q: 'A compliant cash discount program is structured as:', options: ['A penalty fee on card users', 'A discount for cash off the posted price', 'A surcharge on debit cards', 'A monthly membership'], answer: 1 },
        ],
      },
      {
        id: 'm2-l2',
        title: 'Reading a statement like an auditor',
        minutes: 8,
        paragraphs: [
          'Every statement, from any processor, answers three questions if you know where to look: how much volume ran, what the total cost of acceptance was, and how that cost breaks down. Start with the effective rate: total fees divided by total volume. A retail merchant on fair pricing usually lands in the low-to-mid 2% range all-in; north of 3% on ordinary retail volume means someone is feasting.',
          'Then hunt the junk: monthly "statement fees," "PCI non-compliance fees" (often charged while providing nothing), "batch fees," annual fees, and vague "other" lines. On tiered statements, look for the share of volume landing in mid- and non-qualified tiers — downgrades are often engineered by the processor’s setup, not the merchant’s card mix.',
          'In practice you will rarely do this by hand: upload the statement to the Delt analyzer and it extracts volume, transaction count, effective rate, and the full fee breakdown, then quotes our programs against it. But you must be able to walk a merchant through the output line by line. The rep who can explain the statement owns the conversation; the rep who just reads a savings number is every other rep they’ve met.',
        ],
        keyPoints: [
          'Effective rate = total fees ÷ total volume; it is the single most useful number.',
          'Junk fees: statement, PCI non-compliance, batch, annual, and vague "other" lines.',
          'Tier downgrades are often the processor’s doing, not the merchant’s.',
          'Use the analyzer for extraction — but be able to explain every line yourself.',
        ],
        quiz: [
          { q: 'Effective rate is calculated as:', options: ['Qualified rate + per-item fee', 'Total fees ÷ total volume', 'Interchange + assessments', 'Monthly fees × 12'], answer: 1 },
          { q: 'Which of these is a classic junk fee?', options: ['Interchange', 'Network assessment', 'PCI non-compliance fee', 'Settlement deposit'], answer: 2 },
          { q: 'A merchant’s ordinary retail statement shows a 3.8% effective rate. That most likely means:', options: ['Their customers use debit', 'They are on excellent pricing', 'They are significantly overpaying', 'Their volume is too low to price'], answer: 2 },
        ],
      },
      {
        id: 'm2-l3',
        title: 'Selling the cash discount program honestly',
        minutes: 7,
        paragraphs: [
          'The cash discount pitch is simple: "Your processing cost goes to zero. Your customers see a posted price, and cash payers get a discount off it. We provide the signage, program the terminal, and handle the disclosure requirements." The merchant’s fear is customer backlash — meet it head-on with the truth: gas stations have run dual pricing for decades, adoption in food service and auto is mainstream, and attrition from properly-run programs is minimal.',
          'Honesty rules for this program, non-negotiable at Delt: never describe the fee as invisible ("your customers won’t notice" is a lie that gets merchants angry calls); never coach a merchant to skip signage or receipt disclosure; and never call a card fee a "cash discount" if the program is actually structured as a surcharge. If a merchant wants a structure we don’t offer, raise it in the Deal Desk — do not invent terms in the field.',
          'Know when NOT to lead with cash discount: high-ticket professional services (a $5,000 invoice with a 4% fee is a $200 conversation), businesses with heavy corporate clientele, and merchants in fiercely price-competitive markets with thin differentiation. For those, interchange-plus with a clean fee schedule is often the stronger and more durable sale. The best agents match the program to the merchant, not the merchant to the program.',
        ],
        keyPoints: [
          'The pitch: zero processing cost, posted prices, discount for cash, we handle signage and compliance.',
          'Never sell the fee as invisible; never coach merchants to skip disclosure.',
          'High-ticket and corporate-heavy merchants often fit interchange-plus better.',
          'Match the program to the merchant — that is what keeps accounts (and your residuals) alive.',
        ],
        quiz: [
          { q: 'A merchant fears customer backlash from dual pricing. The honest response is:', options: ['"Customers won’t notice the fee"', '"Gas stations have done this for decades and attrition in well-run programs is minimal"', '"You can skip the signage to keep it quiet"', '"Everyone will just pay cash"'], answer: 1 },
          { q: 'Which merchant is often a POOR fit for leading with cash discount?', options: ['A coffee shop', 'A barber shop', 'A law firm invoicing $5,000 retainers', 'A convenience store'], answer: 2 },
          { q: 'If a merchant wants a fee structure Delt doesn’t offer, you should:', options: ['Improvise terms to close the deal', 'Promise it and let ops figure it out', 'Raise it in the Deal Desk before promising anything', 'Tell them it’s illegal'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'm3',
    title: 'Selling Merchant Services',
    description: 'Prospecting, the statement ask, objections, and closing — the craft of the trade.',
    lessons: [
      {
        id: 'm3-l1',
        title: 'Prospecting: building a pipeline that compounds',
        minutes: 7,
        paragraphs: [
          'Merchant services is a density game. The most effective prospecting is vertical and geographic clustering: pick a niche you can speak to (restaurants, salons, auto shops, smoke shops) in an area you can cover, and become the payments person for that world. Ten merchants in one vertical teach you the objections, the software they use, and the reference names that open the next ten doors.',
          'The walk-in still works because almost nobody does it well. The goal of a first visit is not a sale — it is the statement. "I’m not here to quote you a rate; rates without your statement are fiction. Let me take one month’s statement, run it through our analyzer, and I’ll come back with the actual math — takes me a day." Low pressure, concrete promise, and a reason to return.',
          'Referrals compound faster than cold outreach: every activated merchant should be asked, at the moment they see their first clean statement or their first zero-fee month, "who else do you know that’s getting beat up on processing?" And your own book protects itself — a merchant you visit quarterly does not take the next rep’s call. Prospecting, service, and retention are the same activity performed at different times.',
        ],
        keyPoints: [
          'Cluster by vertical and geography; density compounds knowledge and referrals.',
          'The goal of a first visit is the statement, not the sale.',
          'Ask for referrals at the moment of demonstrated value.',
          'Quarterly touch on your book is both retention and prospecting.',
        ],
        quiz: [
          { q: 'The primary goal of a first walk-in visit is:', options: ['Signing the merchant on the spot', 'Getting one month’s processing statement', 'Dropping off a flyer', 'Quoting a rate from memory'], answer: 1 },
          { q: 'The best moment to ask for a referral is:', options: ['Before the merchant activates', 'The moment they see demonstrated value', 'Only at contract renewal', 'Never — referrals come unprompted'], answer: 1 },
          { q: 'Vertical clustering works because:', options: ['It limits competition legally', 'Objections, tools, and references repeat within a vertical', 'Processors require it', 'It reduces driving time only'], answer: 1 },
        ],
      },
      {
        id: 'm3-l2',
        title: 'The pitch: anatomy of a statement-back conversation',
        minutes: 8,
        paragraphs: [
          'The second visit — statement analysis in hand — follows a reliable arc. Open with their number, not yours: "You processed $42,000 last month and paid $1,580 — that’s a 3.76% effective rate. Here’s where it went." Walk the layers: this part was interchange (nobody can change it), this part was junk, this part was margin. You have now taught them something true, which no other rep has done.',
          'Then present two paths, not one: "Option one, we keep your pricing model and cut the padding — here’s the number on interchange-plus. Option two, our zero-cost program — your posted prices stay, cash payers get a discount, your processing cost goes to about zero." Two options make you an advisor with alternatives instead of a vendor with a pitch, and the merchant’s choice tells you exactly what they value.',
          'Close on logistics, not pressure: "If we did this, the switch looks like — we board you this week, terminal arrives programmed, signage included, and I’m standing here the morning you go live." The objection library in your Resources page covers the five responses you’ll hear most; drill them until your answers sound like conversation, not script. Then ask for the application. Most reps never actually ask.',
        ],
        keyPoints: [
          'Open with their actual numbers from the analyzer — teach before you pitch.',
          'Present two paths (clean interchange-plus vs zero-cost) and let the choice reveal what they value.',
          'Close on concrete logistics: boarding timeline, programmed terminal, go-live support.',
          'Drill the objection library until responses sound natural — then actually ask.',
        ],
        quiz: [
          { q: 'The strongest way to open a statement-back meeting is:', options: ['With Delt’s company story', 'With the merchant’s own volume, cost, and effective rate', 'With a discount offer', 'With hardware options'], answer: 1 },
          { q: 'Why present two program options instead of one?', options: ['It doubles commission', 'It positions you as an advisor and reveals what the merchant values', 'Processors require it', 'It confuses the merchant into agreeing'], answer: 1 },
          { q: 'The close should center on:', options: ['Urgency and scarcity', 'Concrete switching logistics and support', 'A bigger discount', 'A signed exclusivity agreement'], answer: 1 },
        ],
      },
      {
        id: 'm3-l3',
        title: 'Objections, stalls, and the long game',
        minutes: 7,
        paragraphs: [
          'Every objection you will hear is one of five: my customers will be upset (reframe: discount for cash, not penalty for cards — gas stations proved it), I’ll lose sales (the data says under 1% churn in well-run programs), it sounds complicated (we program, we sign, we train — zero merchant work), is it legal (yes, all 50 states, structured as dual pricing with disclosure), and I’m under contract (let’s read the contract — many "contracts" are month-to-month with a junk cancellation fee that first-month savings cover). The full talk tracks with supporting data live in your Resources page.',
          'Distinguish objections from stalls. An objection has content and deserves an answer. A stall ("let me think about it") usually means an unvoiced concern — surface it: "Totally fair. When people tell me that, it’s usually one of two things: they don’t believe the number, or there’s someone else in the decision. Which is closer?" You will get the real conversation about half the time, which beats zero.',
          'And respect the long no. A merchant who says no today renews a lease, gets hit with a fee hike, or has a terminal die within a year. The rep still in the neighborhood — who left on good terms and checks in quarterly — gets that call. Your book in month twelve is built substantially from your polite noes in month two.',
        ],
        keyPoints: [
          'Five core objections; all have tested responses in the Resources playbooks.',
          'Stalls hide unvoiced concerns — surface them with a direct, respectful question.',
          'Read the actual contract before conceding a merchant is stuck.',
          'Today’s polite no is next year’s activation — stay in the neighborhood.',
        ],
        quiz: [
          { q: '"Let me think about it" is usually:', options: ['A firm no', 'A stall hiding an unvoiced concern', 'A yes', 'A negotiation tactic requiring a discount'], answer: 1 },
          { q: 'A merchant says they’re locked in a contract. Your first move is:', options: ['Walk away', 'Offer to pay any amount to break it', 'Read the actual contract terms with them', 'Tell them contracts are unenforceable'], answer: 2 },
          { q: 'The "customers will be upset" objection is best met with:', options: ['A lower rate', 'The discount-for-cash reframe plus real adoption data', 'An offer to hide the fee', 'Changing the subject to hardware'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'm4',
    title: 'Underwriting, Risk & Compliance',
    description: 'What gets deals approved, what kills them, and the lines an agent never crosses.',
    lessons: [
      {
        id: 'm4-l1',
        title: 'How underwriting thinks',
        minutes: 7,
        paragraphs: [
          'When you submit a deal, an underwriter is answering one question: if this merchant takes money for goods it never delivers, who eats the loss? The processor does — so underwriting prices and gates that risk. They check who the merchant is (KYC: legal entity, owner identity, EIN), what they sell (the MCC — merchant category code — drives risk classification), how they sell it (card-present retail is low risk; future delivery, high tickets, and online sales raise it), and their financial story (processing history, bank statements, credit).',
          'A complete packet is the biggest approval accelerator that exists — which is exactly why your deal submission asks for the voided check, ID, and statements up front. Deals stall on mismatched names (DBA vs legal entity vs bank account), unsigned applications, unexplained volume claims, and vague business descriptions. An agent who submits clean packets develops a reputation with underwriting, and their deals genuinely move faster.',
          'Never coach a merchant to misrepresent anything to underwriting — not the business type, not expected volume, not who owns the company. A merchant boarded on false information gets terminated with funds held, the merchant blames you, and load-bearing trust with our processing partners burns. There is no commission worth it, and at Delt it is a firing offense.',
        ],
        keyPoints: [
          'Underwriting prices the risk of undelivered goods and fraud — the processor eats those losses.',
          'MCC, delivery model, ticket size, and financial history drive the risk decision.',
          'Complete, consistent packets (check, ID, statements, matching names) approve fastest.',
          'Coaching a merchant to misrepresent anything to underwriting ends your Delt career.',
        ],
        quiz: [
          { q: 'Underwriting fundamentally exists to answer:', options: ['What rate to advertise', 'Who eats the loss if the merchant fails to deliver', 'Which terminal to ship', 'How big the agent bonus is'], answer: 1 },
          { q: 'Which packet issue commonly stalls a deal?', options: ['Too many documents', 'DBA, legal entity, and bank account names that don’t match', 'A statement that is too clean', 'A merchant with a website'], answer: 1 },
          { q: 'A merchant asks you to describe their vape shop as a "gift shop" on the application. You:', options: ['Do it — MCC barely matters', 'Refuse; misrepresentation to underwriting is prohibited', 'Split the difference with "convenience store"', 'Submit it and let underwriting catch it'], answer: 1 },
        ],
      },
      {
        id: 'm4-l2',
        title: 'Chargebacks: the tax on trust',
        minutes: 7,
        paragraphs: [
          'A chargeback is a cardholder disputing a transaction through their issuer — fraud claims, "goods not received," "not as described," or plain friendly fraud (the customer recognized the charge and disputed it anyway). The merchant loses the sale amount, pays a chargeback fee, and — critically — accumulates a ratio. Sustained ratios around 1% of transactions put a merchant into network monitoring programs, and processors terminate accounts that stay there.',
          'Merchants prevent most chargebacks with unglamorous hygiene: a recognizable billing descriptor (half of "fraud" disputes are customers not recognizing the name on their card statement), clear receipts and refund policies, delivery confirmation on shipped goods, and answering their phone — a customer who can reach the merchant asks for a refund; one who can’t calls their bank.',
          'For you, chargebacks are both a selling angle and a retention duty. Selling: high-risk merchants live in fear of them, and Delt’s dispute tooling and durable-account posture is a genuine differentiator. Retention: a merchant trending toward a bad ratio is a residual about to die — when you see disputes climbing on an account in your book, get ops involved through the Deal Desk before the network program does it for you.',
        ],
        keyPoints: [
          'Chargebacks cost the sale, a fee, and — most dangerously — ratio.',
          'A ~1% dispute ratio triggers network monitoring; sustained ratios get accounts terminated.',
          'Descriptor clarity, reachable customer service, and delivery proof prevent most disputes.',
          'A climbing dispute ratio in your book is a Deal Desk conversation, not a wait-and-see.',
        ],
        quiz: [
          { q: 'The most dangerous cost of chargebacks to a merchant is:', options: ['The chargeback fee', 'The lost sale', 'The accumulating dispute ratio', 'The paperwork'], answer: 2 },
          { q: 'Many "fraud" disputes actually happen because:', options: ['Card networks encourage them', 'The customer didn’t recognize the billing descriptor', 'Merchants file them', 'Issuers profit from them'], answer: 1 },
          { q: 'You notice a merchant in your book with climbing disputes. You should:', options: ['Wait for the processor to act', 'Raise it through the Deal Desk proactively', 'Tell the merchant to switch processors', 'Ignore it — not your job'], answer: 1 },
        ],
      },
      {
        id: 'm4-l3',
        title: 'High-risk verticals and PCI, briefly',
        minutes: 7,
        paragraphs: [
          'High-risk is Delt’s opportunity vertical: CBD, vape and tobacco, liquor, nutraceuticals, travel, and subscription businesses that mainstream aggregators shut down without explanation. These merchants have usually been terminated by Stripe, Square, or PayPal at least once — often with funds held — and they buy durability, not price. The pitch is different: "a real merchant account underwritten for what you actually sell, so you stop rebuilding your payments every 90 days."',
          'High-risk deals carry real friction: more documentation, sometimes reserves (a held percentage protecting the processor), higher pricing, and longer underwriting. Set those expectations up front — a high-risk merchant who expects friction and gets approval is loyal for years; one promised "easy approval" and hit with a reserve requirement churns and burns your reputation with them.',
          'PCI in one paragraph: the Payment Card Industry Data Security Standard applies to every merchant. In practice, small merchants satisfy it with an annual self-assessment questionnaire and by never storing card numbers outside their certified terminal or gateway. Your role is not PCI consulting — it is knowing that "PCI non-compliance fees" on a competitor’s statement are usually a revenue line dressed as security, and that Delt helps merchants get compliant instead of billing them for not being so.',
        ],
        keyPoints: [
          'High-risk merchants buy durability, not price — they’ve been shut down before.',
          'Set expectations on documentation, possible reserves, and timeline up front.',
          'Reserves protect the processor on risky delivery models; they are negotiated, not hidden.',
          'PCI: annual SAQ + never storing card data improperly; competitor "non-compliance fees" are usually junk revenue.',
        ],
        quiz: [
          { q: 'What does a previously-terminated CBD merchant primarily buy from Delt?', options: ['The lowest possible rate', 'Account durability under honest underwriting', 'Free hardware', 'Marketing services'], answer: 1 },
          { q: 'A reserve on a high-risk account exists to:', options: ['Punish the merchant', 'Protect the processor against undelivered goods and disputes', 'Boost agent commissions', 'Satisfy the IRS'], answer: 1 },
          { q: 'A "PCI non-compliance fee" on a competitor statement is usually:', options: ['A network requirement', 'A junk revenue line dressed as security', 'A government tax', 'Proof the merchant was breached'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'm5',
    title: 'Hardware, POS & the Delt Stack',
    description: 'Terminals, KORONA POS, and matching equipment to the merchant.',
    lessons: [
      {
        id: 'm5-l1',
        title: 'Terminals, smart terminals, and full POS',
        minutes: 6,
        paragraphs: [
          'Payment acceptance hardware comes in three tiers. A countertop or wireless terminal takes payments — dip, tap, swipe, receipt — and nothing else; it is right for simple counters and mobile trades. A smart terminal adds an app ecosystem, digital receipts, and basic reporting on an Android-based device. A full point-of-sale system runs the business: inventory, employees, customers, and reporting, with payments as one integrated function.',
          'The selling mistake to avoid is over- or under-hardwaring. A food truck does not need a POS; a liquor store with four thousand SKUs and age-verification requirements absolutely does, and putting a bare terminal in that store loses the account within a year to whoever sells them a real system. Ask what runs their business today — paper, spreadsheets, a legacy POS — and size accordingly.',
          'Delt ships terminals programmed for the merchant’s pricing program (including the cash discount configuration and signage), which is part of the "we handle everything" close. Hardware is also a commission event for you and one of the stickiest retention anchors in the industry: merchants change processors far more readily than they change the system their staff is trained on.',
        ],
        keyPoints: [
          'Three tiers: terminal (payments only) → smart terminal (+apps/reporting) → POS (runs the business).',
          'Size the hardware to the operation; both over- and under-selling lose accounts.',
          'Delt ships hardware pre-programmed for the pricing program, signage included.',
          'POS is sticky: staff training and inventory data anchor merchants for years.',
        ],
        quiz: [
          { q: 'A high-SKU liquor store with age-verification needs is best fit by:', options: ['A basic countertop terminal', 'A smartphone reader', 'A full POS system', 'Cash only'], answer: 2 },
          { q: 'Why is POS the stickiest product in the stack?', options: ['Contracts are longer', 'Staff training and business data live in it', 'It can’t be uninstalled', 'Networks require it'], answer: 1 },
          { q: 'Delt terminals arrive:', options: ['Blank, for merchant setup', 'Pre-programmed for the merchant’s pricing program with signage', 'Requiring an IT contractor', 'Without receipt capability'], answer: 1 },
        ],
      },
      {
        id: 'm5-l2',
        title: 'KORONA POS and when to lead with it',
        minutes: 6,
        paragraphs: [
          'KORONA is Delt’s POS partner, and its sweet spot is high-SKU, compliance-heavy retail: liquor stores, smoke and vape shops, convenience stores — precisely the verticals mainstream aggregators avoid. It brings serious inventory management, age-verification workflows, case-break pricing, and multi-location support. When you walk into one of these stores, POS is often the stronger door-opener than processing: "how are you tracking four thousand SKUs?" starts a better conversation than "what’s your rate?"',
          'A POS-attached deal is worth more to everyone. The merchant gets a system that runs the store. Delt earns software revenue alongside processing. And you earn the multi-product kicker on your activation bonus plus a stickier residual — POS accounts churn at a fraction of terminal-only accounts. This is why the bonus schedule explicitly pays more when POS or Capital attaches.',
          'Be honest about fit: KORONA is built for retail workflows. A full-service restaurant with complex table management, coursing, and tip pooling may be better served in a later conversation — check current fit with ops through the Deal Desk rather than forcing the wrong tool into the wrong store. One mis-sold POS costs more reputation than ten right-sized terminal deals earn.',
        ],
        keyPoints: [
          'KORONA’s sweet spot: high-SKU, age-verified retail — liquor, smoke, convenience.',
          'In those verticals, lead with the operations problem, not the rate.',
          'POS-attached deals pay the multi-product kicker and churn far less.',
          'Check restaurant/service-vertical fit with ops before promising — never force the tool.',
        ],
        quiz: [
          { q: 'KORONA’s strongest fit is:', options: ['Fine dining restaurants', 'High-SKU, age-verified retail', 'Freelance consultants', 'Food trucks'], answer: 1 },
          { q: 'The best door-opener in a 4,000-SKU smoke shop is usually:', options: ['"What’s your rate?"', '"How are you tracking inventory and age checks?"', '"Want a free reader?"', '"Who does your website?"'], answer: 1 },
          { q: 'Attaching POS to a deal does what to your economics?', options: ['Nothing', 'Adds the multi-product bonus kicker and a stickier residual', 'Reduces the residual split', 'Delays activation'], answer: 1 },
        ],
      },
      {
        id: 'm5-l3',
        title: 'Delt Capital and the multi-product relationship',
        minutes: 6,
        paragraphs: [
          'Delt Capital advances working capital — roughly $1,000 to $300,000 — repaid as a fixed total amount collected as a percentage of daily card sales. No compounding interest, no collateral, funding as fast as the next business day. For a merchant, the honest framing is: fast and flexible, more expensive than a bank loan, repayment breathes with revenue. It is oxygen for inventory buys, equipment failures, and seasonal swings — not a substitute for cheap long-term credit, and you should say so.',
          'Capital deepens the relationship mechanically: repayment flows through processing, so a funded merchant is a retained merchant for the life of the advance, and a merchant whose expansion you funded does not take a competitor’s call. You earn on funded deals (they appear in your commissions), and the Capital conversation naturally reopens the processing conversation with merchants who said no a year ago.',
          'The compliance line: you introduce and refer — underwriting sets offers, terms, and eligibility. Never quote a specific advance amount, factor, or approval as if it were certain ("you’d qualify for about fifty grand" is a promise you cannot keep). The safe words: "worth an application — approvals and terms come from underwriting, usually fast." Overpromising funding is the fastest way to convert a warm merchant into a hostile one.',
        ],
        keyPoints: [
          'Capital: fixed-fee advances repaid as a % of daily sales — fast, flexible, honestly priced above bank debt.',
          'Funded merchants are retained merchants; repayment rides the processing relationship.',
          'You refer; underwriting decides. Never quote amounts or promise approval.',
          'Capital re-opens processing conversations with old noes.',
        ],
        quiz: [
          { q: 'The honest framing of Delt Capital to a merchant is:', options: ['"Cheaper than any bank loan"', '"Fast and flexible, costs more than bank debt, repayment moves with your revenue"', '"Free money against future sales"', '"A government program"'], answer: 1 },
          { q: 'Can you tell a merchant they "qualify for about $50K"?', options: ['Yes, if they seem healthy', 'Yes, if they sign first', 'No — underwriting sets offers; you refer', 'Only in writing'], answer: 2 },
          { q: 'Why does a funded merchant strengthen retention?', options: ['They sign a longer contract', 'Repayment flows through the processing relationship', 'They get a free terminal', 'Their rate goes up'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'm6',
    title: 'The Delt Playbook',
    description: 'Your comp, your tools, your standards — how to run your book like a business.',
    lessons: [
      {
        id: 'm6-l1',
        title: 'Your compensation, mechanically',
        minutes: 6,
        paragraphs: [
          'Your income has two engines. Activation bonuses pay fast: $150 to $1,000 per activated account depending on the merchant’s monthly volume band, plus $100 when POS or Capital attaches, plus Fast Start milestones in your first 90 days and the retroactive kicker in any 8-activation month. Bonuses at the $400+ bands are confirmed against the merchant’s first full month of actual processing — so submit honest volume estimates; inflated ones just get re-banded down.',
          'Residuals pay forever: your split of Delt’s net revenue on every account, every month, for as long as the merchant processes. You start at 50% and the ladder promotes you to 60% and 70% as your active book grows. Residuals are never clawed back; the only clawback anywhere is the activation bonus if a merchant cancels within 90 days — which is why merchants well-matched to their program are worth more to you than merchants oversold into the wrong one.',
          'Everything is visible in your portal: pipeline with pending bonuses, per-merchant residual statements down to the penny, commission history, tier progress, and the quarterly President’s Club standings. Payday is the 15th, every month. If a number ever looks wrong, the Deal Desk is the channel — and because every deal is attributed to you from submission, disputes are resolved by records, not memory.',
        ],
        keyPoints: [
          'Bonuses: volume-banded $150–$1,000, +$100 multi-product, Fast Start, and the 8-deal kicker.',
          '$400+ bands confirm against actual first-month volume — estimate honestly.',
          'Residuals: 50%→70% ladder, lifetime, never clawed back.',
          'Everything is auditable in your portal; paid on the 15th.',
        ],
        quiz: [
          { q: 'Residuals are clawed back when:', options: ['A merchant’s volume drops', 'You go inactive for a month', 'Never — only the activation bonus has a 90-day clawback', 'A merchant disputes a charge'], answer: 2 },
          { q: 'Submitting an inflated volume estimate results in:', options: ['A permanently higher bonus', 'Re-banding to the actual volume after the first month', 'Account termination', 'Nothing'], answer: 1 },
          { q: 'Commissions and residuals pay on:', options: ['Every Friday', 'The 1st', 'The 15th of each month', 'Quarterly'], answer: 2 },
        ],
      },
      {
        id: 'm6-l2',
        title: 'Running a deal through the portal, end to end',
        minutes: 7,
        paragraphs: [
          'The full lifecycle of a Delt deal: prospect and get the statement → run it through the Analyzer (Sales Tools) and build your two-path pitch with the Cost Calculator → submit the deal from Submit a Deal with honest volume and complete contact info → upload the packet (voided check, ID, statement) so extraction pre-fills the boarding data → send the Delt application for e-signature from the deal’s document panel → watch the pipeline: ops routes it to a processor channel, and each stage change is visible to you in real time.',
          'Your pending earnings show from the moment of submission, and the bonus locks at activation. The signed application, the documents, and every status change live on the deal — which means when a merchant calls you in month six, you open one screen and know everything. That is what "running your book like a business" means in practice.',
          'Use the Deal Desk for anything ambiguous: underwriting questions, program-structure requests, merchants in trouble, numbers that look off. A question asked before a promise is professionalism; the same question asked after a broken promise is damage control. The agents who thrive here treat ops as their deal team, not their adversary.',
        ],
        keyPoints: [
          'Lifecycle: statement → analyzer → pitch → submit → docs → e-sign → pipeline to activation.',
          'Complete packets with honest volumes move fastest and pre-fill boarding.',
          'Everything about a deal lives on the deal — one screen, full history.',
          'Ask the Deal Desk before promising, not after.',
        ],
        quiz: [
          { q: 'What pre-fills boarding data for ops?', options: ['The merchant calling in', 'AI extraction from the uploaded documents', 'The processor’s API', 'Manual retyping only'], answer: 1 },
          { q: 'When does your activation bonus lock?', options: ['At submission', 'At underwriting', 'At activation', 'At the first residual'], answer: 2 },
          { q: 'A merchant asks for terms you’re not sure Delt offers. You:', options: ['Promise it to close, then check', 'Ask the Deal Desk first, then answer', 'Guess based on a competitor', 'Decline the deal'], answer: 1 },
        ],
      },
      {
        id: 'm6-l3',
        title: 'The Delt standard: sell like we’d want to be sold to',
        minutes: 6,
        paragraphs: [
          'Delt’s public value is: we tell merchants the truth about fees, terms, and eligibility — even when it costs us the deal. As an agent you are the company to every merchant you meet, so the standard binds you: no invisible-fee promises, no guaranteed approvals, no invented terms, no coaching anyone past underwriting, no trash-talking a competitor with claims you can’t support. Show the statement math and let the truth do the selling — it genuinely is the best pitch in this industry, because almost nobody else uses it.',
          'The same standard protects your income. Oversold merchants churn inside the bonus clawback window; well-matched merchants compound into a residual base that pays you for years. Every rule in this curriculum that sounds like ethics is also, on a twelve-month horizon, the highest-earning strategy available to you.',
          'Finally: never promise beyond the written docs. Your comp is defined by the comp plan and your agent agreement; merchant terms are defined by their signed application and program agreement. If a conversation drifts beyond what is written — yours or theirs — stop and get it in writing through the proper channel. Congratulations on finishing the curriculum; the Deal Desk and your first ten statements are the real final exam.',
        ],
        keyPoints: [
          'You are Delt to every merchant — the honesty standard binds in the field.',
          'No invisible fees, no guaranteed approvals, no invented terms, no underwriting coaching.',
          'Honest matching maximizes twelve-month earnings; overselling churns inside the clawback window.',
          'Nothing beyond the written docs — for merchants or for your own comp.',
        ],
        quiz: [
          { q: 'A competitor’s rep is spreading a claim you can’t verify. You:', options: ['Repeat it — all’s fair', 'Invent a counter-claim', 'Stick to statement math and verifiable facts', 'Report them to the network'], answer: 2 },
          { q: 'Overselling a merchant into the wrong program most directly costs you:', options: ['Nothing if they sign', 'Churn inside the clawback window and a dead residual', 'A tier promotion', 'Portal access'], answer: 1 },
          { q: 'A merchant asks for a verbal side-agreement. The Delt standard is:', options: ['Fine if small', 'Nothing beyond the written docs — get it in writing through the proper channel', 'Allowed for top producers', 'Only with a witness'], answer: 1 },
        ],
      },
    ],
  },
];

export const ALL_LESSON_IDS = CURRICULUM.flatMap(m => m.lessons.map(l => l.id));
