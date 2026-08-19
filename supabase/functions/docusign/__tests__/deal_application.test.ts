import { describe, it, expect } from "vitest";
import { renderDltAppHtml, type DltAppFields } from "../deal_application.ts";

const minimal = (over: Partial<DltAppFields> = {}): DltAppFields => ({
  dateSubmitted: "2026-08-19",
  legalName: "Taqueria El Sol LLC",
  ...over,
});

describe("renderDltAppHtml (Form DLT-APP)", () => {
  it("renders every signature anchor for owner 1 and the rep", () => {
    const html = renderDltAppHtml(minimal());
    for (const a of ["/own1_sig/", "/own1_date/", "/own1_name/", "/rep_sig/", "/rep_date/", "/rep_name/"]) {
      expect(html).toContain(a);
    }
  });

  it("renders all eight sections plus the blank decision box", () => {
    const html = renderDltAppHtml(minimal());
    for (const heading of [
      "SECTION A.", "SECTION B.", "SECTION C.", "SECTION D.",
      "SECTION E.", "SECTION F.", "SECTION G.", "SECTION H.",
      "FOR DELT CAPITAL USE ONLY",
    ]) {
      expect(html).toContain(heading);
    }
    // The decision itself is blank at intake — unchecked boxes only.
    expect(html).toContain("[&nbsp;] Approved&nbsp;&nbsp;[&nbsp;] Declined");
  });

  it("keeps identifiers masked and escapes injected HTML", () => {
    const html = renderDltAppHtml(minimal({
      owner1SsnMasked: "•••-••-1234",
      ein: "••-•••6789",
      legalName: 'Evil <script>alert("x")</script> LLC',
    }));
    expect(html).toContain("•••-••-1234");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    // Full SSNs never appear — the renderer only accepts masked fields.
    expect(html).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });

  it("renders the Section G checklist from actual document presence", () => {
    const html = renderDltAppHtml(minimal({
      attachments: { bankStatements: true, photoId: false, voidedCheck: true, additional: ["Lease.pdf"] },
    }));
    expect(html).toContain("[X] Business Bank Statements");
    expect(html).toContain("[&nbsp;&nbsp;] Government Photo ID");
    expect(html).toContain("[X] Voided Business Check");
    expect(html).toContain("[X] Lease.pdf");
  });

  it("includes the Section A(d) rep-authorization language", () => {
    const html = renderDltAppHtml(minimal());
    expect(html).toContain("express authorization from the merchant");
  });
});
