/**
 * Delt Pay MCA agreement — HTML renderer for DocuSign envelopes.
 *
 * Reproduces the "Purchase and Sale of Future Receivables Agreement"
 * verbatim, with Schedule A populated from the CRM deal terms and
 * white-ink anchor strings (/mer_sig/ etc.) that DocuSign resolves
 * into signature/date/name tabs. DocuSign converts the HTML document
 * to PDF at envelope-creation time.
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

export function renderAgreementHtml(t: AgreementTerms): string {
  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

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
  ];

  const scheduleTable = scheduleRows
    .map(([k, v]) => `<tr><td style="border:1px solid #c7c9e8;padding:6px 10px;width:45%;font-weight:bold;background:#f4f4ff;color:#121E3E;">${k}</td><td style="border:1px solid #c7c9e8;padding:6px 10px;">${v}</td></tr>`)
    .join('\n');

  const h = (text: string) =>
    `<h2 style="font-size:13px;margin:22px 0 8px;color:#121E3E;border-bottom:2px solid #4945FF;padding-bottom:3px;letter-spacing:0.3px;">${text}</h2>`;
  const p = (text: string) => `<p style="margin:0 0 10px;">${text}</p>`;

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
    <p style="margin:6px 0 0;">By signing above, Guarantor agrees to be bound by the Limited Performance Guarantee in Article 7.</p>`;

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

${p(`This Agreement is entered into as of the Effective Date set forth in Schedule A above, by and between <b>Delt Pay LLC</b>, a Florida limited liability company ("Company" or "Purchaser"), and the Merchant identified in Schedule A ("Merchant"). This Agreement incorporates all terms set forth in Schedule A and the General Terms and Conditions below.`)}

${h('RECITALS')}
${p(`A. Merchant operates a business that generates future receivables through the ordinary course of commerce, including but not limited to credit card settlements, ACH transfers, electronic payments, and other business receipts.`)}
${p(`B. Purchaser desires to purchase, and Merchant desires to sell, a specified portion of Merchant's future receivables on the terms and conditions set forth herein.`)}
${p(`C. The parties acknowledge that this transaction constitutes a true sale of future receivables and not a loan, and that the obligations of Merchant hereunder do not constitute a debt or obligation to repay a sum certain.`)}
${p(`D. The Purchase Price paid by Purchaser represents fair consideration for the Purchased Amount of future receivables, reflecting a commercially reasonable discount for (i) the time value of money, (ii) the risk of non-collection, (iii) the speculative nature of future business performance, and (iv) Purchaser's cost of capital.`)}

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
${p(`1.12 <b>"Guarantor"</b> means any individual or entity executing a personal or commercial guarantee in connection with this Agreement.`)}
${p(`1.13 <b>"Reconciliation"</b> has the meaning set forth in Section 3.4.`)}
${p(`1.14 <b>"Stacking"</b> means entering into any additional merchant cash advance, revenue-based financing, or similar transaction with any third party while amounts remain outstanding under this Agreement.`)}

${h('ARTICLE 2 — PURCHASE AND SALE OF RECEIVABLES')}
${p(`2.1 <b>Sale of Receivables.</b> Subject to the terms and conditions of this Agreement, Merchant hereby sells, assigns, transfers, and conveys to Purchaser, and Purchaser hereby purchases from Merchant, the Specific Receivables. Title to the Specific Receivables shall vest in Purchaser upon execution of this Agreement and payment of the Purchase Price. The sale of the Specific Receivables is absolute, irrevocable, and unconditional.`)}
${p(`2.2 <b>Purchase Price.</b> In consideration of the sale of the Specific Receivables, Purchaser shall pay to Merchant the Purchase Price set forth in Schedule A. Disbursement shall be made by ACH or wire to Merchant's designated bank account within one (1) to three (3) Business Days following execution and satisfaction of all conditions precedent.`)}
${p(`2.3 <b>True Sale; Not a Loan.</b> The parties expressly intend this transaction to constitute a sale of receivables and not a loan, forbearance, or extension of credit. The Purchased Amount is not a principal amount subject to interest; the factor rate is not an interest rate or APR; and there is no fixed repayment schedule, maturity date, or guarantee of any specific payment amount or timing. Merchant's obligation to remit funds is conditioned entirely on the actual collection of Receivables from Merchant's business operations.`)}
${p(`2.4 <b>Risk of Non-Collection.</b> Purchaser assumes the risk that Merchant's Receivables may be less than anticipated due to fluctuations in Merchant's business volume, seasonality, market conditions, or other factors outside Merchant's control. If Merchant's business ceases operations for legitimate business reasons unrelated to fraud or breach, and Merchant has complied with all obligations under this Agreement, Purchaser shall have no recourse against Merchant for uncollected amounts except as set forth in Article 8.`)}
${p(`2.5 <b>No Right of Setoff.</b> Merchant expressly waives any right of setoff, defense, counterclaim, or recoupment against Purchaser's right to collect the Specific Receivables, except as expressly provided in Section 3.4.`)}

${h('ARTICLE 3 — REMITTANCE AND COLLECTION')}
${p(`3.1 <b>Remittance Method.</b> The parties shall collect the Specific Receivables through the method specified in Schedule A, which may include: (a) ACH debit from Merchant's designated bank account; (b) split funding through Merchant's Processor; or (c) lockbox or other arrangement as agreed. Merchant authorizes Purchaser to initiate ACH debits from Merchant's designated bank account in accordance with the remittance schedule set forth in Schedule A.`)}
${p(`3.2 <b>Estimated Remittance Amount.</b> The estimated daily, weekly, or monthly remittance amount set forth in Schedule A is an estimate only, calculated by applying the Remittance Percentage to Merchant's estimated average Receivables for the applicable period. The actual amount collected shall reflect Merchant's actual Receivables collected during the applicable period. The estimated remittance amount is not a fixed payment obligation.`)}
${p(`3.3 <b>ACH Authorization.</b> Merchant hereby authorizes Purchaser and its designated payment processor or ACH originator to initiate debit entries to Merchant's designated bank account(s) for the purpose of collecting Remittances. This authorization is irrevocable except upon full collection of the Purchased Amount or as otherwise provided herein. Merchant agrees to maintain sufficient funds in the designated account(s) to cover scheduled Remittances.`)}
${p(`3.4 <b>Reconciliation.</b> Either party may request a reconciliation of Remittances to actual Receivables at any time, but no more frequently than once per calendar month unless an Event of Default has occurred. Upon request, Merchant shall provide bank statements, Processor statements, or other documentation within five (5) Business Days. If Remittances have exceeded the Remittance Percentage of actual collected Receivables, Purchaser shall credit the excess against future Remittances or refund within ten (10) Business Days. If Remittances have been less than the applicable percentage, Merchant shall pay the shortfall within five (5) Business Days. Reconciliation is the sole and exclusive remedy for Remittance disputes.`)}
${p(`3.5 <b>Revenue Decline Adjustment.</b> If Merchant experiences a verifiable decline in Receivables exceeding thirty percent (30%) for thirty (30) or more consecutive days due to seasonal variation, economic conditions, force majeure, or other factors outside Merchant's control (excluding fraud or breach), Merchant may request an adjustment to the estimated Remittance amount with supporting documentation. Purchaser shall respond within five (5) Business Days. Any adjustment applies to the estimated ACH debit only; the Purchased Amount and Remittance Percentage remain unchanged.`)}
${p(`3.6 <b>Failed ACH Debits.</b> In the event an ACH debit is returned for non-sufficient funds or any other reason, Purchaser may re-initiate the debit up to two (2) additional times within five (5) Business Days. Three (3) or more returned ACH debits within any thirty (30) day period shall constitute an Event of Default.`)}

${h('ARTICLE 4 — NATURE OF TRANSACTION; RECHARACTERIZATION DEFENSE')}
${p(`4.1 <b>Characteristics of a True Sale.</b> The parties acknowledge and agree that this transaction possesses the following characteristics of a true sale: (a) Purchaser bears the risk of non-collection if Merchant's business generates insufficient Receivables through no fault of Merchant; (b) the Purchased Amount is not a fixed obligation with no maturity date; (c) the Purchase Price reflects a genuine discount to present value of future Receivables incorporating collection risk and time value; (d) Merchant has no absolute obligation to repay any fixed sum; and (e) the transaction is documented as a purchase and sale, not as a loan.`)}
${p(`4.2 <b>No Guarantee of Payment.</b> Merchant does not guarantee the payment of any specific amount or the collection of any specific volume of Receivables. The Guarantor's obligations, if any, are limited to the specific performance guarantees set forth in Article 7 and shall not be construed as a guarantee of payment of the Purchased Amount.`)}
${p(`4.3 <b>Intent of the Parties.</b> The parties expressly intend this Agreement to be treated as a sale of receivables for all purposes, including tax, accounting, and legal characterization. In the event any court determines that this transaction constitutes a loan, the parties agree that the factor rate shall be deemed an interest rate and the Purchased Amount shall be deemed the principal balance for purposes of such determination only. The foregoing shall not constitute an admission that this transaction is a loan.`)}

${h('ARTICLE 5 — MERCHANT REPRESENTATIONS, WARRANTIES, AND COVENANTS')}
${p(`5.1 <b>Representations and Warranties.</b> Merchant represents and warrants on a continuing basis that: (a) Merchant is duly organized and in good standing; (b) Merchant has full authority to enter this Agreement; (c) this Agreement is a valid, binding, enforceable obligation; (d) execution does not violate any law or agreement; (e) all information provided is true and complete in all material respects; (f) Merchant has no undisclosed outstanding MCAs or revenue-based financing except as disclosed in Schedule A; (g) the designated bank account(s) are Merchant's primary operating account(s); and (h) Merchant is not contemplating bankruptcy or cessation of operations.`)}
${p(`5.2 <b>Affirmative Covenants.</b> During the term, Merchant shall: (a) deposit all Receivables into the designated bank account(s) and not divert Receivables without prior written consent; (b) maintain designated account(s) in good standing and provide ten (10) Business Days' notice before closing or changing such account(s); (c) continue to operate its business in the ordinary course; (d) promptly notify Purchaser of any material change in operations, ownership, or financial condition; (e) provide bank and Processor statements within five (5) Business Days of request; (f) notify Purchaser immediately upon any garnishment or levy against Merchant's accounts; and (g) comply with all applicable laws including Nacha Operating Rules.`)}
${p(`5.3 <b>Negative Covenants; Stacking Restriction.</b> Without Purchaser's prior written consent, Merchant shall not: (a) enter into any Stacking arrangement; (b) sell, assign, or encumber any Receivables other than pursuant to this Agreement; (c) change Merchant's primary Processor(s) without thirty (30) days' prior written notice; (d) permit any lien to attach to the Specific Receivables; (e) make any material change to Merchant's business or ownership that would impair Receivable generation; or (f) use the Purchase Price for purposes other than legitimate business operations.`)}
${p(`5.4 <b>Nacha Compliance.</b> Merchant acknowledges that ACH debits under this Agreement are governed by the Nacha Operating Rules. Merchant agrees not to dispute, return, or cause the return of any ACH debit initiated in accordance with this Agreement as unauthorized.`)}

${h('ARTICLE 6 — SECURITY INTEREST AND UCC FILING')}
${p(`6.1 <b>Grant of Security Interest.</b> To secure Merchant's performance obligations under this Agreement, Merchant hereby grants to Purchaser a first-priority security interest in the following Collateral: all of Merchant's accounts, accounts receivable, payment intangibles, and proceeds thereof, whether now existing or hereafter arising.`)}
${p(`6.2 <b>Scope of Security Interest.</b> The security interest is granted solely as security for performance obligations and not as evidence that this transaction is a loan. Purchaser shall not enforce the security interest except upon the occurrence of an Event of Default.`)}
${p(`6.3 <b>UCC Financing Statement.</b> Merchant authorizes Purchaser to file UCC-1 financing statements in any applicable jurisdiction. Purchaser shall file a UCC-3 termination statement within fifteen (15) Business Days following full collection of the Purchased Amount, provided no Event of Default has occurred.`)}
${p(`6.4 <b>Processor Notification.</b> Merchant authorizes Purchaser to notify Merchant's Processor(s) of this Agreement and to direct Processor(s) to remit the Remittance Percentage of settled funds directly to Purchaser through split funding or other arrangement.`)}

${h('ARTICLE 7 — LIMITED PERFORMANCE GUARANTEE')}
${p(`7.1 <b>Nature of Guarantee.</b> The Guarantor, if any, does not guarantee the payment of the Purchased Amount. Guarantor's obligations are strictly limited to guaranteeing Merchant's performance of its covenants — specifically, that Merchant will not take any action to interfere with, impair, or prevent Purchaser's collection of the Specific Receivables.`)}
${p(`7.2 <b>Triggering Events.</b> Guarantor's liability is triggered solely by: (a) Merchant's breach of the Stacking restriction; (b) diversion of Receivables to non-designated accounts; (c) unauthorized closure of designated bank account(s); (d) material misrepresentation in connection with this Agreement; (e) fraudulent interference with Purchaser's collection rights; or (f) voluntary bankruptcy filing while amounts remain outstanding, unless necessitated solely by a catastrophic business event unrelated to Merchant's obligations hereunder.`)}
${p(`7.3 <b>Scope of Guarantee.</b> Upon a triggering event, Guarantor shall be jointly and severally liable with Merchant for the uncollected balance of the Purchased Amount, plus reasonable costs of collection including attorneys' fees. Guarantor waives notice of default, demand for payment, and any right to require Purchaser to proceed against Merchant first.`)}

${h('ARTICLE 8 — EVENTS OF DEFAULT AND REMEDIES')}
${p(`8.1 <b>Events of Default.</b> Each of the following constitutes an Event of Default: (a) diversion of Receivables with intent to impair Purchaser's collection; (b) closure or material change to designated bank account(s) without ten (10) Business Days' notice; (c) three (3) or more returned ACH debits within any thirty (30) day period; (d) breach of the Stacking restriction; (e) material misrepresentation in connection with this Agreement; (f) bankruptcy filing or general assignment for the benefit of creditors; (g) cessation of business operations other than due to force majeure; (h) a judgment or attachment that materially impairs Purchaser's collection rights; or (i) breach of any material covenant not cured within five (5) Business Days of written notice.`)}
${p(`8.2 <b>Remedies.</b> Upon an Event of Default, Purchaser may: (a) declare the full uncollected Purchased Amount immediately due and payable; (b) enforce the security interest granted in Article 6; (c) enforce the Limited Performance Guarantee in Article 7; (d) seek injunctive relief to prevent further diversion of Receivables; (e) notify Merchant's Processor(s) to redirect settlement payments; and (f) pursue any other remedy available at law or in equity.`)}
${p(`8.3 <b>Costs of Enforcement.</b> Merchant shall reimburse Purchaser for all reasonable costs of enforcement, including attorneys' fees, court costs, and collection agency fees.`)}

${h('ARTICLE 9 — DISPUTE RESOLUTION; ARBITRATION')}
${p(`9.1 <b>Mandatory Arbitration.</b> EXCEPT AS OTHERWISE PROVIDED IN SECTION 9.3, ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THIS AGREEMENT SHALL BE RESOLVED BY BINDING ARBITRATION ADMINISTERED BY THE AMERICAN ARBITRATION ASSOCIATION (AAA) UNDER ITS COMMERCIAL ARBITRATION RULES. THE ARBITRATION SHALL BE CONDUCTED BY A SINGLE ARBITRATOR. THE ARBITRATOR'S AWARD SHALL BE FINAL AND BINDING AND MAY BE ENTERED AS A JUDGMENT IN ANY COURT OF COMPETENT JURISDICTION.`)}
${p(`9.2 <b>No Confession of Judgment.</b> This Agreement does not include and Merchant does not agree to any confession of judgment, cognovit provision, or pre-authorized judgment. No judgment may be entered against Merchant without service of process and an opportunity to be heard.`)}
${p(`9.3 <b>Equitable Relief.</b> Either party may seek emergency injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration, including an injunction preventing diversion of Receivables.`)}
${p(`9.4 <b>Class Action Waiver.</b> THE PARTIES WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN ANY CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING IN ARBITRATION OR IN COURT.`)}
${p(`9.5 <b>Venue for Court Proceedings.</b> For any court proceedings permitted under this Article, the parties consent to exclusive jurisdiction and venue in the state or federal courts located in Miami-Dade County, Florida.`)}

${h('ARTICLE 10 — GOVERNING LAW AND MISCELLANEOUS')}
${p(`10.1 <b>Governing Law.</b> This Agreement shall be governed by the laws of the State of Florida, without regard to its conflict of law principles; provided that to the extent any court applying Florida law determines that New York law provides materially stronger enforceability of receivables purchase agreements, the parties agree that New York law shall govern such specific provisions. The parties acknowledge that New York courts have developed substantial MCA case law that may inform interpretation of this Agreement.`)}
${p(`10.2 <b>State-Specific Disclosures.</b> To the extent Merchant's Principal State of Operations requires specific commercial financing disclosures, including New York (NYBL 89-d), California (Cal. Fin. Code 22800 et seq.), Virginia (Va. Code 6.2-2228 et seq.), Utah (Utah Code 7-27-101 et seq.), or Connecticut (CGS 36a-860 et seq.), such disclosures are set forth in the applicable State Disclosure Addendum attached hereto.`)}
${p(`10.3 <b>Entire Agreement.</b> This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and understandings.`)}
${p(`10.4 <b>Amendment.</b> This Agreement may not be amended except by a written instrument signed by authorized representatives of both parties.`)}
${p(`10.5 <b>Severability.</b> If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.`)}
${p(`10.6 <b>Waiver.</b> No failure or delay by Purchaser in exercising any right shall constitute a waiver thereof.`)}
${p(`10.7 <b>Assignment.</b> Purchaser may assign this Agreement without Merchant's consent. Merchant may not assign this Agreement without Purchaser's prior written consent.`)}
${p(`10.8 <b>Notices.</b> All notices shall be in writing and delivered by email with confirmation, overnight courier, or certified mail to the addresses in Schedule A. Notices to Purchaser: Delt Pay LLC, Miami, Florida, legal@deltpay.com.`)}
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

<p style="margin-top:26px;border:1.5px solid #4945FF;border-left:5px solid #4945FF;background:#f4f4ff;padding:10px;font-size:10px;color:#121E3E;">
<b>IMPORTANT NOTICE:</b> This Agreement constitutes a sale of future receivables and not a loan. The Purchased Amount is not a principal balance and the factor rate is not an interest rate. Merchant should review this Agreement carefully and consult independent legal and financial advisors before executing.
</p>

<p style="font-size:9px;color:#4945FF;margin-top:16px;letter-spacing:0.5px;">CONFIDENTIAL — This agreement constitutes a sale of receivables, not a loan. &nbsp;·&nbsp; Delt Pay LLC &nbsp;·&nbsp; deltpay.com</p>

</body>
</html>`;
}
