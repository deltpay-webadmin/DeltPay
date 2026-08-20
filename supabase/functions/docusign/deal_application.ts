/**
 * Delt Capital Merchant Funding Application (Form DLT-APP) — HTML renderer
 * for DocuSign envelopes.
 *
 * Reproduces the paper form in docs/capital-templates/
 * delt-capital-application-dlt-app.pdf (Rev. 08-2026): Sections A–H plus the
 * page-2 "FOR DELT CAPITAL USE ONLY" decision box. Signed at INTAKE — Owner 1
 * and the submitting Broker/ISO rep execute Section H; the decision box
 * renders blank because terms don't exist yet and a sent envelope is
 * immutable (the underwriter's decision is recorded separately at approval).
 *
 * Same white-ink anchor pattern as mca_agreement.ts: /own1_sig/ etc. resolve
 * into DocuSign tabs; DocuSign converts the HTML to PDF at envelope creation.
 *
 * SSN/DOB are rendered MASKED (last-4 / year) — the full values live in the
 * encrypted application blob, and Section A(b) authorizes verification, so
 * the signed paper never needs to carry them in the clear.
 */

export interface DltAppFields {
  // Section B — broker / submission details
  isoCompany?: string; // defaults to "Delt Pay LLC"
  dateSubmitted: string; // YYYY-MM-DD
  commissionPoints?: string;
  repName?: string;
  repEmail?: string;
  repPhone?: string;
  amountRequested?: number;
  desiredTerm?: string;
  fundsNeededBy?: string;
  priorFunderRenewal?: boolean;
  useOfFunds?: string;
  // Section C — business information
  legalName: string;
  dba?: string;
  productRequested?: string;
  ein?: string;
  legalStructure?: string;
  stateOfIncorporation?: string;
  businessStartDate?: string;
  industry?: string;
  employees?: string;
  businessPhone?: string;
  website?: string;
  businessAddress?: string;
  premises?: 'Rent' | 'Own';
  businessEmail?: string;
  // Section D — financial snapshot
  grossAnnualRevenue?: number;
  avgMonthlyRevenue?: number;
  avgMonthlyDeposits?: number;
  avgDailyBalance?: number;
  depositsPerMonth?: string;
  negativeDays3mo?: string;
  nsfs3mo?: string;
  monthlyCardVolume?: number;
  existingAdvances?: boolean;
  // Section E — owner information (SSN/DOB masked)
  owner1FirstName?: string;
  owner1LastName?: string;
  owner1EquityPct?: number;
  owner1Fico?: string;
  owner1SsnMasked?: string; // e.g. "•••-••-1234"
  owner1DobMasked?: string; // e.g. "1985"
  owner1CellPhone?: string;
  owner1Email?: string;
  owner1HomeAddress?: string;
  owner1Home?: 'Own' | 'Rent';
  hasSecondOwner?: boolean;
  owner2FirstName?: string;
  owner2LastName?: string;
  owner2EquityPct?: number;
  owner2SsnMasked?: string;
  owner2Email?: string;
  // Section F — risk, legal, deal notes
  openTaxLiens?: boolean;
  bankruptcy7yr?: boolean;
  judgmentsLiens?: boolean;
  priorMcaPaid?: boolean;
  brokerNotes?: string;
  // Section G — attachments on file (rendered from actual deal_documents)
  attachments?: {
    bankStatements?: boolean;
    photoId?: boolean;
    voidedCheck?: boolean;
    additional?: string[];
  };
  // Decision-box header (administrative identifiers only; decision blank)
  applicationId?: string;
}

