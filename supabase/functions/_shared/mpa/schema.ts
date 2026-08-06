// Unified merchant application domain model. This is the superset of what
// the Luqra (Evolve) and Paysafe (Citizens) MPA PDFs ask for, so one filled
// application can be boarded to either processor (or copied into the
// Square/OrderOut portal). Pure TypeScript — no Deno/npm imports — so the
// Vite frontend and vitest can share it with the edge functions.

// ── Sensitive vs plain split ─────────────────────────────────────────────
// SecureData (SSNs, DOBs, license/passport numbers, bank account numbers)
// is encrypted app-side into merchant_applications.secure and never returned
// to any client. Everything in ApplicationData is stored as plain jsonb.

export type OwnershipType =
  | "sole_prop"
  | "partnership"
  | "corporation"
  | "llc"
  | "non_profit"
  | "government";

export type RefundPolicy = "none" | "30_days" | "7_days" | "exchange_only" | "other";

export const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;
export type Month = (typeof MONTHS)[number];

export interface Address {
  line1: string;
  city: string;
  state: string;
  zip: string;
}

export interface Owner {
  firstName: string;
  lastName: string;
  title: string;
  equityPct: number;
  isController: boolean;
  email: string;
  cellPhone: string;
  homeAddress: string;
  city: string;
  state: string;
  zip: string;
  driversLicenseState: string;
}

export interface ApplicationData {
  business: {
    legalName: string;
    dba: string;
    ein: string; // 9 digits, required
    ownershipType: OwnershipType | "";
    taxExempt: boolean;
    establishedDate: string; // YYYY-MM
    stateIncorporated: string;
    numberOfLocations: string;
    phone: string;
    email: string;
    website: string;
    customerServicePhone: string;
    customerServiceEmail: string;
    contactFirstName: string;
    contactLastName: string;
  };
  locationAddress: Address;
  billingAddress: Address & { sameAsLocation: boolean };
  profile: {
    productsDescription: string;
    mcc: string;
    monthlyVolume: string; // USD
    monthlyAmexVolume: string;
    averageTicket: string;
    highestTicket: string;
    pctCardPresent: number; // swiped/EMV
    pctKeyedCardPresent: number;
    pctMoto: number;
    pctInternet: number; // the four must total 100
    pctB2b: number;
    pctInternational: number;
    acceptedCardsBefore: boolean;
    refundPolicy: RefundPolicy | "";
    refundPolicyOther: string;
    seasonal: boolean;
    closedMonths: Month[];
  };
  cnp: {
    deliveryDays: "0-7" | "8-14" | "15-30" | "30+" | "";
    pctDepositRequired: number;
    pctPaidUpfront: "advance" | "delivery" | "";
    incrementalPayments: string;
    productOwner: "merchant" | "vendor" | "";
    fulfillmentHouse: string;
    shoppingCart: string;
    thirdPartiesWithCardData: string;
    shippingMethod: "fedex" | "ups" | "usps" | "other" | "";
    shippingMethodOther: string;
    advertisingMethods: Array<"catalog" | "tv_radio" | "direct_mail" | "internet" | "other">;
    advertisingOther: string;
    warrantyProvider: "merchant" | "manufacturer" | "other" | "";
    warrantyOther: string;
    geographySold: string;
    productPurchaseAddress: string;
    callCenter: string;
    chargebackSystem: string;
  };
  owners: Owner[]; // 1..4 (Paysafe caps at 4 principals; Luqra takes 5)
  bank: { bankName: string; accountType: "checking" | "savings" | "" };
  bank2: { bankName: string } | null;
  attestation: { agreedAt: string | null; typedName: string };
}

export interface SecureOwner {
  ssn: string; // 9 digits
  dob: string; // YYYY-MM-DD
  driversLicenseNumber: string;
  passportNumber?: string;
}

export interface SecureData {
  owners: SecureOwner[];
  bank: { routingNumber: string; accountNumber: string };
  bank2: { routingNumber: string; accountNumber: string } | null;
}

export type FullApplication = { data: ApplicationData; secure: SecureData };

// ── Pricing (admin-entered at boarding) ──────────────────────────────────

