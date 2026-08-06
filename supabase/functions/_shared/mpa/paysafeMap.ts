// Paysafe (Citizens Bank) Merchant Payment Card Application — field mapping.
// Field names were extracted from the fillable PDF template
// (Paysafe_Citizens_0524CFG, 355 AcroForm fields; pages 1-4 are the app).
//
// Conventions in this template: checkboxes export "/On" (e.g.
// "OwnershipType:LLC"), boolean pairs are separate ":True"/":False"
// checkboxes, and several fee fields are dropdowns (/Ch) — those are
// emitted as {select} so fill.ts can match an existing option.

import type { FullApplication, PaysafePricing } from "./schema.ts";
import { needsCnpSection } from "./schema.ts";
import type { PdfFieldValues } from "./pdfValues.ts";

const fmtSsn = (ssn: string) => {
  const d = ssn.replace(/\D/g, "");
  return d.length === 9 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : ssn;
};
const fmtEin = (ein: string) => {
  const d = ein.replace(/\D/g, "");
  return d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2)}` : ein;
};
// Paysafe DOB: MM/DD/YYYY.
const fmtDob = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : iso;
};
// "Date Business Started (Mo/Yr)".
const fmtMoYr = (yyyyMm: string) => {
  const m = /^(\d{4})-(\d{2})$/.exec(yyyyMm);
  return m ? `${m[2]}/${m[1]}` : yyyyMm;
};
const pct = (n: number) => (n || n === 0 ? String(n) : "");

const MONTH_NAMES: Record<string, string> = {
  jan: "January", feb: "February", mar: "March", apr: "April",
  may: "May", jun: "June", jul: "July", aug: "August",
  sep: "September", oct: "October", nov: "November", dec: "December",
};

export function mapPaysafe(app: FullApplication, pricing?: PaysafePricing): PdfFieldValues {
  const { data, secure } = app;
  const v: PdfFieldValues = {};
  const set = (name: string, value: string) => {
    if (value && value.trim()) v[name] = value.trim();
  };
  const check = (name: string, on: boolean) => {
    if (on) v[name] = { check: true };
  };

  // ── Section I: business information ──
  const b = data.business;
  check("ApplicationType:1", true); // New Account
  set("LegalBusinessName", b.legalName);
  set("DoingBusinessAs", b.dba || b.legalName);
  set("FederalTaxID", fmtEin(b.ein));
  set("MainWebsite", b.website);
  set("MainEmailAddress", b.email);
  set("MainPhone", b.phone);
  set("CustomerServicePhone", b.customerServicePhone || b.phone);
  set("ContactFirstName", b.contactFirstName);
  set("ContactLastName", b.contactLastName);
  set("DateBusinessStarted", fmtMoYr(b.establishedDate));
  set("NumberOfLocations", b.numberOfLocations || "1");

  check("OwnershipType:SoleProprietorship", b.ownershipType === "sole_prop");
  check("OwnershipType:Partnership", b.ownershipType === "partnership");
  check("OwnershipType:Corporation", b.ownershipType === "corporation");
  check("OwnershipType:LLC", b.ownershipType === "llc");
  check("OwnershipType:NonProfit", b.ownershipType === "non_profit");
  check("OwnershipType:Government", b.ownershipType === "government");

  // Physical location; mailing/corporate address only when different.
  const loc = data.locationAddress;
  set("LocationAddress", loc.line1);
  set("LocationCity", loc.city);
  set("LocationState", loc.state);
  set("LocationZip", loc.zip);
  const bill = data.billingAddress;
  if (bill.sameAsLocation) {
    // "Same as Corporate Address" checkbox is nm_xxx1 in this template.
    check("nm_xxx1", true);
    set("MailingAddress", loc.line1);
    set("MailingAddressCity", loc.city);
    set("MailingAddressState", loc.state);
    set("MailingAddressZip", loc.zip);
  } else {
    set("MailingAddress", bill.line1);
    set("MailingAddressCity", bill.city);
    set("MailingAddressState", bill.state);
    set("MailingAddressZip", bill.zip);
  }

  // ── Business type / profile ──
  const p = data.profile;
  set("ProductsType", p.productsDescription);
  set("MccSic", (pricing && pricing.mccSic) || p.mcc);
  // Merchant type: derive the common cases from the card mix.
  const internetDominant = (Number(p.pctInternet) || 0) >= 50;
  const motoDominant = (Number(p.pctMoto) || 0) >= 50;
  check("MerchantType:Internet", internetDominant);
  check("MerchantType:MOTO", motoDominant && !internetDominant);
  check("MerchantType:Retail", !internetDominant && !motoDominant);

  // Sales method (must = 100%): swiped → RetailSwipe, keyed-CP → RetailKeyed,
  // MOTO → MailOrder, internet → Internet.
  set("RetailSwipePercentage", pct(p.pctCardPresent));
  set("RetailKeyedPercentage", pct(p.pctKeyedCardPresent));
  set("MailOrderPercentage", pct(p.pctMoto));
  set("InternetPercentage", pct(p.pctInternet));
  set("InternationalCardTransactionPercentage", pct(p.pctInternational));

  check("HasApplicantAcceptedCreditCardsBefore", p.acceptedCardsBefore);

  check("CustomerReturnPolicy:None", p.refundPolicy === "none");
  check("CustomerReturnPolicy:Refundwithin7Days", p.refundPolicy === "7_days");
  check("CustomerReturnPolicy:Refundwithin30Days", p.refundPolicy === "30_days");
  check("CustomerReturnPolicy:ExchangeOnly", p.refundPolicy === "exchange_only");
  check("CustomerReturnPolicy:Other", p.refundPolicy === "other");
  set("CustomerReturnPolicyComment", p.refundPolicy === "other" ? p.refundPolicyOther : "");

  check("IsSeasonalMerchant:True", p.seasonal);
  check("IsSeasonalMerchant:False", !p.seasonal);
  if (p.seasonal && p.closedMonths.length > 0) {
    set("SeasonalMonthStart", MONTH_NAMES[p.closedMonths[0]] ?? "");
    set("SeasonalMonthEnd", MONTH_NAMES[p.closedMonths[p.closedMonths.length - 1]] ?? "");
  }

  const c = data.cnp;
  if (needsCnpSection(p)) {
    const deliveryDaysText: Record<string, string> = {
      "0-7": "7", "8-14": "14", "15-30": "30", "30+": "30+",
    };
    set("ProductDeliveryNumberOfDays", deliveryDaysText[c.deliveryDays] ?? "");
    set("PercentDepositOrFuture", pct(Number(c.pctDepositRequired)));
    set("PercentDepositRequired", pct(Number(c.pctDepositRequired)));
    check("ProductOwner:Merchant", c.productOwner === "merchant");
    check("ProductOwner:Vendor", c.productOwner === "vendor");
    set("FulfillmentHouseName", c.fulfillmentHouse);
    set("ThirdPartyDataName", c.thirdPartiesWithCardData);
    check("MethodsOfMarketingType:MagazineOrCatalog", c.advertisingMethods.includes("catalog"));
    check("MethodsOfMarketingType:TVorRadio", c.advertisingMethods.includes("tv_radio"));
    check("MethodsOfMarketingType:DirectMail", c.advertisingMethods.includes("direct_mail"));
    check("MethodsOfMarketingType:Internet", c.advertisingMethods.includes("internet"));
  }

  // ── Section IV: processing volume ──
  set("MonthlyBankcardVolume", p.monthlyVolume);
  set("MonthlyAmexVolume", p.monthlyAmexVolume);
  set("MonthlyAverageTicket", p.averageTicket);
  set("MonthlyHighTicket", p.highestTicket);

  // ── Section VII: ownership (principals #1-4, controller) ──
  data.owners.slice(0, 4).forEach((o, i) => {
    const n = i + 1;
    const s = secure.owners[i];
    set(`PrincipalFirstName#${n}`, o.firstName);
    set(`PrincipalLastName#${n}`, o.lastName);
    set(`PrincipalTitle#${n}`, o.title);
    set(`PrincipalOwnershipPercentage#${n}`, pct(Number(o.equityPct)));
    set(`PrincipalEmail#${n}`, o.email);
    set(`PrincipalCellPhone#${n}`, o.cellPhone);
    set(`PrincipalResidentialAddress#${n}`, o.homeAddress);
    set(`PrincipalCity#${n}`, o.city);
    set(`PrincipalState#${n}`, o.state);
    set(`PrincipalZip#${n}`, o.zip);
    set(`PrincipalDriversLicenseState#${n}`, o.driversLicenseState);
    if (s) {
      set(`PrincipalSocialSecurityNumber#${n}`, fmtSsn(s.ssn));
      set(`PrincipalDateOfBirth#${n}`, fmtDob(s.dob));
      set(`PrincipalDriversLicenseNumber#${n}`, s.driversLicenseNumber);
    }
  });
  // Controller block: the designated controller (or owner 1 as fallback).
  const controllerIdx = Math.max(0, data.owners.findIndex((o) => o.isController));
  const ctrl = data.owners[controllerIdx];
  const ctrlSecure = secure.owners[controllerIdx];
  if (ctrl) {
    set("ControlPositionFirstName", ctrl.firstName);
    set("ControlPositionLastName", ctrl.lastName);
    set("ControlPositionTitle", ctrl.title);
    set("ControlPositionOwnershipPercent", pct(Number(ctrl.equityPct)));
    set("ControlPositionEmail", ctrl.email);
    set("ControllingPositionCellPhoneNumber", ctrl.cellPhone);
    set("ControlPositionAddress", ctrl.homeAddress);
    set("ControlPositionCity", ctrl.city);
    set("ControlPositionState", ctrl.state);
    set("ControlPositionZip", ctrl.zip);
    set("ControllingPositionDriverLicenseState", ctrl.driversLicenseState);
    if (ctrlSecure) {
      set("ControlPositionSocialSecurityNumber", fmtSsn(ctrlSecure.ssn));
      set("ControlPositionDateOfBirth", fmtDob(ctrlSecure.dob));
      set("ControllingPositionDriversLicenseNumber", ctrlSecure.driversLicenseNumber);
    }
  }

  // ── Section XI: banking ──
  set("BankName", data.bank.bankName);
  set("TransRoutingNumber", secure.bank.routingNumber);
  set("DdaNumber", secure.bank.accountNumber);
  check("AccountType:Checking", data.bank.accountType !== "savings");
  if (secure.bank2) {
    set("AlternateBankName", data.bank2?.bankName ?? "");
    set("AlternateTransRoutingNumber", secure.bank2.routingNumber);
    set("AlternateBankAccountNumber", secure.bank2.accountNumber);
    check("AlternateAccountType:Checking", true);
  } else {
    // "Same as Bank Account #1" checkbox
    check("Check Box7", true);
  }
  check("DepositTimeFrame:Standard", true);

  // ── Signature blocks: owner 1 signs everywhere (v1 single-signer).
  // Dates are left blank for DocuSign date tabs.
  const owner1 = data.owners[0];
  if (owner1) {
    const name1 = `${owner1.firstName} ${owner1.lastName}`.trim();
    set("Print Name", name1); // Section I certification
    set("Title", owner1.title);
    set("Print Authorized Signer 1 Name", name1); // Section XII resolution
    set("Title_8", owner1.title);
    set("Guarantor 1 Name", name1); // Section XIII personal guaranty
    check("Guarantor1", true);
    check("MPASigner#1", true);
  }

  // ── Section X: rates & fees (admin pricing) ──
  if (pricing) {
    check("Interchange Plus", pricing.structure === "interchange_plus");
    check("TieredPricingTierType", pricing.structure === "tiered");
    check("ERRPricingTierType", pricing.structure === "err");
    check("FlatRateFeeOption", pricing.structure === "flat_rate");
    check("DiscountMethod:Daily", pricing.discountMethod === "daily");
    check("DiscountMethod:Monthly", pricing.discountMethod === "monthly");
    set("CreditCardDiscountQualifiedRate", pricing.creditQualifiedRatePct);
    set("OfflineDebitDiscountQualifiedRate", pricing.debitQualifiedRatePct);
    set("VisaMasterCardDiscoverAmericanExpressTransactionFee", pricing.transactionFee);
    set("AmericanExpressOptBlueCreditCardDiscountQualifiedRate", pricing.amexQualifiedRatePct);
    set("AMEX Transaction Fee", pricing.amexTransactionFee);
    set("ErrRate", pricing.errRatePct);
    set("InterchangePassthroughCreditCardAdditionalBasisPoints", pricing.interchangeCreditBps);
    set("AvsFee", pricing.avsFee);
    set("BatchHeaderFee", pricing.batchHeaderFee);
    set("MonthlyMinimumDiscountFee", pricing.monthlyMinimumFee);
    set("CustomerServiceStatementFee", pricing.monthlyServiceFee);
    set("AnnualFee", pricing.annualFee);
    set("RegulatoryFee", pricing.regulatoryFee);
    set("ApplicationFee", pricing.applicationFee);
    set("PCINonActionFee", pricing.pciNonComplianceFee);
    if (pricing.chargebackFee) v["ChargebacksFee"] = { select: pricing.chargebackFee };
    if (pricing.retrievalFee) v["RetrievalRequestFee"] = { select: pricing.retrievalFee };
    if (pricing.earlyTerminationBeforeYear1) {
      v["EarlyTerminationFee_BeforeFirstYear"] = { select: pricing.earlyTerminationBeforeYear1 };
    }
    if (pricing.earlyTerminationAfterYear1) {
      v["EarlyTerminationFee_AfterFirstYear"] = { select: pricing.earlyTerminationAfterYear1 };
    }
    set("SalesName", pricing.salesName);
    set("SalesOfficeNumber", pricing.salesOfficeNumber);
  }

  return v;
}