const usd = (n: number | undefined) =>
  n == null ? '' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const esc = (s: string | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escOr = (s: string | undefined) => (s && s.trim() ? esc(s) : '&mdash;');

/** Anchor marker rendered in white so it's invisible on the final PDF. */
const anchor = (tag: string) => `<span style="color:#ffffff;font-size:7px;">${tag}</span>`;

const yn = (v: boolean | undefined) =>
  v == null ? '[&nbsp;] Yes&nbsp;&nbsp;[&nbsp;] No' : v ? '[X] Yes&nbsp;&nbsp;[&nbsp;] No' : '[&nbsp;] Yes&nbsp;&nbsp;[X] No';

const box = (on: boolean | undefined, label: string) => `[${on ? 'X' : '&nbsp;&nbsp;'}] ${label}`;

export function renderDltAppHtml(f: DltAppFields): string {
  const fmtDate = (d: string | undefined) => {
    if (!d) return '&mdash;';
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt.getTime()) ? esc(d) : dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  const a = f.attachments ?? {};

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; color: #111; margin: 40px 48px; line-height: 1.4; }
  h1 { font-size: 14pt; text-align: center; margin: 0; letter-spacing: .04em; }
  .brand { text-align: center; font-size: 10pt; color: #444; margin: 2px 0 0; }
  .formno { text-align: center; font-size: 8pt; color: #666; margin: 2px 0 14px; }
  h2 { font-size: 10pt; margin: 14px 0 5px; background: #0b2545; color: #fff; padding: 3px 8px; }
  table.fields { width: 100%; border-collapse: collapse; margin: 4px 0; }
  table.fields td { padding: 3px 6px; border: 1px solid #bbb; font-size: 9pt; vertical-align: top; }
  table.fields td.l { width: 32%; color: #333; background: #f2f4f8; font-size: 8pt; text-transform: uppercase; letter-spacing: .02em; }
  .auth { font-size: 8.5pt; color: #222; margin: 4px 0; }
  .auth b { display: inline-block; width: 18px; }
  .sig { margin-top: 18px; }
  .line { border-bottom: 1px solid #111; display: inline-block; min-width: 240px; }
  .small { font-size: 7.5pt; color: #555; }
  .uwbox { border: 2px solid #0b2545; margin-top: 20px; padding: 8px 10px; }
  .uwbox h3 { font-size: 9pt; margin: 0 0 6px; color: #0b2545; }
  .cols { display: flex; gap: 24px; }
  .cols > div { flex: 1; }
</style></head><body>

<h1>DELT CAPITAL</h1>
<p class="brand">Revenue-Based Business Funding &middot; MERCHANT FUNDING APPLICATION &middot; Broker / ISO Submission</p>
<p class="formno">Form DLT-APP (Rev. 08-2026) &middot; Content identical to the online application</p>

<h2>SECTION A. AUTHORIZATION AND DISCLOSURE — READ BEFORE SIGNING</h2>
<p class="auth"><b>(a)</b> You are authorized to apply on behalf of the business listed below, and all information provided is true, accurate, and complete to the best of your knowledge.</p>
<p class="auth"><b>(b)</b> You authorize Delt Capital and its partners, agents, and assignees to obtain consumer and business credit reports, verify bank and financial information, and share application data with third parties as necessary to evaluate this application. This may include a soft or hard credit inquiry.</p>
<p class="auth"><b>(c)</b> Submitting this application does not guarantee approval or constitute an offer of financing. All offers are subject to underwriting review and final approval. Revenue-based financing is a purchase of future receivables and is not a loan.</p>
<p class="auth"><b>(d)</b> By signing below, the Broker/ISO Representative certifies that they have obtained express authorization from the merchant and its owner(s) to submit this application and to sign it on the merchant's behalf, including authorization to obtain the credit reports and verifications described above.</p>

<h2>SECTION B. BROKER / SUBMISSION DETAILS</h2>
<table class="fields">
  <tr><td class="l">1. ISO / Broker Company</td><td>${escOr(f.isoCompany ?? 'Delt Pay LLC')}</td>
      <td class="l">2. Date Submitted</td><td>${fmtDate(f.dateSubmitted)}</td></tr>
  <tr><td class="l">3. Commission / Points Expected</td><td>${escOr(f.commissionPoints)}</td>
      <td class="l">4. Rep Name</td><td>${escOr(f.repName)}</td></tr>
  <tr><td class="l">5. Rep Email</td><td>${escOr(f.repEmail)}</td>
      <td class="l">6. Rep Phone</td><td>${escOr(f.repPhone)}</td></tr>
  <tr><td class="l">7. Amount Requested</td><td><b>${usd(f.amountRequested) || '&mdash;'}</b></td>
      <td class="l">8. Desired Term</td><td>${escOr(f.desiredTerm)}</td></tr>
  <tr><td class="l">9. Funds Needed By</td><td>${fmtDate(f.fundsNeededBy)}</td>
      <td class="l">10. Prior Funder / Renewal</td><td>${yn(f.priorFunderRenewal)}</td></tr>
  <tr><td class="l">11. Use of Funds</td><td colspan="3">${escOr(f.useOfFunds)}</td></tr>
</table>

<h2>SECTION C. BUSINESS INFORMATION</h2>
<table class="fields">
  <tr><td class="l">12. Legal Company Name</td><td><b>${esc(f.legalName)}</b></td>
      <td class="l">13. DBA / Trade Name</td><td>${escOr(f.dba)}</td></tr>
  <tr><td class="l">14. Product Requested</td><td>${escOr(f.productRequested ?? 'Revenue-based funding')}</td>
      <td class="l">15. Federal Tax ID / EIN</td><td>${escOr(f.ein)}</td></tr>
  <tr><td class="l">16. Legal Structure</td><td>${escOr(f.legalStructure)}</td>
      <td class="l">17. State of Incorporation</td><td>${escOr(f.stateOfIncorporation)}</td></tr>
  <tr><td class="l">18. Business Start Date</td><td>${fmtDate(f.businessStartDate)}</td>
      <td class="l">19. Industry / Business Type</td><td>${escOr(f.industry)}</td></tr>
  <tr><td class="l">20. # of Employees</td><td>${escOr(f.employees)}</td>
      <td class="l">21. Business Phone</td><td>${escOr(f.businessPhone)}</td></tr>
  <tr><td class="l">22. Website</td><td>${escOr(f.website)}</td>
      <td class="l">25. Business Email</td><td>${escOr(f.businessEmail)}</td></tr>
  <tr><td class="l">23. Business Street Address</td><td colspan="3">${escOr(f.businessAddress)}</td></tr>
  <tr><td class="l">24. Premises</td><td colspan="3">${box(f.premises === 'Rent', 'Rent')}&nbsp;&nbsp;${box(f.premises === 'Own', 'Own')}</td></tr>
</table>

<h2>SECTION D. FINANCIAL SNAPSHOT</h2>
<table class="fields">
  <tr><td class="l">26. Gross Annual Revenue</td><td>${usd(f.grossAnnualRevenue) || '&mdash;'}</td>
      <td class="l">27. Avg. Monthly Revenue</td><td>${usd(f.avgMonthlyRevenue) || '&mdash;'}</td></tr>
  <tr><td class="l">28. Avg. Monthly Bank Deposits</td><td>${usd(f.avgMonthlyDeposits) || '&mdash;'}</td>
      <td class="l">29. Avg. Daily Bank Balance</td><td>${usd(f.avgDailyBalance) || '&mdash;'}</td></tr>
  <tr><td class="l">30. # Deposits / Month</td><td>${escOr(f.depositsPerMonth)}</td>
      <td class="l">31. Negative Days (last 3 mo.)</td><td>${escOr(f.negativeDays3mo)}</td></tr>
  <tr><td class="l">32. NSFs (last 3 mo.)</td><td>${escOr(f.nsfs3mo)}</td>
      <td class="l">33. Monthly Card Volume</td><td>${usd(f.monthlyCardVolume) || '&mdash;'}</td></tr>
  <tr><td class="l">34. Existing Advances</td><td colspan="3">${yn(f.existingAdvances)}</td></tr>
</table>

<h2>SECTION E. OWNER INFORMATION</h2>
<table class="fields">
  <tr><td class="l">35. Owner 1 — First Name</td><td>${escOr(f.owner1FirstName)}</td>
      <td class="l">36. Owner 1 — Last Name</td><td>${escOr(f.owner1LastName)}</td></tr>
  <tr><td class="l">37. Ownership %</td><td>${f.owner1EquityPct != null ? esc(String(f.owner1EquityPct)) + '%' : '&mdash;'}</td>
      <td class="l">38. Est. FICO / Credit</td><td>${escOr(f.owner1Fico)}</td></tr>
  <tr><td class="l">39. Social Security Number</td><td>${escOr(f.owner1SsnMasked)} <span class="small">(masked; verification authorized per Section A(b))</span></td>
      <td class="l">40. Date of Birth</td><td>${escOr(f.owner1DobMasked)} <span class="small">(masked)</span></td></tr>
  <tr><td class="l">41. Cell Phone</td><td>${escOr(f.owner1CellPhone)}</td>
      <td class="l">42. Email</td><td>${escOr(f.owner1Email)}</td></tr>
  <tr><td class="l">43. Owner 1 — Home Address</td><td colspan="3">${escOr(f.owner1HomeAddress)}</td></tr>
  <tr><td class="l">44. Home</td><td>${f.owner1Home ? box(f.owner1Home === 'Own', 'Own') + '&nbsp;&nbsp;' + box(f.owner1Home === 'Rent', 'Rent') : '[&nbsp;] Own&nbsp;&nbsp;[&nbsp;] Rent'}</td>
      <td class="l">45. Second Owner</td><td>${yn(f.hasSecondOwner)}</td></tr>
  ${f.hasSecondOwner ? `
  <tr><td class="l">Owner 2 — Name</td><td>${escOr(`${f.owner2FirstName ?? ''} ${f.owner2LastName ?? ''}`.trim())}</td>
      <td class="l">Owner 2 — Ownership %</td><td>${f.owner2EquityPct != null ? esc(String(f.owner2EquityPct)) + '%' : '&mdash;'}</td></tr>
  <tr><td class="l">Owner 2 — SSN</td><td>${escOr(f.owner2SsnMasked)} <span class="small">(masked)</span></td>
      <td class="l">Owner 2 — Email</td><td>${escOr(f.owner2Email)}</td></tr>` : ''}
</table>

<h2>SECTION F. RISK, LEGAL, AND DEAL NOTES</h2>
<table class="fields">
  <tr><td class="l">46. Open Tax Liens or Payment Plan</td><td>${yn(f.openTaxLiens)}</td>
      <td class="l">47. Bankruptcy (last 7 yrs)</td><td>${yn(f.bankruptcy7yr)}</td></tr>
  <tr><td class="l">48. Judgments / Liens on File</td><td>${yn(f.judgmentsLiens)}</td>
      <td class="l">49. Prior MCA Paid in Full</td><td>${yn(f.priorMcaPaid)}</td></tr>
  <tr><td class="l">50. Broker Notes / Deal Story</td><td colspan="3">${escOr(f.brokerNotes)}</td></tr>
</table>

<h2>SECTION G. REQUIRED ATTACHMENTS AND SUPPORTING DOCUMENTS</h2>
<div class="cols">
  <div>
    <p class="small" style="font-weight:bold;">REQUIRED WITH EVERY SUBMISSION</p>
    <p class="auth">${box(true, 'Signed Application')} <span class="small">(this document)</span><br/>
    ${box(a.bankStatements, 'Business Bank Statements')}<br/>
    ${box(a.photoId, 'Government Photo ID')}<br/>
    ${box(a.voidedCheck, 'Voided Business Check')}</p>
  </div>
  <div>
    <p class="small" style="font-weight:bold;">ADDITIONAL DOCUMENTS ATTACHED</p>
    <p class="auth">${(a.additional && a.additional.length > 0)
      ? a.additional.map((d) => box(true, esc(d))).join('<br/>')
      : '<span class="small">None</span>'}</p>
  </div>
</div>

<h2>SECTION H. CERTIFICATION AND SIGNATURES</h2>
<p class="auth">The undersigned have read and agree to the Authorization and Disclosure set forth in Section A, paragraphs (a) through (d), of this application.</p>

<div class="sig">
  <p><b>51. Owner 1 Signature</b></p>
  <p>Signature: ${anchor('/own1_sig/')}<span class="line">&nbsp;</span>&nbsp;&nbsp;
     52. Date: ${anchor('/own1_date/')}<span class="line" style="min-width:120px;">&nbsp;</span></p>
  <p>Name: ${anchor('/own1_name/')}<span class="line">&nbsp;</span></p>
</div>

<div class="sig">
  <p><b>53. Broker / ISO Representative Signature</b></p>
  <p>Signature: ${anchor('/rep_sig/')}<span class="line">&nbsp;</span>&nbsp;&nbsp;
     54. Date: ${anchor('/rep_date/')}<span class="line" style="min-width:120px;">&nbsp;</span></p>
  <p>Name: ${anchor('/rep_name/')}<span class="line">&nbsp;</span></p>
</div>

<p class="small">* On the online application, signatures are executed electronically and file attachments are uploaded in PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, or XLSX format.</p>

<div class="uwbox">
  <h3>FOR DELT CAPITAL USE ONLY — DO NOT WRITE BELOW THIS LINE</h3>
  <table class="fields">
    <tr><td class="l">Date Received</td><td>${fmtDate(f.dateSubmitted)}</td>
        <td class="l">Application ID</td><td>${escOr(f.applicationId)}</td></tr>
    <tr><td class="l">Underwriter</td><td></td><td class="l">File Status</td><td></td></tr>
    <tr><td class="l">Decision</td><td>[&nbsp;] Approved&nbsp;&nbsp;[&nbsp;] Declined</td>
        <td class="l">Approved Amount</td><td>$</td></tr>
    <tr><td class="l">Factor Rate</td><td></td><td class="l">Term</td><td></td></tr>
    <tr><td class="l">Payment Frequency</td><td></td><td class="l">Underwriting Notes / Stipulations</td><td></td></tr>
  </table>
  <p class="small">Completed by underwriting at decision time; the recorded decision lives in the CRM and the decision memo filed to the deal.</p>
</div>

</body></html>`;
}
