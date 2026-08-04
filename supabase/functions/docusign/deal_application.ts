/**
 * Delt Pay merchant application — HTML renderer for DocuSign envelopes.
 *
 * Sent from a deal submission so the merchant can execute Delt's own
 * application/agreement without leaving the pipeline. Same white-ink anchor
 * pattern as mca_agreement.ts (/mer_sig/ etc. resolve into DocuSign tabs;
 * DocuSign converts the HTML to PDF at envelope creation).
 *
 * Scope note: this is DELT's application and processing-services consent.
 * Processor-specific merchant agreements (Square, Luqra, Paysafe) are still
 * executed in those providers' own flows during boarding.
 */

export interface ApplicationFields {
  merchantName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  vertical?: string;
  monthlyVolume?: number;
  wantsPos?: boolean;
  wantsCapital?: boolean;
  agentName?: string;
  applicationDate: string; // YYYY-MM-DD
}

const usd = (n: number | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const esc = (s: string | undefined) =>
  (s ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Anchor marker rendered in white so it's invisible on the final PDF. */
const anchor = (tag: string) => `<span style="color:#ffffff;font-size:7px;">${tag}</span>`;

export function renderApplicationHtml(f: ApplicationFields): string {
  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  const products = [
    'Payment processing',
    ...(f.wantsPos ? ['KORONA POS'] : []),
    ...(f.wantsCapital ? ['Delt Capital'] : []),
  ].join(', ');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #111; margin: 48px 56px; line-height: 1.45; }
  h1 { font-size: 15pt; text-align: center; margin-bottom: 2px; }
  h2 { font-size: 11.5pt; margin: 18px 0 6px; border-bottom: 1px solid #999; padding-bottom: 3px; }
  .sub { text-align: center; color: #444; font-size: 10pt; margin-top: 0; }
  table.fields { width: 100%; border-collapse: collapse; margin: 8px 0; }
  table.fields td { padding: 4px 6px; border: 1px solid #ccc; font-size: 10.5pt; }
  table.fields td.l { width: 34%; color: #333; background: #f5f5f5; }
  .sig { margin-top: 26px; }
  .line { border-bottom: 1px solid #111; display: inline-block; min-width: 260px; }
  .small { font-size: 9pt; color: #444; }
</style></head><body>

<h1>Delt Pay — Merchant Application &amp; Processing Services Agreement</h1>
<p class="sub">Application date: ${fmtDate(f.applicationDate)}</p>

<h2>1. Business Information</h2>
<table class="fields">
  <tr><td class="l">Business / DBA name</td><td><b>${esc(f.merchantName)}</b></td></tr>
  <tr><td class="l">Contact</td><td>${esc(f.contactName)}</td></tr>
  <tr><td class="l">Phone</td><td>${esc(f.phone)}</td></tr>
  <tr><td class="l">Email</td><td>${esc(f.email)}</td></tr>
  <tr><td class="l">Industry / vertical</td><td>${esc(f.vertical)}</td></tr>
  <tr><td class="l">Estimated monthly card volume</td><td>${usd(f.monthlyVolume)}</td></tr>
  <tr><td class="l">Products requested</td><td>${esc(products)}</td></tr>
  <tr><td class="l">Delt account manager</td><td>${esc(f.agentName)}</td></tr>
</table>

<h2>2. Application Consent &amp; Authorization</h2>
<p>By signing below, the undersigned ("Merchant") applies for payment processing and related
services arranged by Delt Pay and: (a) certifies that the information above is true, complete,
and correct; (b) authorizes Delt Pay and its processing and financial partners to obtain and
exchange information about Merchant — including consumer and business credit reports,
bank references, and processing history — for the purpose of evaluating and maintaining this
application; (c) understands that approval, pricing, and settlement are subject to underwriting
by Delt Pay's processing partners and that a separate merchant processing agreement with the
approved processor will govern the processing relationship; and (d) agrees to be contacted by
Delt Pay at the phone number and email above regarding this application.</p>

<h2>3. Terms of Service</h2>
<p class="small">[FOUNDER/COUNSEL TO REVIEW: insert or attach Delt Pay's standard terms of
service, program terms (including any cash discount program disclosures), fee schedule, and
data-use notices applicable to the requested products before using this document in
production.]</p>

<div class="sig">
  <p><b>Merchant</b></p>
  <p>Signature: ${anchor('/mer_sig/')}<span class="line">&nbsp;</span></p>
  <p>Name: ${anchor('/mer_name/')}<span class="line">&nbsp;</span></p>
  <p>Title: ${anchor('/mer_title/')}<span class="line">&nbsp;</span></p>
  <p>Date: ${anchor('/mer_date/')}<span class="line">&nbsp;</span></p>
</div>

<div class="sig">
  <p><b>Delt Pay (acknowledged)</b></p>
  <p>Signature: ${anchor('/pur_sig/')}<span class="line">&nbsp;</span></p>
  <p>Name: ${anchor('/pur_name/')}<span class="line">&nbsp;</span></p>
  <p>Title: ${anchor('/pur_title/')}<span class="line">&nbsp;</span></p>
  <p>Date: ${anchor('/pur_date/')}<span class="line">&nbsp;</span></p>
</div>

<p class="small">Delt Pay · Miami, FL · This application does not itself constitute an approval
or a guarantee of services.</p>

</body></html>`;
}
