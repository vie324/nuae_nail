/**
 * Tiny structured logger wrapper.
 *
 * Uses pino under the hood (it ships with Fastify) so we get a single
 * format and the API server's logs interleave cleanly with worker logs.
 */
import { pino } from 'pino';
import { config } from '../config.ts';

const transport = config.nodeEnv === 'development'
  ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
  : undefined;

export const logger = pino({
  level: config.logLevel,
  transport,
  base: { app: 'nuae-backend' }
});

export type Logger = typeof logger;
