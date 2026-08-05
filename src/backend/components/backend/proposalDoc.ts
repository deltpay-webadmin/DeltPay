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
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Safely embed a string as a JS literal inside the generated <script>. */
const js = (s: string) => JSON.stringify(s).replace(/</g, '\\u003c');
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
  const { extracted: ex, programs, focusKey, preparedBy, preparedByEmail } = input;
  const focus = programs.find(p => p.key === focusKey) ?? programs[0];
  if (!focus) return '';

  const name = esc(ex.merchantName);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const monthlySavings = Math.max(0, ex.currentMonthlyCost - focus.monthlyCost);
  const currentAnnual = Math.round(ex.currentMonthlyCost * 12);
  const maxFee = Math.max(...ex.fees.map(f => f.amount), 1);
  const maxCost = Math.max(currentAnnual, focus.annualCost, 1);
  const dailySavings = monthlySavings * 12 / 365;
  const threeYear = Math.round(monthlySavings * 36);

  // Closer ammo, all pulled from the real statement:
  // junk fees the merchant pays for nothing, and documented interchange
  // padding vs the published Visa/MC schedules.
  const junkFees = ex.fees
    .filter(f => /pci|statement|batch|monthly|regulatory|annual|minimum|service fee|gateway|misc|other/i.test(f.label))
    .reduce((s, f) => s + f.amount, 0);
  const audit = ex.interchangeLines.length
    ? auditInterchangeLines(ex.interchangeLines, ex.avgTicket).summary
    : null;
  const padding = audit && audit.monthlyPadding > 0.5 ? audit : null;
  const validUntil = new Date(Date.now() + 14 * 86400_000)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const fileName = `Delt-Proposal-${ex.merchantName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Merchant'}-${new Date().toISOString().slice(0, 10)}.html`;
  const mailSubject = `We found ${fmtWhole(focus.annualSavings)}/yr in your processing statement — ${ex.merchantName}`;
  const mailBody = [
    `Hi,`,
    ``,
    `We audited your statement line by line — not a website estimate, your actual numbers. Here's what it showed:`,
    ``,
    `• Today you pay ${fmt(ex.currentMonthlyCost)}/month (${ex.effectiveRatePct}% effective rate)`,
    `• With Delt ${focus.name}: ${fmt(focus.monthlyCost)}/month`,
    `• That's ${fmtWhole(focus.annualSavings)}/year staying in your business instead of your processor's`,
    ``,
    `Same customers, same cards, same counter — the only thing that changes is who keeps the money.`,
    ``,
    `The full proposal is attached (opens in any browser). It's priced off your current statement, so the sooner we talk, the sooner the meter stops. When's a good 15 minutes this week?`,
    ``,
    preparedBy ? `${preparedBy}\nDelt` : `The Delt Team`,
  ].join('\n');

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
  <button class="primary" onclick="startPresent()" title="Full-screen, page-by-page walkthrough">▶ Present</button>
  <button onclick="window.print()" title="Print or save as PDF">🖨 Save as PDF</button>
  <button onclick="sendProposal()" title="Open a pre-written email in your Outlook account and download the file to attach">✉ Send</button>
</div>

<div class="pnav">
  <button onclick="step(-1)" title="Previous page">‹</button>
  <span class="counter" id="pcounter"></span>
  <button onclick="step(1)" title="Next page">›</button>
  <span class="hint">← → to navigate · Esc to exit</span>
</div>

