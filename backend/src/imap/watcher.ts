/**
 * IMAP watcher
 *
 * Connects to the salon's inbox, listens for new mail in real time
 * (IMAP IDLE), parses each new message, and emits ParsedReservation.
 *
 * Phase 2 status:
 *   ✅ Implementation is complete and runnable.
 *   ⏳ The "onParsed" hook below currently just logs. In Phase 1 it
 *      will hand off to BullMQ which writes to Postgres.
 *
 * Run:
 *   cp .env.example .env       # fill in IMAP_*
 *   npm run imap:watch
 */
import 'dotenv/config';
import { ImapFlow, type FetchMessageObject } from 'imapflow';
import { simpleParser } from 'mailparser';
import { parseEmail } from '../parsers/index.ts';
import type { ParsedReservation } from '../parsers/types.ts';

interface Config {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  mailbox: string;
}

function loadConfig(): Config {
  const required = ['IMAP_HOST', 'IMAP_USER', 'IMAP_PASSWORD'] as const;
  for (const k of required) {
    if (!process.env[k]) {
      throw new Error(`Missing env var: ${k}. Copy .env.example → .env and fill it in.`);
    }
  }
  return {
    host:     process.env.IMAP_HOST!,
    port:     Number(process.env.IMAP_PORT ?? 993),
    secure:   (process.env.IMAP_SECURE ?? 'true') === 'true',
    user:     process.env.IMAP_USER!,
    password: process.env.IMAP_PASSWORD!,
    mailbox:  process.env.IMAP_MAILBOX ?? 'INBOX'
  };
}

/** Convert imapflow's message object to our parser input. */
async function toParsed(msg: FetchMessageObject): Promise<ParsedReservation | null> {
  const parsed = await simpleParser(msg.source!);
  const result = parseEmail({
    from:    parsed.from?.text,
    replyTo: parsed.replyTo?.text,
    subject: parsed.subject ?? '',
    text:    parsed.text ?? ''
  });
  if (result.parsed) return result.parsed;

  console.warn(
    `[skip] uid=${msg.uid} reason=${result.reason} subject="${parsed.subject}"`
  );
  return null;
}

/**
 * Hook point: in Phase 1 this becomes
 *   await queue.add('persist-reservation', reservation);
 */
async function onParsed(r: ParsedReservation): Promise<void> {
  console.log(
    `[parsed] source=${r.source} status=${r.status} ` +
    `id=${r.externalId} customer=${r.customer.name ?? '?'} ` +
    `at=${r.startAt}`
  );
}

async function main(): Promise<void> {
  const cfg = loadConfig();
  const client = new ImapFlow({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false
  });

  await client.connect();
  console.log(`[imap] connected as ${cfg.user}`);

  const lock = await client.getMailboxLock(cfg.mailbox);
  try {
    // 1) catch-up: parse the last 24h on startup
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for await (const msg of client.fetch(
      { since },
      { source: true, envelope: true, uid: true }
    )) {
      const r = await toParsed(msg);
      if (r) await onParsed(r);
    }

    // 2) live: react to new arrivals via IDLE
    console.log('[imap] entering IDLE — waiting for new mail');
    client.on('exists', async () => {
      // Re-acquire lock briefly to fetch the unseen messages.
      const inner = await client.getMailboxLock(cfg.mailbox);
      try {
        for await (const msg of client.fetch(
          { unseen: true },
          { source: true, envelope: true, uid: true }
        )) {
          const r = await toParsed(msg);
          if (r) await onParsed(r);
        }
      } finally {
        inner.release();
      }
    });

    // Keep the process alive
    await new Promise(() => { /* never */ });
  } finally {
    lock.release();
    await client.logout();
  }
}

// Run only when invoked directly
const isEntry = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isEntry || process.argv[1]?.endsWith('watcher.ts')) {
  main().catch((err) => {
    console.error('[imap] fatal', err);
    process.exit(1);
  });
}

export { main as runWatcher, toParsed };