export interface LuqraPricing {
  applicationType: "tiered" | "flat_rate" | "cash_discount" | "interchange" | "err" | "cpvcnp" | "";
  discount: "daily" | "monthly" | "";
  businessType: "retail" | "restaurant" | "internet" | "moto" | "";
  qualifiedRatePct: string;
  qualifiedItemFee: string;
  midQualifiedRatePct: string;
  midQualifiedItemFee: string;
  nonQualifiedRatePct: string;
  nonQualifiedItemFee: string;
  amexQualifiedRatePct: string;
  amexQualifiedItemFee: string;
  pinDebitRatePct: string;
  pinDebitItemFee: string;
  batchFee: string;
  chargebackFee: string;
  retrievalFee: string;
  monthlyMinimumFee: string;
  annualFee: string;
  regulatoryFee: string;
  monthlyServiceFee: string; // "Additional Services / month"
  aofOccurrenceFee: string;
  earlyDeconversionFee: string;
  pciAnnualFee: string;
  pciMonthlyFee: string;
  mccCode: string;
  agentName: string;
  agentCode: string;
}

export interface PaysafePricing {
  structure: "interchange_plus" | "tiered" | "err" | "flat_rate" | "";
  discountMethod: "daily" | "monthly" | "";
  creditQualifiedRatePct: string;
  debitQualifiedRatePct: string;
  transactionFee: string; // V/MC/D/Amex per-transaction
  amexQualifiedRatePct: string;
  amexTransactionFee: string;
  errRatePct: string;
  interchangeCreditBps: string;
  avsFee: string;
  batchHeaderFee: string;
  monthlyMinimumFee: string;
  monthlyServiceFee: string; // Customer Service/Statement fee
  annualFee: string;
  regulatoryFee: string;
  applicationFee: string;
  chargebackFee: string; // dropdown on the PDF
  retrievalFee: string; // dropdown on the PDF
  earlyTerminationBeforeYear1: string; // dropdown
  earlyTerminationAfterYear1: string; // dropdown
  pciNonComplianceFee: string;
  mccSic: string;
  salesName: string;
  salesOfficeNumber: string;
}

export type ProcessorChannel = "Luqra" | "Paysafe";

export interface PricingBundle {
  luqra?: LuqraPricing;
  paysafe?: PaysafePricing;
}

// ── Masks (safe display of sensitive fields) ─────────────────────────────

export interface Masks {
  owners: Array<{ ssnLast4: string; dobYear: string; dlLast4: string; hasPassport: boolean }>;
  bank: { routingLast4: string; accountLast4: string } | null;
  bank2: { routingLast4: string; accountLast4: string } | null;
}

const last4 = (s: string) => (s ? s.replace(/\D/g, "").slice(-4) : "");

export function buildMasks(secure: SecureData): Masks {
  return {
    owners: (secure.owners ?? []).map((o) => ({
      ssnLast4: last4(o.ssn),
      dobYear: (o.dob ?? "").slice(0, 4),
      dlLast4: last4(o.driversLicenseNumber),
      hasPassport: Boolean(o.passportNumber),
    })),
    bank: secure.bank
      ? { routingLast4: last4(secure.bank.routingNumber), accountLast4: last4(secure.bank.accountNumber) }
      : null,
    bank2: secure.bank2
      ? { routingLast4: last4(secure.bank2.routingNumber), accountLast4: last4(secure.bank2.accountNumber) }
      : null,
  };
}

// ── Validation ───────────────────────────────────────────────────────────

export const isSsn = (s: string) => /^\d{9}$/.test(s.replace(/\D/g, ""));
export const isEin = (s: string) => /^\d{9}$/.test(s.replace(/\D/g, ""));

/** ABA routing number checksum (9 digits, weights 3-7-1). */
export function isAbaRouting(s: string): boolean {
  const d = s.replace(/\D/g, "");
  if (!/^\d{9}$/.test(d)) return false;
  const w = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  const sum = d.split("").reduce((acc, ch, i) => acc + Number(ch) * w[i], 0);
  return sum % 10 === 0;
}

export function cardMixTotal(p: ApplicationData["profile"]): number {
  return (
    (Number(p.pctCardPresent) || 0) +
    (Number(p.pctKeyedCardPresent) || 0) +
    (Number(p.pctMoto) || 0) +
    (Number(p.pctInternet) || 0)
  );
}

