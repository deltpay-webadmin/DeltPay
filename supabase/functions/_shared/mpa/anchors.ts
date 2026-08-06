// DocuSign anchor placement for the two MPA templates.
//
// Rather than hand-tuned absolute coordinates, each anchor is positioned
// relative to a known form field's widget rectangle (captured in fill.ts
// before flattening). dx/dy offsets shift from that field to the signature
// line beside it. The offsets below place the sign-here anchor in the
// signature cell to the LEFT of each date field, and the date anchor on the
// date field itself.
//
// NOTE: offsets need one visual tuning pass against the DocuSign sandbox —
// open the sent envelope and nudge dx/dy until the tabs sit on the lines.
// Pure TS constants (no pdf-lib import) so tests can assert the spec.

export interface AnchorSpecEntry {
  /** Existing AcroForm field whose widget rect anchors the position. */
  sourceField: string;
  /** Anchor string to stamp in white ink (DocuSign matches on this). */
  anchor: string;
  dx: number;
  dy: number;
}

export interface AnchorPoint {
  page: number;
  x: number;
  y: number;
  text: string;
}

export const SIG1_ANCHOR = "/mpa_sig1/";
export const DATE1_ANCHOR = "/mpa_date1/";

// Luqra: merchant/owner 1 signs Section 4 (disclosures), Section 9
// (personal guaranty), and Section 13 (acknowledgements). Each row is
// [print name | signature | date]; the date field's rect is the reference.
export const LUQRA_ANCHOR_SPEC: AnchorSpecEntry[] = [
  { sourceField: "disclosureSignatureDate1", anchor: SIG1_ANCHOR, dx: -250, dy: 2 },
  { sourceField: "disclosureSignatureDate1", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
  { sourceField: "guarantorSignatureDate1", anchor: SIG1_ANCHOR, dx: -250, dy: 2 },
  { sourceField: "guarantorSignatureDate1", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
  { sourceField: "ownerSignatureDate1", anchor: SIG1_ANCHOR, dx: -250, dy: 2 },
  { sourceField: "ownerSignatureDate1", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
];

// Paysafe: owner 1 signs the Section I certification ("Print Name / Title /
// Signature / Date" row), the Section XII resolution (Authorized Signer #1),
// and the Section XIII personal guaranty (Guarantor #1). Date field names in
// this template are generic (Date, Date_1, Date_3) — verified against the
// extracted field inventory; re-check after any template revision.
export const PAYSAFE_ANCHOR_SPEC: AnchorSpecEntry[] = [
  { sourceField: "Date", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
  { sourceField: "Date", anchor: SIG1_ANCHOR, dx: -170, dy: 2 },
  { sourceField: "Date_1", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
  { sourceField: "Date_1", anchor: SIG1_ANCHOR, dx: -170, dy: 2 },
  { sourceField: "Date_3", anchor: DATE1_ANCHOR, dx: 4, dy: 2 },
  { sourceField: "Date_3", anchor: SIG1_ANCHOR, dx: -170, dy: 2 },
];

export function anchorSpecFor(channel: "Luqra" | "Paysafe"): AnchorSpecEntry[] {
  return channel === "Luqra" ? LUQRA_ANCHOR_SPEC : PAYSAFE_ANCHOR_SPEC;
}
