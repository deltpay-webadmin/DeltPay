// Input masks and format helpers for the MPA wizard.

export const digitsOnly = (s: string) => s.replace(/\D/g, '');

export function formatSsnInput(s: string): string {
  const d = digitsOnly(s).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function formatEinInput(s: string): string {
  const d = digitsOnly(s).slice(0, 9);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

export function formatPhoneInput(s: string): string {
  const d = digitsOnly(s).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const formatRoutingInput = (s: string) => digitsOnly(s).slice(0, 9);
export const formatAccountInput = (s: string) => digitsOnly(s).slice(0, 17);

export function clampPct(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** File → base64 (no data: prefix) for upload-doc. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.includes(',') ? result.slice(result.indexOf(',') + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
