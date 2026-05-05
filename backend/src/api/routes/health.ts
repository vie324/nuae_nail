import type { FastifyInstance } from 'fastify';
import { query } from '../../db/client.ts';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    ok: true,
    ts: new Date().toISOString()
  }));

  /** Includes a real DB ping. Used by docker / k8s readiness probes. */
  app.get('/health/ready', async (req, reply) => {
    try {
      const rows = await query<{ ok: number }>('SELECT 1 AS ok');
      return { ok: rows[0]?.ok === 1 };
    } catch (err) {
      req.log.error({ err }, 'readiness probe failed');
      return reply.code(503).send({ ok: false, reason: 'db unavailable' });
    }
  });
}
