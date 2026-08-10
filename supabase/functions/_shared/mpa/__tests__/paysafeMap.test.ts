import { describe, it, expect } from "vitest";
import { mapPaysafe } from "../paysafeMap.ts";
import { sampleApplication, samplePaysafePricing } from "./fixtures.ts";

describe("mapPaysafe", () => {
  const values = mapPaysafe(sampleApplication(), samplePaysafePricing());

  it("fills business identity with Paysafe naming", () => {
    expect(values["ApplicationType:1"]).toEqual({ check: true }); // New Account
    expect(values["LegalBusinessName"]).toBe("Taqueria El Sol LLC");
    expect(values["DoingBusinessAs"]).toBe("El Sol Tacos");
    expect(values["FederalTaxID"]).toBe("12-3456789");
    expect(values["OwnershipType:LLC"]).toEqual({ check: true });
    expect(values["OwnershipType:Corporation"]).toBeUndefined();
    expect(values["DateBusinessStarted"]).toBe("05/2019");
    expect(values["LocationAddress"]).toBe("812 Congress Ave");
    expect(values["LocationState"]).toBe("TX");
    // same-as-location mirrors into the mailing/corporate block
    expect(values["MailingAddress"]).toBe("812 Congress Ave");
  });

  it("maps the four-way sales method split", () => {
    expect(values["RetailSwipePercentage"]).toBe("70");
    expect(values["RetailKeyedPercentage"]).toBe("10");
    expect(values["MailOrderPercentage"]).toBe("0");
    expect(values["InternetPercentage"]).toBe("20");
  });

  it("uses True/False paired checkboxes", () => {
    expect(values["IsSeasonalMerchant:True"]).toEqual({ check: true });
    expect(values["IsSeasonalMerchant:False"]).toBeUndefined();
    expect(values["HasApplicantAcceptedCreditCardsBefore"]).toEqual({ check: true });
    expect(values["SeasonalMonthStart"]).toBe("January");
    expect(values["SeasonalMonthEnd"]).toBe("February");
  });

  it("fans owners into Principal#n fields with full DOB", () => {
    expect(values["PrincipalFirstName#1"]).toBe("Maria");
    expect(values["PrincipalLastName#1"]).toBe("Gomez");
    expect(values["PrincipalSocialSecurityNumber#1"]).toBe("111-22-3333");
    expect(values["PrincipalDateOfBirth#1"]).toBe("03/14/1985");
    expect(values["PrincipalOwnershipPercentage#2"]).toBe("40");
    expect(values["PrincipalFirstName#3"]).toBeUndefined();
  });

  it("mirrors the controller into the ControlPosition block", () => {
    expect(values["ControlPositionFirstName"]).toBe("Maria");
    expect(values["ControlPositionSocialSecurityNumber"]).toBe("111-22-3333");
    expect(values["ControlPositionTitle"]).toBe("Managing Member");
  });

  it("fills banking and defaults deposit timing", () => {
    expect(values["BankName"]).toBe("Frost Bank");
    expect(values["TransRoutingNumber"]).toBe("111000025");
    expect(values["DdaNumber"]).toBe("000123456789");
    expect(values["AccountType:Checking"]).toEqual({ check: true });
    expect(values["Check Box7"]).toEqual({ check: true }); // same-as-account-1
    expect(values["DepositTimeFrame:Standard"]).toEqual({ check: true });
  });

  it("pre-fills owner 1 as signer and guarantor", () => {
    expect(values["Print Name"]).toBe("Maria Gomez");
    expect(values["Print Authorized Signer 1 Name"]).toBe("Maria Gomez");
    expect(values["Guarantor 1 Name"]).toBe("Maria Gomez");
    expect(values["Guarantor1"]).toEqual({ check: true });
    expect(values["MPASigner#1"]).toEqual({ check: true });
    expect(values["Date"]).toBeUndefined(); // dates left for DocuSign tabs
  });

  it("fills pricing, emitting dropdown fees as selects", () => {
    expect(values["FlatRateFeeOption"]).toEqual({ check: true });
    expect(values["CreditCardDiscountQualifiedRate"]).toBe("2.75");
    expect(values["ChargebacksFee"]).toEqual({ select: "$25.00" });
    expect(values["RetrievalRequestFee"]).toEqual({ select: "$15.00" });
    expect(values["EarlyTerminationFee_BeforeFirstYear"]).toEqual({ select: "$495" });
    expect(values["SalesName"]).toBe("Carlos");
  });
});
