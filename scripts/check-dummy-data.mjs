#!/usr/bin/env node
/**
 * Prevent fabricated data from being added to the embedded Backend CRM.
 * Run with: npm run check:dummy-data
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const BACKEND_DIR = 'src/backend';

// EASY-TO-EXTEND: Add removed fabricated merchant, agent, or employee names here.
const BANNED_TERMS = [
  'Havana Bites',
  'Brooklyn Vinyl',
  'Little Havana Barbershop',
  'Sunrise Cafe',
  'Sunrise Bakery',
  'Downtown Cafe',
  'Marcus Johnson',
  'Sarah Kim',
  'Carlos Rivera',
  'Devon Richards',
  'Priya Patel',
  'Jamal Foster',
  'Lisa Tran',
  'Alex Rivera',
  'Peak Construction',
  'Sunset Logistics',
  'Bright Auto Sales',
  'Lakeside Catering',
  'Metro Diner',
  'Coastal Seafood',
  'TechStart Solutions',
  'Bella Vista Restaurant',
  'Urban Fitness',
  'Apex Fitness',
  'Patrick Oduya',
  'Jason Park',
  'Lyndon Tate',
  'Nina Voskresenskaya',
];

// Match mock/dummy/sample/fake/seed array declarations, but only when non-empty.
const NONEMPTY_MOCK_ARRAY = /\b(mock|dummy|sample|fake|seed(ed)?)[A-Z_]?\w*\s*(?::\s*\w+(?:\[\])?)?\s*=\s*\[(?!\s*\])/gi;

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (!entry.name.includes('.test.')) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

const violations = [];
for (const file of collectFiles(BACKEND_DIR)) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const lowerText = text.toLowerCase();
  for (const term of BANNED_TERMS) {
    const index = lowerText.indexOf(term.toLowerCase());
    if (index !== -1) {
      violations.push({
        file: relative('.', file),
        line: lineForOffset(text, index),
        matched: term,
      });
    }
  }

  NONEMPTY_MOCK_ARRAY.lastIndex = 0;
  let match;
  while ((match = NONEMPTY_MOCK_ARRAY.exec(text)) !== null) {
    violations.push({
      file: relative('.', file),
      line: lineForOffset(text, match.index),
      matched: match[0].trim(),
    });
  }
}

if (violations.length > 0) {
  console.error('Dummy data guard failed: the embedded Backend CRM is LIVE-DATA-ONLY.');
  console.error('Remove fabricated data, use a clean empty state or Supabase, and see CLAUDE.md.');
  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line}  matched "${violation.matched}"`);
  }
  process.exit(1);
}
