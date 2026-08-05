/**
 * Personalized merchant savings proposal — a paginated, print-ready document
 * built from the analyzed statement. Opened in a new window where the built-in
 * toolbar offers Present (full-screen walkthrough), Download, Save as PDF, and
 * Send (Outlook compose in the rep's own account).
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
  nextSteps: string;
  steps: { b: string; rest: string }[];
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
  nextSteps: 'Next Steps',
  steps: [
    { b: 'Accept this proposal', rest: ' — sign below or reply to your Delt contact.' },
    { b: 'Quick onboarding', rest: ' — a short application; approval typically lands within 1–2 business days.' },
    { b: 'Go live', rest: ' — equipment and signage arrive configured; most merchants switch with zero downtime.' },
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
  nextSteps: 'Próximos Pasos',
  steps: [
    { b: 'Acepte esta propuesta', rest: ' — firme abajo o responda a su contacto de Delt.' },
    { b: 'Alta rápida', rest: ' — una solicitud corta; la aprobación normalmente llega en 1–2 días hábiles.' },
    { b: 'Puesta en marcha', rest: ' — el equipo y la señalización llegan configurados; la mayoría de los comercios cambia sin interrupciones.' },
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
  const { extracted: ex, programs, focusKey, preparedBy, preparedByEmail, lang = 'en' } = input;
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

  const whyCells = L.whyItems.map(w => `<div><h4>${esc(w.h)}</h4><p>${esc(w.p)}</p></div>`).join('\n    ');
  const nextSteps = L.steps.map((s, i) =>
    `<div class="step"><div class="stepnum">${i + 1}</div><p><strong>${esc(s.b)}</strong>${esc(s.rest)}</p></div>`).join('\n  ');
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

  .brand { font-size: 15px; font-weight: 800; color: #2E6BFF; letter-spacing: 0.02em; }
  h1 { font-size: 40px; line-height: 1.1; color: #111827; margin: 18px 0 6px; }
  h2 { font-size: 19px; color: #111827; margin-bottom: 4px; }
  .rule { height: 3px; width: 44px; background: #2E6BFF; border-radius: 2px; margin: 10px 0 16px; }
  .muted { color: #6b7280; }
  .small { font-size: 11px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .green { color: #059669; }

  /* Cover */
  .cover { display: flex; flex-direction: column; }
  .cover .hero {
    margin-top: 26px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px;
    padding: 26px; text-align: center;
  }
  .cover .hero .big { font-size: 46px; font-weight: 800; color: #047857; }
  .prepared { display: flex; gap: 14px; margin-top: 26px; }
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

  /* Why Delt */
  .why { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .why > div { background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
  .why h4 { font-size: 12px; margin-bottom: 3px; }
  .why p { font-size: 11px; color: #6b7280; }

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
  <div class="brand">DELT</div>
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
  <div class="brand">DELT</div>
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

<!-- ── Page 3: Proposed solutions ── -->
<div class="page">
  <div class="brand">DELT</div>
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

<!-- ── Page 4: How it works + next steps + acceptance ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">${esc(L.howWorks(focusName))}</h2>
  <div class="rule"></div>
  ${steps}

  <h2 style="margin-top:20px;">${esc(L.whyDelt)}</h2>
  <div class="rule"></div>
  <div class="why">
    ${whyCells}
  </div>

  <h2 style="margin-top:20px;">${esc(L.nextSteps)}</h2>
  <div class="rule"></div>
  ${nextSteps}

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
