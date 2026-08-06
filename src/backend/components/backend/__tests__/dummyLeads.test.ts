import { describe, it, expect } from 'vitest';
import { isMetaTestLead } from '../marketingStore';
import { isDummyLead, type Lead } from '../crmStore';

// The Meta test-tool classifier is the gate that keeps dummy submissions
// from being re-imported into the pipeline. It must catch every shape
// Meta's Lead Ads testing tool actually produces — and nothing real.

describe('isMetaTestLead', () => {
  it('catches the angle-bracket placeholder names Meta injects', () => {
    expect(isMetaTestLead({ fullName: '<test lead: dummy data for Capital form>', email: null })).toBe(true);
    expect(isMetaTestLead({ fullName: '<Test Lead: Dummy Data For Processing>', email: null })).toBe(true);
  });

  it('catches test signatures regardless of case', () => {
    expect(isMetaTestLead({ fullName: 'Test Lead: dummy data', email: null })).toBe(true);
    expect(isMetaTestLead({ fullName: 'DUMMY DATA for form', email: null })).toBe(true);
  });

  it("catches Meta's test emails — including test@fb.com, which the old filter missed", () => {
    expect(isMetaTestLead({ fullName: 'John Smith', email: 'test@fb.com' })).toBe(true);
    expect(isMetaTestLead({ fullName: 'John Smith', email: 'test@meta.com' })).toBe(true);
    expect(isMetaTestLead({ fullName: 'John Smith', email: 'Test@FB.com ' })).toBe(true);
  });

  it('never flags a real submission', () => {
    expect(isMetaTestLead({ fullName: 'Maria Gonzalez', email: 'maria@lacocina.com' })).toBe(false);
    expect(isMetaTestLead({ fullName: null, email: null })).toBe(false);
    // "test" appearing inside a real name is not a test signature
    expect(isMetaTestLead({ fullName: 'Protest Leaders LLC', email: 'info@pl.org' })).toBe(false);
  });
});

describe('isDummyLead (manual sweep heuristic)', () => {
  const lead = (businessName: string) => ({ businessName }) as Lead;

  it('is case-insensitive on dummy/test-lead markers', () => {
    expect(isDummyLead(lead('<Test Lead: Dummy Data>'))).toBe(true);
    expect(isDummyLead(lead('Dummy Data For Form'))).toBe(true);
    expect(isDummyLead(lead('Test Lead 123'))).toBe(true);
  });

  it('keeps real businesses', () => {
    expect(isDummyLead(lead('Green Valley Auto Repair'))).toBe(false);
  });
});
