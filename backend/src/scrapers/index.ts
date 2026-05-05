/**
 * Public scraper factory. Producers and the BullMQ job processor pick
 * scrapers via this single entry-point.
 */
import { HpbScraper }    from './hpb.ts';
import { MinimoScraper } from './minimo.ts';
import { BaseScraper }   from './base.ts';
import type { ReservationSource } from '../parsers/types.ts';

export type ScrapableSource = Extract<ReservationSource, 'minimo' | 'hpb'>;

export function createScraper(source: ScrapableSource): BaseScraper {
  switch (source) {
    case 'minimo': return new MinimoScraper();
    case 'hpb':    return new HpbScraper();
  }
}

export { BaseScraper } from './base.ts';
export { HpbScraper, extractFromHpbRowHtml } from './hpb.ts';
export { MinimoScraper, extractFromMinimoRowHtml } from './minimo.ts';
export { ReAuthRequired, SelectorDriftError } from './types.ts';
export type { ScrapeOptions, ScrapeResult } from './types.ts';