export function needsCnpSection(p: ApplicationData["profile"]): boolean {
  return (
    (Number(p.pctKeyedCardPresent) || 0) + (Number(p.pctMoto) || 0) + (Number(p.pctInternet) || 0) > 0
  );
}

/**
 * Full server-side validation before an application can be submitted.
 * Returns a list of human-readable problems; empty list means valid.
 */
export function validateForSubmit(app: FullApplication): string[] {
  const problems: string[] = [];
  const { data, secure } = app;
  const b = data.business;

  if (!b.legalName.trim()) problems.push("Legal business name is required");
  if (!isEin(b.ein)) problems.push("EIN must be 9 digits");
  if (!b.ownershipType) problems.push("Ownership type is required");
  if (!b.phone.trim()) problems.push("Business phone is required");
  if (!b.email.trim()) problems.push("Contact email is required");
  if (!b.contactFirstName.trim() || !b.contactLastName.trim()) problems.push("Contact name is required");

  const loc = data.locationAddress;
  if (!loc.line1.trim() || !loc.city.trim() || !loc.state.trim() || !loc.zip.trim()) {
    problems.push("Business location address is incomplete");
  }
  if (/p\.?\s*o\.?\s*box/i.test(loc.line1)) {
    problems.push("Location address cannot be a PO Box (both processors require a physical address)");
  }

  const p = data.profile;
  if (!p.productsDescription.trim()) problems.push("Description of products/services is required");
  if (!p.monthlyVolume.trim()) problems.push("Monthly card volume is required");
  if (!p.averageTicket.trim()) problems.push("Average ticket is required");
  if (!p.highestTicket.trim()) problems.push("Highest ticket is required");
  if (cardMixTotal(p) !== 100) problems.push("Card-mix percentages must total exactly 100%");
  if (!p.refundPolicy) problems.push("Refund policy is required");
  if (p.refundPolicy === "other" && !p.refundPolicyOther.trim()) {
    problems.push("Describe the refund policy");
  }
  if (p.seasonal && p.closedMonths.length === 0) problems.push("Select the months the business is closed");

  if (data.owners.length < 1) problems.push("At least one owner is required");
  if (data.owners.length > 4) problems.push("At most 4 owners are supported");
  if (secure.owners.length !== data.owners.length) {
    problems.push("Owner identity details (SSN/DOB) are incomplete");
  }
  let equityTotal = 0;
  data.owners.forEach((o, i) => {
    const n = i + 1;
    if (!o.firstName.trim() || !o.lastName.trim()) problems.push(`Owner ${n}: name is required`);
    if (!o.title.trim()) problems.push(`Owner ${n}: title is required`);
    if (!o.cellPhone.trim()) problems.push(`Owner ${n}: cell phone is required`);
    if (!o.homeAddress.trim() || !o.city.trim() || !o.state.trim() || !o.zip.trim()) {
      problems.push(`Owner ${n}: home address is incomplete`);
    }
    equityTotal += Number(o.equityPct) || 0;
    const s = secure.owners[i];
    if (!s || !isSsn(s.ssn)) problems.push(`Owner ${n}: SSN must be 9 digits`);
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s.dob)) problems.push(`Owner ${n}: date of birth is required`);
  });
  if (equityTotal > 100) problems.push("Total ownership percentage cannot exceed 100%");
  if (data.owners.length > 0 && !data.owners.some((o) => o.isController || (Number(o.equityPct) || 0) >= 25)) {
    problems.push("At least one owner must hold 25%+ equity or be marked as the controller");
  }

  if (!data.bank.bankName.trim()) problems.push("Bank name is required");
  if (!isAbaRouting(secure.bank?.routingNumber ?? "")) problems.push("Bank routing number is invalid");
  if (!(secure.bank?.accountNumber ?? "").replace(/\D/g, "")) problems.push("Bank account number is required");
  if (data.bank2 && !isAbaRouting(secure.bank2?.routingNumber ?? "")) {
    problems.push("Second bank routing number is invalid");
  }

  if (needsCnpSection(p)) {
    if (!data.cnp.deliveryDays) problems.push("Delivery timeframe is required for card-not-present business");
    if (!data.cnp.productOwner) problems.push("Product ownership is required for card-not-present business");
  }

  if (!data.attestation.typedName.trim()) problems.push("Typed signature name is required");

  return problems;
}

// ── Empty scaffolds (shared by wizard + edge function) ───────────────────

