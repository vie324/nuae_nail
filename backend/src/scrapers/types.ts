/**
 * Scraper-side types. Output is intentionally compatible with the
 * email parser's `ParsedReservation` so the queue worker / repo
 * layer doesn't need to know whether data came from email or DOM.
 */
import type { ParsedReservation, ReservationSource } from '../parsers/types.ts';

export interface ScrapeOptions {
  /** Force a fresh login even if a saved session exists. */
  forceLogin?: boolean;
  /** Skip the actual page actions; useful for typecheck/unit testing. */
  dryRun?: boolean;
  /** Lookahead horizon in days (default: 14). */
  daysAhead?: number;
}

export interface ScrapeResult {
  source: ReservationSource;
  reservations: ParsedReservation[];
  warnings: string[];
}

/** Thrown by scrapers when the saved session is invalid. */
export class ReAuthRequired extends Error {
  constructor(public source: ReservationSource, public reason: string) {
    super(`re-auth required for ${source}: ${reason}`);
    this.name = 'ReAuthRequired';
  }
}

/** Thrown when the page DOM doesn't match expected selectors. */
export class SelectorDriftError extends Error {
  constructor(
    public source: ReservationSource,
    public selector: string,
    public hint: string
  ) {
    super(`selector "${selector}" not found on ${source}: ${hint}`);
    this.name = 'SelectorDriftError';
  }
}
