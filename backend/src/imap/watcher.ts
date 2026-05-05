/**
 * IMAP watcher → mail-ingest queue.
 *
 *   npm run imap:watch
 *
 * Behavior:
 *   1. Connect to the configured IMAP mailbox.
 *   2. On startup, catch up the last 24h of unread mail.
 *   3. Enter IDLE and react to new arrivals in real time.
 *   4. For every parsable message, push a `mail-ingest` job onto BullMQ.
 *   5. Unparsable messages are recorded in failed_messages for review.
 */
import { ImapFlow, type FetchMessageObject } from 'imapflow';
import { simpleParser } from 'mailparser';
import { parseEmail } from '../parsers/index.ts';
import { mailIngestQueue } from '../queue/queues.ts';
import { recordFailure } from '../db/repositories/failed.ts';
import { logger } from '../lib/logger.ts';
import { requireImapConfig } from '../config.ts';

async function handleMessage(msg: FetchMessageObject): Promise<void> {
  const parsedMail = await simpleParser(msg.source!);
  const result = parseEmail({
    from:    parsedMail.from?.text,
    replyTo: parsedMail.replyTo?.text,
    subject: parsedMail.subject ?? '',
    text:    parsedMail.text ?? ''
  });

  if (!result.parsed) {
    logger.warn({ uid: msg.uid, reason: result.reason, subject: parsedMail.subject }, 'mail skipped');
    await recordFailure({
      reason: result.reason ?? 'unknown',
      rawSubject: parsedMail.subject,
      rawFrom: parsedMail.from?.text,
      rawText: parsedMail.text ?? ''
    }).catch((err) => logger.error({ err }, 'failed_messages insert error'));
    return;
  }

  const job = await mailIngestQueue().add('parsed-mail', {
    reservation: result.parsed,
    meta: { receivedAt: new Date().toISOString(), imapUid: msg.uid }
  });
  logger.info(
    { uid: msg.uid, jobId: job.id, source: result.parsed.source, externalId: result.parsed.externalId },
    'enqueued'
  );
}

async function main(): Promise<void> {
  const cfg = requireImapConfig();
  const client = new ImapFlow({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false
  });

  await client.connect();
  logger.info({ user: cfg.user }, 'imap connected');

  const lock = await client.getMailboxLock(cfg.mailbox);
  try {
    // Catch-up: parse the last 24h on startup
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for await (const msg of client.fetch(
      { since },
      { source: true, envelope: true, uid: true }
    )) {
      await handleMessage(msg).catch((err) =>
        logger.error({ err, uid: msg.uid }, 'handleMessage failed'));
    }

    logger.info('entering IDLE — waiting for new mail');
    client.on('exists', async () => {
      const inner = await client.getMailboxLock(cfg.mailbox);
      try {
        for await (const msg of client.fetch(
          { seen: false },
          { source: true, envelope: true, uid: true }
        )) {
          await handleMessage(msg).catch((err) =>
            logger.error({ err, uid: msg.uid }, 'handleMessage failed'));
        }
      } finally {
        inner.release();
      }
    });

    await new Promise(() => { /* run forever */ });
  } finally {
    lock.release();
    await client.logout();
  }
}

main().catch((err) => {
  logger.error({ err }, 'imap watcher crashed');
  process.exit(1);
});
