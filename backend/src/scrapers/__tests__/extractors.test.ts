import { describe, it, expect } from 'vitest';
import { extractFromHpbRowHtml }    from '../hpb.ts';
import { extractFromMinimoRowHtml } from '../minimo.ts';

/**
 * These fixtures use the same selectors that hpb.ts / minimo.ts assume.
 * When you patch the real selectors in production, copy actual HTML
 * snippets here so we have regression coverage.
 */

describe('extractFromHpbRowHtml', () => {
  const html = `
    <tr data-reservation-id="HPB-789012345">
      <td class="col-id">789012345</td>
      <td class="col-customer">伊藤 さやか 様</td>
      <td class="col-phone">090-3333-4444</td>
      <td class="col-datetime">2026年4月24日(金) 13:00 〜 14:15</td>
      <td class="col-menu">フレンチジェル</td>
      <td class="col-staff">田中 美咲</td>
      <td class="col-amount">¥7,700</td>
      <td class="col-status">確定</td>
    </tr>
  `;

  it('parses a row into ParsedReservation', () => {
    const r = extractFromHpbRowHtml(html);
    expect(r).not.toBeNull();
    expect(r!.source).toBe('hpb');
    expect(r!.externalId).toBe('HPB-789012345');
    expect(r!.status).toBe('new');
    expect(r!.customer.name).toBe('伊藤 さやか');
    expect(r!.customer.phone).toBe('09033334444');
    expect(r!.startAt).toBe('2026-04-24T04:00:00.000Z');
    expect(r!.endAt).toBe('2026-04-24T05:15:00.000Z');
    expect(r!.menu).toBe('フレンチジェル');
    expect(r!.staff).toBe('田中 美咲');
    expect(r!.amount).toBe(7700);
    expect(r!.warnings).toEqual([]);
  });

  it('returns null when reservation id is missing', () => {
    expect(extractFromHpbRowHtml('<tr><td>nothing</td></tr>')).toBeNull();
  });

  it('flags cancellation status', () => {
    const cancelled = html.replace('確定', 'キャンセル');
    expect(extractFromHpbRowHtml(cancelled)?.status).toBe('cancelled');
  });
});

describe('extractFromMinimoRowHtml', () => {
  const html = `
    <div data-reservation-id="M9876543" class="reservation-row">
      <span class="reservation-customer">山田 花子 様</span>
      <span class="reservation-phone">090-1111-2222</span>
      <span class="reservation-datetime">2026年4月24日(金) 10:00 〜 11:30</span>
      <span class="reservation-menu">ジェルネイル(ワンカラー)</span>
      <span class="reservation-staff">田中 美咲</span>
      <span class="reservation-amount">¥6,600</span>
      <span class="reservation-status">確定</span>
    </div>
  `;

  it('parses a row into ParsedReservation', () => {
    const r = extractFromMinimoRowHtml(html);
    expect(r).not.toBeNull();
    expect(r!.source).toBe('minimo');
    expect(r!.externalId).toBe('M9876543');
    expect(r!.customer.name).toBe('山田 花子');
    expect(r!.startAt).toBe('2026-04-24T01:00:00.000Z');
    expect(r!.amount).toBe(6600);
  });
});
