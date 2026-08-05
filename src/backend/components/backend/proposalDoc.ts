/**
 * Personalized merchant savings proposal — a paginated, print-ready document
 * built from the analyzed statement. Opened in a new window where the built-in
 * toolbar offers Present (full-screen walkthrough), Save as PDF, and Send
 * (Outlook compose in the rep's own account; Send also downloads the file for
 * attaching).
 *
 * Fully bilingual: pass lang 'es' for a Spanish proposal (copy lives in the
 * EN/ES objects below).
 *
 * Merchant-safe by construction: consumes ProgramQuote only, never
 * ProgramEconomics (see pricingPrograms.ts).
 */
import type { ProgramQuote } from './pricingPrograms';
import { termsToEs } from './i18n';
import type { ExtractedData } from './pages/BackendAnalysis';
import { auditInterchangeLines } from './InterchangeAudit';
import { IC_SCHEDULE } from './interchangeReference';

export interface ProposalInput {
  extracted: ExtractedData;
  programs: ProgramQuote[];
  /** Program to lead with — the merchant's selection or the recommendation. */
  focusKey: ProgramQuote['key'] | null;
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

/**
 * Official Delt lockup (same traced SVG as the CRM sidebar): indigo mark +
 * exact letterforms. Height set via the wrapping .logo / .logo-lg classes.
 */
const DELT_LOGO = `<svg viewBox="74 153 552 174" class="logosvg" aria-label="Delt">
  <rect x="148.9" y="156.6" width="50.8" height="168.3" rx="17.2" fill="#4945FF"/>
  <circle cx="107.8" cy="274.1" r="33.3" fill="#4945FF"/>
  <g fill="#111827" transform="translate(208,153)">
    <path transform="translate(0.428,167.36)" d="M 80.28125 0 L 21.6875 0 L 21.6875 -159.390625 L 79.921875 -159.390625 C 92.503906 -159.390625 103.953125 -157.492188 114.265625 -153.703125 C 124.578125 -149.910156 133.441406 -144.5 140.859375 -137.46875 C 148.285156 -130.4375 153.988281 -122.054688 157.96875 -112.328125 C 161.957031 -102.597656 163.953125 -91.757812 163.953125 -79.8125 C 163.953125 -67.851562 161.957031 -56.972656 157.96875 -47.171875 C 153.988281 -37.367188 148.304688 -28.953125 140.921875 -21.921875 C 133.546875 -14.890625 124.738281 -9.476562 114.5 -5.6875 C 104.257812 -1.894531 92.851562 0 80.28125 0 Z M 42.078125 -140.875 L 42.078125 -18.75 L 79.8125 -18.75 C 92.851562 -18.75 104.082031 -21.226562 113.5 -26.1875 C 122.914062 -31.15625 130.179688 -38.1875 135.296875 -47.28125 C 140.421875 -56.382812 142.984375 -67.070312 142.984375 -79.34375 C 142.984375 -91.6875 140.421875 -102.46875 135.296875 -111.6875 C 130.179688 -120.90625 122.875 -128.070312 113.375 -133.1875 C 103.882812 -138.3125 92.539062 -140.875 79.34375 -140.875 Z M 42.078125 -140.875"/>
    <path transform="translate(160.05,167.36)" d="M 129.15625 -62.703125 C 129.15625 -61.679688 129.132812 -60.601562 129.09375 -59.46875 C 129.050781 -58.34375 128.953125 -56.6875 128.796875 -54.5 L 29.65625 -54.5 C 30.507812 -46.53125 32.847656 -39.613281 36.671875 -33.75 C 40.503906 -27.894531 45.3125 -23.382812 51.09375 -20.21875 C 56.875 -17.050781 63.046875 -15.46875 69.609375 -15.46875 C 77.660156 -15.46875 84.535156 -17.207031 90.234375 -20.6875 C 95.941406 -24.164062 100.125 -29.265625 102.78125 -35.984375 L 125.40625 -35.984375 C 123.6875 -30.515625 121.125 -25.394531 117.71875 -20.625 C 114.320312 -15.863281 110.21875 -11.703125 105.40625 -8.140625 C 100.601562 -4.585938 95.210938 -1.796875 89.234375 0.234375 C 83.265625 2.265625 76.878906 3.28125 70.078125 3.28125 C 61.410156 3.28125 53.382812 1.660156 46 -1.578125 C 38.613281 -4.828125 32.164062 -9.34375 26.65625 -15.125 C 21.15625 -20.90625 16.878906 -27.601562 13.828125 -35.21875 C 10.785156 -42.832031 9.265625 -51.015625 9.265625 -59.765625 C 9.265625 -68.515625 10.785156 -76.695312 13.828125 -84.3125 C 16.878906 -91.9375 21.15625 -98.640625 26.65625 -104.421875 C 32.164062 -110.203125 38.613281 -114.734375 46 -118.015625 C 53.382812 -121.296875 61.410156 -122.9375 70.078125 -122.9375 C 78.671875 -122.9375 86.582031 -121.332031 93.8125 -118.125 C 101.039062 -114.925781 107.289062 -110.515625 112.5625 -104.890625 C 117.84375 -99.265625 121.925781 -92.835938 124.8125 -85.609375 C 127.707031 -78.378906 129.15625 -70.742188 129.15625 -62.703125 Z M 30.59375 -72.3125 L 108.515625 -72.3125 C 108.203125 -76.53125 106.972656 -80.550781 104.828125 -84.375 C 102.679688 -88.207031 99.847656 -91.585938 96.328125 -94.515625 C 92.816406 -97.441406 88.773438 -99.742188 84.203125 -101.421875 C 79.628906 -103.109375 74.804688 -103.953125 69.734375 -103.953125 C 63.796875 -103.953125 58.128906 -102.738281 52.734375 -100.3125 C 47.347656 -97.894531 42.703125 -94.34375 38.796875 -89.65625 C 34.890625 -84.96875 32.15625 -79.1875 30.59375 -72.3125 Z M 30.59375 -72.3125"/>
    <path transform="translate(282.643,167.36)" d="M 39.5 0 L 19.34375 0 L 19.34375 -165.25 L 39.5 -165.25 Z M 39.5 0"/>
    <path transform="translate(327.545,167.36)" d="M 87.546875 0 L 65.515625 0 C 60.984375 0 56.488281 -0.582031 52.03125 -1.75 C 47.582031 -2.925781 43.539062 -5.078125 39.90625 -8.203125 C 36.269531 -11.328125 33.359375 -15.800781 31.171875 -21.625 C 28.984375 -27.445312 27.890625 -35.003906 27.890625 -44.296875 L 27.890625 -101.84375 L 1.296875 -101.84375 L 1.296875 -119.53125 L 27.890625 -119.53125 L 27.890625 -155.046875 L 48.046875 -155.171875 L 48.046875 -119.53125 L 87.546875 -119.53125 L 87.546875 -101.84375 L 48.046875 -101.84375 L 48.046875 -43.359375 C 48.046875 -37.816406 48.648438 -33.304688 49.859375 -29.828125 C 51.078125 -26.347656 52.71875 -23.691406 54.78125 -21.859375 C 56.851562 -20.023438 59.160156 -18.773438 61.703125 -18.109375 C 64.242188 -17.441406 66.84375 -17.109375 69.5 -17.109375 L 87.546875 -17.109375 Z M 87.546875 0"/>
  </g>
</svg>`;

/**
 * All human copy for the document, per language. Functions receive
 * pre-formatted (and, where they land in HTML, pre-escaped) values; strings
 * returned by *Callout/body functions may contain HTML and are injected raw.
 */
interface ProposalCopy {
  docTitle: string;
  heroTitle: (savings: string) => string;
  preparedExclusivelyFor: string;
  coverSub: string;
  heroLabel: (name: string, program: string) => string;
  heroLine: (a: { monthly: string; pct: number; daily: string | null }) => string;
  whoKeeps: (processor: string, savings: string) => string;
  preparedFor: string;
  preparedBy: string;
  basedOnStatement: (period: string, processor: string) => string;
  pricingHonored: (date: string) => string;
  coverDisclaimer: string;
  situationTitle: string;
  situationBody: (a: {
    volume: string; txns: string; processor: string; model: string;
    period: string; monthlyCost: string; rate: number; annual: string;
  }) => string;
  monthlyVolume: string;
  effectiveRate: string;
  monthlyCost: string;
  annualCost: string;
  feeOnStatement: string;
  amount: string;
  paddingCallout: (a: { version: string; flagged: number; monthly: string; annual: string }) => string;
  junkCallout: (a: { monthly: string; annual: string }) => string;
  calloutMeaning: (name: string) => string;
  calloutChargebacks: (n: number) => string;
  pricingOptions: string;
  pricingIntro: (name: string) => string;
  recommendedFor: (name: string) => string;
  icBreakdown: (base: string, margin: string) => string;
  youdPay: string;
  youdSave: string;
  perMo: string;
  perYr: string;
  annualCostCompare: string;
  today: string;
  with: string;
  year1: string;
  threeYears: string;
  kept: string;
  everyMonthWait: string;
  gone: string;
  inactionCallout: (a: { m3: string; yr: string; yr3: string }) => string;
  cdNote: (name: string, fee: string) => string;
  howWorks: (program: string) => string;
  valueTitle: string;
  valueTiles: (a: {
    junkMo: string | null; junkYr: string | null;
    paddingYr: string | null; cdCost: string | null;
  }) => { h: string; p: string }[];
  guarantee: string;
  capital: string;
  first30Title: string;
  first30Intro: string;
  first30: (a: { monthly: string; cd: boolean }) => { b: string; rest: string }[];
  lockCta: (a: { date: string; period: string; version: string }) => string;
  signature: (name: string) => string;
  date: string;
  footerLeft: (name: string) => string;
  footerRight: (date: string) => string;
  programNames: Record<ProgramQuote['key'], string>;
  programTaglines: Record<ProgramQuote['key'], string>;
  howItWorks: Record<ProgramQuote['key'], string[]>;
  toolbar: { present: string; pdf: string; send: string };
  presentHint: string;
  mailSubject: (name: string, savings: string) => string;
  mailBody: (a: { current: string; program: string; newCost: string; savings: string; rate: number; signoff: string }) => string;
  teamSignoff: string;
}

const EN: ProposalCopy = {
  docTitle: 'Savings Proposal',
  heroTitle: savings => `We Found ${savings}<br>Hiding in Your Statement.`,
  preparedExclusivelyFor: 'Prepared exclusively for',
  coverSub: 'from your actual numbers, not an estimate off a website.',
  heroLabel: (name, program) => `Back in ${name}'s pocket with ${program}`,
  heroLine: a => `That's ${a.monthly} every month — ${a.pct}% off what you pay today${a.daily ? `, about ${a.daily} every single day` : ''}.`,
  whoKeeps: (processor, savings) =>
    `Right now, ${processor} keeps that money. Same customers. Same cards. Same terminal on the counter. The only thing that changes is <strong>who keeps the ${savings}</strong> — them, or you.`,
  preparedFor: 'Prepared for',
  preparedBy: 'Prepared by',
  basedOnStatement: (period, processor) =>
    `${period ? `Line-by-line audit of the ${period} statement` : 'Line-by-line audit of your processing statement'}${processor ? ` from ${processor}` : ''}`,
  pricingHonored: date => `Pricing honored through ${date}`,
  coverDisclaimer: 'Numbers come from the statement provided. Actual results depend on card mix and processing volume.',
  situationTitle: "Here's What's Actually Happening",
  situationBody: a => `
    Your situation, in your numbers: you're processing <strong>${a.volume}/month</strong> across ${a.txns} transactions${a.processor ? ` on ${a.processor}` : ''}${a.model ? `'s ${a.model} pricing` : ''},
    and in ${a.period || 'the period analyzed'} you paid <strong>${a.monthlyCost}</strong> for it — a <strong>${a.rate}%</strong> effective rate.
    We didn't skim that statement; we audited every line. Annualized, that's <strong>${a.annual} a year</strong> walking out the door for the privilege of taking cards.`,
  monthlyVolume: 'Monthly volume',
  effectiveRate: 'Effective rate',
  monthlyCost: 'Monthly cost',
  annualCost: 'Annual cost',
  feeOnStatement: 'Fee on your statement',
  amount: 'Amount',
  paddingCallout: a =>
    `<strong>We caught something.</strong> Compared against the published ${a.version} Visa/Mastercard interchange schedules, ${a.flagged} of your card categories are billed <strong>above the published rate</strong> — roughly <strong>${a.monthly}/month (${a.annual}/year)</strong> in markup buried inside "interchange." Your processor is betting you'll never check. We checked.`,
  junkCallout: a =>
    `<strong>And the junk fees:</strong> ${a.monthly}/month (${a.annual}/year) of PCI, statement, batch, and "service" fees — charges for paperwork, not processing. Under the programs on the next page, most of this disappears on day one.`,
  calloutMeaning: name =>
    `<strong>What this means for ${name}:</strong> every one of these line items is negotiable — most shrink dramatically or disappear under the programs on the next page.`,
  calloutChargebacks: n =>
    ` We also noted ${n} chargeback${n === 1 ? '' : 's'} this period; Delt includes dispute-response tooling at no extra cost.`,
  pricingOptions: 'Pick How You Want to Win',
  pricingIntro: name =>
    `Three programs. All three beat what you pay today — the only wrong choice is staying where you are. The highlighted one is our recommendation for ${name}.`,
  recommendedFor: name => `Recommended for ${name}`,
  icBreakdown: (base, margin) =>
    `Your interchange cost (published rates): <strong>${base}/mo</strong> &nbsp;+&nbsp; Delt margin: <strong>${margin}/mo</strong>`,
  youdPay: "You'd pay",
  youdSave: "You'd save",
  perMo: '/mo',
  perYr: '/yr',
  annualCostCompare: 'Annual Cost: Today vs. Delt',
  today: 'Today',
  with: 'With',
  year1: 'Year 1',
  threeYears: '3 years',
  kept: 'kept',
  everyMonthWait: 'Every month you wait',
  gone: 'gone',
  inactionCallout: a =>
    `<strong>The cost of "let me think about it":</strong> this decision has a meter running. Wait 3 months, that's ${a.m3}. Wait a year, ${a.yr}. Over 3 years, <strong>${a.yr3}</strong> — money that buys inventory, staff, marketing… or stays with your processor. It never comes back either way.`,
  cdNote: (name, fee) =>
    `With Cash Discount, the ${fee} service fee is paid by card-paying customers — ${name}'s own cost is the flat program fee shown above.`,
  howWorks: p => `How ${p} Works`,
  valueTitle: 'Everything You Get (Without Paying Extra For It)',
  valueTiles: a => [
    { h: 'Locked pricing — in writing', p: 'Your program price is your program price. No rate creep, no "quarterly adjustments," no surprise line items in month seven.' },
    {
      h: a.junkYr ? `${a.junkYr}/yr of junk fees — deleted` : 'Junk fees — deleted',
      p: `PCI, statement, batch, and "service" fees${a.junkMo ? ` (${a.junkMo}/mo on your current statement)` : ''} don't follow you here.`,
    },
    a.cdCost
      ? { h: 'One flat cost — nothing to audit', p: `There's no percentage rate on you at all. Card costs are covered by the customer service fee, so your cost is ${a.cdCost}/mo, period — the same in December as in January.` }
      : { h: 'Rate audit, every cycle', p: `We re-check your pricing against the published Visa/Mastercard schedules every April and October — the same audit that ${a.paddingYr ? `caught ${a.paddingYr}/yr of padding on your current statement` : 'found the savings in this proposal'}.` },
    { h: 'Compliance + real humans', p: 'Signage, receipt formatting, dispute-response tooling, and setup handled end to end — by people who pick up the phone, not a ticket queue.' },
  ],
  guarantee:
    `<strong>The Delt guarantee:</strong> no long-term contract and no cancellation fee — we keep your business by earning it monthly, not by trapping you in one. And if our audit ever shows we can't beat your current statement, we'll tell you to stay put. We only win when you save.`,
  capital:
    `<strong>And when you're ready to grow — Delt Capital.</strong> Delt merchants get priority access to working capital with best-in-class rates and flexible repayment that flexes with your daily card sales — busy week, pay a little more; slow week, a little less. We already know your numbers from processing, so funding decisions come in days, not weeks. No new paperwork marathon.`,
  first30Title: 'Your First 30 Days — What Actually Happens',
  first30Intro: "Most stalled switches die from fear of switching pain, not price. Here's the whole thing, start to finish:",
  first30: a => [
    { b: 'Today — say yes.', rest: ' Sign below or reply to your Delt contact. Two minutes, and the meter stops running.' },
    { b: 'Days 1–2 — approval.', rest: " A short application; we already have your statement, so underwriting is fast. You'll have a named onboarding contact the same day." },
    { b: 'Days 3–5 — equipment arrives configured.', rest: ` Terminal${a.cd ? ', compliant signage kit,' : ''} and receipt setup done before it ships. Your current processing keeps running — no gap.` },
    { b: 'Week 1 — go live.', rest: ` Your rep is on standby for the switch-over; most merchants change over with zero downtime and start keeping the ${a.monthly}/mo immediately.` },
    { b: 'Day 30 — first-statement review.', rest: ' We sit down with your first Delt statement next to this proposal, line by line, and confirm the numbers landed. If anything is off, we fix it.' },
  ],
  lockCta: a =>
    `<strong>Sign below to lock this pricing through ${a.date}.</strong> This proposal is priced off your ${a.period ? a.period + ' ' : ''}statement and the current ${a.version} interchange cycle — after ${a.date} the numbers have to be re-run.`,
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
  toolbar: { present: '▶ Present', pdf: '🖨 Save as PDF', send: '✉ Send' },
  presentHint: '← → to navigate · Esc to exit',
  mailSubject: (name, savings) => `We found ${savings}/yr in your processing statement — ${name}`,
  mailBody: a => [
    'Hi,', '',
    "We audited your statement line by line — not a website estimate, your actual numbers. Here's what it showed:", '',
    `• Today you pay ${a.current}/month (${a.rate}% effective rate)`,
    `• With Delt ${a.program}: ${a.newCost}/month`,
    `• That's ${a.savings}/year staying in your business instead of your processor's`, '',
    'Same customers, same cards, same counter — the only thing that changes is who keeps the money.', '',
    "The full proposal is attached (opens in any browser). It's priced off your current statement, so the sooner we talk, the sooner the meter stops. When's a good 15 minutes this week?", '',
    a.signoff,
  ].join('\n'),
  teamSignoff: 'The Delt Team',
};

const ES_COPY: ProposalCopy = {
  docTitle: 'Propuesta de Ahorro',
  heroTitle: savings => `Encontramos ${savings}<br>Escondidos en Su Estado de Cuenta.`,
  preparedExclusivelyFor: 'Preparada exclusivamente para',
  coverSub: 'con sus números reales, no una estimación sacada de un sitio web.',
  heroLabel: (name, program) => `De vuelta al bolsillo de ${name} con ${program}`,
  heroLine: a => `Eso es ${a.monthly} cada mes — ${a.pct}% menos de lo que paga hoy${a.daily ? `, cerca de ${a.daily} cada día` : ''}.`,
  whoKeeps: (processor, savings) =>
    `Hoy, ${processor} se queda con ese dinero. Los mismos clientes. Las mismas tarjetas. La misma terminal en el mostrador. Lo único que cambia es <strong>quién se queda con los ${savings}</strong> — ellos, o usted.`,
  preparedFor: 'Preparada para',
  preparedBy: 'Preparada por',
  basedOnStatement: (period, processor) =>
    `${period ? `Auditoría línea por línea del estado de cuenta de ${period}` : 'Auditoría línea por línea de su estado de cuenta'}${processor ? ` de ${processor}` : ''}`,
  pricingHonored: date => `Precios garantizados hasta el ${date}`,
  coverDisclaimer: 'Las cifras provienen del estado de cuenta proporcionado. Los resultados reales dependen de la mezcla de tarjetas y el volumen procesado.',
  situationTitle: 'Esto Es Lo Que Está Pasando Realmente',
  situationBody: a => `
    Su situación, en sus números: usted procesa <strong>${a.volume}/mes</strong> en ${a.txns} transacciones${a.processor ? ` con ${a.processor}` : ''}${a.model ? ` bajo precios de tipo ${a.model}` : ''},
    y en ${a.period || 'el período analizado'} pagó <strong>${a.monthlyCost}</strong> por ello — una tasa efectiva del <strong>${a.rate}%</strong>.
    No hojeamos ese estado de cuenta; auditamos cada línea. Anualizado, son <strong>${a.annual} al año</strong> que salen por la puerta por el privilegio de aceptar tarjetas.`,
  monthlyVolume: 'Volumen mensual',
  effectiveRate: 'Tasa efectiva',
  monthlyCost: 'Costo mensual',
  annualCost: 'Costo anual',
  feeOnStatement: 'Cargo en su estado de cuenta',
  amount: 'Monto',
  paddingCallout: a =>
    `<strong>Encontramos algo.</strong> Comparadas contra las tablas de intercambio publicadas de Visa/Mastercard (${a.version}), ${a.flagged} de sus categorías de tarjeta se cobran <strong>por encima de la tasa publicada</strong> — aproximadamente <strong>${a.monthly}/mes (${a.annual}/año)</strong> de margen escondido dentro del "intercambio". Su procesador apuesta a que usted nunca lo revisará. Nosotros lo revisamos.`,
  junkCallout: a =>
    `<strong>Y los cargos basura:</strong> ${a.monthly}/mes (${a.annual}/año) en cuotas de PCI, estado de cuenta, lotes y "servicio" — cobros por papeleo, no por procesamiento. Con los programas de la siguiente página, la mayoría desaparece desde el primer día.`,
  calloutMeaning: name =>
    `<strong>Qué significa esto para ${name}:</strong> cada una de estas líneas es negociable — la mayoría se reduce drásticamente o desaparece con los programas de la siguiente página.`,
  calloutChargebacks: n =>
    ` También notamos ${n} contracargo${n === 1 ? '' : 's'} en este período; Delt incluye herramientas de respuesta a disputas sin costo adicional.`,
  pricingOptions: 'Elija Cómo Quiere Ganar',
  pricingIntro: name =>
    `Tres programas. Los tres cuestan menos que lo que paga hoy — la única decisión equivocada es quedarse donde está. El resaltado es nuestra recomendación para ${name}.`,
  recommendedFor: name => `Recomendado para ${name}`,
  icBreakdown: (base, margin) =>
    `Su costo de intercambio (tasas publicadas): <strong>${base}/mes</strong> &nbsp;+&nbsp; margen Delt: <strong>${margin}/mes</strong>`,
  youdPay: 'Usted pagaría',
  youdSave: 'Usted ahorraría',
  perMo: '/mes',
  perYr: '/año',
  annualCostCompare: 'Costo Anual: Hoy vs. Delt',
  today: 'Hoy',
  with: 'Con',
  year1: 'Año 1',
  threeYears: '3 años',
  kept: 'retenidos',
  everyMonthWait: 'Cada mes que espera',
  gone: 'perdidos',
  inactionCallout: a =>
    `<strong>El costo de "déjeme pensarlo":</strong> esta decisión tiene un taxímetro corriendo. Espere 3 meses y son ${a.m3}. Espere un año, ${a.yr}. En 3 años, <strong>${a.yr3}</strong> — dinero que compra inventario, personal, publicidad… o se queda con su procesador. De cualquier forma, no regresa.`,
  cdNote: (name, fee) =>
    `Con Descuento por Efectivo, la tarifa de servicio de ${fee} la pagan los clientes que usan tarjeta — el costo propio de ${name} es solo la cuota fija del programa mostrada arriba.`,
  howWorks: p => `Cómo Funciona ${p}`,
  valueTitle: 'Todo Lo Que Recibe (Sin Pagar Extra)',
  valueTiles: a => [
    { h: 'Precio fijado — por escrito', p: 'Su precio de programa es su precio de programa. Sin aumentos escondidos, sin "ajustes trimestrales", sin cargos sorpresa en el mes siete.' },
    {
      h: a.junkYr ? `${a.junkYr}/año de cargos basura — eliminados` : 'Cargos basura — eliminados',
      p: `Las cuotas de PCI, estado de cuenta, lotes y "servicio"${a.junkMo ? ` (${a.junkMo}/mes en su estado de cuenta actual)` : ''} no lo siguen hasta aquí.`,
    },
    a.cdCost
      ? { h: 'Un solo costo fijo — nada que auditar', p: `No hay ninguna tasa porcentual sobre usted. Los costos de tarjeta los cubre la tarifa de servicio del cliente, así que su costo es ${a.cdCost}/mes, punto — igual en diciembre que en enero.` }
      : { h: 'Auditoría de tasas, cada ciclo', p: `Re-verificamos sus precios contra las tablas publicadas de Visa/Mastercard cada abril y octubre — la misma auditoría que ${a.paddingYr ? `detectó ${a.paddingYr}/año de sobrecargos en su estado de cuenta actual` : 'encontró el ahorro de esta propuesta'}.` },
    { h: 'Cumplimiento + personas de verdad', p: 'Señalización, formato de recibos, herramientas de disputas e instalación de principio a fin — con personas que contestan el teléfono, no filas de tickets.' },
  ],
  guarantee:
    `<strong>La garantía Delt:</strong> sin contrato de plazo forzoso y sin cargo por cancelación — conservamos su negocio ganándolo cada mes, no atrapándolo en un contrato. Y si nuestra auditoría alguna vez muestra que no podemos mejorar su estado de cuenta actual, le diremos que se quede donde está. Solo ganamos cuando usted ahorra.`,
  capital:
    `<strong>Y cuando esté listo para crecer — Delt Capital.</strong> Los comercios Delt tienen acceso prioritario a capital de trabajo con tasas de primer nivel y pagos flexibles que se ajustan a sus ventas diarias con tarjeta — semana ocupada, paga un poco más; semana lenta, un poco menos. Ya conocemos sus números por el procesamiento, así que las decisiones de financiamiento llegan en días, no semanas. Sin maratones de papeleo.`,
  first30Title: 'Sus Primeros 30 Días — Lo Que Pasa Realmente',
  first30Intro: 'La mayoría de los cambios se estancan por miedo a la transición, no por el precio. Aquí está el proceso completo, de principio a fin:',
  first30: a => [
    { b: 'Hoy — diga que sí.', rest: ' Firme abajo o responda a su contacto de Delt. Dos minutos, y el taxímetro se detiene.' },
    { b: 'Días 1–2 — aprobación.', rest: ' Una solicitud corta; ya tenemos su estado de cuenta, así que la evaluación es rápida. Ese mismo día tendrá un contacto de alta asignado por nombre.' },
    { b: 'Días 3–5 — el equipo llega configurado.', rest: ` La terminal${a.cd ? ', el kit de señalización,' : ''} y los recibos quedan listos antes del envío. Su procesamiento actual sigue funcionando — sin interrupciones.` },
    { b: 'Semana 1 — en marcha.', rest: ` Su representante acompaña el cambio; la mayoría de los comercios cambia sin tiempo fuera de línea y empieza a retener los ${a.monthly}/mes de inmediato.` },
    { b: 'Día 30 — revisión del primer estado de cuenta.', rest: ' Nos sentamos con su primer estado de cuenta de Delt junto a esta propuesta, línea por línea, y confirmamos que los números se cumplieron. Si algo no cuadra, lo corregimos.' },
  ],
  lockCta: a =>
    `<strong>Firme abajo para asegurar estos precios hasta el ${a.date}.</strong> Esta propuesta está calculada sobre su estado de cuenta${a.period ? ` de ${a.period}` : ''} y el ciclo de intercambio vigente (${a.version}) — después del ${a.date} los números deben recalcularse.`,
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
  toolbar: { present: '▶ Presentar', pdf: '🖨 Guardar PDF', send: '✉ Enviar' },
  presentHint: '← → para navegar · Esc para salir',
  mailSubject: (name, savings) => `Encontramos ${savings}/año en su estado de cuenta — ${name}`,
  mailBody: a => [
    'Hola,', '',
    'Auditamos su estado de cuenta línea por línea — no una estimación de sitio web, sus números reales. Esto es lo que mostró:', '',
    `• Hoy usted paga ${a.current}/mes (tasa efectiva del ${a.rate}%)`,
    `• Con Delt ${a.program}: ${a.newCost}/mes`,
    `• Son ${a.savings}/año que se quedan en su negocio en lugar de con su procesador`, '',
    'Los mismos clientes, las mismas tarjetas, el mismo mostrador — lo único que cambia es quién se queda con el dinero.', '',
    'La propuesta completa va adjunta (se abre en cualquier navegador). Está calculada sobre su estado de cuenta actual, así que entre más pronto hablemos, más pronto se detiene el taxímetro. ¿Cuándo tiene 15 minutos esta semana?', '',
    a.signoff,
  ].join('\n'),
  teamSignoff: 'El Equipo Delt',
};

export function buildProposalHtml(input: ProposalInput): string {
  const { extracted: ex, programs, focusKey, preparedBy, preparedByEmail, lang = 'en' } = input;
  const L = lang === 'es' ? ES_COPY : EN;
  const locale = lang === 'es' ? 'es-US' : 'en-US';
  const focus = programs.find(p => p.key === focusKey) ?? programs[0];
  if (!focus) return '';

  const name = esc(ex.merchantName);
  const today = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const monthlySavings = Math.max(0, ex.currentMonthlyCost - focus.monthlyCost);
  const dailySavings = monthlySavings * 12 / 365;
  const threeYear = Math.round(monthlySavings * 36);
  const currentAnnual = Math.round(ex.currentMonthlyCost * 12);
  const maxFee = Math.max(...ex.fees.map(f => f.amount), 1);
  const maxCost = Math.max(currentAnnual, focus.annualCost, 1);
  const focusName = L.programNames[focus.key];
  const processorName = ex.currentProcessor && ex.currentProcessor !== 'Unknown' ? esc(ex.currentProcessor) : '';
  const periodName = ex.statementPeriod && ex.statementPeriod !== '—' ? esc(ex.statementPeriod) : '';
  const validUntil = new Date(Date.now() + 14 * 86400_000)
    .toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });

  // Closer ammo, all pulled from the real statement: junk fees the merchant
  // pays for nothing, and documented interchange padding vs published rates.
  const junkFees = ex.fees
    .filter(f => /pci|statement|batch|monthly|regulatory|annual|minimum|service fee|gateway|misc|other/i.test(f.label))
    .reduce((s, f) => s + f.amount, 0);
  const audit = ex.interchangeLines.length
    ? auditInterchangeLines(ex.interchangeLines, ex.avgTicket).summary
    : null;
  const padding = audit && audit.monthlyPadding > 0.5 ? audit : null;

  const fileName = `Delt-Proposal-${ex.merchantName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Merchant'}-${new Date().toISOString().slice(0, 10)}.html`;
  const mailSubject = L.mailSubject(ex.merchantName, fmtWhole(focus.annualSavings));
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
      ${p.key === 'interchange_plus' && p.icBaseMonthly != null && p.icMarginMonthly != null
        ? `<p class="tagline" style="margin-bottom:8px;">${L.icBreakdown(fmt(p.icBaseMonthly), fmt(p.icMarginMonthly))}</p>`
        : ''}
      <div class="split">
        <div><span class="lbl">${esc(L.youdPay)}</span><span class="val">${fmt(p.monthlyCost)}${L.perMo}</span></div>
        <div><span class="lbl">${esc(L.youdSave)}</span><span class="val green">${fmtWhole(p.annualSavings)}${L.perYr}</span></div>
      </div>
    </div>`).join('');

  const steps = L.howItWorks[focus.key].map((s, i) => `
    <div class="step"><div class="stepnum">${i + 1}</div><p>${esc(s)}</p></div>`).join('');

  const valueCells = L.valueTiles({
    junkMo: junkFees > 1 ? fmt(junkFees) : null,
    junkYr: junkFees > 1 ? fmtWhole(junkFees * 12) : null,
    paddingYr: padding ? fmtWhole(padding.annualPadding) : null,
    cdCost: focus.key === 'cash_discount' ? fmt(focus.monthlyCost) : null,
  }).map(w => `<div><h4>${esc(w.h)}</h4><p>${esc(w.p)}</p></div>`).join('\n    ');

  const first30Steps = L.first30({ monthly: fmtWhole(monthlySavings), cd: focus.key === 'cash_discount' })
    .map((s, i) => `<div class="step"><div class="stepnum">${i + 1}</div><p><strong>${esc(s.b)}</strong>${esc(s.rest)}</p></div>`)
    .join('\n  ');

  const footer = `<div class="footer"><span>${L.footerLeft(name)}</span><span>${L.footerRight(today)}</span></div>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${L.docTitle} — ${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937; font-size: 13px; line-height: 1.55;
  }
  @page { size: letter; margin: 0; }
  .page {
    width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.75in;
    page-break-after: always; position: relative; background: #fff;
  }
  .page:last-child { page-break-after: auto; }
  @media screen { .page { box-shadow: 0 1px 8px rgba(0,0,0,0.12); margin: 16px auto; } body { background: #eef0f3; } }

  .logo .logosvg { height: 22px; width: auto; display: block; }
  .logo-lg .logosvg { height: 34px; width: auto; display: block; }
  h1 { font-size: 36px; line-height: 1.12; color: #111827; margin: 18px 0 6px; }
  h2 { font-size: 19px; color: #111827; margin-bottom: 4px; }
  .rule { height: 3px; width: 44px; background: #2E6BFF; border-radius: 2px; margin: 10px 0 16px; }
  .muted { color: #6b7280; }
  .small { font-size: 11px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .green { color: #059669; }
  .red { color: #dc2626; }

  /* Cover */
  .cover { display: flex; flex-direction: column; }
  .cover .hero {
    margin-top: 22px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px;
    padding: 24px; text-align: center;
  }
  .cover .hero .big { font-size: 44px; font-weight: 800; color: #047857; }
  .prepared { display: flex; gap: 14px; margin-top: 22px; }
  .prepared > div { flex: 1; background: #f0f5ff; border-radius: 10px; padding: 14px 16px; }
  .prepared .lbl { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 4px; }
  .prepared .who { font-size: 15px; font-weight: 700; color: #111827; }
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
  .callout.alert { background: #fef2f2; border-left-color: #dc2626; }
  .callout.good { background: #ecfdf5; border-left-color: #059669; }
  .callout.brandbox { background: #f0f5ff; border-left-color: #4945FF; }

  /* Stat grid */
  .stats { display: flex; gap: 12px; margin: 14px 0; }
  .stats > div { flex: 1; background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
  .stats .lbl { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 3px; }
  .stats .val { font-size: 17px; font-weight: 700; color: #111827; }

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

  /* Value stack */
  .why { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .why > div { background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
  .why h4 { font-size: 12px; margin-bottom: 3px; }
  .why p { font-size: 11px; color: #6b7280; }

  /* Acceptance */
  .sig { display: flex; gap: 24px; margin-top: 28px; }
  .sig > div { flex: 1; }
  .sigline { border-bottom: 1px solid #9ca3af; height: 34px; margin-bottom: 5px; }
  .footer { position: absolute; bottom: 0.45in; left: 0.75in; right: 0.75in; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; border-top: 1px solid #eef0f3; padding-top: 8px; }

  /* ── Screen-only toolbar (Present / PDF / Send) ── */
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  <div class="logo-lg">${DELT_LOGO}</div>
  <h1>${L.heroTitle(fmtWhole(focus.annualSavings))}</h1>
  <p class="muted">${esc(L.preparedExclusivelyFor)} <strong>${name}</strong> — ${esc(L.coverSub)}</p>
  <div class="hero">
    <p class="muted small" style="text-transform:uppercase;letter-spacing:0.08em;">${esc(L.heroLabel(ex.merchantName, focusName))}</p>
    <div class="big">${fmtWhole(focus.annualSavings)}<span style="font-size:19px;font-weight:700;">${L.perYr}</span></div>
    <p class="green" style="font-weight:700;">${esc(L.heroLine({ monthly: fmtWhole(monthlySavings), pct: focus.savingsPct, daily: dailySavings >= 1 ? fmt(dailySavings) : null }))}</p>
  </div>
  <p style="margin-top:16px;">${L.whoKeeps(processorName || (lang === 'es' ? 'su procesador' : 'your processor'), fmtWhole(focus.annualSavings))}</p>
  <div class="prepared">
    <div>
      <span class="lbl">${esc(L.preparedFor)}</span>
      <span class="who">${name}</span>
      <p class="muted small">${esc(L.basedOnStatement(periodName, processorName))}</p>
    </div>
    <div>
      <span class="lbl">${esc(L.preparedBy)}</span>
      <span class="who">${preparedBy ? esc(preparedBy) : 'Delt'}</span>
      <p class="muted small">${today} · ${esc(L.pricingHonored(validUntil))}</p>
    </div>
  </div>
  <p class="coverfoot">${esc(L.coverDisclaimer)}</p>
</div>

<!-- ── Page 2: Where you are today ── -->
<div class="page">
  <div class="logo">${DELT_LOGO}</div>
  <h2 style="margin-top:14px;">${esc(L.situationTitle)}</h2>
  <div class="rule"></div>
  <p>${L.situationBody({
    volume: fmtWhole(ex.totalVolume),
    txns: ex.totalTransactions.toLocaleString(),
    processor: processorName,
    model: ex.pricingModel && ex.pricingModel !== 'unknown' ? esc(ex.pricingModel.replace(/-/g, ' ')) : '',
    period: periodName,
    monthlyCost: fmt(ex.currentMonthlyCost),
    rate: ex.effectiveRatePct,
    annual: fmtWhole(currentAnnual),
  })}</p>

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
  ${padding ? `<div class="callout alert">${L.paddingCallout({ version: esc(IC_SCHEDULE.version), flagged: audit!.flaggedLines, monthly: fmt(padding.monthlyPadding), annual: fmtWhole(padding.annualPadding) })}</div>` : ''}
  ${junkFees > 1
    ? `<div class="callout">${L.junkCallout({ monthly: fmt(junkFees), annual: fmtWhole(junkFees * 12) })}${ex.chargebackCount > 0 ? L.calloutChargebacks(ex.chargebackCount) : ''}</div>`
    : `<div class="callout">${L.calloutMeaning(name)}${ex.chargebackCount > 0 ? L.calloutChargebacks(ex.chargebackCount) : ''}</div>`}
  ${footer}
</div>

<!-- ── Page 3: Pricing options + cost of inaction ── -->
<div class="page">
  <div class="logo">${DELT_LOGO}</div>
  <h2 style="margin-top:14px;">${esc(L.pricingOptions)}</h2>
  <div class="rule"></div>
  <p>${esc(L.pricingIntro(ex.merchantName))}</p>
  <div class="programs">${programCards}</div>

  <h2 style="margin-top:20px;">${esc(L.annualCostCompare)}</h2>
  <div class="rule"></div>
  <div class="compare">
    <div class="row">
      <div class="lbl">${esc(L.today)}${processorName ? ` (${processorName})` : ''}</div>
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
    <div><span class="lbl">${esc(L.year1)}</span><span class="val green">${fmtWhole(focus.annualSavings)} ${esc(L.kept)}</span></div>
    <div><span class="lbl">${esc(L.threeYears)}</span><span class="val green">${fmtWhole(threeYear)} ${esc(L.kept)}</span></div>
    <div><span class="lbl">${esc(L.everyMonthWait)}</span><span class="val red">${fmtWhole(monthlySavings)} ${esc(L.gone)}</span></div>
  </div>
  ${monthlySavings > 0 ? `<div class="callout alert">${L.inactionCallout({ m3: fmtWhole(monthlySavings * 3), yr: fmtWhole(focus.annualSavings), yr3: fmtWhole(threeYear) })}</div>` : ''}
  ${focus.key === 'cash_discount' ? `<p class="muted small">${esc(L.cdNote(ex.merchantName, focus.terms.split(' ')[0] ?? ''))}</p>` : ''}
  ${footer}
</div>

<!-- ── Page 4: How it works + value stack + guarantee + Capital ── -->
<div class="page">
  <div class="logo">${DELT_LOGO}</div>
  <h2 style="margin-top:14px;">${esc(L.howWorks(focusName))}</h2>
  <div class="rule"></div>
  ${steps}

  <h2 style="margin-top:20px;">${esc(L.valueTitle)}</h2>
  <div class="rule"></div>
  <div class="why">
    ${valueCells}
  </div>

  <div class="callout good">${L.guarantee}</div>
  <div class="callout brandbox">${L.capital}</div>
  ${footer}
</div>

<!-- ── Page 5: First 30 days + dated CTA + acceptance ── -->
<div class="page">
  <div class="logo">${DELT_LOGO}</div>
  <h2 style="margin-top:14px;">${esc(L.first30Title)}</h2>
  <div class="rule"></div>
  <p>${esc(L.first30Intro)}</p>
  ${first30Steps}

  <div class="callout" style="margin-top:20px;">${L.lockCta({ date: validUntil, period: periodName, version: esc(IC_SCHEDULE.version) })}</div>

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
 * (full-screen walkthrough), Save as PDF, and Send (which also downloads
 * the file for attaching).
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
