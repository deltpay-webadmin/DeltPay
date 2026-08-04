/**
 * Shared document-to-payload helpers for the AI extraction edge functions
 * (analyze-statement, extract-deal-doc). Renders PDFs to JPEGs client-side
 * (pdfjs) so the cheap Nebius vision provider can read them; images pass
 * through as base64.
 */

export interface PageImage {
  mediaType: string;
  dataBase64: string;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      resolve(url.slice(url.indexOf(',') + 1)); // strip the data: prefix
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Render a PDF's pages to JPEGs in the browser. Boarding docs and statements
 * are short; 8 pages covers them with headroom.
 */
export async function pdfToImages(file: File, maxPages = 8): Promise<PageImage[]> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = Math.min(doc.numPages, maxPages);
  const out: PageImage[] = [];
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 }); // ~1200x1600 for letter pages
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering unavailable');
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    out.push({ mediaType: 'image/jpeg', dataBase64: dataUrl.slice(dataUrl.indexOf(',') + 1) });
  }
  return out;
}

/**
 * Build the extraction payload for a file: pre-rendered page set for PDFs,
 * single base64 file otherwise.
 */
export async function fileToExtractionPayload(
  file: File,
): Promise<{ images?: PageImage[]; mediaType?: string; dataBase64?: string }> {
  if (file.type === 'application/pdf') return { images: await pdfToImages(file) };
  return { mediaType: file.type || 'image/png', dataBase64: await fileToBase64(file) };
}
