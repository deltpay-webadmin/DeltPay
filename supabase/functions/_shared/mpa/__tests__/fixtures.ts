import type { ApplicationData, FullApplication, LuqraPricing, PaysafePricing, SecureData } from "../schema.ts";
import { emptyApplicationData, emptyOwner } from "../schema.ts";

export function sampleApplication(): FullApplication {
  const data: ApplicationData = emptyApplicationData();
  data.business = {
    legalName: "Taqueria El Sol LLC",
    dba: "El Sol Tacos",
    ein: "123456789",
    ownershipType: "llc",
    taxExempt: false,
    establishedDate: "2019-05",
    stateIncorporated: "TX",
    numberOfLocations: "1",
    phone: "5125550100",
    email: "maria@elsoltacos.com",
    website: "https://elsoltacos.com",
    customerServicePhone: "5125550101",
    customerServiceEmail: "help@elsoltacos.com",
    contactFirstName: "Maria",
    contactLastName: "Gomez",
  };
  data.locationAddress = { line1: "812 Congress Ave", city: "Austin", state: "TX", zip: "78701" };
  data.billingAddress = { sameAsLocation: true, line1: "", city: "", state: "", zip: "" };
  data.profile = {
    ...data.profile,
    productsDescription: "Restaurant — tacos and beverages",
    mcc: "5812",
    monthlyVolume: "45000",
    monthlyAmexVolume: "5000",
    averageTicket: "28",
    highestTicket: "400",
    pctCardPresent: 70,
    pctKeyedCardPresent: 10,
    pctMoto: 0,
    pctInternet: 20,
    pctB2b: 0,
    pctInternational: 1,
    acceptedCardsBefore: true,
    refundPolicy: "30_days",
    refundPolicyOther: "",
    seasonal: true,
    closedMonths: ["jan", "feb"],
  };
  data.cnp = {
    ...data.cnp,
    deliveryDays: "0-7",
    productOwner: "merchant",
    pctDepositRequired: 0,
    pctPaidUpfront: "advance",
    shippingMethod: "other",
    shippingMethodOther: "Local delivery",
    advertisingMethods: ["internet", "direct_mail"],
    geographySold: "Austin metro",
  };
  data.owners = [
    {
      ...emptyOwner(),
      firstName: "Maria",
      lastName: "Gomez",
      title: "Managing Member",
      equityPct: 60,
      isController: true,
      email: "maria@elsoltacos.com",
      cellPhone: "5125550111",
      homeAddress: "4501 Oak Hill Dr",
      city: "Austin",
      state: "TX",
      zip: "78704",
      driversLicenseState: "TX",
    },
    {
      ...emptyOwner(),
      firstName: "Luis",
      lastName: "Gomez",
      title: "Member",
      equityPct: 40,
      isController: false,
      email: "luis@elsoltacos.com",
      cellPhone: "5125550112",
      homeAddress: "88 Barton Springs Rd",
      city: "Austin",
      state: "TX",
      zip: "78704",
      driversLicenseState: "TX",
    },
  ];
  data.bank = { bankName: "Frost Bank", accountType: "checking" };
  data.bank2 = null;
  data.attestation = { agreedAt: "2026-08-06T12:00:00Z", typedName: "Maria Gomez" };

  const secure: SecureData = {
    owners: [
      { ssn: "111223333", dob: "1985-03-14", driversLicenseNumber: "TX1234567" },
      { ssn: "444556666", dob: "1988-11-02", driversLicenseNumber: "TX7654321" },
    ],
    // Valid ABA checksum: 111000025
    bank: { routingNumber: "111000025", accountNumber: "000123456789" },
    bank2: null,
  };
  return { data, secure };
}

export function sampleLuqraPricing(): LuqraPricing {
  return {
    applicationType: "flat_rate",
    discount: "daily",
    businessType: "restaurant",
    qualifiedRatePct: "2.75",
    qualifiedItemFee: "0.10",
    midQualifiedRatePct: "",
    midQualifiedItemFee: "",
    nonQualifiedRatePct: "",
    nonQualifiedItemFee: "",
    amexQualifiedRatePct: "2.90",
    amexQualifiedItemFee: "0.10",
    pinDebitRatePct: "",
    pinDebitItemFee: "",
    batchFee: "0.25",
    chargebackFee: "25.00",
    retrievalFee: "15.00",
    monthlyMinimumFee: "25.00",
    annualFee: "99.00",
    regulatoryFee: "4.95",
    monthlyServiceFee: "10.00",
    aofOccurrenceFee: "5.00",
    earlyDeconversionFee: "495.00",
    pciAnnualFee: "119.00",
    pciMonthlyFee: "",
    mccCode: "5812",
    agentName: "Carlos",
    agentCode: "DELT01",
  };
}

export function samplePaysafePricing(): PaysafePricing {
  return {
    structure: "flat_rate",
    discountMethod: "daily",
    creditQualifiedRatePct: "2.75",
    debitQualifiedRatePct: "2.75",
    transactionFee: "0.10",
    amexQualifiedRatePct: "2.90",
    amexTransactionFee: "0.10",
    errRatePct: "",
    interchangeCreditBps: "",
    avsFee: "0.05",
    batchHeaderFee: "0.25",
    monthlyMinimumFee: "25.00",
    monthlyServiceFee: "10.00",
    annualFee: "99.00",
    regulatoryFee: "4.95",
    applicationFee: "0",
    chargebackFee: "$25.00",
    retrievalFee: "$15.00",
    earlyTerminationBeforeYear1: "$495",
    earlyTerminationAfterYear1: "$295",
    pciNonComplianceFee: "19.95",
    mccSic: "5812",
    salesName: "Carlos",
    salesOfficeNumber: "DELT",
  };
}
