// Luqra (Evolve Bank & Trust) Merchant Application — field mapping.
// Field names were extracted from the fillable PDF template
// (Fillable_Luqra_Application_02.2026.pdf, 295 AcroForm fields).

import type { FullApplication, LuqraPricing, Month } from "./schema.ts";
import { needsCnpSection } from "./schema.ts";
import type { PdfFieldValues } from "./pdfValues.ts";

// The template's occurrence-fee field name literally starts with a space —
// " aofOccurrenceFee" — do NOT "fix" it or the fill silently misses.
export const LUQRA_AOF_FIELD = " aofOccurrenceFee";

const fmtSsn = (ssn: string) => {
  const d = ssn.replace(/\D/g, "");
  return d.length === 9 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : ssn;
};
const fmtEin = (ein: string) => {
  const d = ein.replace(/\D/g, "");
  return d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2)}` : ein;
};
// Luqra asks for DOB as MM/DD/YY.
const fmtDobShort = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[2]}/${m[3]}/${m[1].slice(2)}` : iso;
};
const cityStateZip = (city: string, state: string, zip: string) =>
  [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
const pct = (n: number) => (n || n === 0 ? String(n) : "");

const CLOSED_MONTH_FIELDS: Record<Month, string> = {
  jan: "isClosedMonthsJan", feb: "isClosedMonthsFeb", mar: "isClosedMonthsMar",
  apr: "isClosedMonthsApr", may: "isClosedMonthsMay", jun: "isClosedMonthsJun",
  jul: "isClosedMonthsJul", aug: "isClosedMonthsAug", sep: "isClosedMonthsSep",
  oct: "isClosedMonthsOct", nov: "isClosedMonthsNov", dec: "isClosedMonthsDec",
};

export function mapLuqra(app: FullApplication, pricing?: LuqraPricing): PdfFieldValues {
  const { data, secure } = app;
  const v: PdfFieldValues = {};
  const set = (name: string, value: string) => {
    if (value && value.trim()) v[name] = value.trim();
  };
  const check = (name: string, on: boolean) => {
    if (on) v[name] = { check: true };
  };

  // ── Section 1: business information ──
  const b = data.business;
  set("businessLegalName", b.legalName);
  set("businessNameDba", b.dba || b.legalName);
  set("federalTaxId", fmtEin(b.ein));
  set("contactName", `${b.contactFirstName} ${b.contactLastName}`.trim());
  set("website", b.website);
  set("customerServiceEmail", b.customerServiceEmail || b.email);
  set("businessPhone", b.phone);
  set("businessContactPhone", b.customerServicePhone || b.phone);
  set("businessContactEmail", b.email);
  const loc = data.locationAddress;
  set("businessLocationAddress", loc.line1);
  set("businessLocationCityStateZip", cityStateZip(loc.city, loc.state, loc.zip));
  const bill = data.billingAddress;
  if (!bill.sameAsLocation) {
    set("businessBillingAddress", bill.line1);
    set("businessBillingCityStateZip", cityStateZip(bill.city, bill.state, bill.zip));
  }

  // ── Section 2: ownership type + owners ──
  check("isSoleProp", b.ownershipType === "sole_prop");
  check("isPartnership", b.ownershipType === "partnership");
  check("isCorporation", b.ownershipType === "corporation");
  check("isLLC", b.ownershipType === "llc");
  check("isGovernment", b.ownershipType === "government");
  check("isTaxExempt", b.ownershipType === "non_profit" || b.taxExempt);

  data.owners.slice(0, 5).forEach((o, i) => {
    const n = i + 1;
    const s = secure.owners[i];
    set(`owner${n}Name`, `${o.firstName} ${o.lastName}`.trim());
    set(`owner${n}Title`, o.title);
    set(`owner${n}HomeAddress`, o.homeAddress);
    set(`owner${n}CityStateZip`, cityStateZip(o.city, o.state, o.zip));
    set(`owner${n}CellPhone`, o.cellPhone);
    set(`owner${n}DriversLicenseState`, o.driversLicenseState);
    if (s) {
      set(`owner${n}Ssn`, fmtSsn(s.ssn));
      set(`owner${n}Dob`, fmtDobShort(s.dob));
      set(`owner${n}DriversLicense`, s.driversLicenseNumber);
      set(`owner${n}PassportNumber`, s.passportNumber ?? "");
    }
    if (o.isController && !(Number(o.equityPct) > 0)) {
      check(`isOwner${n}Controller`, true);
    } else if (Number(o.equityPct) > 0) {
      check(`isOwner${n}EquityOwnership`, true);
      set(`owner${n}EquityOwnershipPercentage`, pct(Number(o.equityPct)));
    }
  });

  // ── Section 3: business profile ──
  const p = data.profile;
  set("businessEstablishedDate", b.establishedDate);
  set("businessStateIncorporated", b.stateIncorporated);
  set("monthlyVolumeVisaAmount", p.monthlyVolume);
  set("monthlyVolumeAmexAmount", p.monthlyAmexVolume);
  set("averageTicketAmountVisa", p.averageTicket);
  set("highestTicketAmountVisa", p.highestTicket);
  check("isNeverAcceptedCards", !p.acceptedCardsBefore);
  set("cardPresentPercentage", pct(p.pctCardPresent));
  set("cardNotPresentPercentage", pct(p.pctKeyedCardPresent));
  // Template typo: the MOTO percentage field is named "motoPercenage".
  set("motoPercenage", pct(p.pctMoto));
  set("internetPercentage", pct(p.pctInternet));
  set("b2bPercent", pct(p.pctB2b));
  set("internationalCards", pct(p.pctInternational));
  set("descriptionProductServices", p.productsDescription);
  check("isNoRefund", p.refundPolicy === "none");
  check("isRefund30Days", p.refundPolicy === "30_days" || p.refundPolicy === "7_days");
  check("isMerchandiseExchangeOnly", p.refundPolicy === "exchange_only");
  check("isOtherRefundPolicy", p.refundPolicy === "other");
  set("otherRefundPolicyExplanation", p.refundPolicy === "other" ? p.refundPolicyOther : "");
  check("isSeasonalSalesYes", p.seasonal);
  check("isSeasonalSalesNo", !p.seasonal);
  if (p.seasonal) {
    for (const m of p.closedMonths) check(CLOSED_MONTH_FIELDS[m], true);
  }

  // ── Section 7: advertising, sales and delivery (CNP detail) ──
  const c = data.cnp;
  check("isRefundPolicyWrittenYes", p.refundPolicy !== "" && p.refundPolicy !== "none");
  check("isRefundPolicyWrittenNo", p.refundPolicy === "none");
  // How does the customer purchase: derive from the card mix.
  check("customerPurchaseInPerson", (Number(p.pctCardPresent) || 0) + (Number(p.pctKeyedCardPresent) || 0) > 0);
  check("customerPurchaseByPhone", (Number(p.pctMoto) || 0) > 0);
  check("customerPurchaseByMail", (Number(p.pctMoto) || 0) > 0);
  check("customerPurchaseOnline", (Number(p.pctInternet) || 0) > 0);
  if (needsCnpSection(p)) {
    check("deliveryTime07Days", c.deliveryDays === "0-7");
    check("deliveryTime814Days", c.deliveryDays === "8-14");
    check("deliveryTime1530Days", c.deliveryDays === "15-30");
    check("deliveryTime30MoreDays", c.deliveryDays === "30+");
    check("merchantOwnsProduct", c.productOwner === "merchant");
    check("vendorOwnsProduct", c.productOwner === "vendor");
    check("isCustomerRequiredDepositYes", (Number(c.pctDepositRequired) || 0) > 0);
    check("isCustomerRequiredDepositNo", !(Number(c.pctDepositRequired) > 0));
    if (Number(c.pctDepositRequired) > 0) set("depositPercentage", pct(Number(c.pctDepositRequired)));
    check("isPaidAdvanced", c.pctPaidUpfront === "advance");
    check("isPaidDelivery", c.pctPaidUpfront === "delivery");
    set("fulfillmentCenterNameAddress", c.fulfillmentHouse);
    set("shoppingCart", c.shoppingCart);
    set("partiesAccessCardholderData", c.thirdPartiesWithCardData);
    set("geographySold", c.geographySold);
    set("nameAddressProductPurchased", c.productPurchaseAddress);
    set("callCenter", c.callCenter);
    set("chargebackManagementSystem", c.chargebackSystem);
    check("shippingFedex", c.shippingMethod === "fedex");
    check("shippingUps", c.shippingMethod === "ups");
    check("shippingUsps", c.shippingMethod === "usps");
    check("shippingOther", c.shippingMethod === "other");
    set("shippingOtherField", c.shippingMethod === "other" ? c.shippingMethodOther : "");
    check("adveteriseCatalog", c.advertisingMethods.includes("catalog")); // template typo: "adveterise"
    check("advertiseTvRadio", c.advertisingMethods.includes("tv_radio"));
    check("advertiseDirectMail", c.advertisingMethods.includes("direct_mail"));
    check("advertiseInternet", c.advertisingMethods.includes("internet"));
    check("advertiseOther", c.advertisingMethods.includes("other"));
    set("isAdvertiseOtherField", c.advertisingMethods.includes("other") ? c.advertisingOther : "");
    check("warrantyMerchant", c.warrantyProvider === "merchant");
    check("warrantyManufacturer", c.warrantyProvider === "manufacturer");
    check("warrantyOther", c.warrantyProvider === "other");
    set("warrantyOtherField", c.warrantyProvider === "other" ? c.warrantyOther : "");
  }

  // ── Section 8: banking ──
  set("routingNumber1", secure.bank.routingNumber);
  set("accountNumber1", secure.bank.accountNumber);
  if (secure.bank2) {
    set("routingNumber2", secure.bank2.routingNumber);
    set("accountNumber2", secure.bank2.accountNumber);
  }

  // ── Signature blocks: owner 1 is the signer/guarantor everywhere.
  // Dates are left blank for DocuSign date tabs.
  const owner1 = data.owners[0];
  const s1 = secure.owners[0];
  if (owner1) {
    const name1 = `${owner1.firstName} ${owner1.lastName}`.trim();
    set("disclosurePrintOwnerName1", name1); // Section 4
    set("guarantorName1", name1); // Section 9
    if (s1) set("guarantorSsn1", fmtSsn(s1.ssn));
    set("ownerName1", name1); // Section 13
    set("merchantBusinessName", b.dba || b.legalName); // page 2/3 header
  }

  // ── Sections 10-11: schedule of fees (admin pricing) ──
  if (pricing) {
    check("applicationTypeTiered", pricing.applicationType === "tiered");
    check("applicationTypeFlatRate", pricing.applicationType === "flat_rate");
    check("applicationTypeCashDiscount", pricing.applicationType === "cash_discount");
    check("applicationTypeInterchange", pricing.applicationType === "interchange");
    check("applicationTypeErr", pricing.applicationType === "err");
    check("applicationTypeCnpVCp", pricing.applicationType === "cpvcnp");
    check("discountDaily", pricing.discount === "daily");
    check("discountMonthly", pricing.discount === "monthly");
    check("businessTypeRetail", pricing.businessType === "retail");
    check("businessTypeRestaurant", pricing.businessType === "restaurant");
    check("businessTypeInternet", pricing.businessType === "internet");
    check("businessTypeMailTelephone", pricing.businessType === "moto");
    set("qualifiedDiscountRatePercentage", pricing.qualifiedRatePct);
    set("qualifiedTransactionFeeAmount", pricing.qualifiedItemFee);
    set("midQualifiedDiscountRatePercentage", pricing.midQualifiedRatePct);
    set("midQualifiedTransactionFeeAmount", pricing.midQualifiedItemFee);
    set("nonQualifiedDiscountRatePercentage", pricing.nonQualifiedRatePct);
    set("nonQualifiedTransactionFeeAmount", pricing.nonQualifiedItemFee);
    set("amexQualifiedDiscountRatePercentage", pricing.amexQualifiedRatePct);
    set("amexQualifiedTransactionFeeAmount", pricing.amexQualifiedItemFee);
    set("debitPinBasedDiscountRatePercentage", pricing.pinDebitRatePct);
    set("debitPinBasedTransactionFeeAmount", pricing.pinDebitItemFee);
    set("batchFee", pricing.batchFee);
    set("chargebackFee", pricing.chargebackFee);
    set("retrievalFee", pricing.retrievalFee);
    set("monthlyMinimumFee", pricing.monthlyMinimumFee);
    set("annualFee", pricing.annualFee);
    set("regulatoryFee", pricing.regulatoryFee);
    set("additionalServicesFee", pricing.monthlyServiceFee);
    set(LUQRA_AOF_FIELD, pricing.aofOccurrenceFee);
    set("earlyDeconversionFee", pricing.earlyDeconversionFee);
    if (pricing.pciAnnualFee) {
      check("isPCIAnnualFeeExcludeBreach", true);
      set("pciFeeYearExclude", pricing.pciAnnualFee);
    }
    if (pricing.pciMonthlyFee) {
      check("isPCIMonthlyFeeExcludeBreach", true);
      set("pciFeeMonthExclude", pricing.pciMonthlyFee);
    }
    set("mccCode", pricing.mccCode || p.mcc);
    set("agentName", pricing.agentName);
    set("agentCode", pricing.agentCode);
  } else {
    set("mccCode", p.mcc);
  }

  return v;
}
