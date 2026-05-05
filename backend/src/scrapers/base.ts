/**
 * Shared scraper machinery: browser launch, session reuse, error
 * normalization. Concrete scrapers only have to implement the
 * platform-specific bits (login flow + DOM extraction).
 *
 *   class MyScraper extends BaseScraper {
 *     readonly source = 'minimo';
 *     readonly loginUrl = 'https://...';
 *     readonly reservationsUrl = 'https://...';
 *     async ensureLoggedIn(page) { ... }
 *     async extractReservations(page) { ... }
 *   }
 *
 *   const result = await new MyScraper().run();
 */
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.ts';
import { logger } from '../lib/logger.ts';
import type { ParsedReservation, ReservationSource } from '../parsers/types.ts';
import {
  type ScrapeOptions,
  type ScrapeResult,
  ReAuthRequired,
  SelectorDriftError
} from './types.ts';
import { loadSession, saveSession, clearSession } from './session.ts';

const REALISTIC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export abstract class BaseScraper {
  abstract readonly source: ReservationSource;
  abstract readonly loginUrl: string;
  abstract readonly reservationsUrl: string;

  /** Detect whether the current page state requires re-auth. */
  protected abstract isLoggedOut(page: Page): Promise<boolean>;

  /**
   * Perform the login form fill + submit. Caller has already navigated
   * to `loginUrl`. Should throw `ReAuthRequired` if 2FA is needed and
   * cannot be resolved.
   */
  protected abstract performLogin(page: Page): Promise<void>;

  /**
   * Read the reservations list page (already navigated by `run()`)
   * and return them in the unified ParsedReservation shape.
   */
  protected abstract extractReservations(page: Page): Promise<ParsedReservation[]>;

  /** Run the full scrape with one helpful retry on auth drift. */
  async run(options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const log = logger.child({ scraper: this.source });

    if (options.dryRun) {
      log.info('dryRun=true; skipping browser launch');
      return { source: this.source, reservations: [], warnings: ['dryRun'] };
    }

    let browser: Browser | undefined;
    let ctx: BrowserContext | undefined;
    const warnings: string[] = [];

    try {
      browser = await chromium.launch({
        headless: config.scrapers.headless,
        args: ['--disable-blink-features=AutomationControlled']
      });
      ctx = await this.makeContext(browser, options.forceLogin);
      const page = await ctx.newPage();

      // Slow down a bit so we don't trip rate limiters.
      page.setDefaultTimeout(15_000);

      // First navigate to the reservations page directly. If session is good,
      // we land there; if not, the platform will redirect us to login.
      await page.goto(this.reservationsUrl, { waitUntil: 'domcontentloaded' });

      if (await this.isLoggedOut(page)) {
        log.info('session invalid → logging in');
        await page.goto(this.loginUrl, { waitUntil: 'domcontentloaded' });
        await this.performLogin(page);
        await saveSession(this.source, ctx);
        await page.goto(this.reservationsUrl, { waitUntil: 'domcontentloaded' });

        if (await this.isLoggedOut(page)) {
          throw new ReAuthRequired(this.source, 'login flow did not establish session');
        }
      }

      const reservations = await this.extractReservations(page);
      log.info({ count: reservations.length }, 'scrape complete');
      return { source: this.source, reservations, warnings };
    } catch (err) {
      if (err instanceof ReAuthRequired) {
        clearSession(this.source);
        log.warn({ err: err.message }, 'cleared bad session');
      }
      throw err;
    } finally {
      await ctx?.close().catch(() => {});
      await browser?.close().catch(() => {});
    }
  }

  /** Build a context with a saved session if available. */
  protected async makeContext(browser: Browser, forceLogin?: boolean): Promise<BrowserContext> {
    const state = forceLogin ? undefined : loadSession(this.source);
    return browser.newContext({
      storageState: state,
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      userAgent: REALISTIC_UA,
      viewport: { width: 1366, height: 800 }
    });
  }

  /** Helper for concrete extractors: throw a typed error on missing selector. */
  protected async requireLocator(page: Page, selector: string, hint: string): Promise<void> {
    const count = await page.locator(selector).count();
    if (count === 0) throw new SelectorDriftError(this.source, selector, hint);
  }
}
