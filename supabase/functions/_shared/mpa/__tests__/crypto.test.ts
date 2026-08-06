import { describe, it, expect } from "vitest";
import { decryptJson, encryptJson, newToken, sha256Hex } from "../crypto.ts";

// 32 zero bytes, base64 — test key only.
const KEY = Buffer.from(new Uint8Array(32)).toString("base64");
const OTHER_KEY = Buffer.from(new Uint8Array(32).fill(1)).toString("base64");

describe("mpa crypto", () => {
  it("round-trips JSON through AES-256-GCM", async () => {
    const secret = { owners: [{ ssn: "111223333" }], bank: { accountNumber: "987654" } };
    const blob = await encryptJson(secret, KEY);
    expect(blob.v).toBe(1);
    expect(blob.ct).not.toContain("111223333");
    const roundTripped = await decryptJson<typeof secret>(blob, KEY);
    expect(roundTripped).toEqual(secret);
  });

  it("uses a fresh IV per write", async () => {
    const a = await encryptJson({ x: 1 }, KEY);
    const b = await encryptJson({ x: 1 }, KEY);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it("fails with the wrong key", async () => {
    const blob = await encryptJson({ x: 1 }, KEY);
    await expect(decryptJson(blob, OTHER_KEY)).rejects.toThrow();
  });

  it("rejects malformed keys", async () => {
    await expect(encryptJson({ x: 1 }, "dG9vc2hvcnQ=")).rejects.toThrow(/32 bytes/);
  });

  it("hashes tokens deterministically", async () => {
    const t = newToken();
    expect(t.length).toBeGreaterThanOrEqual(43); // 32 bytes base64url
    expect(t).not.toMatch(/[+/=]/);
    expect(await sha256Hex(t)).toBe(await sha256Hex(t));
    expect(await sha256Hex(t)).toHaveLength(64);
  });
});
