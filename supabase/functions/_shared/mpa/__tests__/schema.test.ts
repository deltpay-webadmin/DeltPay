import { describe, it, expect } from "vitest";
import {
  buildMasks,
  cardMixTotal,
  isAbaRouting,
  isEin,
  isSsn,
  mergeSecure,
  needsCnpSection,
  validateForSubmit,
} from "../schema.ts";
import { sampleApplication } from "./fixtures.ts";

describe("format validators", () => {
  it("accepts 9-digit SSN/EIN in any punctuation", () => {
    expect(isSsn("111-22-3333")).toBe(true);
    expect(isEin("12-3456789")).toBe(true);
    expect(isSsn("12345678")).toBe(false);
    expect(isEin("1234567890")).toBe(false);
  });

  it("validates ABA routing checksums", () => {
    expect(isAbaRouting("111000025")).toBe(true); // Frost/Federal Reserve test number
    expect(isAbaRouting("111000026")).toBe(false);
    expect(isAbaRouting("12345678")).toBe(false);
  });
});

describe("card mix helpers", () => {
  it("totals the four sales-method percentages", () => {
    const { data } = sampleApplication();
    expect(cardMixTotal(data.profile)).toBe(100);
  });

  it("requires CNP section only when keyed/moto/internet volume exists", () => {
    const { data } = sampleApplication();
    expect(needsCnpSection(data.profile)).toBe(true);
    data.profile.pctKeyedCardPresent = 0;
    data.profile.pctInternet = 0;
    data.profile.pctMoto = 0;
    expect(needsCnpSection(data.profile)).toBe(false);
  });
});

describe("validateForSubmit", () => {
  it("passes a complete application", () => {
    expect(validateForSubmit(sampleApplication())).toEqual([]);
  });

  it("requires SSN and EIN", () => {
    const app = sampleApplication();
    app.data.business.ein = "12";
    app.secure.owners[0].ssn = "999";
    const problems = validateForSubmit(app);
    expect(problems).toContain("EIN must be 9 digits");
    expect(problems).toContain("Owner 1: SSN must be 9 digits");
  });

  it("rejects PO Box locations and bad card mixes", () => {
    const app = sampleApplication();
    app.data.locationAddress.line1 = "PO Box 12";
    app.data.profile.pctInternet = 25;
    const problems = validateForSubmit(app);
    expect(problems.some((p) => p.includes("PO Box"))).toBe(true);
    expect(problems).toContain("Card-mix percentages must total exactly 100%");
  });

  it("rejects invalid routing numbers", () => {
    const app = sampleApplication();
    app.secure.bank.routingNumber = "123456789";
    expect(validateForSubmit(app)).toContain("Bank routing number is invalid");
  });
});

describe("buildMasks", () => {
  it("keeps only last-4s and years", () => {
    const { secure } = sampleApplication();
    const masks = buildMasks(secure);
    expect(masks.owners[0]).toEqual({
      ssnLast4: "3333",
      dobYear: "1985",
      dlLast4: "4567",
      hasPassport: false,
    });
    expect(masks.bank).toEqual({ routingLast4: "0025", accountLast4: "6789" });
    const json = JSON.stringify(masks);
    expect(json).not.toContain("111223333");
    expect(json).not.toContain("000123456789");
  });
});

describe("mergeSecure", () => {
  it("keeps existing values when the update leaves fields blank", () => {
    const { secure } = sampleApplication();
    const merged = mergeSecure(secure, {
      owners: [{ ssn: "", dob: "", driversLicenseNumber: "" }, { ssn: "777889999", dob: "", driversLicenseNumber: "" }],
    });
    expect(merged.owners[0].ssn).toBe("111223333");
    expect(merged.owners[1].ssn).toBe("777889999");
    expect(merged.owners[1].dob).toBe("1988-11-02");
    expect(merged.bank.routingNumber).toBe("111000025");
  });

  it("truncates owners when one is removed", () => {
    const { secure } = sampleApplication();
    const merged = mergeSecure(secure, { owners: [{ ssn: "", dob: "", driversLicenseNumber: "" }] });
    expect(merged.owners).toHaveLength(1);
  });
});
