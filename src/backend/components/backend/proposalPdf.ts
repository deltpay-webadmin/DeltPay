// ── Delt Savings Proposal PDF ──
// Renders a print-ready, multi-page proposal document from a statement
// analysis and opens the browser print dialog (Save as PDF). Falls back to
// an HTML download when popups are blocked. Branding matches Delt's other
// generated documents (indigo #4945FF / navy #121E3E).

import {
  analyzeProcessing,
  auditFeeLine,
  type PricingProgram,
  type ProcessingIntelligence,
  type ProposalInput,
  type StatementInput,
} from './interchangeEngine';

const NAVY = '#121E3E';
const INDIGO = '#4945FF';
const TINT = '#f4f4ff';
const BORDER = '#c7c9e8';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const usd0 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number, d = 2) => `${n.toFixed(d)}%`;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const th = (text: string, align: 'left' | 'right' = 'left') =>
  `<th style="text-align:${align};border:1px solid ${NAVY};background:${NAVY};color:#fff;padding:5px 8px;font-size:8.5px;letter-spacing:0.6px;text-transform:uppercase;">${text}</th>`;
const td = (text: string, align: 'left' | 'right' = 'left', extra = '') =>
  `<td style="text-align:${align};border:1px solid ${BORDER};padding:5px 8px;${extra}">${text}</td>`;
const h2 = (text: string) =>
  `<h2 style="font-size:13px;margin:20px 0 8px;color:${NAVY};border-bottom:2px solid ${INDIGO};padding-bottom:3px;letter-spacing:0.3px;">${text}</h2>`;
const note = (text: string) =>
  `<p style="margin:6px 0 0;font-size:8.5px;color:#5a6180;">${text}</p>`;

export interface ProposalPdfOptions {
  merchantName: string;
  sourceFileName: string;
  statement: StatementInput;
  proposal: ProposalInput;
  /** Selected pricing program; the proposal numbers should already reflect it. */
  program?: PricingProgram;
  preparedBy?: string;
}

