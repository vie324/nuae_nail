import type { FastifyInstance } from 'fastify';
import {
  listIntegrations,
  getIntegration,
  setConnected,
  recordSync
} from '../../db/repositories/integrations.ts';
import { listReservations } from '../../db/repositories/reservations.ts';
import { scrapeQueue } from '../../queue/queues.ts';

const SCRAPABLE = new Set(['minimo', 'hpb']);

interface IdParam { id: string }
interface ConnectBody { connected: boolean; accountId?: string; config?: Record<string, unknown> }

export async function integrationRoutes(app: FastifyInstance): Promise<void> {
  /** GET /api/integrations — used by the dashboard's main view. */
  app.get('/api/integrations', async () => {
    const rows = await listIntegrations();

    // Attach a couple of derived counters per integration so the frontend
    // doesn't have to make extra requests.
    const enriched = await Promise.all(rows.map(async (i) => {
      const recent = await listReservations({ source: i.id, limit: 200 });
      const newCount     = recent.filter((r) => r.status === 'new').length;
      const pendingCount = recent.filter((r) => r.status === 'modified').length;
      return {
        id:           i.id,
        name:         i.display_name,
        connected:    i.connected,
        account:      i.account_id ?? '',
        lastSync:     i.last_sync_at?.toISOString() ?? null,
        lastError:    i.last_error,
        newReservations: newCount,
        pending:      pendingCount,
        config:       i.config
      };
    }));
    return { data: enriched };
  });

  app.get<{ Params: IdParam }>('/api/integrations/:id', async (req, reply) => {
    const row = await getIntegration(req.params.id);
    if (!row) return reply.code(404).send({ error: 'not found' });
    return row;
  });

  /** PATCH /api/integrations/:id/connection — connect/disconnect. */
  app.patch<{ Params: IdParam; Body: ConnectBody }>(
    '/api/integrations/:id/connection',
    async (req, reply) => {
      const updated = await setConnected({
        id: req.params.id,
        connected: req.body.connected,
        accountId: req.body.accountId ?? null,
        config: req.body.config
      });
      if (!updated) return reply.code(404).send({ error: 'not found' });
      return updated;
    }
  );

  /**
   * POST /api/integrations/:id/sync — manual trigger.
   *
   * For scrapable platforms (minimo / hpb): enqueues a scrape job
   * onto BullMQ and returns its id. The worker process must be running
   * for the job to actually execute.
   *
   * For non-scrapable platforms (line / google / instagram): just
   * records a sync timestamp.
   */
  app.post<{ Params: IdParam }>('/api/integrations/:id/sync', async (req, reply) => {
    const id = req.params.id;
    const row = await getIntegration(id);
    if (!row) return reply.code(404).send({ error: 'not found' });
    if (!row.connected) return reply.code(400).send({ error: 'not connected' });

    if (SCRAPABLE.has(id)) {
      const job = await scrapeQueue().add(
        `manual-${id}`,
        { source: id as 'minimo' | 'hpb', reason: 'manual' },
        { jobId: `manual-${id}-${Date.now()}` }
      );
      req.log.info({ id, jobId: job.id }, 'scrape job enqueued');
      return { ok: true, id, jobId: job.id, mode: 'enqueued' };
    }

    await recordSync(id, null);
    return { ok: true, id, mode: 'timestamped' };
  });
}
