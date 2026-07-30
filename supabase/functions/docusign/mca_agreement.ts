/**
 * Delt Pay MCA agreement — HTML renderer for DocuSign envelopes.
 *
 * Reproduces the "Purchase and Sale of Future Receivables Agreement"
 * verbatim, with Schedule A populated from the CRM deal terms and
 * white-ink anchor strings (/mer_sig/ etc.) that DocuSign resolves
 * into signature/date/name tabs. DocuSign converts the HTML document
 * to PDF at envelope-creation time.
 *
 * Anchor strings place a tab at every occurrence, so the merchant
 * signature/date anchors repeated on Exhibit B (ACH authorization)
 * become a second live signing block on the same recipient.
 */

export interface AgreementTerms {
  merchantLegalName: string;
  dbaName?: string;
  stateOfFormation?: string;
  ein?: string;
  businessAddress?: string;
  purchasePrice: number;        // advance amount
  purchasedAmount: number;      // total receivables
  factorRate: number;
  remittancePct?: number;       // estimated remittance percentage
  dailyRemittance?: number;     // estimated ACH amount per remittance period
  remittanceFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  remittanceMethod?: 'ACH' | 'Split Funding' | 'Lockbox';
  effectiveDate: string;        // YYYY-MM-DD
  principalState?: string;
  hasGuarantor: boolean;
  guarantorName?: string;
  noticeEmail?: string;         // defaults to the merchant signer's email
  // Exhibit B — designated bank account (when absent, the exhibit renders
  // /mer_bank/-style anchors that index.ts turns into required DocuSign
  // text tabs, so the merchant must fill them before signing)
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
}