export function generateProposalPdf(opts: ProposalPdfOptions): void {
  const intel = analyzeProcessing(opts.statement, opts.proposal);
  const html = buildDocument(opts, intel);

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Let the layout settle before invoking the print dialog.
    setTimeout(() => win.print(), 400);
  } else {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Delt-Savings-Proposal-${opts.merchantName.replace(/[^a-z0-9]+/gi, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function buildDocument(opts: ProposalPdfOptions, intel: ProcessingIntelligence): string {
  const { statement: s, proposal: p } = opts;
  const merchant = esc(opts.merchantName);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const masthead = `
    <div style="text-align:center;border-bottom:3px solid ${INDIGO};padding-bottom:12px;margin-bottom:16px;">
      <div style="font-size:19px;font-weight:bold;letter-spacing:2px;color:${NAVY};">DELT <span style="color:${INDIGO};">PAY</span></div>
      <div style="font-size:10px;color:${INDIGO};letter-spacing:1px;">deltpay.com &nbsp;·&nbsp; Miami, Florida</div>
      <div style="font-size:15px;font-weight:bold;margin-top:12px;color:${NAVY};letter-spacing:0.5px;">MERCHANT PROCESSING SAVINGS PROPOSAL</div>
      <div style="font-size:11px;color:#3a4160;margin-top:4px;">Prepared for <b>${merchant}</b> &nbsp;·&nbsp; ${today} &nbsp;·&nbsp; Statement period: ${esc(s.statementPeriod)}</div>
    </div>`;

  // ── Page 1: Executive summary ──
  const headline = `
    <div style="display:flex;gap:10px;margin:14px 0;">
      ${[
        ['Current Effective Rate', pct(p.currentRate), '#8b1f2f'],
        ['Delt Effective Rate', pct(p.deltRate), INDIGO],
        ['Annual Savings', usd0(p.annualSavings), '#0d7a4f'],
        ['Cost Reduction', pct(p.savingsPercent, 1), '#0d7a4f'],
      ]
        .map(
          ([label, value, color]) => `
        <div style="flex:1;border:1px solid ${BORDER};border-top:3px solid ${color};background:${TINT};padding:10px 12px;text-align:center;">
          <div style="font-size:8.5px;letter-spacing:0.8px;text-transform:uppercase;color:#5a6180;">${label}</div>
          <div style="font-size:20px;font-weight:bold;color:${color};margin-top:3px;">${value}</div>
        </div>`,
        )
        .join('')}
    </div>`;

  const execSummary = `
    ${h2('1 &nbsp;Executive Summary')}
    ${headline}
    <p>
      ${merchant} processed <b>${usd0(s.totalVolume)}</b> across <b>${s.totalTransactions.toLocaleString()}</b> transactions
      (average ticket ${usd(s.avgTicket)}) with <b>${esc(s.currentProcessor)}</b> in ${esc(s.statementPeriod)}, paying
      <b>${usd(s.currentMonthlyCost)}</b> — an all-in effective rate of <b>${pct(s.effectiveRate)}</b>.
    </p>
    <p>
      Our audit models this statement against published card-network economics. The true wholesale cost floor —
      interchange plus network assessments, identical on every processor — is approximately
      <b>${usd(intel.wholesaleTotal)} (${pct(intel.wholesaleRatePct)})</b>. Everything above that line,
      <b>${usd(intel.currentMarkup)}/mo (${intel.currentMarkupBps.toFixed(0)} bps)</b>, is processor spread,
      downgrade leakage, and junk fees. Diagnosis: <b>${esc(intel.pricingModelDiagnosis)}</b>.
    </p>
    <p>
      Delt reprices this account on transparent interchange-plus at an effective <b>${pct(p.deltRate)}</b>, cutting monthly
      cost from ${usd(p.currentMonthlyCost)} to <b>${usd(p.deltMonthlyCost)}</b> —
      <b>${usd0(p.annualSavings)} per year</b>. Interchange-optimization items in Section 6 offer a further
      <b>${usd0(intel.additionalUpsideLow * 12)}–${usd0(intel.additionalUpsideHigh * 12)}/yr</b> of upside, a stretch
      effective rate of ≈ <b>${pct(intel.stretchEffectiveRatePct)}</b>.
    </p>
    ${
      opts.program
        ? `<div style="border:1px solid ${BORDER};border-left:4px solid ${INDIGO};background:${TINT};padding:8px 10px;margin:8px 0;">
            <b style="color:${NAVY};font-size:10.5px;">Pricing program: ${esc(opts.program.name)}</b>
            <span style="font-size:10px;color:${NAVY};"> — ${esc(opts.program.tagline)}. Quoted as <b>${esc(opts.program.headlineRate)}</b>.</span>
            <div style="font-size:9.5px;color:#3a4160;margin-top:3px;"><b>Cardholder impact:</b> ${esc(opts.program.cardholderImpact)}</div>
            ${opts.program.compliance.length > 1
              ? `<div style="font-size:8.5px;color:#5a6180;margin-top:3px;"><b>Program requirements:</b> ${opts.program.compliance.map(esc).join(' · ')}</div>`
              : ''}
          </div>`
        : ''
    }
    <p style="border:1.5px solid ${INDIGO};border-left:5px solid ${INDIGO};background:${TINT};padding:8px 10px;font-size:10px;color:${NAVY};">
      <b>Three-year value:</b> ${usd0(p.annualSavings * 3)} at the guaranteed rate alone;
      up to ${usd0((p.annualSavings + intel.additionalUpsideHigh * 12) * 3)} with full interchange optimization.
    </p>`;

  // ── Page 1b: Statement audit ──
  const feeRows = s.fees
    .map(f => {
      const auditNote = auditFeeLine(f.label, f.amount, s, intel);
      return `<tr>${td(esc(f.label))}${td(usd(f.amount), 'right', 'font-variant-numeric:tabular-nums;')}${td(pct((f.amount / s.totalVolume) * 100), 'right')}${td(auditNote, 'left', `font-size:9px;color:#3a4160;`)}</tr>`;
    })
    .join('');

  const statementAudit = `
    ${h2('2 &nbsp;Statement Audit — ' + esc(s.currentProcessor))}
    <table style="border-collapse:collapse;width:100%;font-size:10px;">
      <tr>${th('Fee line')}${th('Amount', 'right')}${th('% of volume', 'right')}${th('Audit note')}</tr>
      ${feeRows}
      <tr>
        ${td('<b>Total processing cost</b>', 'left', `background:${TINT};`)}
        ${td(`<b>${usd(s.currentMonthlyCost)}</b>`, 'right', `background:${TINT};`)}
        ${td(`<b>${pct(s.effectiveRate)}</b>`, 'right', `background:${TINT};`)}
        ${td('', 'left', `background:${TINT};`)}
      </tr>
    </table>
    <p style="margin-top:8px;"><b>Pricing model diagnosis — ${esc(intel.pricingModelDiagnosis)}.</b> ${esc(intel.pricingModelDetail)}</p>`;

  // ── Page 2: True cost decomposition ──
  const passThrough = opts.program?.passThrough ?? false;
  const decompRows: Array<[string, string, string]> = [
    ['Modeled interchange (optimized qualification)', usd(intel.interchangeTotal), pct(intel.interchangeRatePct)],
    ['Network assessments & fixed fees', usd(intel.assessmentsTotal), pct((intel.assessmentsTotal / s.totalVolume) * 100)],
    ['<b>Wholesale cost floor (identical on any processor)</b>', `<b>${usd(intel.wholesaleTotal)}</b>`, `<b>${pct(intel.wholesaleRatePct)}</b>`],
    [`Current processor spread + downgrade leakage + junk fees`, usd(intel.currentMarkup), `${intel.currentMarkupBps.toFixed(0)} bps`],
    ['<b>Current all-in cost</b>', `<b>${usd(s.currentMonthlyCost)}</b>`, `<b>${pct(s.effectiveRate)}</b>`],
    ...(passThrough
      ? ([
          [
            `Cardholder-funded acceptance cost under ${esc(opts.program!.name)} (credit-side wholesale + service margin)`,
            'Funded by cardholder', '—',
          ],
          [`<b>Delt merchant-paid cost — ${esc(opts.program!.name)}</b>`, `<b>${usd(p.deltMonthlyCost)}</b>`, `<b>${pct(p.deltRate)}</b>`],
        ] as Array<[string, string, string]>)
      : ([
          [`Delt transparent margin (all-inclusive: PCI, support, dispute tooling)`, usd(intel.deltMarkup), `${intel.deltMarkupBps.toFixed(0)} bps`],
          ['<b>Delt all-in cost</b>', `<b>${usd(p.deltMonthlyCost)}</b>`, `<b>${pct(p.deltRate)}</b>`],
        ] as Array<[string, string, string]>)),
  ];

  const assessRows = intel.assessments
    .map(a => `<tr>${td(esc(a.label))}${td(esc(a.basis), 'left', 'font-size:9px;color:#3a4160;')}${td(usd(a.amount), 'right', 'font-variant-numeric:tabular-nums;')}</tr>`)
    .join('');

  const decomposition = `
    ${h2('3 &nbsp;True Cost Decomposition')}
    <p>
      Interchange is set by the card networks and owed to the card-issuing bank; assessments are owed to the networks.
      Neither is negotiable by any processor. The only controllable numbers are (a) how cleanly transactions qualify
      for the lowest published interchange category and (b) the processor's margin above the floor.
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:10px;">
      <tr>${th('Cost layer')}${th('Monthly', 'right')}${th('Rate', 'right')}</tr>
      ${decompRows.map(r => `<tr>${td(r[0])}${td(r[1], 'right', 'font-variant-numeric:tabular-nums;')}${td(r[2], 'right')}</tr>`).join('')}
    </table>
    <h3 style="font-size:11px;margin:14px 0 6px;color:${NAVY};">Network assessments &amp; per-item fees (modeled)</h3>
    <table style="border-collapse:collapse;width:100%;font-size:10px;">
      <tr>${th('Assessment')}${th('Basis')}${th('Monthly', 'right')}</tr>
      ${assessRows}
      <tr>${td('<b>Total</b>', 'left', `background:${TINT};`)}${td('', 'left', `background:${TINT};`)}${td(`<b>${usd(intel.assessmentsTotal)}</b>`, 'right', `background:${TINT};`)}</tr>
    </table>`;

  // ── Page 3: Card mix & interchange application ──
  const mixRows = intel.cardMix
    .map(
      m => `<tr>
        ${td(`${m.network} — ${esc(m.category)}`)}
        ${td(pct(m.sharePct, 1), 'right')}
        ${td(usd0(m.volume), 'right', 'font-variant-numeric:tabular-nums;')}
        ${td(`${pct(m.ratePct)} + ${usd(m.perItem)}`, 'right')}
        ${td(usd(m.cost), 'right', 'font-variant-numeric:tabular-nums;')}
        ${td(esc(m.qualification), 'left', 'font-size:8.5px;color:#3a4160;')}
      </tr>`,
    )
    .join('');

  const cardMix = `
    ${h2('4 &nbsp;Estimated Card Mix at Published Interchange')}
    <p>
      Modeled from this statement's volume, count, and ${usd(s.avgTicket)} average ticket against a card-present retail
      baseline. Regulated (Durbin) debit is federally capped and identical everywhere — which is exactly why bundled
      pricing overcharges debit-heavy merchants.
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:9.5px;">
      <tr>${th('Interchange program')}${th('Share', 'right')}${th('Volume', 'right')}${th('Published rate', 'right')}${th('Cost', 'right')}${th('Qualification requirements')}</tr>
      ${mixRows}
      <tr>
        ${td('<b>Modeled interchange total</b>', 'left', `background:${TINT};`)}
        ${td('100%', 'right', `background:${TINT};`)}
        ${td(`<b>${usd0(s.totalVolume)}</b>`, 'right', `background:${TINT};`)}
        ${td('', 'right', `background:${TINT};`)}
        ${td(`<b>${usd(intel.interchangeTotal)}</b>`, 'right', `background:${TINT};`)}
        ${td('', 'left', `background:${TINT};`)}
      </tr>
    </table>
    ${note('Rates reflect published US card-present schedules (Visa CPS, Mastercard Merit III, Discover PSL, Amex OptBlue), most recent network release. Amex OptBlue tier is set by average Amex ticket.')}`;

  // ── Page 3b: Downgrades & compliance ──
  const downgradeRows = intel.downgradeFindings
    .map(
      d => `<tr>
        ${td(`<b>${esc(d.program)}</b>`)}
        ${td(esc(d.trigger), 'left', 'font-size:9px;')}
        ${td(esc(d.penalty), 'left', 'font-size:9px;color:#8b1f2f;')}
        ${td(esc(d.remediation), 'left', 'font-size:9px;')}
      </tr>`,
    )
    .join('');

  const cb = intel.chargebacks;
  const cbColor = cb.status === 'healthy' ? '#0d7a4f' : cb.status === 'watch' ? '#9a6b00' : '#8b1f2f';

  const downgrades = `
    ${h2('5 &nbsp;Downgrade Exposure &amp; Card-Brand Compliance')}
    <p>
      Every transaction starts at the best rate it could qualify for and <i>downgrades</i> when settlement timing, data
      quality, or authorization handling breaks a network rule. On tiered statements those penalties surface as
      "non-qualified" surcharges. We estimate <b>${usd(intel.downgradeLeakLow)}–${usd(intel.downgradeLeakHigh)}/mo</b>
      of this statement's cost is downgrade and surcharge leakage recoverable through clean qualification.
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:9.5px;">
      <tr>${th('Downgrade path')}${th('Trigger')}${th('Penalty')}${th('Delt remediation')}</tr>
      ${downgradeRows}
    </table>
    <h3 style="font-size:11px;margin:14px 0 6px;color:${NAVY};">Dispute &amp; monitoring-program posture</h3>
    <p style="border:1px solid ${BORDER};border-left:4px solid ${cbColor};background:${TINT};padding:8px 10px;">
      <b style="color:${cbColor};text-transform:uppercase;font-size:9px;letter-spacing:0.8px;">${cb.status}</b> —
      ${cb.count} chargeback${cb.count === 1 ? '' : 's'} on ${s.totalTransactions.toLocaleString()} transactions
      (<b>${pct(cb.ratioPct)}</b> vs Visa VDMP ${pct(cb.vdmpThresholdPct, 1)} / Mastercard ECP ${pct(cb.ecpThresholdPct, 1)}).
      ${esc(cb.note)}
    </p>`;

  // ── Page 4: Optimization roadmap & projection ──
  const oppRows = intel.opportunities
    .map(
      o => `<tr>
        ${td(`<b>${esc(o.title)}</b><br><span style="font-size:8.5px;color:#3a4160;">${esc(o.rule)}</span>`)}
        ${td(esc(o.evidence), 'left', 'font-size:9px;')}
        ${td(esc(o.action), 'left', 'font-size:9px;')}
        ${td(
          o.estLowMonthly === o.estHighMonthly ? usd(o.estLowMonthly) : `${usd(o.estLowMonthly)}–${usd(o.estHighMonthly)}`,
          'right',
          'font-variant-numeric:tabular-nums;white-space:nowrap;',
        )}
        ${td(
          o.includedInPricing
            ? `<span style="color:${INDIGO};font-weight:bold;">In Delt rate</span>`
            : `<span style="color:#0d7a4f;font-weight:bold;">Additional</span>`,
          'left',
          'font-size:8.5px;white-space:nowrap;',
        )}
      </tr>`,
    )
    .join('');

  const projection = `
    ${h2('6 &nbsp;Optimization Roadmap')}
    <table style="border-collapse:collapse;width:100%;font-size:9.5px;">
      <tr>${th('Initiative')}${th('Evidence on this statement')}${th('Action')}${th('Est. monthly value', 'right')}${th('Status')}</tr>
      ${oppRows}
    </table>
    ${h2('7 &nbsp;Savings Projection')}
    <table style="border-collapse:collapse;width:100%;font-size:10px;">
      <tr>${th('')}${th('Monthly', 'right')}${th('Year 1', 'right')}${th('3 Years', 'right')}</tr>
      <tr>${td('Guaranteed pricing savings (vs current)')}${td(usd(p.annualSavings / 12), 'right')}${td(usd0(p.annualSavings), 'right')}${td(usd0(p.annualSavings * 3), 'right')}</tr>
      <tr>${td('Additional interchange-optimization upside (range midpoint)')}${td(usd((intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2), 'right')}${td(usd0(((intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2) * 12), 'right')}${td(usd0(((intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2) * 36), 'right')}</tr>
      <tr>
        ${td('<b>Total potential</b>', 'left', `background:${TINT};`)}
        ${td(`<b>${usd(p.annualSavings / 12 + (intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2)}</b>`, 'right', `background:${TINT};`)}
        ${td(`<b>${usd0(p.annualSavings + ((intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2) * 12)}</b>`, 'right', `background:${TINT};`)}
        ${td(`<b>${usd0((p.annualSavings + ((intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2) * 12) * 3)}</b>`, 'right', `background:${TINT};`)}
      </tr>
    </table>
    <div style="margin-top:12px;border:1.5px solid ${INDIGO};border-left:5px solid ${INDIGO};background:${TINT};padding:10px 12px;">
      <b style="color:${NAVY};">The Delt commitment.</b>
      <span style="font-size:10px;color:${NAVY};">
        ${passThrough
          ? `Under the ${esc(opts.program!.name)} program, acceptance cost is funded at the point of sale — the merchant is quoted ${esc(opts.program!.headlineRate)}.`
          : `Published interchange and assessments passed through at cost. One transparent margin line
        (${intel.deltMarkupBps.toFixed(0)} bps all-in equivalent on this profile).`} No PCI, statement, batch, or annual fees.
        Interchange-optimization engineering — daily auto-batch, Level 2/3 enrichment, least-cost debit routing,
        dispute alerts with Visa CE 3.0 workflows — included, with every recovered basis point flowing to ${merchant}.
      </span>
    </div>`;

  const assumptions = `
    ${h2('8 &nbsp;Methodology &amp; Assumptions')}
    <ol style="font-size:9px;color:#3a4160;padding-left:16px;margin:6px 0;">
      ${intel.assumptions.map(a => `<li style="margin-bottom:3px;">${esc(a)}</li>`).join('')}
    </ol>
    <p style="font-size:8.5px;color:#5a6180;margin-top:10px;">
      This proposal is an estimate prepared from a single monthly statement (${esc(opts.sourceFileName)}) and does not
      constitute a rate guarantee until a signed merchant agreement is executed. Interchange categories and assessment
      rates are set by the card networks and adjust semi-annually; interchange-plus pricing passes those adjustments
      through at cost in both directions.
    </p>
    <p style="font-size:9px;color:${INDIGO};margin-top:14px;letter-spacing:0.5px;">CONFIDENTIAL &nbsp;·&nbsp; Delt Pay LLC &nbsp;·&nbsp; deltpay.com</p>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Delt Savings Proposal — ${merchant}</title>
<style>
  @page { size: letter; margin: 0.55in 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 10.5px; color: #1a2138; line-height: 1.45; margin: 0; }
  p { margin: 6px 0; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  h2 { page-break-after: avoid; }
  .page-break { page-break-before: always; }
  @media screen {
    body { background: #e8e9f2; padding: 24px 0; }
    .sheet { background: #fff; max-width: 8.5in; margin: 0 auto 16px; padding: 0.55in 0.6in; box-shadow: 0 2px 12px rgba(18,30,62,0.15); }
  }
  @media print {
    .sheet { padding: 0; }
  }
</style>
</head>
<body>
<div class="sheet">
${masthead}
${execSummary}
${statementAudit}
<div class="page-break"></div>
${decomposition}
<div class="page-break"></div>
${cardMix}
${downgrades}
<div class="page-break"></div>
${projection}
${assumptions}
</div>
</body>
</html>`;
}
