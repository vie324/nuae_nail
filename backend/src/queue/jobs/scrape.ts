/**
 * scrape job processor.
 *
 * Each job launches a Playwright instance for one source, fetches all
 * upcoming reservations, and pushes them through the same UPSERT path
 * the email pipeline uses.
 */
import type { Job } from 'bullmq';
import type { ScrapeJob } from '../queues.ts';
import { createScraper } from '../../scrapers/index.ts';
import { ReAuthRequired, SelectorDriftError } from '../../scrapers/types.ts';
import { upsertReservation } from '../../db/repositories/reservations.ts';
import { recordSync } from '../../db/repositories/integrations.ts';
import { recordFailure } from '../../db/repositories/failed.ts';
import { notifyReauthNeeded, notifyScrapeError } from '../../lib/notify.ts';
import { logger } from '../../lib/logger.ts';

export async function processScrape(job: Job<ScrapeJob>): Promise<{ count: number }> {
  const { source, daysAhead, reason } = job.data;
  const log = logger.child({ jobId: job.id, source, reason });

  let scraper;
  try { scraper = createScraper(source); }
  catch (err) {
    log.error({ err }, 'unsupported source');
    throw err;
  }

  try {
    const result = await scraper.run({ daysAhead });
    let upserted = 0;
    for (const r of result.reservations) {
      await upsertReservation(r);
      upserted += 1;
    }
    await recordSync(source, null);
    log.info({ count: upserted }, 'scrape complete');
    return { count: upserted };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (err instanceof ReAuthRequired) {
      await recordSync(source, `re-auth required: ${err.reason}`);
      await notifyReauthNeeded(source, err.reason);
    } else if (err instanceof SelectorDriftError) {
      await recordSync(source, `selector drift: ${err.selector}`);
      await recordFailure({ source, reason: msg }).catch(() => {});
      await notifyScrapeError(source, `セレクタが変わったかもしれません: ${err.selector}`);
    } else {
      await recordSync(source, msg);
      await recordFailure({ source, reason: msg }).catch(() => {});
      await notifyScrapeError(source, msg);
    }
    throw err;
  }
}
