import { describe, it, expect } from 'vitest';
import { extraProductTags, leadWantsCapital } from '../crmStore';

describe('extraProductTags (TYPE column dedupe)', () => {
  it('hides the Capital badge on MCA leads — the type already says it', () => {
    expect(extraProductTags({ type: 'MCA', products: ['Capital'] })).toEqual([]);
  });

  it('hides the duplicate Processing badge on Processing leads', () => {
    expect(extraProductTags({ type: 'Processing', products: ['Processing'] })).toEqual([]);
  });

  it('keeps genuine cross-sell tags', () => {
    expect(extraProductTags({ type: 'MCA', products: ['Capital', 'Processing'] })).toEqual(['Processing']);
    expect(extraProductTags({ type: 'Processing', products: ['Capital', 'Processing'] })).toEqual(['Capital']);
  });

  it('Residual and Leasing imply no line, so their tags always show', () => {
    expect(extraProductTags({ type: 'Residual', products: ['Processing'] })).toEqual(['Processing']);
    expect(extraProductTags({ type: 'Leasing', products: ['Capital'] })).toEqual(['Capital']);
  });

  it('tolerates untagged leads', () => {
    expect(extraProductTags({ type: 'MCA', products: undefined })).toEqual([]);
  });
});

describe('leadWantsCapital (Plaid is Capital-only)', () => {
  it('MCA leads are capital files even with no product tags', () => {
    expect(leadWantsCapital({ type: 'MCA', products: undefined })).toBe(true);
    expect(leadWantsCapital({ type: 'MCA', products: [] })).toBe(true);
  });

  it('a Capital product tag qualifies any type', () => {
    expect(leadWantsCapital({ type: 'Processing', products: ['Capital'] })).toBe(true);
    expect(leadWantsCapital({ type: 'Residual', products: ['Capital'] })).toBe(true);
  });

  it('Processing-only leads are not capital files', () => {
    expect(leadWantsCapital({ type: 'Processing', products: [] })).toBe(false);
    expect(leadWantsCapital({ type: 'Processing', products: undefined })).toBe(false);
    expect(leadWantsCapital({ type: 'Processing', products: ['Processing'] })).toBe(false);
    expect(leadWantsCapital({ type: 'Leasing', products: ['Processing'] })).toBe(false);
  });
});
