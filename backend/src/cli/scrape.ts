#!/usr/bin/env tsx
/**
 * Manual scrape — one-shot, no queue, useful for development and
 * for capturing selectors interactively.
 *
 * Usage:
 *   npm run scrape minimo
 *   npm run scrape hpb
 *   npm run scrape hpb -- --capture        # headful, leaves browser open for selector capture
 *   npm run scrape hpb -- --force-login    # ignore saved session
 *   npm run scrape hpb -- --dry            # don't launch a browser, just verify wiring
 */
import { createScraper, ReAuthRequired, SelectorDriftError, type ScrapableSource } from '../scrapers/index.ts';
import { upsertReservation } from '../db/repositories/reservations.ts';
import { recordSync } from '../db/repositories/integrations.ts';
import { closePool } from '../db/client.ts';
import { logger } from '../lib/logger.ts';
import { config } from '../config.ts';

const args = process.argv.slice(2);
const source = args.find((a) => !a.startsWith('-')) as ScrapableSource | undefined;
const forceLogin = args.includes('--force-login');
const dryRun     = args.includes('--dry');
const capture    = args.includes('--capture');

if (!source || !['minimo', 'hpb'].includes(source)) {
  console.error('Usage: npm run scrape <minimo|hpb> [-- --capture | --force-login | --dry]');
  process.exit(1);
}

(async () => {
  // Capture mode toggles headed browser for interactive selector capture.
  if (capture) {
    process.env.SCRAPER_HEADLESS = 'false';
    logger.info('capture mode: SCRAPER_HEADLESS=false. Inspect DOM and press Ctrl+C when done.');
  }

  const scraper = createScraper(source);
  try {
    const result = await scraper.run({ forceLogin, dryRun });
    logger.info({ source, count: result.reservations.length }, 'scrape result');

    // Only persist if we actually have a DB URL configured.
    if (config.db.url && result.reservations.length > 0) {
      let upserted = 0;
      for (const r of result.reservations) {
        await upsertReservation(r);
        upserted += 1;
      }
      await recordSync(source, null);
      logger.info({ upserted }, 'persisted to DB');
    } else if (!config.db.url) {
      logger.warn('DATABASE_URL not set — printing instead of persisting');
      for (const r of result.reservations) {
        console.log(`  ${r.externalId}  ${r.startAt}  ${r.customer.name ?? '?'}  (${r.status})`);
      }
    }
  } catch (err) {
    if (err instanceof ReAuthRequired) {
      logger.error({ reason: err.reason }, 'RE-AUTH REQUIRED — manual login needed');
    } else if (err instanceof SelectorDriftError) {
      logger.error({ selector: err.selector, hint: err.hint }, 'SELECTOR DRIFT — update selectors');
    } else {
      logger.error({ err }, 'scrape failed');
    }
    process.exit(1);
  } finally {
    if (config.db.url) await closePool();
  }
})();
