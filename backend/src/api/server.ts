#!/usr/bin/env tsx
/**
 * Fastify HTTP entry point.
 *
 *   npm run start:api      # production
 *   npm run dev:api        # auto-reload
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config.ts';
import { closePool } from '../db/client.ts';
import { closeRedis } from '../queue/connection.ts';
import { logger } from '../lib/logger.ts';
import { healthRoutes } from './routes/health.ts';
import { reservationRoutes } from './routes/reservations.ts';
import { integrationRoutes } from './routes/integrations.ts';

async function buildApp() {
  const app = Fastify({
    logger,
    disableRequestLogging: config.nodeEnv !== 'development'
  });

  await app.register(cors, {
    origin: config.api.corsOrigin === '*' ? true : config.api.corsOrigin.split(',').map((s) => s.trim())
  });

  app.register(healthRoutes);
  app.register(reservationRoutes);
  app.register(integrationRoutes);

  return app;
}

async function start(): Promise<void> {
  const app = await buildApp();
  try {
    await app.listen({ port: config.api.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error({ err }, 'startup failed');
    process.exit(1);
  }

  const shutdown = async (reason: string) => {
    app.log.info({ reason }, 'shutting down');
    await app.close();
    await closePool();
    await closeRedis().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();

export { buildApp };