<!-- ── Page 1: Cover ── -->
<div class="page cover">
  <div class="brand">DELT</div>
  <h1>We Found ${fmtWhole(focus.annualSavings)}<br>Hiding in Your Statement.</h1>
  <p class="muted">Prepared exclusively for <strong>${name}</strong> — from your actual numbers, not an estimate off a website.</p>
  <div class="hero">
    <p class="muted small" style="text-transform:uppercase;letter-spacing:0.08em;">Back in ${name}'s pocket with ${esc(focus.name)}</p>
    <div class="big">${fmtWhole(focus.annualSavings)}<span style="font-size:20px;font-weight:700;">/yr</span></div>
    <p class="green" style="font-weight:700;">That's ${fmtWhole(monthlySavings)} every month — ${focus.savingsPct}% off what you pay today${dailySavings >= 1 ? `, about ${fmt(dailySavings)} every single day` : ''}.</p>
  </div>
  <p style="margin-top:18px;">
    Right now, ${ex.currentProcessor && ex.currentProcessor !== 'Unknown' ? esc(ex.currentProcessor) : 'your processor'} keeps that money.
    Same customers. Same cards. Same terminal on the counter. The only thing that changes is <strong>who keeps the ${fmtWhole(focus.annualSavings)}</strong> — them, or you.
  </p>
  <div class="prepared">
    <div>
      <span class="lbl">Prepared for</span>
      <span class="who">${name}</span>
      <p class="muted small">${ex.statementPeriod ? `Line-by-line audit of the ${esc(ex.statementPeriod)} statement` : 'Line-by-line audit of your processing statement'}${ex.currentProcessor ? ` from ${esc(ex.currentProcessor)}` : ''}</p>
    </div>
    <div>
      <span class="lbl">Prepared by</span>
      <span class="who">${preparedBy ? esc(preparedBy) : 'Delt'}</span>
      <p class="muted small">${today} · Pricing honored through ${validUntil}</p>
    </div>
  </div>
  <p class="coverfoot">Numbers come from the statement provided. Actual results depend on card mix and processing volume.</p>
</div>

<!-- ── Page 2: Where you are today ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">Here's What's Actually Happening</h2>
  <div class="rule"></div>
  <p>
    We didn't skim your statement — we audited every line of the ${ex.statementPeriod ? esc(ex.statementPeriod) + ' ' : ''}statement${ex.currentProcessor ? ` from ${esc(ex.currentProcessor)}` : ''}.
    On ${fmtWhole(ex.totalVolume)} of card volume across ${ex.totalTransactions.toLocaleString()} transactions, ${name} paid
    <strong>${fmt(ex.currentMonthlyCost)}</strong> — a <strong>${ex.effectiveRatePct}%</strong> effective rate.
    That's <strong>${fmtWhole(currentAnnual)} a year</strong> walking out the door for the privilege of taking cards.
  </p>

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
  ${padding ? `
  <div class="callout" style="border-left-color:#dc2626;background:#fef2f2;">
    <strong>We caught something.</strong> Compared against the published ${esc(IC_SCHEDULE.version)} Visa/Mastercard interchange schedules,
    ${audit!.flaggedLines} of your card categories are billed <strong>above the published rate</strong> — roughly
    <strong>${fmt(padding.monthlyPadding)}/month (${fmtWhole(padding.annualPadding)}/year)</strong> in markup buried inside "interchange."
    Your processor is betting you'll never check. We checked.
  </div>` : ''}
  ${junkFees > 1 ? `
  <div class="callout">
    <strong>And the junk fees:</strong> ${fmt(junkFees)}/month (${fmtWhole(junkFees * 12)}/year) of PCI, statement, batch, and service
    fees — charges for paperwork, not processing. Under the programs on the next page, most of this disappears on day one.
    ${ex.chargebackCount > 0 ? ` We also noted ${ex.chargebackCount} chargeback${ex.chargebackCount === 1 ? '' : 's'} this period; Delt includes dispute-response tooling at no extra cost.` : ''}
  </div>` : `
  <div class="callout">
    <strong>What this means for ${name}:</strong> every one of these line items is negotiable — most shrink dramatically or disappear
    under the programs on the next page.${ex.chargebackCount > 0 ? ` We also noted ${ex.chargebackCount} chargeback${ex.chargebackCount === 1 ? '' : 's'} this period; Delt includes dispute-response tooling at no extra cost.` : ''}
  </div>`}
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
</div>

