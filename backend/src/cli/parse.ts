#!/usr/bin/env tsx
/**
 * Demo CLI: parse a fixture (or any file) and print the structured result.
 *
 * Usage:
 *   npm run parse src/fixtures/minimo-new.txt
 *   npm run parse src/fixtures/hpb-new.txt
 *   npm run demo                        # parse all built-in fixtures
 *
 * The CLI reads a plain-text email body. To test against a real RFC822
 * .eml file, pipe through mailparser first - or wait for Phase 1 where
 * the IMAP watcher does this automatically.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMinimo, parseHotpepper } from '../parsers/index.ts';
import { detectSource } from '../parsers/router.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(HERE, '..', 'fixtures');

function inferSourceFromFilename(name: string): 'minimo' | 'hpb' | null {
  if (name.startsWith('minimo')) return 'minimo';
  if (name.startsWith('hpb')) return 'hpb';
  return null;
}

function fakeSubject(name: string): string {
  if (name.includes('cancel')) return '【参考】予約キャンセル';
  if (name.includes('modify')) return '【参考】予約変更';
  return '【参考】新規予約';
}

function processOne(filePath: string): void {
  const text = readFileSync(filePath, 'utf8');
  const file = basename(filePath);

  // Try to infer source by either filename or routing rules.
  const source = inferSourceFromFilename(file)
    ?? detectSource({ subject: fakeSubject(file) });

  if (!source) {
    console.error(`✗ ${file}: source could not be determined`);
    return;
  }

  const subject = fakeSubject(file);
  const parsed = source === 'minimo'
    ? parseMinimo(text, subject)
    : parseHotpepper(text, subject);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📩  ${file}  [source=${source}]`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!parsed) {
    console.log('  ✗ parse returned null (no external id?)');
    return;
  }

  const lines = [
    ['source',       parsed.source],
    ['status',       parsed.status],
    ['externalId',   parsed.externalId],
    ['customer',     parsed.customer.name + (parsed.customer.phone ? ` (${parsed.customer.phone})` : '')],
    ['startAt',      parsed.startAt || '(unparsed)'],
    ['endAt',        parsed.endAt ?? '-'],
    ['menu',         parsed.menu ?? '-'],
    ['staff',        parsed.staff ?? '-'],
    ['amount',       parsed.amount != null ? `¥${parsed.amount.toLocaleString()}` : '-']
  ];
  for (const [k, v] of lines) {
    console.log(`  ${k.padEnd(12)} ${v}`);
  }
  if (parsed.warnings.length) {
    console.log(`  ⚠ warnings:  ${parsed.warnings.join(', ')}`);
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run parse <fixture-or-file>');
  console.error('       npm run demo                  # all fixtures');
  process.exit(1);
}

if (args[0] === '--all') {
  const files = readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.txt'))
    .sort();
  for (const f of files) processOne(resolve(FIXTURES_DIR, f));
  console.log();
} else {
  for (const arg of args) processOne(resolve(arg));
}
