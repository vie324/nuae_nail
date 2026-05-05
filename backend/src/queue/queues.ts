/**
 * Queue registry. Keep all queue *names* and their job *payload types*
 * in one place so producers and workers share definitions.
 */
import { Queue } from 'bullmq';
import { getRedis } from './connection.ts';
import type { ParsedReservation } from '../parsers/types.ts';
import type { ScrapableSource } from '../scrapers/index.ts';

export const QueueNames = {
  mailIngest: 'mail-ingest',
  scrape:     'scrape'
} as const;

// ─── mail-ingest ─────────────────────────────────────────────────────
export interface MailIngestJob {
  reservation: ParsedReservation;
  meta?: { receivedAt?: string; imapUid?: number };
}

let _mailIngest: Queue<MailIngestJob> | null = null;
export function mailIngestQueue(): Queue<MailIngestJob> {
  if (_mailIngest) return _mailIngest;
  _mailIngest = new Queue<MailIngestJob>(QueueNames.mailIngest, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 1000, age: 60 * 60 * 24 },
      removeOnFail:    { count: 1000, age: 60 * 60 * 24 * 7 }
    }
  });
  return _mailIngest;
}

// ─── scrape ──────────────────────────────────────────────────────────
export interface ScrapeJob {
  source: ScrapableSource;
  /** 'manual' (sync button) | 'scheduled' (cron) | 'retry' */
  reason: 'manual' | 'scheduled' | 'retry';
  daysAhead?: number;
}

let _scrape: Queue<ScrapeJob> | null = null;
export function scrapeQueue(): Queue<ScrapeJob> {
  if (_scrape) return _scrape;
  _scrape = new Queue<ScrapeJob>(QueueNames.scrape, {
    connection: getRedis(),
    defaultJobOptions: {
      // Fewer attempts than mail because each attempt launches a browser.
      attempts: 2,
      backoff: { type: 'exponential', delay: 60_000 },
      removeOnComplete: { count: 200, age: 60 * 60 * 24 * 3 },
      removeOnFail:    { count: 500, age: 60 * 60 * 24 * 14 }
    }
  });
  return _scrape;
}
