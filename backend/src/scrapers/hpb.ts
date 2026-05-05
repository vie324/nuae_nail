/**
 * Hot Pepper Beauty / Salonboard scraper (skeleton).
 *
 * ⚠️ サロンボードの利用規約は自動アクセスを禁じています。
 *    本番運用は必ずオーナーの自己責任 + 文書同意のうえで行ってください。
 *
 * 実装のステータス:
 *   - フロー / セレクタ捕獲ポイント / 抽出関数のシグネチャ: 完成
 *   - 実セレクタ (input[name=...]、行 selector など): TODO で未確定
 *
 * セレクタ捕獲手順:
 *   1. SCRAPER_HEADLESS=false で `npm run scrape hpb -- --capture` を実行
 *   2. 表示された Chromium 上で実際にログインする（手動）
 *   3. /reservation/list 等を開いた状態で DevTools → "Copy selector"
 *   4. 下の `SEL` を埋める
 *   5. SCRAPER_HEADLESS=true に戻して通常運用へ
 */
import type { Page } from 'playwright';
import { BaseScraper } from './base.ts';
import { ReAuthRequired, SelectorDriftError } from './types.ts';
import {
  parseJpDateTimeRange, normalizePhone, parseYen, toHankaku
} from '../parsers/normalize.ts';
import { config } from '../config.ts';
import type { ParsedReservation } from '../parsers/types.ts';

/**
 * セレクタは公開情報のため空欄にしてあります。実機キャプチャ後に埋めてください。
 * 各キーの ★ 印は最低限必要なもの。
 */
const SEL = {
  // ★ Login form
  loginUser:      'input[name="userId"]',          // TODO: verify on /login
  loginPassword:  'input[name="password"]',        // TODO: verify
  loginSubmit:    'button[type="submit"]',         // TODO: verify
  // 2FA element to detect (if salonboard prompts SMS code)
  twofaInput:     'input[name="otp"]',             // optional

  // ★ Logged-in marker (e.g. an account dropdown only present after auth)
  loggedInMarker: '[data-testid="account-menu"]',  // TODO: verify

  // ★ Reservation list page
  rowSelector:    'table.reservation-list tr[data-reservation-id]', // TODO
  cellId:         'td.col-id',                     // TODO
  cellCustomer:   'td.col-customer',               // TODO
  cellPhone:      'td.col-phone',                  // TODO
  cellDateTime:   'td.col-datetime',               // TODO
  cellMenu:       'td.col-menu',                   // TODO
  cellStaff:      'td.col-staff',                  // TODO
  cellAmount:     'td.col-amount',                 // TODO
  cellStatus:     'td.col-status'                  // TODO
} as const;

export class HpbScraper extends BaseScraper {
  readonly source = 'hpb' as const;
  readonly loginUrl        = 'https://salonboard.com/login/';
  readonly reservationsUrl = 'https://salonboard.com/CNK/reserve/list/';

  protected async isLoggedOut(page: Page): Promise<boolean> {
    // Salonboard typically redirects unauthenticated requests to /login/.
    if (/\/login\/?(\?|$)/.test(page.url())) return true;
    return (await page.locator(SEL.loginUser).count()) > 0;
  }

  protected async performLogin(page: Page): Promise<void> {
    const { user, password } = config.scrapers.hpb;
    if (!user || !password) {
      throw new ReAuthRequired(this.source, 'SALONBOARD_USER / SALONBOARD_PASSWORD not configured');
    }

    await page.fill(SEL.loginUser, user);
    await page.fill(SEL.loginPassword, password);
    await page.click(SEL.loginSubmit);

    // Wait for either logged-in marker, 2FA prompt, or remaining on login.
    const result = await Promise.race([
      page.waitForSelector(SEL.loggedInMarker, { timeout: 12_000 }).then(() => 'ok'),
      page.waitForSelector(SEL.twofaInput,    { timeout: 12_000 }).then(() => '2fa'),
      page.waitForTimeout(13_000).then(() => 'timeout')
    ]).catch(() => 'timeout');

    if (result === '2fa') {
      throw new ReAuthRequired(this.source, '2FA prompted; manual code entry required');
    }
    if (result !== 'ok') {
      throw new ReAuthRequired(this.source, 'login did not produce logged-in marker');
    }
  }

  protected async extractReservations(page: Page): Promise<ParsedReservation[]> {
    // Make sure we're on the right page; the platform might redirect elsewhere.
    if (!page.url().includes('reserve')) {
      throw new SelectorDriftError(this.source, 'page.url()', `unexpected url: ${page.url()}`);
    }

    // Wait for at least one row, but don't blow up on empty days.
    await page.waitForSelector(SEL.rowSelector, { timeout: 8_000 }).catch(() => {/* empty list */});

    const rowsHtml = await page.locator(SEL.rowSelector).evaluateAll((els) =>
      els.map((el) => el.outerHTML)
    );

    return rowsHtml.map((html) => extractFromHpbRowHtml(html)).filter((r): r is ParsedReservation => r !== null);
  }
}

/**
 * Pure function: given a single <tr> outerHTML, return ParsedReservation.
 * Lives outside the class so it's unit-testable with HTML fixtures.
 */
export function extractFromHpbRowHtml(html: string): ParsedReservation | null {
  const get = (re: RegExp): string | undefined => {
    const m = html.match(re);
    return m && m[1] ? toHankaku(m[1]).replace(/<[^>]+>/g, '').trim() : undefined;
  };

  // Highly tolerant: matches by class name regardless of tag.
  const externalId = get(/data-reservation-id="([^"]+)"/);
  if (!externalId) return null;

  const dateStr  = get(/class="col-datetime"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const { startAt, endAt } = dateStr ? parseJpDateTimeRange(dateStr) : { startAt: undefined, endAt: undefined };

  const cust  = get(/class="col-customer"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const phone = get(/class="col-phone"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const menu  = get(/class="col-menu"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const staff = get(/class="col-staff"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const amt   = get(/class="col-amount"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/);
  const stat  = get(/class="col-status"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/td>/) || 'new';

  const status =
    /キャンセル|取消/.test(stat) ? 'cancelled' :
    /変更/.test(stat)            ? 'modified'  : 'new';

  const warnings: string[] = [];
  if (!startAt) warnings.push('startAt could not be parsed');
  if (!cust)    warnings.push('customer.name missing');

  return {
    source: 'hpb',
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
