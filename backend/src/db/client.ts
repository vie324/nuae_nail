/**
 * Postgres connection pool — created lazily so modules that don't
 * need DB (e.g. parser tests) can import side-effect free.
 */
import pg from 'pg';
import { requireDbUrl } from '../config.ts';
import { logger } from '../lib/logger.ts';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: requireDbUrl(),
    max: 10,
    idleTimeoutMillis: 30_000
  });
  pool.on('error', (err) => logger.error({ err }, 'pg pool error'));
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Convenience helpers for repositories.
 *
 * The pg driver constrains its generic to QueryResultRow (an index
 * signature). To let our domain types stay strict we cast at this
 * boundary — every caller is a controlled SELECT so it's safe.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: readonly unknown[] = []
): Promise<T[]> {
  const res = await getPool().query(sql, params as unknown[]);
  return res.rows as T[];
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  params: readonly unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
