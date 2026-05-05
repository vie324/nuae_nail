#!/usr/bin/env tsx
/**
 * Worker entry point. Run as a separate process from the API server.
 *
 *   npm run start:worker     # production
 *   npm run dev:worker       # auto-reload
 */
import { Worker } from 'bullmq';
import { getRedis, closeRedis } from './connection.ts';
import { closePool } from '../db/client.ts';
import { QueueNames, type MailIngestJob } from './queues.ts';
import { processMailIngest } from './jobs/mail-ingest.ts';
import { logger } from '../lib/logger.ts';

const worker = new Worker<MailIngestJob>(
  QueueNames.mailIngest,
  processMailIngest,
  {
    connection: getRedis(),
    concurrency: 4
  }
);

worker.on('ready',     ()        => logger.info('worker ready'));
worker.on('completed', (job, result) => logger.info({ jobId: job.id, result }, 'completed'));
worker.on('failed',    (job, err)  => logger.error({ jobId: job?.id, err }, 'failed'));
worker.on('error',     (err)        => logger.error({ err }, 'worker error'));

async function shutdown(reason: string): Promise<void> {
  logger.info({ reason }, 'shutting down');
  await worker.close();
  await closeRedis();
  await closePool();
  process.exit(0);
}
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
