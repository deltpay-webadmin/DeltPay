import { describe, it, expect } from "vitest";
import { buildMasks } from "../schema.ts";
import { squarePacketText } from "../packet.ts";
import { sampleApplication } from "./fixtures.ts";

describe("squarePacketText", () => {
  const { data, secure } = sampleApplication();
  const masks = buildMasks(secure);

  it("masks SSNs and bank numbers by default", () => {
    const text = squarePacketText(data, masks, { includeSensitive: false });
    expect(text).toContain("Taqueria El Sol LLC");
    expect(text).toContain("•••-••-3333");
    expect(text).toContain("•••••6789");
    expect(text).not.toContain("111223333");
    expect(text).not.toContain("000123456789");
  });

  it("includes full values only when explicitly asked", () => {
    const text = squarePacketText(data, masks, { includeSensitive: true, secure });
    expect(text).toContain("111223333");
    expect(text).toContain("000123456789");
    expect(text).toContain("111000025");
  });
});
