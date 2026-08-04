import { describe, it, expect } from 'vitest';
import { SUBMISSION_PIPELINE, BOARDING_CHANNELS } from '../dealSubmissionsStore';
import { activationBonus } from '../agentComp';

describe('submission pipeline', () => {
  it('runs Submitted → Underwriting → Approved → Activated → Paid', () => {
    expect(SUBMISSION_PIPELINE).toEqual([
      'Submitted',
      'Underwriting',
      'Approved',
      'Activated',
      'Paid',
    ]);
  });

  it('boarding channels are the three live processors', () => {
    expect(BOARDING_CHANNELS).toEqual(['Square', 'Luqra', 'Paysafe']);
  });
});

describe('re-banding math (ops confirms actual volume)', () => {
  it('drops the bonus when claimed volume was inflated', () => {
    // Claimed $60K ($600 band) but processed $18K → $250 band.
    expect(activationBonus(60_000, false)).toBe(600);
    expect(activationBonus(18_000, false)).toBe(250);
  });

  it('raises the bonus when the merchant outperforms the estimate', () => {
    expect(activationBonus(8_000, true)).toBe(250);   // $150 band + kicker
    expect(activationBonus(30_000, true)).toBe(500);  // $400 band + kicker
  });
});
