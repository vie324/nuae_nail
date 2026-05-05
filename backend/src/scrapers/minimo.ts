/**
 * minimo (salon admin) scraper (skeleton).
 *
 * minimo は API を公開していないため、サロン管理画面 (salon.minimo.mu)
 * を Playwright で操作します。HPBスクレイパーと同じ方式。
 *
 * セレクタは minimo の管理画面構造に合わせて埋めてください。
 */
import type { Page } from 'playwright';
import { BaseScraper } from './base.ts';
import { ReAuthRequired, SelectorDriftError } from './types.ts';
import {
  parseJpDateTimeRange, normalizePhone, parseYen, toHankaku
} from '../parsers/normalize.ts';
import { config } from '../config.ts';
import type { ParsedReservation } from '../parsers/types.ts';

const SEL = {
  loginUser:      'input[name="email"]',           // TODO: verify
  loginPassword:  'input[name="password"]',        // TODO
  loginSubmit:    'button[type="submit"]',         // TODO

  loggedInMarker: '[data-testid="header-user"]',   // TODO

  rowSelector:    '[data-reservation-id]',         // TODO
  cellId:         '[data-reservation-id]',
  cellCustomer:   '.reservation-customer',         // TODO
  cellPhone:      '.reservation-phone',
  cellDateTime:   '.reservation-datetime',
  cellMenu:       '.reservation-menu',
  cellStaff:      '.reservation-staff',
  cellAmount:     '.reservation-amount',
  cellStatus:     '.reservation-status'
} as const;

export class MinimoScraper extends BaseScraper {
  readonly source = 'minimo' as const;
  readonly loginUrl        = 'https://salon.minimo.mu/login';
  readonly reservationsUrl = 'https://salon.minimo.mu/reservations';

  protected async isLoggedOut(page: Page): Promise<boolean> {
    if (/\/login(\?|$)/.test(page.url())) return true;
    return (await page.locator(SEL.loginUser).count()) > 0;
  }

  protected async performLogin(page: Page): Promise<void> {
    const { user, password } = config.scrapers.minimo;
    if (!user || !password) {
      throw new ReAuthRequired(this.source, 'MINIMO_USER / MINIMO_PASSWORD not configured');
    }

    await page.fill(SEL.loginUser, user);
    await page.fill(SEL.loginPassword, password);
    await page.click(SEL.loginSubmit);

    const ok = await page.waitForSelector(SEL.loggedInMarker, { timeout: 12_000 })
      .then(() => true)
      .catch(() => false);

    if (!ok) throw new ReAuthRequired(this.source, 'login did not produce logged-in marker');
  }

  protected async extractReservations(page: Page): Promise<ParsedReservation[]> {
    if (!page.url().includes('reservation')) {
      throw new SelectorDriftError(this.source, 'page.url()', `unexpected url: ${page.url()}`);
    }
    await page.waitForSelector(SEL.rowSelector, { timeout: 8_000 }).catch(() => {/* empty */});

    const rowsHtml = await page.locator(SEL.rowSelector).evaluateAll((els) =>
      els.map((el) => el.outerHTML)
    );
    return rowsHtml.map((html) => extractFromMinimoRowHtml(html))
                   .filter((r): r is ParsedReservation => r !== null);
  }
}

/** Pure extraction function — testable with HTML fixtures. */
export function extractFromMinimoRowHtml(html: string): ParsedReservation | null {
  const get = (re: RegExp): string | undefined => {
    const m = html.match(re);
    return m && m[1] ? toHankaku(m[1]).replace(/<[^>]+>/g, '').trim() : undefined;
  };

  const externalId = get(/data-reservation-id="([^"]+)"/);
  if (!externalId) return null;

  const dateStr  = get(/class="reservation-datetime"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const { startAt, endAt } = dateStr ? parseJpDateTimeRange(dateStr) : { startAt: undefined, endAt: undefined };

  const cust  = get(/class="reservation-customer"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const phone = get(/class="reservation-phone"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const menu  = get(/class="reservation-menu"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const staff = get(/class="reservation-staff"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const amt   = get(/class="reservation-amount"[^>]*>([\s\S]*?)<\/[^>]+>/);
  const stat  = get(/class="reservation-status"[^>]*>([\s\S]*?)<\/[^>]+>/) || 'new';

  const status =
    /キャンセル|取消/.test(stat) ? 'cancelled' :
    /変更/.test(stat)            ? 'modified'  : 'new';

  const warnings: string[] = [];
  if (!startAt) warnings.push('startAt could not be parsed');
  if (!cust)    warnings.push('customer.name missing');

  return {
    source: 'minimo',
    externalId,
    status,
    customer: { name: cust?.replace(/\s*様\s*$/, '').trim(), phone: normalizePhone(phone) },
    startAt: startAt ?? '',
    endAt,
    menu,
    staff,
    amount: parseYen(amt),
    rawText: html,
    parsedAt: new Date().toISOString(),
    warnings
  };
}
