// AcroForm fill for the processor MPA templates (Deno-only: imports pdf-lib).
//
// The fill NEVER throws on a missing or mismatched field — the templates are
// third-party documents that may be revised — it records a warning instead
// and keeps going, so the admin sees "3 fields didn't land" rather than a
// dead button. Signature-line coordinates are captured from the widgets
// while the form still exists, then the form is flattened (values become
// page content) and white-ink DocuSign anchor strings are stamped at those
// coordinates for sign-here/date tabs.

import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb,
} from "npm:pdf-lib@1.17.1";
import type { PdfFieldValues } from "./pdfValues.ts";
import type { AnchorSpecEntry, AnchorPoint } from "./anchors.ts";

export interface FillOptions {
  /** Signature anchor spec; omit for a clean preview with no anchors. */
  anchorSpec?: AnchorSpecEntry[];
}

export interface FillMpaResult {
  pdf: Uint8Array;
  warnings: string[];
}

export async function fillMpaPdf(
  templateBytes: Uint8Array,
  values: PdfFieldValues,
  opts: FillOptions = {},
): Promise<FillMpaResult> {
  const warnings: string[] = [];
  // The Paysafe template ships AES-encrypted with an owner password only;
  // the canonical fix is a decrypted template in the mpa-templates bucket,
  // but ignoreEncryption keeps a stale upload from hard-failing the fill.
  const doc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const form = doc.getForm();

  for (const [name, value] of Object.entries(values)) {
    let field;
    try {
      field = form.getField(name);
    } catch {
      warnings.push(`Field not in template: "${name}"`);
      continue;
    }
    try {
      if (typeof value === "string") {
        if (field instanceof PDFTextField) {
          field.setText(value);
        } else if (field instanceof PDFDropdown) {
          selectDropdown(field, value, name, warnings);
        } else {
          warnings.push(`Field "${name}" is not a text field; skipped`);
        }
      } else if ("check" in value) {
        if (field instanceof PDFCheckBox) {
          field.check();
        } else if (field instanceof PDFRadioGroup) {
          const options = field.getOptions();
          if (options.length > 0) field.select(options[0]);
          else warnings.push(`Radio group "${name}" has no options; skipped`);
        } else {
          warnings.push(`Field "${name}" is not a checkbox; skipped`);
        }
      } else if ("select" in value) {
        if (field instanceof PDFDropdown) {
          selectDropdown(field, value.select, name, warnings);
        } else if (field instanceof PDFTextField) {
          field.setText(value.select);
        } else {
          warnings.push(`Field "${name}" is not a dropdown; skipped`);
        }
      }
    } catch (err) {
      warnings.push(`Field "${name}" fill failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Capture signature-line coordinates from the live widgets before
  // flattening destroys them.
  const anchorPoints: AnchorPoint[] = [];
  for (const entry of opts.anchorSpec ?? []) {
    try {
      const field = form.getField(entry.sourceField);
      const widget = field.acroField.getWidgets()[0];
      if (!widget) {
        warnings.push(`Anchor source "${entry.sourceField}" has no widget`);
        continue;
      }
      const rect = widget.getRectangle();
      const pageRef = widget.P();
      let pageIndex = doc.getPages().findIndex((p) => p.ref === pageRef);
      if (pageIndex < 0) {
        // Some templates omit /P on widgets — find the page whose annots
        // contain this widget.
        pageIndex = doc.getPages().findIndex((p) => {
          const annots = p.node.Annots();
          if (!annots) return false;
          for (let i = 0; i < annots.size(); i++) {
            if (annots.get(i) === widget.dict) return true;
          }
          return false;
        });
      }
      if (pageIndex < 0) {
        warnings.push(`Anchor source "${entry.sourceField}" page not found`);
        continue;
      }
      anchorPoints.push({
        page: pageIndex,
        x: rect.x + entry.dx,
        y: rect.y + entry.dy,
        text: entry.anchor,
      });
    } catch {
      warnings.push(`Anchor source field missing: "${entry.sourceField}"`);
    }
  }

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  try {
    form.updateFieldAppearances(helvetica);
  } catch (err) {
    warnings.push(`Appearance refresh failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  try {
    form.flatten();
  } catch (err) {
    // A single un-flattenable field shouldn't kill the document; DocuSign
    // renders remaining live fields read-only anyway.
    warnings.push(`Flatten failed (continuing unflattened): ${err instanceof Error ? err.message : String(err)}`);
  }

  const pages = doc.getPages();
  for (const point of anchorPoints) {
    const page = pages[point.page];
    if (!page) continue;
    // White ink: invisible to the reader, visible to DocuSign anchor search.
    page.drawText(point.text, {
      x: point.x,
      y: point.y,
      size: 7,
      font: helvetica,
      color: rgb(1, 1, 1),
    });
  }

  const pdf = await doc.save();
  return { pdf, warnings };
}

function selectDropdown(field: PDFDropdown, wanted: string, name: string, warnings: string[]) {
  const options = field.getOptions();
  const exact = options.find((o) => o === wanted);
  if (exact) {
    field.select(exact);
    return;
  }
  // Loose match: compare digits only ("$25.00" vs "25").
  const digits = (s: string) => s.replace(/[^0-9.]/g, "");
  const loose = options.find((o) => digits(o) !== "" && digits(o) === digits(wanted));
  if (loose) {
    field.select(loose);
    warnings.push(`Dropdown "${name}": used option "${loose}" for "${wanted}"`);
    return;
  }
  warnings.push(`Dropdown "${name}": no option matches "${wanted}" (options: ${options.join(", ")})`);
}
