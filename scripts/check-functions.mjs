#!/usr/bin/env node
/**
 * Syntax + import-graph check for Supabase edge functions.
 *
 * Bundles every supabase/functions/<name>/index.ts with esbuild, treating
 * remote specifiers (npm:, jsr:, https:) as external. Catches TypeScript
 * syntax errors, missing local modules, and missing exports from local
 * modules — the exact failure modes a broken deploy would otherwise ship.
 * Run via `npm run check:functions`; wired into CI.
 */

import { build } from 'esbuild';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FUNCTIONS_DIR = 'supabase/functions';

const remoteExternals = {
  name: 'remote-externals',
  setup(b) {
    b.onResolve({ filter: /^(npm:|jsr:|https?:)/ }, args => ({
      path: args.path,
      external: true,
    }));
  },
};

const entries = readdirSync(FUNCTIONS_DIR)
  .filter(d => !d.startsWith('_') && statSync(join(FUNCTIONS_DIR, d)).isDirectory())
  .map(d => {
    for (const candidate of ['index.ts', 'index.tsx']) {
      const p = join(FUNCTIONS_DIR, d, candidate);
      if (existsSync(p)) return { name: d, entry: p };
    }
    return null;
  })
  .filter(Boolean);

let failed = 0;
for (const { name, entry } of entries) {
  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'neutral',
      logLevel: 'silent',
      plugins: [remoteExternals],
    });
    console.log(`ok   ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${name}`);
    for (const e of err.errors ?? []) {
      console.error(`     ${e.location?.file ?? entry}:${e.location?.line ?? '?'} ${e.text}`);
    }
    if (!err.errors?.length) console.error(`     ${err.message}`);
  }
}

console.log(`\n${entries.length - failed}/${entries.length} functions clean`);
process.exit(failed ? 1 : 0);
