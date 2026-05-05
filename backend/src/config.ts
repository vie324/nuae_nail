/**
 * Single source of truth for env-derived configuration.
 *
 * All other modules import from here so test environments can swap
 * config without touching the rest of the code.
 */
import 'dotenv/config';

function required(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(
      `Missing required env var: ${key}\n` +
      `Copy .env.example → .env and fill it in, or export the variable.`
    );
  }
  return v;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function int(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`env ${key} must be an integer, got "${v}"`);
  }
  return n;
}

function bool(key: string, fallback: boolean): boolean {
  const v = process.env[key];
  if (v == null) return fallback;
  return v === 'true' || v === '1';
}

export const config = {
  nodeEnv:  optional('NODE_ENV', 'development'),
  logLevel: optional('LOG_LEVEL', 'info'),

  api: {
    port: int('PORT', 4000),
    corsOrigin: optional('CORS_ORIGIN', '*')
  },

  db: {
    /** Optional in dev: code that needs DB will throw if missing. */
    url: process.env.DATABASE_URL ?? null
  },

  redis: {
    url: process.env.REDIS_URL ?? null
  },

  imap: {
    host:     process.env.IMAP_HOST     ?? null,
    port:     int('IMAP_PORT', 993),
    secure:   bool('IMAP_SECURE', true),
    user:     process.env.IMAP_USER     ?? null,
    password: process.env.IMAP_PASSWORD ?? null,
    mailbox:  optional('IMAP_MAILBOX', 'INBOX')
  },

  scrapers: {
    /** Where to keep persisted Playwright session state. */
    sessionDir: optional('SCRAPER_SESSION_DIR', './.sessions'),
    /** Headless toggle - keep `false` while you're capturing selectors. */
    headless:   bool('SCRAPER_HEADLESS', true),
    /** Per-source credentials. Optional in config; required at runtime. */
    minimo: {
      user:     process.env.MINIMO_USER     ?? null,
      password: process.env.MINIMO_PASSWORD ?? null
    },
    hpb: {
      user:     process.env.SALONBOARD_USER     ?? null,
      password: process.env.SALONBOARD_PASSWORD ?? null
    }
  },

  /** Optional LINE Messaging API for re-auth notifications. */
  line: {
    accessToken: process.env.LINE_ACCESS_TOKEN ?? null,
    ownerUserId: process.env.LINE_OWNER_USER_ID ?? null
  }
} as const;

/** Use in modules that absolutely need a DB connection. */
export function requireDbUrl(): string {
  if (!config.db.url) throw new Error('DATABASE_URL is required for this command');
  return config.db.url;
}

/** Use in modules that absolutely need Redis. */
export function requireRedisUrl(): string {
  if (!config.redis.url) throw new Error('REDIS_URL is required for this command');
  return config.redis.url;
}

/** Use in IMAP watcher only. */
export function requireImapConfig(): {
  host: string; port: number; secure: boolean;
  user: string; password: string; mailbox: string;
} {
  const i = config.imap;
  if (!i.host || !i.user || !i.password) {
    throw new Error('IMAP_HOST, IMAP_USER and IMAP_PASSWORD are required');
  }
  return { host: i.host, port: i.port, secure: i.secure, user: i.user, password: i.password, mailbox: i.mailbox };
}
