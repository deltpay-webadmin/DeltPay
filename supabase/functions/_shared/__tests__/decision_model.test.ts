import { describe, it, expect } from "vitest";
import {
  MODEL_VERSION,
  POLICY,
  runDecisionModel,
  type ModelInput,
} from "../decision_model.ts";

/** A healthy prospect: strong balances, clean NSF history, growing revenue. */
const healthy: ModelInput = {
  monthlyRevenue: 60_000,
  revenueStdDevPct: 0.08,
  revenueTrend: "growing",
  revenueChange3moPct: 0.10,
  avgDailyBalance: 20_000,
  minDailyBalance: 5_000,
  nsfCount90d: 0,
  daysSinceLastNsf: 9999,
  depositConcentration: "diversified",
  monthsOfData: 12,
  transactionCount: 800,
  monthlyDebtService: 0,
  detectedDebtPositions: 0,
  debtServiceToRevenuePct: 0,
  requestedAmount: 0,
  bankVerified: true,
  identityVerified: true,
  institutionsConnected: 1,
};

describe("fallback starter offer (model v1.1.0)", () => {
  it("stamps the bumped model version", () => {
    expect(MODEL_VERSION).toBe("1.1.0");
    expect(runDecisionModel(healthy).model_version).toBe("1.1.0");
  });

  it("healthy prospect: real offer, no fallback", () => {
    const out = runDecisionModel(healthy);
    expect(out.decision).toBe("PRE_APPROVE");
    expect(out.offer).not.toBeNull();
    expect(out.fallback_offer).toBeNull();
  });

  it("hard-rule decline with decent cash flow still carries a non-binding starter offer", () => {
    const out = runDecisionModel({ ...healthy, nsfCount90d: 22, daysSinceLastNsf: 2 });
    expect(out.decision).toBe("DECLINE");
    expect(out.decision_label).toBe("Decline — hard rule failure");
    expect(out.offer).toBeNull();
    const fb = out.fallback_offer;
    expect(fb).not.toBeNull();
    expect(fb!.non_binding).toBe(true);
    expect(fb!.basis).toBe("tier4_params");
    expect(fb!.floor).toBe(POLICY.FALLBACK_OFFER_FLOOR);
    expect(fb!.amount).toBeGreaterThanOrEqual(POLICY.FALLBACK_OFFER_FLOOR);
    expect(out.explanation.some(l => l.includes("NON-BINDING"))).toBe(true);
  });

  it("zero revenue: declined and even the fallback floors out", () => {
    const out = runDecisionModel({ ...healthy, monthlyRevenue: 0 });
    expect(out.decision).toBe("DECLINE");
    expect(out.offer).toBeNull();
    expect(out.fallback_offer).toBeNull();
  });

  it("insufficient data never gets a fallback offer", () => {
    const out = runDecisionModel({ ...healthy, monthsOfData: 1, transactionCount: 10 });
    expect(out.decision).toBe("INSUFFICIENT_DATA");
    expect(out.offer).toBeNull();
    expect(out.fallback_offer).toBeNull();
  });

  it("no-affordable-offer decline sizes the fallback from the assigned tier", () => {
    // Tiny ADB caps the real offer below the $5,000 floor via the balance
    // buffer, but a sub-$5,000 starter offer still clears the stress test.
    const out = runDecisionModel({
      ...healthy,
      monthlyRevenue: 9_000,
      revenueStdDevPct: 0.18,
      revenueTrend: "flat",
      depositConcentration: "moderate",
      avgDailyBalance: 200,
      minDailyBalance: 50,
    });
    expect(out.decision).toBe("DECLINE");
    expect(out.decision_label).toBe("Decline — no affordable offer");
    expect(out.tier).not.toBeNull();
    const fb = out.fallback_offer;
    expect(fb).not.toBeNull();
    expect(fb!.basis).toBe("assigned_tier");
    expect(fb!.amount).toBeGreaterThanOrEqual(POLICY.FALLBACK_OFFER_FLOOR);
    expect(fb!.amount).toBeLessThan(POLICY.OFFER_FLOOR);
  });

  it("stays deterministic with the fallback path in play", () => {
    const input = { ...healthy, nsfCount90d: 22, daysSinceLastNsf: 2 };
    expect(JSON.stringify(runDecisionModel(input))).toBe(JSON.stringify(runDecisionModel(input)));
  });
});
