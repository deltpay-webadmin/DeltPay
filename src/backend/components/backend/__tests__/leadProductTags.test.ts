import { describe, it, expect } from 'vitest';
import { extraProductTags } from '../crmStore';

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
