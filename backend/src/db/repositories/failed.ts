/**
 * failed_messages repository.
 *
 * Persisted whenever a parser couldn't extract a usable record. Used
 * for monitoring (alert when count grows) and offline re-parsing once
 * we patch the regex.
 */
import { query } from '../client.ts';

export interface FailedRow {
  id: string;
  source: string | null;
  reason: string;
  raw_subject: string | null;
  raw_from: string | null;
  raw_text: string | null;
  failed_at: Date;
}

export interface RecordFailureInput {
  source?: string | null;
  reason: string;
  rawSubject?: string;
  rawFrom?: string;
  rawText?: string;
}

export async function recordFailure(f: RecordFailureInput): Promise<void> {
  await query(
    `INSERT INTO failed_messages (source, reason, raw_subject, raw_from, raw_text)
     VALUES ($1, $2, $3, $4, $5)`,
    [f.source ?? null, f.reason, f.rawSubject ?? null, f.rawFrom ?? null, f.rawText ?? null]
  );
}

export async function listRecentFailures(limit = 50): Promise<FailedRow[]> {
  return query<FailedRow>(
    'SELECT * FROM failed_messages ORDER BY failed_at DESC LIMIT $1',
    [Math.min(limit, 200)]
  );
}