export function emptyOwner(): Owner {
  return {
    firstName: "", lastName: "", title: "", equityPct: 0, isController: false,
    email: "", cellPhone: "", homeAddress: "", city: "", state: "", zip: "",
    driversLicenseState: "",
  };
}

export function emptyApplicationData(): ApplicationData {
  return {
    business: {
      legalName: "", dba: "", ein: "", ownershipType: "", taxExempt: false,
      establishedDate: "", stateIncorporated: "", numberOfLocations: "1",
      phone: "", email: "", website: "", customerServicePhone: "",
      customerServiceEmail: "", contactFirstName: "", contactLastName: "",
    },
    locationAddress: { line1: "", city: "", state: "", zip: "" },
    billingAddress: { sameAsLocation: true, line1: "", city: "", state: "", zip: "" },
    profile: {
      productsDescription: "", mcc: "", monthlyVolume: "", monthlyAmexVolume: "",
      averageTicket: "", highestTicket: "",
      pctCardPresent: 100, pctKeyedCardPresent: 0, pctMoto: 0, pctInternet: 0,
      pctB2b: 0, pctInternational: 0, acceptedCardsBefore: false,
      refundPolicy: "", refundPolicyOther: "", seasonal: false, closedMonths: [],
    },
    cnp: {
      deliveryDays: "", pctDepositRequired: 0, pctPaidUpfront: "",
      incrementalPayments: "", productOwner: "", fulfillmentHouse: "",
      shoppingCart: "", thirdPartiesWithCardData: "", shippingMethod: "",
      shippingMethodOther: "", advertisingMethods: [], advertisingOther: "",
      warrantyProvider: "", warrantyOther: "", geographySold: "",
      productPurchaseAddress: "", callCenter: "", chargebackSystem: "",
    },
    owners: [emptyOwner()],
    bank: { bankName: "", accountType: "checking" },
    bank2: null,
    attestation: { agreedAt: null, typedName: "" },
  };
}

export function emptySecureData(): SecureData {
  return {
    owners: [{ ssn: "", dob: "", driversLicenseNumber: "" }],
    bank: { routingNumber: "", accountNumber: "" },
    bank2: null,
  };
}

/** Deep-merge a partial secure update over the existing blob contents. */
export function mergeSecure(existing: SecureData, update: Partial<SecureData>): SecureData {
  const merged: SecureData = {
    owners: existing.owners?.slice() ?? [],
    bank: { ...existing.bank },
    bank2: existing.bank2 ? { ...existing.bank2 } : null,
  };
  if (update.owners) {
    update.owners.forEach((o, i) => {
      if (!o) return;
      const prev = merged.owners[i] ?? { ssn: "", dob: "", driversLicenseNumber: "" };
      merged.owners[i] = {
        ssn: o.ssn !== undefined && o.ssn !== "" ? o.ssn.replace(/\D/g, "") : prev.ssn,
        dob: o.dob !== undefined && o.dob !== "" ? o.dob : prev.dob,
        driversLicenseNumber:
          o.driversLicenseNumber !== undefined && o.driversLicenseNumber !== ""
            ? o.driversLicenseNumber
            : prev.driversLicenseNumber,
        passportNumber: o.passportNumber !== undefined && o.passportNumber !== "" ? o.passportNumber : prev.passportNumber,
      };
    });
    // The client always sends the owners array sized to the current owner
    // count (unchanged slots may be empty objects), so truncation here is
    // how owner removal propagates.
    merged.owners.length = update.owners.length;
  }
  if (update.bank) {
    merged.bank = {
      routingNumber: update.bank.routingNumber?.replace(/\D/g, "") || merged.bank.routingNumber,
      accountNumber: update.bank.accountNumber?.replace(/\D/g, "") || merged.bank.accountNumber,
    };
  }
  if (update.bank2 !== undefined) {
    if (update.bank2 === null) {
      merged.bank2 = null;
    } else {
      const prev = merged.bank2 ?? { routingNumber: "", accountNumber: "" };
      merged.bank2 = {
        routingNumber: update.bank2.routingNumber?.replace(/\D/g, "") || prev.routingNumber,
        accountNumber: update.bank2.accountNumber?.replace(/\D/g, "") || prev.accountNumber,
      };
    }
  }
  return merged;
}
