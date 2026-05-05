#!/usr/bin/env tsx
/**
 * Worker entry point. Run as a separate process from the API server.
 *
 *   npm run start:worker     # production
 *   npm run dev:worker       # auto-reload
 *
 * Two BullMQ workers run in parallel inside this process:
 *   - mail-ingest  (high concurrency)
 *   - scrape       (concurrency 1 — one browser at a time per host)
 *
 * Repeatable cron jobs are registered on startup so leaving the
 * worker running gives you automatic 15-min HPB / 30-min minimo polls.
 */
import { Worker } from 'bullmq';
import { getRedis, closeRedis } from './connection.ts';
import { closePool } from '../db/client.ts';
import {
  QueueNames,
  scrapeQueue,
  type MailIngestJob,
  type ScrapeJob
} from './queues.ts';
import { processMailIngest } from './jobs/mail-ingest.ts';
import { processScrape }     from './jobs/scrape.ts';
import { logger } from '../lib/logger.ts';
import { config } from '../config.ts';

const workers: Worker[] = [];

// ─── mail-ingest ────────────────────────────────────────────────────
workers.push(
  new Worker<MailIngestJob>(
    QueueNames.mailIngest,
    processMailIngest,
    { connection: getRedis(), concurrency: 4 }
  )
);

// ─── scrape ────────────────────────────────────────────────────────
workers.push(
  new Worker<ScrapeJob>(
    QueueNames.scrape,
    processScrape,
    { connection: getRedis(), concurrency: 1 }
  )
);

// Lifecycle logging across workers
for (const w of workers) {
  w.on('ready',     ()              => logger.info({ queue: w.name }, 'worker ready'));
  w.on('completed', (job, result)   => logger.info({ queue: w.name, jobId: job.id, result }, 'completed'));
  w.on('failed',    (job, err)      => logger.error({ queue: w.name, jobId: job?.id, err }, 'failed'));
  w.on('error',     (err)           => logger.error({ queue: w.name, err }, 'worker error'));
}

// ─── cron schedules ────────────────────────────────────────────────
async function registerSchedules(): Promise<void> {
  // Skip auto-scheduling if the operator hasn't enabled scrapers yet.
  const queue = scrapeQueue();
  if (config.scrapers.hpb.user) {
    await queue.add(
      'hpb-scheduled',
      { source: 'hpb', reason: 'scheduled' },
      { repeat: { pattern: '*/15 * * * *' }, jobId: 'hpb-cron' }
    );
    logger.info('scheduled: hpb every 15 min');
  }
  if (config.scrapers.minimo.user) {
    await queue.add(
      'minimo-scheduled',
      { source: 'minimo', reason: 'scheduled' },
      { repeat: { pattern: '*/30 * * * *' }, jobId: 'minimo-cron' }
    );
    logger.info('scheduled: minimo every 30 min');
  }
}
registerSchedules().catch((err) => logger.error({ err }, 'schedule registration failed'));

// ─── shutdown ──────────────────────────────────────────────────────
async function shutdown(reason: string): Promise<void> {
  logger.info({ reason }, 'shutting down');
  await Promise.all(workers.map((w) => w.close().catch(() => {})));
  await closeRedis();
  await closePool();
  process.exit(0);
}
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
