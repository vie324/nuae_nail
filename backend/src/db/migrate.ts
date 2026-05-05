#!/usr/bin/env tsx
/**
 * Tiny migration runner.
 *
 * Reads `db/migrations/*.sql` in lexical order, applies each within
 * a transaction, and records the version in schema_migrations so it's
 * idempotent.
 *
 * Usage:
 *   npm run db:migrate
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from './client.ts';
import { logger } from '../lib/logger.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR  = resolve(HERE, 'migrations');

async function main(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Ensure the bookkeeping table exists before we look for applied versions.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = new Set(
      (await client.query<{ version: string }>('SELECT version FROM schema_migrations'))
        .rows.map((r) => r.version)
    );

    const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (applied.has(version)) {
        logger.info({ version }, 'skip (already applied)');
        continue;
      }
      const sql = readFileSync(resolve(DIR, file), 'utf8');
      logger.info({ version }, 'applying');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations(version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ err, version }, 'migration failed');
        throw err;
      }
    }
    logger.info('migrations complete');
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((err) => {
  logger.error({ err }, 'migrate failed');
  process.exit(1);
});
