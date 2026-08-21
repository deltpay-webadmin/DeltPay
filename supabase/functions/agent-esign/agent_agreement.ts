/**
 * Delt Pay Independent Sales Agent Agreement — HTML renderer for DocuSign.
 *
 * One envelope, one signature: Agreement body → Schedule A (fee schedule &
 * net program revenue) → Schedule B (compensation plan) → signature page
 * with the ACH direct-deposit authorization. White-ink anchors (/agt_sig/,
 * /del_sig/, etc.) become DocuSign tabs in index.ts; the ACH fields are required
 * text tabs so the agent cannot execute with a blank deposit account.
 * Banking details live only in the DocuSign envelope — they are never
 * written back to the CRM database.
 *
 * Content mirrors docs/hiring/agent-agreement.md; the comp numbers mirror
 * Schedule B ⇄ comp-plan-one-pager.md ⇄ agentComp.ts. Change one, change all.
 */

export interface AgentAgreementFields {
  agentName: string;
  agentEmail: string;
  effectiveDateNote?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Anchor marker rendered in white so it's invisible on the final PDF. */
const anchor = (tag: string) => `<span style="color:#ffffff;font-size:7px;">${tag}</span>`;

const h2 = (text: string) =>
  `<h2 style="font-size:13px;margin:22px 0 8px;color:#121E3E;border-bottom:2px solid #4945FF;padding-bottom:3px;letter-spacing:0.3px;">${text}</h2>`;

const h3 = (text: string) =>
  `<h3 style="font-size:12px;margin:16px 0 6px;color:#121E3E;">${text}</h3>`;

const p = (html: string) => `<p style="margin:6px 0;text-align:justify;">${html}</p>`;

const feeTable = (rows: [string, string, string][]) => `
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin:8px 0;">
    <tr style="background:#EEF2FF;">
      <th style="text-align:left;padding:5px 8px;border:1px solid #d1d5db;">Item</th>
      <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">Standard portfolio</th>
      <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">High-risk portfolio</th>
    </tr>
    ${rows.map(([a, b, c]) => `<tr>
      <td style="padding:4px 8px;border:1px solid #e5e7eb;">${a}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e5e7eb;">${b}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e5e7eb;">${c}</td>
    </tr>`).join("")}
  </table>`;

const twoColTable = (header: [string, string], rows: [string, string][]) => `
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin:8px 0;">
    <tr style="background:#EEF2FF;">
      <th style="text-align:left;padding:5px 8px;border:1px solid #d1d5db;">${header[0]}</th>
      <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${header[1]}</th>
    </tr>
    ${rows.map(([a, b]) => `<tr>
      <td style="padding:4px 8px;border:1px solid #e5e7eb;">${a}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e5e7eb;"><b>${b}</b></td>
    </tr>`).join("")}
  </table>`;

export function renderAgentAgreementHtml(f: AgentAgreementFields): string {
  const agent = esc(f.agentName);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#1a2138;line-height:1.45;margin:36px 48px;">

<div style="text-align:center;margin-bottom:18px;">
  <div style="font-size:19px;font-weight:bold;letter-spacing:2px;color:#121E3E;">DELT <span style="color:#4945FF;">PAY</span> LLC</div>
  <div style="font-size:10px;color:#4945FF;letter-spacing:1px;">deltpay.com &nbsp;·&nbsp; Miami, Florida</div>
  <div style="font-size:14px;font-weight:bold;margin-top:14px;color:#121E3E;">INDEPENDENT SALES AGENT AGREEMENT</div>
  <div style="font-size:10px;color:#666;">Agreement &nbsp;·&nbsp; Schedule A (Fee Schedule) &nbsp;·&nbsp; Schedule B (Compensation Plan) &nbsp;·&nbsp; Substitute W-9 &nbsp;·&nbsp; ACH Authorization</div>
</div>

${p(`This Independent Sales Agent Agreement (the "Agreement") is entered into as of the date of last signature below (the "Effective Date") between <b>Delt Pay LLC</b>, a Florida limited liability company ("Delt"), and <b>${agent}</b> ("Agent").`)}

${h2("1. Appointment; Independent Contractor Status")}
${p(`<b>1.1 Appointment.</b> Delt appoints Agent, on a non-exclusive basis, to solicit merchants in the United States for Delt&rsquo;s products and services, including payment processing, point-of-sale, Delt Capital funding, websites, and software (the "Services"). Agent accepts the appointment.`)}
${p(`<b>1.2 Independent contractor.</b> Agent is an independent contractor, not an employee, partner, joint venturer, or franchisee of Delt. Agent controls the manner, means, place, and hours of Agent&rsquo;s work. Delt does not require set hours, mandatory meetings, or minimum production as a condition of this Agreement; production thresholds affect only compensation tiers and program eligibility under Schedule B. Agent may represent other non-conflicting products and services. Nothing in this Agreement requires Agent to pay any fee to Delt to enter into or maintain this Agreement.`)}
${p(`<b>1.3 No authority to bind.</b> Agent has no authority to sign for, bind, or make commitments on behalf of Delt, to accept funds on Delt&rsquo;s behalf, or to modify Delt&rsquo;s published pricing or terms. All merchant agreements are between the merchant and Delt (or Delt&rsquo;s processing partners) and take effect only upon Delt&rsquo;s acceptance.`)}
${p(`<b>1.4 No employee benefits.</b> Agent is not eligible for any Delt employee benefit plan (health insurance, retirement, paid time off, or otherwise). Program perks described in Schedule B are production-based contractor rewards, not employment benefits, and may be reviewed annually.`)}

${h2("2. Agent Conduct")}
${p(`<b>2.1 Honest selling.</b> Agent will describe the Services truthfully, including fees, terms, funding timelines, and eligibility, and will not guarantee savings, approval, or outcomes that Delt has not committed to in writing. Agent will use only marketing materials, pricing, and claims provided or approved by Delt.`)}
${p(`<b>2.2 No earnings claims.</b> Agent will not make income projections or earnings claims to merchants, prospective agents, or referral partners beyond materials Delt provides for that purpose.`)}
${p(`<b>2.3 Compliance with law.</b> Agent will comply with all applicable laws and card-network rules in soliciting merchants, including telemarketing and text-messaging laws (TCPA and state equivalents), CAN-SPAM, and any state licensing requirements applicable to Agent&rsquo;s activities.`)}
${p(`<b>2.4 No charges to merchants.</b> Agent will not collect any payment from a merchant. All merchant fees are billed by Delt under its published pricing.`)}
${p(`<b>2.5 Submission of business.</b> Agent will submit prospective merchants exclusively through the Delt agent portal or other channels Delt designates.`)}

${h2("3. Compensation")}
${p(`<b>3.1 Schedules control.</b> Delt will pay Agent as set out in Schedule B (Compensation Plan), applied to Net Program Revenue as defined in Schedule A (Fee Schedule). Both Schedules are incorporated into this Agreement. Capitalized program terms have the meanings given in Schedules A and B.`)}
${p(`<b>3.2 Payment timing; statements.</b> Compensation is paid monthly on or about the 15th calendar day for amounts earned through the prior month, with a per-merchant statement available in the agent portal.`)}
${p(`<b>3.3 Clawbacks (complete list).</b> The only clawback under this Agreement: an activation bonus (including any attach kicker) is reversed if the related merchant terminates or ceases processing within ninety (90) days of activation. Residual payments, Fast Start bonuses, capital commissions, and overrides, once earned and paid, are never clawed back, except in the case of fraud or amounts paid in error.`)}
${p(`<b>3.4 Residuals; survival.</b> Agent&rsquo;s residual entitlement on an account continues for as long as that merchant continues processing with Delt, including after this Agreement ends, provided this Agreement was not terminated for cause under Section 8.3 and Agent remains in compliance with Sections 5 and 6. Residuals are calculated on Net Program Revenue as defined in Schedule A.`)}
${p(`<b>3.5 Prospective changes only.</b> Delt may amend Schedule B on thirty (30) days&rsquo; written notice. Amendments apply prospectively only: they do not reduce Agent&rsquo;s residual split percentage or residual entitlement on accounts activated before the amendment&rsquo;s effective date. Delt may adjust Schedule A on thirty (30) days&rsquo; written notice, including to reflect changes in card-network, processor, or bank-sponsor costs; interchange, dues, and assessments always remain pass-through.`)}
${p(`<b>3.6 Taxes.</b> Agent is responsible for all federal, state, and local taxes on amounts paid under this Agreement, including self-employment taxes. Agent will provide a completed IRS Form W-9 before first payment; Delt will issue Form 1099-NEC as required.`)}

${h2("4. Recruiting Override (Sub-ISO Track)")}
${p(`<b>4.1</b> Delt will pay Agent an override equal to ten percent (10%) of the net residual production of each agent personally recruited by Agent and accepted by Delt (a "Recruit"), paid from Delt&rsquo;s share and never deducted from the Recruit&rsquo;s compensation, for so long as both Agent and the Recruit maintain active agreements and Agent remains an Active Producer as defined in Schedule B, plus a one-time bonus of $250 when a Recruit reaches five (5) activations.`)}
${p(`<b>4.2 Single level; no fees.</b> Overrides apply only to agents personally recruited by Agent &mdash; never to a Recruit&rsquo;s recruits. No person pays any fee to become an agent, and no compensation is paid for the act of recruiting itself.`)}

${h2("5. Confidentiality")}
${p(`Agent will use Delt&rsquo;s confidential information &mdash; including merchant lists and data, pricing schedules, residual economics, software, and sales materials &mdash; only to perform under this Agreement, and will not disclose it to any third party during the term and for three (3) years after. Merchant cardholder data must never be stored, copied, or transmitted by Agent outside Delt-provided systems. This Section survives termination.`)}

${h2("6. Non-Solicitation")}
${p(`For the term of this Agreement and twenty-four (24) months after it ends, Agent will not (a) solicit, induce, or refer any merchant with an active Delt account originated by any agent (including Agent) to move its processing or services away from Delt, or (b) solicit any Delt agent or employee to terminate their relationship with Delt. This Section does not otherwise restrict Agent from working in the payments industry.`)}

${h2("7. Trademarks; Title")}
${p(`Delt grants Agent a revocable, non-exclusive license to use Delt&rsquo;s name, marks, the "Account Manager" title, a Delt email address, and Delt business materials solely to perform under this Agreement, in the form Delt provides. All goodwill inures to Delt. The license ends when this Agreement ends.`)}

${h2("8. Term and Termination")}
${p(`<b>8.1 Term.</b> This Agreement begins on the Effective Date and continues until terminated.`)}
${p(`<b>8.2 Termination for convenience.</b> Either party may terminate on thirty (30) days&rsquo; written notice.`)}
${p(`<b>8.3 Termination for cause.</b> Delt may terminate immediately on written notice if Agent (a) commits fraud, misrepresentation, or falsifies merchant applications; (b) materially breaches Sections 2, 5, or 6; or (c) engages in conduct that materially harms Delt&rsquo;s reputation or merchant relationships, in each case where the breach is incurable or remains uncured ten (10) days after written notice.`)}
${p(`<b>8.4 Effect of termination.</b> On any termination: unpaid earned compensation is paid on the normal schedule; Section 3.4 governs residual survival; the license in Section 7 ends; and Sections 3.4, 3.6, 5, 6, 9, 10, and 11 survive. On termination for cause under Section 8.3, residual entitlement terminates as of the termination date.`)}

${h2("9. Indemnification")}
${p(`Each party will indemnify the other against third-party claims arising from its own breach of this Agreement, negligence, or willful misconduct. Agent&rsquo;s indemnity includes claims arising from representations Agent made that Delt did not authorize.`)}

${h2("10. Limitation of Liability")}
${p(`Except for indemnification obligations and breaches of Sections 5 and 6, neither party is liable for indirect, incidental, consequential, or punitive damages, and Delt&rsquo;s total liability under this Agreement will not exceed the amounts paid to Agent in the twelve (12) months preceding the claim.`)}

${h2("11. General")}
${p(`<b>11.1 Governing law; venue.</b> Florida law governs, without regard to conflicts rules. Exclusive venue is the state and federal courts located in Miami-Dade County, Florida.`)}
${p(`<b>11.2 Entire agreement; amendment.</b> This Agreement (with Schedules A and B) is the entire agreement on its subject and supersedes prior discussions, including any job posting or recruiting materials. Except as provided in Section 3.5, amendments must be in a writing signed (including electronically) by both parties.`)}
${p(`<b>11.3 Assignment.</b> Agent may not assign this Agreement or residual rights without Delt&rsquo;s prior written consent. Delt may assign to an affiliate or successor.`)}
${p(`<b>11.4 Notices.</b> Notices go to the parties&rsquo; emails of record; email suffices.`)}
${p(`<b>11.5 Severability; waiver.</b> If a provision is unenforceable, the remainder stands. A waiver must be written to be effective.`)}
${p(`<b>11.6 Electronic signature; counterparts.</b> This Agreement may be signed electronically and in counterparts.`)}

<div style="page-break-before:always;"></div>
${h2("SCHEDULE A — FEE SCHEDULE &amp; NET PROGRAM REVENUE")}
${h3("A-1. Gross Program Revenue")}
${p(`"Gross Program Revenue" on an account means all discount, transaction, monthly, service, and program revenue Delt collects from that merchant.`)}
${h3("A-2. Net Program Revenue")}
${p(`"Net Program Revenue" means Gross Program Revenue minus only: (i) interchange, dues, assessments, and card-network pass-through charges; (ii) the Agent buy-rate fees in A-3; (iii) any bank-sponsor revenue share applicable to the account&rsquo;s program; and (iv) direct third-party costs on the account (gateway, wireless vendor, PCI program). Agent&rsquo;s residual split under Schedule B applies to the full amount of Net Program Revenue so calculated.`)}
${h3("A-3. Fee schedule — Agent buy rates (as of the Effective Date)")}
${feeTable([
    ["Bank-sponsor revenue share", "10% of program revenue", "30%–50% of program revenue"],
    ["BIN sponsorship", "0.05% of volume", "0.15%–0.30% of volume"],
    ["Interchange, dues &amp; assessments (all cards)", "Pass-through", "Pass-through"],
    ["Card transaction (auth &amp; capture)", "$0.05", "$0.08–$0.15"],
    ["PIN debit / EBT transaction", "$0.05", "$0.08–$0.15"],
    ["Batch", "$0.05", "$0.10"],
    ["AVS (electronic)", "$0.10", "$0.15"],
    ["Chargeback", "$25.00", "$35.00"],
    ["Retrieval", "$15.00", "$20.00"],
    ["Account on file (monthly)", "$7.50", "$10.00–$12.50"],
    ["IRS regulatory (monthly)", "$3.95", "$5.95"],
    ["Risk monitoring (monthly)", "—", "0.15%–0.20% of volume"],
    ["Monthly minimum (cost)", "—", "$50.00"],
    ["Annual PCI (with breach insurance)", "$59.00 ($99.00)", "$59.00 ($99.00)"],
    ["Gateway (monthly / per transaction)", "$12.50 / $0.15", "$12.50 / $0.15"],
  ])}
${h3("A-4. Petroleum portfolio")}
${p(`Accounts boarded on the petroleum program carry a bank-sponsor revenue share of 15% and that sponsor&rsquo;s published buy rates in lieu of the A-3 table.`)}
${h3("A-5. Adjustments")}
${p(`Delt may adjust A-3 items on thirty (30) days&rsquo; written notice, including to reflect changes imposed by card networks, processors, or bank sponsors. Interchange, dues, and assessments always remain pass-through at actual cost.`)}
${h3("A-6. Risk pass-throughs")}
${p(`If a processor or sponsor withholds or forfeits residuals on a merchant for excessive chargebacks or network risk thresholds (for example, a Visa/Mastercard dispute ratio above 1.50%), the corresponding agent residual on that merchant is likewise withheld until the sponsor releases it.`)}
${h3("A-7. Confidentiality")}
${p(`This Schedule is Delt confidential information under Section 5 of the Agreement.`)}

<div style="page-break-before:always;"></div>
${h2("SCHEDULE B — COMPENSATION PLAN")}
${p(`<i>Residual splits apply to Net Program Revenue as defined in Schedule A. This Schedule mirrors the agent portal&rsquo;s program display; if they conflict, this Schedule controls.</i>`)}
${h3("B-1. Activation bonuses")}
${p(`Paid on the next monthly payment date after the merchant&rsquo;s first processed batch. Bands of $400 and above are confirmed by the merchant&rsquo;s first full month of actual processing volume.`)}
${twoColTable(["Merchant's monthly card volume", "Bonus"], [
    ["Under $10,000", "$150"],
    ["$10,000 – $25,000", "$250"],
    ["$25,000 – $50,000", "$400"],
    ["$50,000 – $100,000", "$600"],
    ["$100,000+", "$1,000"],
    ["POS or Delt Capital attached", "+$100 on any band"],
  ])}
${h3("B-2. Residual split (tier ladder)")}
${p(`An "active" account is one that processed in the prior calendar month. Tier promotions apply prospectively from the month the criteria are met.`)}
${twoColTable(["Tier", "Split of Net Program Revenue"], [
    ["Tier 1 — from day one", "50%"],
    ["Tier 2 — 15+ active merchant accounts", "60%"],
    ["Tier 3 — 35+ active merchant accounts", "70%"],
  ])}
${h3("B-3. Delt Capital commission")}
${p(`3% of every funded amount on Delt Capital deals originated by Agent, renewals included, paid on the next monthly payment date after funding. Paid in addition to any attach kicker under B-1.`)}
${h3("B-4. Fast Start (first 90 days; one-time; $1,500 lifetime cap)")}
${twoColTable(["Milestone", "Bonus"], [
    ["3 activations in Agent's first 30 days", "+$500"],
    ["10 activations in Agent's first 90 days", "+$1,000"],
  ])}
${h3("B-5. Recruiting override")}
${p(`Per Section 4 of the Agreement: 10% of each personally-recruited agent&rsquo;s net residual production, paid from Delt&rsquo;s share; plus $250 at the Recruit&rsquo;s 5th activation. Single level only; no fees of any kind.`)}
${h3("B-6. Active Producer status and perks")}
${p(`"Active Producer" means 3 or more activations in the trailing 90 days. While Agent holds Active Producer status: founder closer support (first 90 days), weekly live training, lead flow from Delt&rsquo;s inbound referral program (allocation at Delt&rsquo;s discretion; never guaranteed), free use of the Delt platform for Agent&rsquo;s own business, gym membership reimbursement up to $15/month, telehealth membership, and healthcare enrollment support. Perks pause when status lapses and resume when regained; they are contractor rewards, reviewed annually, and are not employment benefits.`)}
${h3("B-7. Payment mechanics")}
${p(`Payments are made monthly on or about the 15th. Per-merchant statements are available in the agent portal. Clawbacks are limited to Section 3.3 of the Agreement.`)}

<div style="page-break-before:always;"></div>
${h2("EXHIBIT 1 — SUBSTITUTE FORM W-9 (Request for Taxpayer Identification Number and Certification)")}
${p(`Agent is engaged as a 1099 independent contractor. Complete this substitute Form W-9 so Delt Pay LLC can report payments on Form 1099-NEC. Delt does not withhold taxes from contractor compensation. This information is used for tax reporting only.`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;margin:10px 0;">
  <tr>
    <td colspan="2" style="padding:7px 0;">1. Name (as shown on your income tax return): ${anchor("/w9_name/")}_______________________________________</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:7px 0;">2. Business name / disregarded entity name, if different: ${anchor("/w9_biz/")}_______________________________</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:7px 0;">3. Federal tax classification (Individual/sole proprietor, C corp, S corp, Partnership, LLC): ${anchor("/w9_class/")}__________________</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:7px 0;">4. Address (number, street, city, state, ZIP): ${anchor("/w9_addr/")}_______________________________________________</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:7px 0;">5. Taxpayer Identification Number (SSN or EIN): ${anchor("/w9_tin/")}______________________________</td>
  </tr>
</table>
${h3("Certification")}
${p(`Under penalties of perjury, I certify that: (1) the number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); (2) I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; (3) I am a U.S. citizen or other U.S. person; and (4) the FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;">
  <tr>
    <td style="width:55%;padding:8px 0;">Signature of U.S. person: ${anchor("/w9_sig/")}________________________</td>
    <td style="padding:8px 0;">Date: ${anchor("/w9_date/")}______________</td>
  </tr>
</table>

<div style="page-break-before:always;"></div>
${h2("SIGNATURE PAGE — AGREEMENT AND SCHEDULES A &amp; B")}
${p(`One signature below executes this Agreement together with Schedule A (Fee Schedule &amp; Net Program Revenue), Schedule B (Compensation Plan), and Exhibit 1 (Substitute Form W-9).`)}

${h3("Direct Deposit (ACH) Authorization")}
${p(`Agent authorizes Delt Pay LLC to initiate ACH credits for all compensation to the account below, and to initiate correcting debits solely for credits made in error. Agent may change the deposit account through the agent portal or by written notice; changes take effect the next payment cycle. Banking details are collected and stored for payout purposes only.`)}
<table style="width:100%;border-collapse:collapse;font-size:11px;margin:10px 0;">
  <tr>
    <td style="width:50%;padding:7px 0;">Bank name: ${anchor("/agt_bank/")}______________________________</td>
    <td style="padding:7px 0;">Account type (Checking/Savings): ${anchor("/agt_accttype/")}______________</td>
  </tr>
  <tr>
    <td style="padding:7px 0;">Routing number: ${anchor("/agt_routing/")}______________________________</td>
    <td style="padding:7px 0;">Account number: ${anchor("/agt_acct/")}______________________________</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:7px 0;">Name on account: ${anchor("/agt_acctname/")}_______________________________________________</td>
  </tr>
</table>

<h3 style="font-size:12px;margin:22px 0 6px;color:#121E3E;">AGENT</h3>
<table style="width:100%;border-collapse:collapse;font-size:11px;">
  <tr>
    <td style="width:55%;padding:8px 0;">Signature: ${anchor("/agt_sig/")}________________________</td>
    <td style="padding:8px 0;">Date: ${anchor("/agt_date/")}______________</td>
  </tr>
</table>
<p style="margin:4px 0 0;">Name: ${anchor("/agt_name/")}<b>${agent}</b></p>
<p style="margin:8px 0 0;">Address: ${anchor("/agt_addr/")}_____________________________________________________________________</p>

<h3 style="font-size:12px;margin:26px 0 6px;color:#121E3E;">DELT PAY LLC</h3>
<table style="width:100%;border-collapse:collapse;font-size:11px;">
  <tr>
    <td style="width:55%;padding:8px 0;">Signature: ${anchor("/del_sig/")}________________________</td>
    <td style="padding:8px 0;">Date: ${anchor("/del_date/")}______________</td>
  </tr>
</table>
<p style="margin:4px 0 0;">Name: ${anchor("/del_name/")}________________________ &nbsp;&nbsp; Title: ${anchor("/del_title/")}______________</p>

</body></html>`;
}