<!-- ── Page 3: Proposed solutions ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">Pick How You Want to Win</h2>
  <div class="rule"></div>
  <p>Three programs. All three beat what you pay today — the only wrong choice is staying where you are. The highlighted one is our recommendation for ${name}.</p>
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
    <div><span class="lbl">Year 1</span><span class="val green">${fmtWhole(focus.annualSavings)} kept</span></div>
    <div><span class="lbl">3 years</span><span class="val green">${fmtWhole(threeYear)} kept</span></div>
    <div><span class="lbl">Every month you wait</span><span class="val" style="color:#dc2626;">${fmtWhole(monthlySavings)} gone</span></div>
  </div>
  ${monthlySavings > 0 ? `
  <div class="callout" style="border-left-color:#dc2626;background:#fef2f2;">
    <strong>The cost of "let me think about it":</strong> this decision has a meter running. Wait 3 months, that's ${fmtWhole(monthlySavings * 3)}.
    Wait a year, ${fmtWhole(focus.annualSavings)}. Over 3 years, <strong>${fmtWhole(threeYear)}</strong> — money that buys inventory, staff,
    marketing… or stays with your processor. It never comes back either way.
  </div>` : ''}
  ${focus.key === 'cash_discount' ? `<p class="muted small">With Cash Discount, the ${esc(focus.terms.split(' ')[0] ?? '')} service fee is paid by card-paying customers — ${name}'s own cost is the flat program fee shown above.</p>` : ''}
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
</div>

<!-- ── Page 4: How it works + next steps + acceptance ── -->
<div class="page">
  <div class="brand">DELT</div>
  <h2 style="margin-top:14px;">How ${esc(focus.name)} Works</h2>
  <div class="rule"></div>
  ${steps}

  <h2 style="margin-top:20px;">Everything You Get (Without Paying Extra For It)</h2>
  <div class="rule"></div>
  <div class="why">
    <div><h4>Locked pricing — in writing</h4><p>Your program price is your program price. No rate creep, no "quarterly adjustments," no surprise line items in month seven.</p></div>
    <div><h4>${junkFees > 1 ? `${fmtWhole(junkFees * 12)}/yr of junk fees — deleted` : 'Junk fees — deleted'}</h4><p>PCI, statement, batch, and "service" fees${junkFees > 1 ? ` (${fmt(junkFees)}/mo on your current statement)` : ''} don't follow you here.</p></div>
    <div><h4>Rate audit, every cycle</h4><p>We re-check your pricing against the published Visa/Mastercard schedules every April and October — the same audit that ${padding ? `caught ${fmtWhole(padding.annualPadding)}/yr of padding on your current statement` : 'found the savings in this proposal'}.</p></div>
    <div><h4>Compliance + real humans</h4><p>Signage, receipt formatting, dispute-response tooling, and setup handled end to end — by people who pick up the phone, not a ticket queue.</p></div>
  </div>

  <div class="callout" style="border-left-color:#059669;background:#ecfdf5;">
    <strong>The Delt guarantee:</strong> no long-term contract and no cancellation fee — we keep your business by earning it monthly, not by trapping you in one.
    And if our audit ever shows we can't beat your current statement, we'll tell you to stay put. We only win when you save.
  </div>

  <h2 style="margin-top:18px;">Next Steps</h2>
  <div class="rule"></div>
  <div class="step"><div class="stepnum">1</div><p><strong>Say yes</strong> — sign below or reply to your Delt contact. Two minutes, and the meter stops running.</p></div>
  <div class="step"><div class="stepnum">2</div><p><strong>Quick onboarding</strong> — a short application; approval typically lands within 1–2 business days.</p></div>
  <div class="step"><div class="stepnum">3</div><p><strong>Go live and keep the ${fmtWhole(monthlySavings)}/mo</strong> — equipment and signage arrive configured; most merchants switch with zero downtime.</p></div>
  <p class="muted small" style="margin-top:8px;">This proposal is priced off your ${ex.statementPeriod ? esc(ex.statementPeriod) + ' ' : ''}statement and the current ${esc(IC_SCHEDULE.version)} interchange cycle — pricing honored through <strong>${validUntil}</strong>.</p>

  <div class="sig">
    <div><div class="sigline"></div><p class="small muted">Signature — ${name}</p></div>
    <div><div class="sigline"></div><p class="small muted">Date</p></div>
  </div>
  <div class="footer"><span>Savings proposal — ${name}</span><span>Prepared by Delt · ${today}</span></div>
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
  win.document.title = `Savings Proposal — ${input.extracted.merchantName}`;
  win.focus();
  return true;
}
