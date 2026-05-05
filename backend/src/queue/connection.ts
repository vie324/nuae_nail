/**
 * Shared Redis connection for BullMQ producers and consumers.
 * BullMQ requires `maxRetriesPerRequest: null` for blocking commands,
 * so this single factory enforces the right settings.
 */
import IORedis, { type Redis } from 'ioredis';
import { requireRedisUrl } from '../config.ts';

let conn: Redis | null = null;

export function getRedis(): Redis {
  if (conn) return conn;
  conn = new IORedis(requireRedisUrl(), {
    // Required by BullMQ for BLPOP / BRPOP based workers.
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  return conn;
}

export async function closeRedis(): Promise<void> {
  if (conn) {
    await conn.quit();
    conn = null;
  }
}
