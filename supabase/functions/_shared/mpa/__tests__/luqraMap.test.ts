import { describe, it, expect } from "vitest";
import { LUQRA_AOF_FIELD, mapLuqra } from "../luqraMap.ts";
import { sampleApplication, sampleLuqraPricing } from "./fixtures.ts";

describe("mapLuqra", () => {
  const values = mapLuqra(sampleApplication(), sampleLuqraPricing());

  it("fills business identity", () => {
    expect(values["businessLegalName"]).toBe("Taqueria El Sol LLC");
    expect(values["businessNameDba"]).toBe("El Sol Tacos");
    expect(values["federalTaxId"]).toBe("12-3456789");
    expect(values["businessLocationAddress"]).toBe("812 Congress Ave");
    expect(values["businessLocationCityStateZip"]).toBe("Austin, TX 78701");
    // billing same as location → billing fields left blank
    expect(values["businessBillingAddress"]).toBeUndefined();
    expect(values["isLLC"]).toEqual({ check: true });
    expect(values["isCorporation"]).toBeUndefined();
  });

  it("fans owners out to owner1/owner2 field sets with formatted SSN and short DOB", () => {
    expect(values["owner1Name"]).toBe("Maria Gomez");
    expect(values["owner1Ssn"]).toBe("111-22-3333");
    expect(values["owner1Dob"]).toBe("03/14/85");
    expect(values["owner1CityStateZip"]).toBe("Austin, TX 78704");
    expect(values["isOwner1EquityOwnership"]).toEqual({ check: true });
    expect(values["owner1EquityOwnershipPercentage"]).toBe("60");
    expect(values["owner2Name"]).toBe("Luis Gomez");
    expect(values["owner2Ssn"]).toBe("444-55-6666");
    expect(values["owner3Name"]).toBeUndefined();
  });

  it("maps the card mix including the template's misspelled moto field", () => {
    expect(values["cardPresentPercentage"]).toBe("70");
    expect(values["cardNotPresentPercentage"]).toBe("10");
    expect(values["motoPercenage"]).toBe("0");
    expect(values["internetPercentage"]).toBe("20");
  });

  it("checks seasonal months", () => {
    expect(values["isSeasonalSalesYes"]).toEqual({ check: true });
    expect(values["isClosedMonthsJan"]).toEqual({ check: true });
    expect(values["isClosedMonthsFeb"]).toEqual({ check: true });
    expect(values["isClosedMonthsMar"]).toBeUndefined();
  });

  it("fills banking from the secure blob", () => {
    expect(values["routingNumber1"]).toBe("111000025");
    expect(values["accountNumber1"]).toBe("000123456789");
    expect(values["routingNumber2"]).toBeUndefined();
  });

  it("pre-fills owner 1 as signer and guarantor, leaving dates for DocuSign", () => {
    expect(values["disclosurePrintOwnerName1"]).toBe("Maria Gomez");
    expect(values["guarantorName1"]).toBe("Maria Gomez");
    expect(values["guarantorSsn1"]).toBe("111-22-3333");
    expect(values["ownerName1"]).toBe("Maria Gomez");
    expect(values["disclosureSignatureDate1"]).toBeUndefined();
    expect(values["guarantorSignatureDate1"]).toBeUndefined();
  });

  it("fills pricing including the leading-space AOF field", () => {
    expect(LUQRA_AOF_FIELD).toBe(" aofOccurrenceFee");
    expect(values[LUQRA_AOF_FIELD]).toBe("5.00");
    expect(values["applicationTypeFlatRate"]).toEqual({ check: true });
    expect(values["businessTypeRestaurant"]).toEqual({ check: true });
    expect(values["qualifiedDiscountRatePercentage"]).toBe("2.75");
    expect(values["chargebackFee"]).toBe("25.00");
    expect(values["agentCode"]).toBe("DELT01");
  });

  it("omits pricing fields when no pricing is provided", () => {
    const noPricing = mapLuqra(sampleApplication());
    expect(noPricing["qualifiedDiscountRatePercentage"]).toBeUndefined();
    expect(noPricing["mccCode"]).toBe("5812"); // falls back to profile MCC
  });
});
