#!/usr/bin/env tsx
/**
 * Direct ingest CLI — read a fixture file, parse it, write to DB.
 * Lets you smoke-test the API/DB end-to-end without configuring IMAP.
 *
 *   npm run ingest src/fixtures/minimo-new.txt
 *   npm run ingest src/fixtures/hpb-new.txt
 *   npm run ingest src/fixtures/*.txt
 */
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { parseMinimo, parseHotpepper } from '../parsers/index.ts';
import { upsertReservation } from '../db/repositories/reservations.ts';
import { recordSync } from '../db/repositories/integrations.ts';
import { closePool } from '../db/client.ts';
import { logger } from '../lib/logger.ts';

function inferSource(name: string): 'minimo' | 'hpb' | null {
  if (name.startsWith('minimo')) return 'minimo';
  if (name.startsWith('hpb'))    return 'hpb';
  return null;
}

function fakeSubject(name: string): string {
  if (name.includes('cancel')) return '【参考】予約キャンセル';
  if (name.includes('modify')) return '【参考】予約変更';
  return '【参考】新規予約';
}

async function ingestOne(filePath: string): Promise<void> {
  const text = readFileSync(filePath, 'utf8');
  const file = basename(filePath);
  const source = inferSource(file);
  if (!source) {
    logger.warn({ file }, 'cannot infer source from filename; skip');
    return;
  }
  const subject = fakeSubject(file);
  const parsed = source === 'minimo'
    ? parseMinimo(text, subject)
    : parseHotpepper(text, subject);

  if (!parsed) {
    logger.warn({ file }, 'parser returned null');
    return;
  }

  const result = await upsertReservation(parsed);
  await recordSync(source, null);
  logger.info(
    { file, source, externalId: parsed.externalId, ...result },
    result.isNew ? 'inserted' : 'updated'
  );
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run ingest <file.txt> [more.txt ...]');
  process.exit(1);
}

(async () => {
  try {
    for (const arg of args) await ingestOne(resolve(arg));
  } finally {
    await closePool();
  }
})().catch((err) => {
  logger.error({ err }, 'ingest failed');
  process.exit(1);
});
