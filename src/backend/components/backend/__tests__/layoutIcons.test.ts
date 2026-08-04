import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression guard for the blank-white-page failure mode: a lucide icon
 * referenced in the layout (nav items, command palette, JSX) but missing
 * from the import list becomes an undefined global — the bundler doesn't
 * complain, and the whole CRM chunk throws a ReferenceError at load.
 * This test statically verifies every icon identifier used in
 * DeltBackendLayout.tsx appears in its lucide-react import.
 */
describe('DeltBackendLayout icon imports', () => {
  const src = readFileSync(
    join(__dirname, '..', 'DeltBackendLayout.tsx'),
    'utf8',
  );

  const importMatch = src.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/);
  const imported = new Set(
    (importMatch?.[1] ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  );

  it('found the lucide-react import block', () => {
    expect(imported.size).toBeGreaterThan(10);
  });

  it('every `icon:` reference is imported', () => {
    const used = [...src.matchAll(/icon:\s*([A-Z][A-Za-z0-9]*)/g)]
      .map(m => m[1])
      .filter(name => name !== 'React'); // the NavItem type annotation, not an icon
    const missing = [...new Set(used)].filter(name => !imported.has(name));
    expect(missing).toEqual([]);
  });

  it('every capitalized JSX tag that looks like an icon is imported or defined locally', () => {
    // Icons render as <Name className="w-4 ..."> — collect PascalCase JSX tags
    // and ensure each is imported from lucide, imported elsewhere, or defined
    // in this file. Guards against the exact ReferenceError-at-load bug.
    const jsxTags = [...new Set([...src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map(m => m[1]))];
    const otherImports = [...src.matchAll(/import\s*\{([^}]*)\}\s*from/g)]
      .flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()!.trim()));
    const localDefs = new Set(
      [...src.matchAll(/(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g)].map(m => m[1]),
    );
    const known = new Set([...imported, ...otherImports, ...localDefs, 'React']);
    const missing = jsxTags.filter(t => !known.has(t) && !t.startsWith('React'));
    expect(missing).toEqual([]);
  });
});
