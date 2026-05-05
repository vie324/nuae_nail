/**
 * external_reservations repository.
 *
 * Idempotency contract:
 *   UPSERT keyed on (source, external_id).
 *   On conflict, partial fields are merged via COALESCE so a later
 *   "cancellation" event (which has fewer fields) doesn't wipe out
 *   data from the original "new" event.
 */
import { query, one } from '../client.ts';
import type { ParsedReservation } from '../../parsers/types.ts';

export interface ReservationRow {
  id: string;
  source: string;
  external_id: string;
  status: string;
  customer_name: string | null;
  customer_kana: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  start_at: Date | null;
  end_at: Date | null;
  menu_text: string | null;
  staff_text: string | null;
  amount: number | null;
  matched_customer_id: string | null;
  raw_text: string | null;
  warnings: string[];
  ingested_at: Date;
  updated_at: Date;
}

export interface UpsertResult {
  id: string;
  /** True if the row didn't exist before. */
  isNew: boolean;
}

const UPSERT_SQL = `
  INSERT INTO external_reservations (
    source, external_id, status,
    customer_name, customer_kana, customer_phone, customer_email,
    start_at, end_at, menu_text, staff_text, amount,
    raw_text, warnings, updated_at
  ) VALUES (
    $1, $2, $3,
    $4, $5, $6, $7,
    $8, $9, $10, $11, $12,
    $13, $14::jsonb, now()
  )
  ON CONFLICT (source, external_id) DO UPDATE SET
    status         = EXCLUDED.status,
    customer_name  = COALESCE(EXCLUDED.customer_name,  external_reservations.customer_name),
    customer_kana  = COALESCE(EXCLUDED.customer_kana,  external_reservations.customer_kana),
    customer_phone = COALESCE(EXCLUDED.customer_phone, external_reservations.customer_phone),
    customer_email = COALESCE(EXCLUDED.customer_email, external_reservations.customer_email),
    start_at       = COALESCE(EXCLUDED.start_at,       external_reservations.start_at),
    end_at         = COALESCE(EXCLUDED.end_at,         external_reservations.end_at),
    menu_text      = COALESCE(EXCLUDED.menu_text,      external_reservations.menu_text),
    staff_text     = COALESCE(EXCLUDED.staff_text,     external_reservations.staff_text),
    amount         = COALESCE(EXCLUDED.amount,         external_reservations.amount),
    raw_text       = EXCLUDED.raw_text,
    warnings       = EXCLUDED.warnings,
    updated_at     = now()
  RETURNING id, (xmax = 0) AS is_new
`;

export async function upsertReservation(r: ParsedReservation): Promise<UpsertResult> {
  const params = [
    r.source,
    r.externalId,
    r.status,
    r.customer.name  ?? null,
    r.customer.nameKana ?? null,
    r.customer.phone ?? null,
    r.customer.email ?? null,
    r.startAt ? new Date(r.startAt) : null,
    r.endAt   ? new Date(r.endAt)   : null,
    r.menu  ?? null,
    r.staff ?? null,
    r.amount ?? null,
    r.rawText,
    JSON.stringify(r.warnings)
  ];
  const row = await one<{ id: string; is_new: boolean }>(UPSERT_SQL, params);
  if (!row) throw new Error('upsert returned no row');
  return { id: row.id, isNew: row.is_new };
}

export interface ListFilters {
  from?: string;            // ISO 8601
  to?: string;
  source?: string;
  status?: string;
  limit?: number;
}

export async function listReservations(filters: ListFilters = {}): Promise<ReservationRow[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (filters.from)   { conds.push(`start_at >= $${i++}`); params.push(new Date(filters.from)); }
  if (filters.to)     { conds.push(`start_at <= $${i++}`); params.push(new Date(filters.to)); }
  if (filters.source) { conds.push(`source = $${i++}`);    params.push(filters.source); }
  if (filters.status) { conds.push(`status = $${i++}`);    params.push(filters.status); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const limit = Math.min(filters.limit ?? 200, 500);
  const sql = `
    SELECT *
    FROM   external_reservations
    ${where}
    ORDER BY start_at NULLS LAST, ingested_at DESC
    LIMIT  ${limit}
  `;
  return query<ReservationRow>(sql, params);
}

export async function countByStatus(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: string }>(
    'SELECT status, COUNT(*)::text AS n FROM external_reservations GROUP BY status'
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}
