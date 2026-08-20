import { describe, it, expect } from "vitest";
import { runDecisionModel, type ModelInput } from "../decision_model.ts";

// A healthy baseline file that passes every sufficiency gate.
const baseInput: ModelInput = {
  monthlyRevenue: 80_000,
  revenueStdDevPct: 0.1,
  revenueTrend: "stable",
  revenueChange3moPct: 0,
  avgDailyBalance: 25_000,
  minDailyBalance: 8_000,
  nsfCount90d: 0,
  daysSinceLastNsf: 9999,
  depositConcentration: "diversified",
  monthsOfData: 12,
  transactionCount: 900,
  monthlyDebtService: 0,
  detectedDebtPositions: 0,
  debtServiceToRevenuePct: 0,
  requestedAmount: 50_000,
  bankVerified: true,
  identityVerified: true,
  institutionsConnected: 1,
};

const bankGate = (input: ModelInput) =>
  runDecisionModel(input).gates.sufficiency.find((g) => g.code === "bank_verified")!;

describe("bank_verified gate note", () => {
  it("passes with no note when verified", () => {
    const g = bankGate(baseInput);
    expect(g.passed).toBe(true);
    expect(g.value).toBe("yes");
    expect(g.note).toBeUndefined();
  });

  it("carries the reason through when unverified", () => {
    const g = bankGate({
      ...baseInput,
      bankVerified: false,
      bankVerifiedReason: 'Verification not requested — use "Verify ownership"',
    });
    expect(g.passed).toBe(false);
    expect(g.value).toBe("no");
    expect(g.note).toBe('Verification not requested — use "Verify ownership"');
  });

  it("omits the note when unverified with no reason (legacy inputs)", () => {
    const g = bankGate({ ...baseInput, bankVerified: false });
    expect(g.passed).toBe(false);
    expect(g.note).toBeUndefined();
  });

  it("never attaches a stale reason to a passing gate", () => {
    const g = bankGate({ ...baseInput, bankVerified: true, bankVerifiedReason: "auth_failed: X" });
    expect(g.passed).toBe(true);
    expect(g.note).toBeUndefined();
  });
});
