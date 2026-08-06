// Mapper output: exact PDF AcroForm field name → what to put in it.
// Strings fill text fields; {check: true} ticks a checkbox; {select: v}
// picks a dropdown option (fill.ts matches loosely and records a warning
// when the option doesn't exist rather than failing the whole fill).

export type PdfFieldValue = string | { check: true } | { select: string };
export type PdfFieldValues = Record<string, PdfFieldValue>;
