/**
 * Personalized merchant savings proposal — a paginated, print-ready document
 * built from the analyzed statement. Opened in a new window where the print
 * dialog saves it as a PDF (same precedent as ExportDealReport / underwriting
 * print views).
 *
 * Merchant-safe by construction: consumes ProgramQuote only, never
 * ProgramEconomics (see pricingPrograms.ts).
 */
import type { ProgramQuote } from './pricingPrograms';
import type { ExtractedData } from './pages/BackendAnalysis';

export interface ProposalInput {
  extracted: ExtractedData;
  programs: ProgramQuote[];
  /** Program to lead with — the merchant's selection or the recommendation. */
  focusKey: ProgramQuote['key'] | null;
  /** Name of the rep preparing the proposal, when known. */
  preparedBy?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const HOW_IT_WORKS: Record<ProgramQuote['key'], string[]> = {
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
};

export function buildProposalHtml(input: ProposalInput): string {
  const { extracted: ex, programs, focusKey, preparedBy } = input;
  const focus = programs.find(p => p.key === focusKey) ?? programs[0];
  if (!focus) return '';

  const name = esc(ex.merchantName);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const monthlySavings = Math.max(0, ex.currentMonthlyCost - focus.monthlyCost);
  const currentAnnual = Math.round(ex.currentMonthlyCost * 12);
  const maxFee = Math.max(...ex.fees.map(f => f.amount), 1);
  const maxCost = Math.max(currentAnnual, focus.annualCost, 1);

  const feeRows = ex.fees.map(f => `
    <tr>
      <td>${esc(f.label)}</td>
      <td class="num">${fmt(f.amount)}</td>
      <td class="barcell"><div class="bar gray" style="width:${Math.max(2, Math.round((f.amount / maxFee) * 100))}%"></div></td>
    </tr>`).join('');

  const programCards = programs.map(p => `
    <div class="program ${p.key === focus.key ? 'focus' : ''}">
      ${p.key === focus.key ? '<div class="pill">Recommended for ' + name + '</div>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="tagline">${esc(p.tagline)}</p>
      <p class="terms">${esc(p.terms)}</p>
      <div class="split">
        <div><span class="lbl">You'd pay</span><span class="val">${fmt(p.monthlyCost)}/mo</span></div>
        <div><span class="lbl">You'd save</span><span class="val green">${fmtWhole(p.annualSavings)}/yr</span></div>
      </div>
    </div>`).join('');

  const steps = HOW_IT_WORKS[focus.key].map((s, i) => `
    <div class="step"><div class="stepnum">${i + 1}</div><p>${s}</p></div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Savings Proposal — ${name}</title>
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
</style>
</head>
<body>

<!-- ── Page 1: Cover ── -->
<div class="page cover">
  <div class="brand">DELT</div>
  <h1>Payment Savings<br>Proposal</h1>
  <p class="muted">Prepared exclusively for <strong>${name}</strong></p>
  <div class="hero">
    <p class="muted small" style="text-transform:uppercase;letter-spacing:0.08em;">Estimated annual savings with ${esc(focus.name)}</p>
    <div class="big">${fmtWhole(focus.annualSavings)}</div>
    <p class="green" style="font-weight:700;">${focus.savingsPct}% less than ${name} pays today${monthlySavings > 0 ? ` — ${fmtWhole(monthlySavings)} back every month` : ''}</p>
  </div>
  <div class="prepared">
    <div>
      <span class="lbl">Prepared for</span>
      <span class="who">${name}</span>
      <p class="muted small">${ex.statementPeriod ? `Based on the ${esc(ex.statementPeriod)} statement` : 'Based on your processing statement'}${ex.currentProcessor ? ` from ${esc(ex.currentProcessor)}` : ''}</p>
    </div>
    <div>
      <span class="lbl">Prepared by</span>
      <span class="who">${preparedBy ? esc(preparedBy) : 'Delt'}</span>
      <p class="muted small">${today}</p>
    </div>
  </div>
  <p class="coverfoot">Estimates are based on the statement provided. Actual results depend on card mix and processing volume.</p>
</div>

<!-- ── Page 2: Where you are today ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">Executive Summary</h2>
  <div class="rule"></div>
  <p>
    We reviewed ${name}'s ${ex.statementPeriod ? esc(ex.statementPeriod) + ' ' : ''}processing statement${ex.currentProcessor ? ` from ${esc(ex.currentProcessor)}` : ''} line by line.
    On ${fmtWhole(ex.totalVolume)} of monthly card volume across ${ex.totalTransactions.toLocaleString()} transactions,
    ${name} is paying <strong>${fmt(ex.currentMonthlyCost)} per month</strong> in processing costs — an effective rate of
    <strong>${ex.effectiveRatePct}%</strong>. Under the recommended <strong>${esc(focus.name)}</strong> program, we estimate that cost drops to
    <strong>${fmt(focus.monthlyCost)} per month</strong>, keeping <strong class="green">${fmtWhole(focus.annualSavings)}</strong> in the business every year.
  </p>

  <h2 style="margin-top:24px;">Where the Money Goes Today</h2>
  <div class="rule"></div>
  <div class="stats">
    <div><span class="lbl">Monthly volume</span><span class="val">${fmtWhole(ex.totalVolume)}</span></div>
    <div><span class="lbl">Effective rate</span><span class="val">${ex.effectiveRatePct}%</span></div>
    <div><span class="lbl">Monthly cost</span><span class="val">${fmt(ex.currentMonthlyCost)}</span></div>
    <div><span class="lbl">Annual cost</span><span class="val">${fmtWhole(currentAnnual)}</span></div>
  </div>
  <table>
    <thead><tr><th>Fee on your statement</th><th class="num">Amount</th><th></th></tr></thead>
    <tbody>${feeRows}</tbody>
  </table>
  <div class="callout">
    <strong>What this means for ${name}:</strong> every one of these line items is negotiable — most shrink dramatically or disappear
    under the programs on the next page.${ex.chargebackCount > 0 ? ` We also noted ${ex.chargebackCount} chargeback${ex.chargebackCount === 1 ? '' : 's'} this period; Delt includes dispute-response tooling at no extra cost.` : ''}
  </div>
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
</div>

<!-- ── Page 3: Proposed solutions ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">Your Pricing Options</h2>
  <div class="rule"></div>
  <p>Three ways forward — all three cost less than today. The highlighted program is our recommendation for ${name}.</p>
  <div class="programs">${programCards}</div>

  <h2 style="margin-top:20px;">Annual Cost: Today vs. Delt</h2>
  <div class="rule"></div>
  <div class="compare">
    <div class="row">
      <div class="lbl">Today${ex.currentProcessor ? ` (${esc(ex.currentProcessor)})` : ''}</div>
      <div class="track"><div class="bar gray" style="width:${Math.max(3, Math.round((currentAnnual / maxCost) * 100))}%"></div></div>
      <div class="amount">${fmtWhole(currentAnnual)}</div>
    </div>
    <div class="row">
      <div class="lbl">With ${esc(focus.name)}</div>
      <div class="track"><div class="bar blue" style="width:${Math.max(3, Math.round((focus.annualCost / maxCost) * 100))}%"></div></div>
      <div class="amount">${fmtWhole(focus.annualCost)}</div>
    </div>
  </div>
  <div class="stats">
    <div><span class="lbl">Year 1 savings</span><span class="val green">${fmtWhole(focus.annualSavings)}</span></div>
    <div><span class="lbl">3-year savings</span><span class="val green">${fmtWhole(Math.round(monthlySavings * 36))}</span></div>
    <div><span class="lbl">Every month</span><span class="val green">${fmtWhole(monthlySavings)}</span></div>
  </div>
  ${focus.key === 'cash_discount' ? `<p class="muted small">With Cash Discount, the ${esc(focus.terms.split(' ')[0] ?? '')} service fee is paid by card-paying customers — ${name}'s own cost is the flat program fee shown above.</p>` : ''}
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
</div>

<!-- ── Page 4: How it works + next steps + acceptance ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">How ${esc(focus.name)} Works</h2>
  <div class="rule"></div>
  ${steps}

  <h2 style="margin-top:20px;">Why Merchants Choose Delt</h2>
  <div class="rule"></div>
  <div class="why">
    <div><h4>No rate creep</h4><p>Your pricing is locked to your program — there is no percentage rate to quietly go up over time.</p></div>
    <div><h4>Transparent statements</h4><p>One page you can read, not twelve pages of line items. What you see is what you pay.</p></div>
    <div><h4>Compliance handled</h4><p>Signage, receipt formatting, and card-network rules are set up and kept current for you.</p></div>
    <div><h4>Real support</h4><p>Setup, hardware, and day-to-day questions handled by people, not ticket queues.</p></div>
  </div>

  <h2 style="margin-top:20px;">Next Steps</h2>
  <div class="rule"></div>
  <div class="step"><div class="stepnum">1</div><p><strong>Accept this proposal</strong> — sign below or reply to your Delt contact.</p></div>
  <div class="step"><div class="stepnum">2</div><p><strong>Quick onboarding</strong> — a short application; approval typically lands within 1–2 business days.</p></div>
  <div class="step"><div class="stepnum">3</div><p><strong>Go live</strong> — equipment and signage arrive configured; most merchants switch with zero downtime.</p></div>

  <div class="sig">
    <div><div class="sigline"></div><p class="small muted">Signature — ${name}</p></div>
    <div><div class="sigline"></div><p class="small muted">Date</p></div>
  </div>
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
</div>

</body>
</html>`;
}

/** Open the proposal in a new window and bring up the print dialog (→ Save as PDF). */
export function openProposalPdf(input: ProposalInput): boolean {
  const html = buildProposalHtml(input);
  if (!html) return false;
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = `Savings Proposal — ${input.extracted.merchantName}`;
  // Let layout settle before invoking print so bars/pages render correctly.
  win.focus();
  setTimeout(() => { try { win.print(); } catch { /* window closed */ } }, 350);
  return true;
}
