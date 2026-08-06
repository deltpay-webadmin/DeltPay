// App-layer encryption for the sensitive subset of a merchant application
// (owner SSNs/DOBs/license numbers, bank routing/account). Uses WebCrypto
// AES-256-GCM so the same code runs in Deno edge functions and under vitest
// (Node >= 20). The key is the APP_ENCRYPTION_KEY function secret: 32 random
// bytes, base64 (`openssl rand -base64 32`).
//
// The whole sensitive object is one blob — owners are an array and every
// consumer (PDF fill, boarding packet) needs the fields together, so
// per-field ciphertext would only add moving parts. A fresh random IV is
// generated on every write.

export interface EncryptedBlob {
  v: 1;
  iv: string; // base64, 12 bytes
  ct: string; // base64 ciphertext + GCM tag
}

function b64encode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64decode(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(keyB64: string): Promise<CryptoKey> {
  const raw = b64decode(keyB64.trim());
  if (raw.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes (base64)");
  return crypto.subtle.importKey("raw", raw.buffer as ArrayBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptJson(obj: unknown, keyB64: string): Promise<EncryptedBlob> {
  const key = await importKey(keyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    plaintext.buffer as ArrayBuffer,
  );
  return { v: 1, iv: b64encode(iv), ct: b64encode(new Uint8Array(ct)) };
}

export async function decryptJson<T>(blob: EncryptedBlob, keyB64: string): Promise<T> {
  if (!blob || blob.v !== 1) throw new Error("Unsupported encrypted blob version");
  const key = await importKey(keyB64);
  const iv = b64decode(blob.iv);
  const ct = b64decode(blob.ct);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ct.buffer as ArrayBuffer,
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

/** Hash a public-link token for storage; only the hash ever touches the DB. */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 256-bit random token, base64url (fits in a link path segment). */
export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return b64encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
