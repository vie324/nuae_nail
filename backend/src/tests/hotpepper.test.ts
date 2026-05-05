import { describe, it, expect } from 'vitest';
import { parseHotpepper } from '../parsers/hotpepper.ts';
import { loadFixture } from './helpers.ts';

describe('parseHotpepper', () => {
  it('parses a new-reservation email', () => {
    const text = loadFixture('hpb-new.txt');
    const out = parseHotpepper(text, '【ホットペッパービューティー】予約完了のお知らせ');
    expect(out).not.toBeNull();
    expect(out!.source).toBe('hpb');
    expect(out!.status).toBe('new');
    expect(out!.externalId).toBe('HPB-789012345');
    expect(out!.customer.name).toBe('伊藤 さやか');
    expect(out!.customer.phone).toBe('09033334444');
    expect(out!.customer.email).toBe('sayaka.i@example.jp');
    expect(out!.startAt).toBe('2026-04-24T04:00:00.000Z'); // 13:00 JST
    expect(out!.endAt).toBe('2026-04-24T05:15:00.000Z');
    expect(out!.menu).toBe('フレンチジェル');
    expect(out!.staff).toBe('田中 美咲');
    expect(out!.amount).toBe(7700);
    expect(out!.warnings).toEqual([]);
  });

  it('parses a cancellation email', () => {
    const text = loadFixture('hpb-cancel.txt');
    const out = parseHotpepper(text, '【ホットペッパービューティー】予約キャンセルのお知らせ');
    expect(out).not.toBeNull();
    expect(out!.status).toBe('cancelled');
    expect(out!.externalId).toBe('HPB-789012345');
  });

  it('returns null without an id', () => {
    expect(parseHotpepper('empty body', '')).toBeNull();
  });
});
