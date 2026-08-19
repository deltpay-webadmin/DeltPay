import { describe, it, expect } from "vitest";
import {
  LUQRA_ANCHOR_SPEC,
  PAYSAFE_ANCHOR_SPEC,
  SIG1_ANCHOR,
  DATE1_ANCHOR,
  SIG2_ANCHOR,
  DATE2_ANCHOR,
} from "../anchors.ts";

describe("MPA anchor specs", () => {
  it("stamps the merchant's three signature stops on both templates", () => {
    for (const spec of [LUQRA_ANCHOR_SPEC, PAYSAFE_ANCHOR_SPEC]) {
      expect(spec.filter((e) => e.anchor === SIG1_ANCHOR)).toHaveLength(3);
      expect(spec.filter((e) => e.anchor === DATE1_ANCHOR)).toHaveLength(3);
    }
  });

  it("stamps the rep's signature stop on both templates", () => {
    const luqraRep = LUQRA_ANCHOR_SPEC.filter((e) => e.anchor === SIG2_ANCHOR);
    expect(luqraRep).toHaveLength(1);
    expect(luqraRep[0].sourceField).toBe("agentSignatureDate");
    expect(LUQRA_ANCHOR_SPEC.filter((e) => e.anchor === DATE2_ANCHOR)).toHaveLength(1);

    const paysafeRep = PAYSAFE_ANCHOR_SPEC.filter((e) => e.anchor === SIG2_ANCHOR);
    expect(paysafeRep).toHaveLength(1);
    expect(paysafeRep[0].sourceField).toBe("nm_xxxMerchantSiteSurveyDate");
    expect(PAYSAFE_ANCHOR_SPEC.filter((e) => e.anchor === DATE2_ANCHOR)).toHaveLength(1);
  });
});
