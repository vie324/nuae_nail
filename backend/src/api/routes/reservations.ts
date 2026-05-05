import type { FastifyInstance } from 'fastify';
import { listReservations, countByStatus } from '../../db/repositories/reservations.ts';

interface ListQuery {
  from?: string;
  to?: string;
  source?: string;
  status?: string;
  limit?: string;
}

export async function reservationRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/reservations
   * Query: from, to, source, status, limit
   */
  app.get<{ Querystring: ListQuery }>('/api/reservations', async (req) => {
    const { from, to, source, status, limit } = req.query;
    const rows = await listReservations({
      from, to, source, status,
      limit: limit ? Number(limit) : undefined
    });
    return {
      data: rows.map((r) => ({
        id:           r.id,
        source:       r.source,
        externalId:   r.external_id,
        status:       r.status,
        customer: {
          name:  r.customer_name,
          kana:  r.customer_kana,
          phone: r.customer_phone,
          email: r.customer_email
        },
        startAt:    r.start_at?.toISOString() ?? null,
        endAt:      r.end_at?.toISOString()   ?? null,
        menu:       r.menu_text,
        staff:      r.staff_text,
        amount:     r.amount,
        warnings:   r.warnings,
        ingestedAt: r.ingested_at.toISOString(),
        updatedAt:  r.updated_at.toISOString()
      })),
      count: rows.length
    };
  });

  /** GET /api/reservations/stats — quick aggregations for dashboard headers. */
  app.get('/api/reservations/stats', async () => {
    const byStatus = await countByStatus();
    return { byStatus };
  });
}
