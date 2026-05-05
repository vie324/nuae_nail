/**
 * Queue registry. Keep all queue *names* and their job *payload types*
 * in one place so producers and workers share definitions.
 */
import { Queue } from 'bullmq';
import { getRedis } from './connection.ts';
import type { ParsedReservation } from '../parsers/types.ts';

export const QueueNames = {
  mailIngest: 'mail-ingest'
} as const;

export interface MailIngestJob {
  /** Output of parsers/index.ts:parseEmail. */
  reservation: ParsedReservation;
  /** Optional metadata for debugging. */
  meta?: {
    receivedAt?: string;
    imapUid?: number;
  };
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