const usd = (n: number | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const esc = (s: string | undefined) =>
  (s ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Anchor marker rendered in white so it's invisible on the final PDF. */
const anchor = (tag: string) => `<span style="color:#ffffff;font-size:7px;">${tag}</span>`;

function checkbox(method: AgreementTerms['remittanceMethod'], label: string): string {
  return `[${method === label ? 'X' : '&nbsp;&nbsp;'}] ${label}`;
}

/** Bank field: printed value, or an anchor that becomes a required DocuSign text tab. */
const bankField = (v: string | undefined, tag: string, hint = '') =>
  v ? `<b>${esc(v)}</b>` : `${anchor(tag)}${'_'.repeat(28)}${hint}`;

export function renderAgreementHtml(t: AgreementTerms): string {
  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Estimated collection term (Exhibit C) and the Outside Collection Date
  // backstop (Section 2.4): the later of 18 months after the Effective Date
  // and twice the estimated collection term implied by Schedule A.
  const estTermMonths = (() => {
    if (!t.dailyRemittance || t.dailyRemittance <= 0) return null;
    const periods = t.purchasedAmount / t.dailyRemittance;
    const perMonth = t.remittanceFrequency === 'Weekly' ? 4.33 : t.remittanceFrequency === 'Monthly' ? 1 : 21;
    return periods / perMonth;
  })();
  const estTerm = estTermMonths == null
    ? null
    : `Approximately ${Math.max(Math.round(estTermMonths * 10) / 10, 0.1)} months`;
  const outsideDate = (() => {
    const dt = new Date(t.effectiveDate + 'T12:00:00');
    if (isNaN(dt.getTime())) return null;
    dt.setMonth(dt.getMonth() + Math.max(18, estTermMonths ? Math.ceil(estTermMonths * 2) : 0));
    return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })();

  const scheduleRows: [string, string][] = [
    ['Merchant Legal Name', esc(t.merchantLegalName)],
    ['DBA Name', esc(t.dbaName)],
    ['State of Formation / Incorporation', esc(t.stateOfFormation)],
    ['Federal EIN', esc(t.ein)],
    ['Principal Business Address', esc(t.businessAddress)],
    ['Purchase Price (Advance Amount)', usd(t.purchasePrice)],
    ['Purchased Amount (Total Receivables)', usd(t.purchasedAmount)],
    ['Factor Rate', t.factorRate.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.0')],
    ['Estimated Remittance Percentage', t.remittancePct != null ? `${t.remittancePct}%` : '—'],
    [`Estimated ${t.remittanceFrequency ?? 'Daily'} ACH Remittance`, usd(t.dailyRemittance)],
    ['Remittance Method', `${checkbox(t.remittanceMethod, 'ACH')} &nbsp; ${checkbox(t.remittanceMethod, 'Split Funding')} &nbsp; ${checkbox(t.remittanceMethod, 'Lockbox')}`],
    ['Effective Date', esc(fmtDate(t.effectiveDate))],
    ['Principal State of Operations', esc(t.principalState)],
    ['Merchant Notice Email (Section 10.8)', esc(t.noticeEmail)],
    ['Outside Collection Date (Section 2.4)', esc(outsideDate ?? undefined)],
  ];

  const scheduleTable = scheduleRows
    .map(([k, v]) => `<tr><td style="border:1px solid #c7c9e8;padding:6px 10px;width:45%;font-weight:bold;background:#f4f4ff;color:#121E3E;">${k}</td><td style="border:1px solid #c7c9e8;padding:6px 10px;">${v}</td></tr>`)
    .join('\n');

  const h = (text: string) =>
    `<h2 style="font-size:13px;margin:22px 0 8px;color:#121E3E;border-bottom:2px solid #4945FF;padding-bottom:3px;letter-spacing:0.3px;">${text}</h2>`;
  const p = (text: string) => `<p style="margin:0 0 10px;">${text}</p>`;

  const feeRows: [string, string][] = [
    ['Returned / NSF ACH Item', '$35.00 per returned item'],
    ['Unauthorized Bank Account Change', '$250.00'],
    ['Blocked Account / Stop-Payment / Frozen Account', '$2,500.00'],
    ['UCC Filing and Administration Fee', '$195.00'],
    ['Default Fee (upon any Event of Default)', '$2,500.00'],
  ];
  const feeTable = feeRows
    .map(([k, v]) => `<tr><td style="border:1px solid #c7c9e8;padding:5px 10px;width:60%;background:#f4f4ff;color:#121E3E;font-weight:bold;">${k}</td><td style="border:1px solid #c7c9e8;padding:5px 10px;">${v}</td></tr>`)
    .join('\n');

  const bankRows: [string, string][] = [
    ['Bank Name', bankField(t.bankName, '/mer_bank/')],
    ['ABA Routing Number', bankField(t.bankRoutingNumber, '/mer_routing/')],
    ['Account Number', bankField(t.bankAccountNumber, '/mer_acct/')],
    ['Account Type', bankField(t.bankAccountType, '/mer_accttype/', ' &nbsp;<span style="color:#666;">(Business Checking / Savings)</span>')],
    ['Account Holder (must match Merchant Legal Name)', esc(t.merchantLegalName)],
  ];
  const bankTable = bankRows
    .map(([k, v]) => `<tr><td style="border:1px solid #c7c9e8;padding:6px 10px;width:45%;font-weight:bold;background:#f4f4ff;color:#121E3E;">${k}</td><td style="border:1px solid #c7c9e8;padding:6px 10px;">${v}</td></tr>`)
    .join('\n');

  const disclosureRows: [string, string][] = [
    ['Funding Provided (Purchase Price)', usd(t.purchasePrice)],
    ['Total Amount to be Delivered (Purchased Amount)', usd(t.purchasedAmount)],
    ['Dollar Cost of Financing', usd(t.purchasedAmount - t.purchasePrice)],
    [`Estimated ${t.remittanceFrequency ?? 'Daily'} Payment`, usd(t.dailyRemittance)],
    ['Estimated Term', estTerm ?? '—'],
    ['Prepayment', 'Merchant may deliver the uncollected Purchased Amount early at any time. Early delivery does not reduce the Purchased Amount unless a separate written payoff addendum provides otherwise.'],
  ];
  const disclosureTable = disclosureRows
    .map(([k, v]) => `<tr><td style="border:1px solid #c7c9e8;padding:6px 10px;width:45%;font-weight:bold;background:#f4f4ff;color:#121E3E;">${k}</td><td style="border:1px solid #c7c9e8;padding:6px 10px;">${v}</td></tr>`)
    .join('\n');

  // Always rendered as its own signature block (matching the source PDF):
  // "execute below only if a Guarantor is required by Schedule A". The
  // /gua_*/ anchors only become live signature tabs when a guarantor
  // recipient is on the envelope; otherwise they stay inert blank lines.
  const guarantorBlock = `
    <h3 style="font-size:12px;margin:26px 0 6px;color:#121E3E;">GUARANTOR
      <span style="font-weight:normal;font-size:10px;color:#666;">(execute below only if a Guarantor is required by Schedule A)</span></h3>
    <p style="margin:0 0 12px;">Guarantor Full Legal Name: ${t.hasGuarantor && t.guarantorName ? `<b>${esc(t.guarantorName)}</b>` : '___________________________________'}</p>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <tr>
        <td style="width:55%;padding:8px 0;">Signature: ${anchor('/gua_sig/')}________________________</td>
        <td style="padding:8px 0;">Date: ${anchor('/gua_date/')}______________</td>
      </tr>
    </table>
    <p style="margin:8px 0 0;">Address: ${anchor('/gua_addr/')}_____________________________________________________________________</p>
    <p style="margin:6px 0 0;">By signing above, Guarantor agrees to be bound by the Absolute and Unconditional Guarantee of Payment and Performance in Article 7 and, as a Principal, by the Successor Entity covenants in Section 2.6.</p>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#1a2138;line-height:1.45;margin:36px 48px;">

<div style="text-align:center;margin-bottom:18px;border-bottom:3px solid #4945FF;padding-bottom:14px;">
  <div style="font-size:19px;font-weight:bold;letter-spacing:2px;color:#121E3E;">DELT <span style="color:#4945FF;">PAY</span> LLC</div>
  <div style="font-size:10px;color:#4945FF;letter-spacing:1px;">deltpay.com &nbsp;·&nbsp; Miami, Florida</div>
  <div style="font-size:14px;font-weight:bold;margin-top:14px;color:#121E3E;">PURCHASE AND SALE OF FUTURE RECEIVABLES AGREEMENT</div>
  <div style="font-size:10px;color:#666;">Merchant Cash Advance &nbsp;·&nbsp; Receivables Purchase Agreement</div>
</div>

${h('SCHEDULE A — KEY DEAL TERMS')}
<table style="width:100%;border-collapse:collapse;font-size:11px;">
<tr><td style="border:1px solid #121E3E;padding:6px 10px;background:#121E3E;color:#ffffff;font-weight:bold;letter-spacing:0.5px;">FIELD</td><td style="border:1px solid #121E3E;padding:6px 10px;background:#121E3E;color:#ffffff;font-weight:bold;letter-spacing:0.5px;">VALUE</td></tr>
${scheduleTable}
</table>

${p(`This Agreement is entered into as of the Effective Date set forth in Schedule A above, by and between <b>Delt Pay LLC</b>, a Florida limited liability company ("Company" or "Purchaser"), and the Merchant identified in Schedule A ("Merchant"). This Agreement incorporates all terms set forth in Schedule A and Exhibits B and C attached hereto, together with the General Terms and Conditions below.`)}

${h('RECITALS')}
${p(`A. Merchant operates a business that generates future receivables through the ordinary course of commerce, including but not limited to credit card settlements, ACH transfers, electronic payments, and other business receipts.`)}
${p(`B. Purchaser desires to purchase, and Merchant desires to sell, a specified portion of Merchant's future receivables on the terms and conditions set forth herein.`)}
${p(`C. The parties intend and agree that this transaction is structured and documented as a purchase and sale of future receivables; provided, however, that Merchant's obligation to deliver the full Purchased Amount to Purchaser is absolute and unconditional as set forth in Section 2.4, and this Agreement is made with full recourse to Merchant.`)}
${p(`D. The Purchase Price paid by Purchaser represents fair consideration for the Purchased Amount of future receivables, reflecting a commercially reasonable discount for (i) the time value of money, (ii) collection and performance risk, (iii) the speculative nature of future business performance, and (iv) Purchaser's cost of capital.`)}

${h('ARTICLE 1 — DEFINITIONS')}
${p(`1.1 <b>"Agreement"</b> means this Purchase and Sale of Future Receivables Agreement, including Schedule A and all exhibits attached hereto, as amended from time to time by mutual written agreement.`)}
${p(`1.2 <b>"Purchased Amount"</b> means the total dollar amount of future receivables purchased by Purchaser from Merchant, as specified in Schedule A.`)}
${p(`1.3 <b>"Purchase Price"</b> means the amount paid by Purchaser to Merchant in exchange for the Purchased Amount, as specified in Schedule A.`)}
${p(`1.4 <b>"Factor Rate"</b> means the multiplier applied to the Purchase Price to determine the Purchased Amount, as specified in Schedule A.`)}
${p(`1.5 <b>"Remittance"</b> means each periodic payment made by Merchant to Purchaser representing a portion of Merchant's collected receivables, in the amount and at the frequency specified in Schedule A.`)}
${p(`1.6 <b>"Remittance Percentage"</b> means the agreed-upon percentage of Merchant's daily receivables to be remitted to Purchaser until the Purchased Amount is fully collected, as specified in Schedule A.`)}
${p(`1.7 <b>"Receivables"</b> means all amounts payable to Merchant from any source in connection with the operation of Merchant's business, including credit card and debit card settlements, ACH receipts, cash equivalents, and electronic payments.`)}
${p(`1.8 <b>"Specific Receivables"</b> means the specific portion of future Receivables sold by Merchant to Purchaser pursuant to this Agreement, equal in aggregate to the Purchased Amount.`)}
${p(`1.9 <b>"Business Day"</b> means any day that is not a Saturday, Sunday, or federally recognized holiday in the United States.`)}
${p(`1.10 <b>"Processor"</b> means any payment processor, acquiring bank, gateway, or similar entity through which Merchant's Receivables are processed or settled.`)}
${p(`1.11 <b>"Event of Default"</b> has the meaning set forth in Article 8.`)}
${p(`1.12 <b>"Guarantor"</b> means any individual or entity executing a guarantee in connection with this Agreement.`)}
${p(`1.13 <b>"Reconciliation"</b> has the meaning set forth in Section 3.4.`)}
${p(`1.14 <b>"Stacking"</b> means entering into any additional merchant cash advance, revenue-based financing, or similar transaction with any third party while amounts remain outstanding under this Agreement.`)}
${p(`1.15 <b>"Obligations"</b> means all obligations of Merchant under this Agreement, including delivery of the full Purchased Amount, payment of all fees set forth in Section 8.4, costs of enforcement, and performance of all covenants.`)}
${p(`1.16 <b>"Principal"</b> means each owner, member, shareholder, officer, or manager of Merchant holding twenty percent (20%) or more of the equity of Merchant or otherwise exercising control over Merchant, including each Guarantor.`)}
${p(`1.17 <b>"Successor Entity"</b> means any corporation, limited liability company, or other entity, other than Merchant, that is owned or controlled by, or under common ownership or control with, Merchant or any Principal and that conducts a business substantially similar to Merchant's business, serves Merchant's customers, or receives revenue derived from Merchant's business operations.`)}
${p(`1.18 <b>"Outside Collection Date"</b> means the date set forth in Schedule A, being the later of (i) eighteen (18) months after the Effective Date and (ii) twice the estimated collection term implied by the estimated Remittance amount in Schedule A.`)}

${h('ARTICLE 2 — PURCHASE AND SALE OF RECEIVABLES')}
${p(`2.1 <b>Sale of Receivables.</b> Subject to the terms and conditions of this Agreement, Merchant hereby sells, assigns, transfers, and conveys to Purchaser, and Purchaser hereby purchases from Merchant, the Specific Receivables. Title to the Specific Receivables shall vest in Purchaser upon execution of this Agreement and payment of the Purchase Price. The sale of the Specific Receivables is absolute, irrevocable, and unconditional.`)}
${p(`2.2 <b>Purchase Price.</b> In consideration of the sale of the Specific Receivables, Purchaser shall pay to Merchant the Purchase Price set forth in Schedule A. Disbursement shall be made by ACH or wire to Merchant's designated bank account within one (1) to three (3) Business Days following execution and satisfaction of all conditions precedent.`)}
${p(`2.3 <b>Characterization.</b> The parties document this transaction as a purchase and sale of receivables. The Purchased Amount is not stated as a principal amount subject to interest, the factor rate is not stated as an interest rate or APR, and there is no fixed maturity date; Remittances are calculated by reference to Merchant's Receivables as set forth in Article 3.`)}
${p(`2.4 <b>Full Recourse; Obligations Absolute and Unconditional.</b> MERCHANT'S OBLIGATION TO DELIVER THE FULL PURCHASED AMOUNT TO PURCHASER IS ABSOLUTE, UNCONDITIONAL, AND IRREVOCABLE, AND IS NOT CONTINGENT ON THE CONTINUED OPERATION, PROFITABILITY, OR SUCCESS OF MERCHANT'S BUSINESS. No decline in revenue, loss of customers or contracts, market or economic conditions, seasonality, act of God, casualty, or cessation, suspension, sale, or transfer of Merchant's business shall reduce, delay, or excuse Merchant's Obligations. This Agreement is made with <b>FULL RECOURSE</b> to Merchant: if the Specific Receivables are not generated or collected for any reason whatsoever, Merchant shall remain liable for, and shall pay to Purchaser on demand, the entire uncollected balance of the Purchased Amount, together with all fees and costs provided herein, and Purchaser may proceed against Merchant and any and all of Merchant's assets. Merchant's Obligations survive the cessation of Merchant's business, any sale or transfer of Merchant's assets, and, to the fullest extent permitted by law, any bankruptcy or insolvency proceeding. Without limiting the foregoing, the entire uncollected balance of the Purchased Amount, together with all fees and costs, shall become immediately due and payable upon the earliest of: (i) the occurrence of any Event of Default; (ii) Merchant ceasing to generate or deposit Receivables into the designated account(s) for fifteen (15) or more consecutive days; or (iii) the Outside Collection Date.`)}
${p(`2.5 <b>No Right of Setoff.</b> Merchant expressly waives any right of setoff, defense, counterclaim, or recoupment against Purchaser's right to collect the Specific Receivables, except as expressly provided in Section 3.4.`)}
${p(`2.6 <b>Successor Entities.</b> Merchant's Obligations extend to and are binding upon Merchant's successors and assigns and upon any Successor Entity. If Merchant or any Principal conducts Merchant's business, or routes revenue derived from Merchant's business or customers, through a Successor Entity while any Obligations remain outstanding, then: (a) such Successor Entity shall be deemed jointly and severally liable for the Obligations; (b) the receivables of such Successor Entity shall be deemed Receivables hereunder and subject to Purchaser's security interest under Article 6; and (c) such conduct shall constitute an Event of Default. Merchant and each Principal covenant not to organize, participate in, or transfer business or revenue to any Successor Entity for the purpose or with the effect of impairing Purchaser's collection of the Obligations.`)}

${h('ARTICLE 3 — REMITTANCE AND COLLECTION')}
${p(`3.1 <b>Remittance Method.</b> The parties shall collect the Specific Receivables through the method specified in Schedule A, which may include: (a) ACH debit from Merchant's designated bank account; (b) split funding through Merchant's Processor; or (c) lockbox or other arrangement as agreed. Merchant authorizes Purchaser to initiate ACH debits from Merchant's designated bank account in accordance with the remittance schedule set forth in Schedule A.`)}
${p(`3.2 <b>Estimated Remittance Amount.</b> The estimated daily, weekly, or monthly remittance amount set forth in Schedule A is an estimate only, calculated by applying the Remittance Percentage to Merchant's estimated average Receivables for the applicable period. Adjustment of the estimated remittance amount, if any, shall not reduce Merchant's obligation to deliver the full Purchased Amount.`)}
${p(`3.3 <b>ACH Authorization.</b> Merchant hereby authorizes Purchaser and its designated payment processor or ACH originator to initiate debit entries to Merchant's designated bank account(s) identified in Exhibit B for the purpose of collecting Remittances and any fees due hereunder. This authorization is irrevocable until the Obligations are paid and performed in full. Merchant agrees to maintain sufficient funds in the designated account(s) to cover scheduled Remittances.`)}
${p(`3.4 <b>Reconciliation.</b> Either party may request a reconciliation of Remittances to actual Receivables at any time, but no more frequently than once per calendar month unless an Event of Default has occurred. Upon request, Merchant shall provide bank statements, Processor statements, or other documentation within five (5) Business Days. If Remittances have exceeded the Remittance Percentage of actual collected Receivables, Purchaser shall credit the excess against future Remittances or refund within ten (10) Business Days. If Remittances have been less than the applicable percentage, Merchant shall pay the shortfall within five (5) Business Days. Reconciliation adjusts the pacing of Remittances only and does not reduce the Purchased Amount.`)}
${p(`3.5 <b>Remittance Adjustment.</b> If Merchant experiences a verifiable decline in Receivables exceeding thirty percent (30%) for thirty (30) or more consecutive days, Merchant may request an adjustment to the estimated Remittance amount with supporting documentation, which Purchaser may grant or deny in its sole and absolute discretion. Any adjustment applies to the estimated ACH debit only; Merchant's obligation to deliver the full Purchased Amount, and the Remittance Percentage, remain unchanged.`)}
${p(`3.6 <b>Failed ACH Debits.</b> In the event an ACH debit is returned for non-sufficient funds or any other reason, Purchaser may re-initiate the debit up to two (2) additional times within five (5) Business Days, and each returned item shall incur the fee set forth in Section 8.4. Three (3) or more returned ACH debits within any thirty (30) day period shall constitute an Event of Default.`)}
${p(`3.7 <b>Early Delivery.</b> Merchant may deliver the entire uncollected balance of the Purchased Amount to Purchaser at any time. Early delivery does not entitle Merchant to any rebate, discount, or reduction of the Purchased Amount unless a separate written payoff addendum executed by Purchaser provides otherwise.`)}

${h('ARTICLE 4 — NATURE OF TRANSACTION; SAVINGS PROVISIONS')}
${p(`4.1 <b>Intent of the Parties.</b> The parties intend this Agreement to be treated as a purchase and sale of receivables for all purposes, including tax, accounting, and legal characterization, and each party waives any claim to the contrary to the fullest extent permitted by law.`)}
${p(`4.2 <b>Guarantee of Payment.</b> The full and punctual payment and performance of the Obligations is unconditionally guaranteed by the Guarantor, if any, pursuant to the Absolute and Unconditional Guarantee of Payment and Performance set forth in Article 7.`)}
${p(`4.3 <b>Usury Savings.</b> If, notwithstanding the intent of the parties, any court or tribunal of competent jurisdiction determines that this transaction constitutes a loan or extension of credit, then: (a) the difference between the Purchased Amount and the Purchase Price shall be deemed compensation for the use of funds; (b) in no event shall any amount deemed to be interest exceed the maximum rate permitted by applicable law; (c) any amount collected in excess of the maximum lawful rate shall automatically be applied to reduce the outstanding balance or, if no balance remains, refunded to Merchant; and (d) this Agreement shall automatically be reformed to the minimum extent necessary to comply with applicable law while preserving, to the greatest extent possible, the economic terms and the full-recourse protections herein. The foregoing is a savings provision only and shall not constitute an admission that this transaction is a loan.`)}

${h('ARTICLE 5 — MERCHANT REPRESENTATIONS, WARRANTIES, AND COVENANTS')}
${p(`5.1 <b>Representations and Warranties.</b> Merchant represents and warrants on a continuing basis that: (a) Merchant is duly organized and in good standing; (b) Merchant has full authority to enter this Agreement; (c) this Agreement is a valid, binding, enforceable obligation; (d) execution does not violate any law or agreement; (e) all information provided is true and complete in all material respects; (f) Merchant has no undisclosed outstanding MCAs or revenue-based financing except as disclosed in Schedule A; (g) the designated bank account(s) identified in Exhibit B are Merchant's primary operating account(s); (h) Merchant is not contemplating bankruptcy or cessation of operations; (i) there is no pending or threatened litigation, judgment, garnishment, or tax lien against Merchant or any Guarantor except as disclosed to Purchaser in writing; and (j) all federal, state, and local taxes of Merchant are current or subject to an approved payment plan disclosed to Purchaser in writing.`)}
${p(`5.2 <b>Affirmative Covenants.</b> During the term, Merchant shall: (a) deposit all Receivables into the designated bank account(s) and not divert Receivables without prior written consent; (b) maintain designated account(s) in good standing and provide ten (10) Business Days' notice before closing or changing such account(s); (c) continue to operate its business in the ordinary course; (d) promptly notify Purchaser of any material change in operations, ownership, or financial condition; (e) provide bank and Processor statements within five (5) Business Days of request; (f) notify Purchaser immediately upon any garnishment or levy against Merchant's accounts; and (g) comply with all applicable laws including Nacha Operating Rules.`)}
${p(`5.3 <b>Negative Covenants; Stacking Restriction.</b> Without Purchaser's prior written consent, Merchant shall not: (a) enter into any Stacking arrangement; (b) sell, assign, or encumber any Receivables other than pursuant to this Agreement; (c) change Merchant's primary Processor(s) without thirty (30) days' prior written notice; (d) permit any lien to attach to the Specific Receivables; (e) make any material change to Merchant's business or ownership that would impair Receivable generation; (f) use the Purchase Price for purposes other than legitimate business operations; or (g) conduct Merchant's business, or route revenue derived from Merchant's business or customers, through any Successor Entity.`)}
${p(`5.4 <b>Nacha Compliance.</b> Merchant acknowledges that ACH debits under this Agreement are governed by the Nacha Operating Rules. Merchant agrees not to dispute, return, or cause the return of any ACH debit initiated in accordance with this Agreement as unauthorized.`)}

${h('ARTICLE 6 — SECURITY INTEREST, UCC FILING, AND POWER OF ATTORNEY')}
${p(`6.1 <b>Grant of Security Interest.</b> To secure the full payment and performance of the Obligations, Merchant hereby grants to Purchaser a first-priority security interest in the following Collateral: all of Merchant's accounts, accounts receivable, payment intangibles, chattel paper, deposit accounts, instruments, and proceeds thereof, whether now existing or hereafter arising.`)}
${p(`6.2 <b>Enforcement.</b> Purchaser may enforce the security interest upon the occurrence of any Event of Default, in addition to all other rights and remedies available under the Uniform Commercial Code, at law, or in equity.`)}
${p(`6.3 <b>UCC Financing Statement.</b> Merchant authorizes Purchaser to file UCC-1 financing statements in any applicable jurisdiction. Purchaser shall file a UCC-3 termination statement within fifteen (15) Business Days following full payment and performance of the Obligations, provided no Event of Default has occurred.`)}
${p(`6.4 <b>Processor Notification.</b> Merchant authorizes Purchaser to notify Merchant's Processor(s) of this Agreement and to direct Processor(s) to remit the Remittance Percentage of settled funds directly to Purchaser through split funding or other arrangement.`)}
${p(`6.5 <b>Power of Attorney.</b> Merchant irrevocably appoints Purchaser as Merchant's attorney-in-fact, which appointment is coupled with an interest, effective upon the occurrence of any Event of Default, to: (a) endorse Merchant's name on any check, draft, or other instrument representing Receivables; (b) notify account debtors, Processors, and depository banks of Purchaser's interest and direct payment to Purchaser; (c) demand, collect, compromise, and settle any Receivables; (d) execute and file any document, including UCC financing statements and Processor redirection instructions, necessary to perfect or enforce Purchaser's rights; and (e) do all other acts reasonably necessary to collect the Obligations. This power of attorney survives until the Obligations are paid and performed in full.`)}

${h('ARTICLE 7 — ABSOLUTE AND UNCONDITIONAL GUARANTEE OF PAYMENT AND PERFORMANCE')}
${p(`7.1 <b>Guarantee of Payment.</b> The Guarantor, if any, hereby absolutely, unconditionally, and irrevocably guarantees to Purchaser the full and punctual payment and performance of all Obligations, including delivery of the entire Purchased Amount, all fees under Section 8.4, and all costs of enforcement. This is a guarantee of payment and performance, not of collection: upon any failure of Merchant to pay or perform, Purchaser may proceed directly against Guarantor without first proceeding against Merchant, any Collateral, or any other person.`)}
${p(`7.2 <b>Waivers.</b> Guarantor waives: presentment, demand, protest, notice of acceptance, notice of default, notice of dishonor, and all other notices; any right to require Purchaser to exhaust remedies against Merchant or any Collateral; and all suretyship and guarantor defenses of every kind, whether arising from any amendment or extension of this Agreement, any release or impairment of Collateral, any settlement with Merchant, or any bankruptcy, insolvency, discharge, or reorganization of Merchant, to the fullest extent permitted by law.`)}
${p(`7.3 <b>Continuing Guarantee; Joint and Several Liability.</b> This guarantee is continuing, remains in full force until the Obligations are indefeasibly paid and performed in full, and is binding on Guarantor's heirs, successors, and assigns. Guarantor is jointly and severally liable with Merchant for all Obligations, plus all costs of collection including reasonable attorneys' fees. If more than one Guarantor executes this Agreement, their liability is joint and several.`)}

${h('ARTICLE 8 — EVENTS OF DEFAULT AND REMEDIES')}
${p(`8.1 <b>Events of Default.</b> Each of the following constitutes an Event of Default: (a) failure to remit any amount due under this Agreement when due; (b) diversion of Receivables to any account other than the designated account(s); (c) closure or material change to designated bank account(s) without ten (10) Business Days' notice; (d) three (3) or more returned ACH debits within any thirty (30) day period; (e) breach of the Stacking restriction; (f) any misrepresentation in connection with this Agreement; (g) bankruptcy filing or general assignment for the benefit of creditors; (h) cessation or suspension of business operations for any reason; (i) a judgment, garnishment, levy, or attachment against Merchant or its accounts; (j) any attempt to revoke, or any challenge to the enforceability of, the guarantee in Article 7; (k) Merchant or any Principal conducting business, or routing revenue, through a Successor Entity in violation of Section 2.6; (l) aggregate Remittances during any sixty (60) consecutive days totaling less than twenty percent (20%) of the amount projected by the estimated Remittance schedule in Schedule A for such period, unless attributable to a Receivables decline verified through Reconciliation under Section 3.4 or covered by an adjustment granted under Section 3.5; (m) failure to deliver the full Purchased Amount by the Outside Collection Date; or (n) breach of any other covenant not cured within five (5) Business Days of written notice.`)}
${p(`8.2 <b>Remedies.</b> Upon an Event of Default, Purchaser may, without notice or demand: (a) declare the entire uncollected balance of the Purchased Amount, together with all fees and costs, immediately due and payable; (b) debit any account of Merchant by ACH for all amounts due; (c) enforce the security interest granted in Article 6; (d) enforce the guarantee in Article 7 directly against Guarantor; (e) exercise the power of attorney granted in Section 6.5; (f) notify Merchant's Processor(s) and account debtors to redirect payments to Purchaser; (g) seek injunctive relief to prevent diversion of Receivables; and (h) pursue any other remedy available at law or in equity. All remedies are cumulative.`)}
${p(`8.3 <b>Costs of Enforcement.</b> Merchant and Guarantor shall reimburse Purchaser for all costs of enforcement and collection, including reasonable attorneys' fees, court and arbitration costs, expert fees, and collection agency fees.`)}
${p(`8.4 <b>Fee Schedule.</b> Merchant shall pay the following fees, which the parties agree are reasonable liquidated administrative fees and not penalties, and which Purchaser may collect by ACH debit:`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;margin:0 0 10px;">
${feeTable}
</table>

${h('ARTICLE 9 — DISPUTE RESOLUTION; ARBITRATION')}
${p(`9.1 <b>Arbitration.</b> ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THIS AGREEMENT THAT IS ASSERTED BY MERCHANT OR ANY GUARANTOR SHALL BE RESOLVED BY BINDING ARBITRATION ADMINISTERED BY THE AMERICAN ARBITRATION ASSOCIATION (AAA) UNDER ITS COMMERCIAL ARBITRATION RULES BEFORE A SINGLE ARBITRATOR. PURCHASER MAY, AT ITS SOLE ELECTION, SUBMIT ANY OF ITS CLAIMS TO SUCH ARBITRATION OR BRING THEM IN A COURT SPECIFIED IN SECTION 9.5; ACTIONS BY PURCHASER TO COLLECT THE OBLIGATIONS, ENFORCE THE SECURITY INTEREST OR THE GUARANTEE, OR OBTAIN EQUITABLE RELIEF ARE NOT SUBJECT TO MANDATORY ARBITRATION. THE ARBITRATOR SHALL ALLOCATE THE FEES AND COSTS OF ARBITRATION, INCLUDING REASONABLE ATTORNEYS' FEES, TO THE NON-PREVAILING PARTY. THE ARBITRATOR'S AWARD SHALL BE FINAL AND BINDING AND MAY BE ENTERED AS A JUDGMENT IN ANY COURT OF COMPETENT JURISDICTION.`)}
${p(`9.2 <b>No Confession of Judgment.</b> This Agreement does not include and Merchant does not agree to any confession of judgment, cognovit provision, or pre-authorized judgment. No judgment may be entered against Merchant without service of process and an opportunity to be heard.`)}
${p(`9.3 <b>Equitable Relief.</b> Either party may seek emergency injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration, including an injunction preventing diversion of Receivables.`)}
${p(`9.4 <b>Class Action Waiver.</b> THE PARTIES WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN ANY CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING IN ARBITRATION OR IN COURT.`)}
${p(`9.5 <b>Venue for Court Proceedings.</b> For any court proceedings permitted under this Article, the parties consent to exclusive jurisdiction and venue in the state or federal courts located in Miami-Dade County, Florida.`)}

${h('ARTICLE 10 — GOVERNING LAW AND MISCELLANEOUS')}
${p(`10.1 <b>Governing Law.</b> This Agreement shall be governed by the laws of the State of Florida, without regard to its conflict of law principles.`)}
${p(`10.2 <b>State-Specific Disclosures.</b> A summary of the financing terms is set forth in Exhibit C. To the extent Merchant's Principal State of Operations requires specific commercial financing disclosures — including Florida (Fla. Stat. 559.961 et seq.), New York (NYBL 801 et seq.), California (Cal. Fin. Code 22800 et seq.), Virginia (Va. Code 6.2-2228 et seq.), Utah (Utah Code 7-27-101 et seq.), or Connecticut (CGS 36a-860 et seq.) — the applicable State Disclosure Addendum shall be provided with or attached to this Agreement, and such addendum controls over Exhibit C to the extent of any conflict.`)}
${p(`10.3 <b>Entire Agreement.</b> This Agreement, including Schedule A and Exhibits B and C, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and understandings.`)}
${p(`10.4 <b>Amendment.</b> This Agreement may not be amended except by a written instrument signed by authorized representatives of both parties.`)}
${p(`10.5 <b>Severability.</b> If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.`)}
${p(`10.6 <b>Waiver.</b> No failure or delay by Purchaser in exercising any right shall constitute a waiver thereof.`)}
${p(`10.7 <b>Assignment.</b> Purchaser may assign this Agreement without Merchant's consent. Merchant may not assign this Agreement without Purchaser's prior written consent.`)}
${p(`10.8 <b>Notices.</b> All notices shall be in writing and delivered by email, overnight courier, or certified mail. Notices to Merchant are effective when sent by email to the Merchant Notice Email set forth in Schedule A unless the sender receives an automated non-delivery notice, or when delivered to the Principal Business Address in Schedule A. Merchant shall keep the Merchant Notice Email current and monitored; notice to the Merchant Notice Email is effective notwithstanding any change Merchant fails to communicate under this Section. Notices to Purchaser: Delt Pay LLC, Miami, Florida, legal@deltpay.com.`)}
${p(`10.9 <b>Counterparts; Electronic Signature.</b> This Agreement may be executed in counterparts. Electronic signatures via DocuSign or similar platforms shall be deemed original signatures for all purposes.`)}
${p(`10.10 <b>Independent Legal Counsel.</b> Merchant acknowledges it has had the opportunity to review this Agreement with independent legal counsel. Merchant acknowledges that Purchaser's counsel prepared this Agreement and does not represent Merchant.`)}

<div style="page-break-before:always;"></div>
${h('SIGNATURE PAGE')}
${p(`IN WITNESS WHEREOF, the parties have executed this Purchase and Sale of Future Receivables Agreement as of the Effective Date set forth in Schedule A.`)}

<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:14px;">
  <tr>
    <td style="width:50%;vertical-align:top;padding-right:24px;">
      <b style="color:#121E3E;border-bottom:2px solid #4945FF;padding-bottom:1px;">PURCHASER</b><br>
      Delt Pay LLC, a Florida limited liability company<br><br>
      Signature: ${anchor('/pur_sig/')}________________________<br><br>
      Name: ${anchor('/pur_name/')}____________________________<br><br>
      Title: ${anchor('/pur_title/')}____________________________<br><br>
      Date: ${anchor('/pur_date/')}_____________________________
    </td>
    <td style="width:50%;vertical-align:top;">
      <b style="color:#121E3E;border-bottom:2px solid #4945FF;padding-bottom:1px;">MERCHANT</b><br>
      ${esc(t.merchantLegalName)}<br><br>
      Signature: ${anchor('/mer_sig/')}________________________<br><br>
      Name: ${anchor('/mer_name/')}____________________________<br><br>
      Title: ${anchor('/mer_title/')}____________________________<br><br>
      Date: ${anchor('/mer_date/')}_____________________________
    </td>
  </tr>
</table>

${guarantorBlock}

<div style="page-break-before:always;"></div>
${h('EXHIBIT B — DESIGNATED BANK ACCOUNT AND ACH AUTHORIZATION')}
${p(`Merchant designates the following bank account as its primary operating account for purposes of this Agreement (the "Designated Account"):`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;">
${bankTable}
</table>
${p(`<br>Merchant authorizes Purchaser and its designated ACH originator to initiate debit entries to the Designated Account (and any successor or additional account disclosed to Purchaser) for Remittances and all fees and amounts due under this Agreement, and to initiate credit entries and corrections to the extent necessary. This authorization is governed by Section 3.3, is irrevocable until the Obligations are paid and performed in full, and remains effective notwithstanding any attempted revocation communicated to Merchant's bank. Merchant will not close, block, or redirect deposits away from the Designated Account without complying with Section 5.2(b).`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:10px;">
  <tr>
    <td style="width:55%;padding:8px 0;">Merchant Authorized Signature: ${anchor('/mer_sig/')}________________________</td>
    <td style="padding:8px 0;">Date: ${anchor('/mer_date/')}______________</td>
  </tr>
</table>

${h('EXHIBIT C — SUMMARY OF FINANCING TERMS')}
${p(`The following summary is provided for the convenience of Merchant. Where Merchant's Principal State of Operations mandates a commercial financing disclosure in a prescribed form, the state-mandated disclosure controls over this summary.`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;">
${disclosureTable}
</table>
${p(`<br>Amounts identified as estimates depend on Merchant's actual Receivables and the remittance mechanics in Article 3. This summary does not modify the Agreement.`)}

<p style="margin-top:26px;border:1.5px solid #4945FF;border-left:5px solid #4945FF;background:#f4f4ff;padding:10px;font-size:10px;color:#121E3E;">
<b>IMPORTANT NOTICE:</b> This Agreement is a purchase and sale of future receivables made with FULL RECOURSE to Merchant. Merchant's obligation to deliver the entire Purchased Amount is absolute and unconditional and is guaranteed by the Guarantor, if any, under Article 7. Merchant should review this Agreement carefully and consult independent legal and financial advisors before executing.
</p>

<p style="font-size:9px;color:#4945FF;margin-top:16px;letter-spacing:0.5px;">CONFIDENTIAL &nbsp;·&nbsp; Delt Pay LLC &nbsp;·&nbsp; deltpay.com</p>

</body>
</html>`;
}
