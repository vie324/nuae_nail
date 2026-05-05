/**
 * mail-ingest job processor.
 *
 * Input:  ParsedReservation already extracted by the parser layer.
 * Output: external_reservations row id (logged).
 *
 * Failure modes:
 *   - DB unavailable      -> BullMQ retries with exponential backoff
 *   - Constraint violation -> recorded in failed_messages, marked completed
 */
import type { Job } from 'bullmq';
import type { MailIngestJob } from '../queues.ts';
import { upsertReservation } from '../../db/repositories/reservations.ts';
import { recordSync } from '../../db/repositories/integrations.ts';
import { recordFailure } from '../../db/repositories/failed.ts';
import { logger } from '../../lib/logger.ts';

export async function processMailIngest(job: Job<MailIngestJob>): Promise<{ id: string; isNew: boolean }> {
  const { reservation } = job.data;
  const log = logger.child({ jobId: job.id, source: reservation.source, externalId: reservation.externalId });

  try {
    const result = await upsertReservation(reservation);
    await recordSync(reservation.source, null);
    log.info({ ...result, status: reservation.status }, 'reservation upserted');
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err }, 'upsert failed');

    // Record once for visibility but still rethrow so BullMQ retries.
    await recordFailure({
      source: reservation.source,
      reason: `upsert error: ${msg}`,
      rawText: reservation.rawText
    }).catch(() => { /* swallow secondary failure */ });

    throw err;
  }
}
