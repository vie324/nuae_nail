import { describe, it, expect } from 'vitest';
import { parseMinimo } from '../parsers/minimo.ts';
import { loadFixture } from './helpers.ts';

describe('parseMinimo', () => {
  it('parses a new-reservation email', () => {
    const text = loadFixture('minimo-new.txt');
    const out = parseMinimo(text, '【minimo】山田 花子様より新規予約のご連絡');
    expect(out).not.toBeNull();
    expect(out!.source).toBe('minimo');
    expect(out!.status).toBe('new');
    expect(out!.externalId).toBe('M9876543');
    expect(out!.customer.name).toBe('山田 花子');
    expect(out!.customer.nameKana).toBe('ヤマダ ハナコ');
    expect(out!.customer.phone).toBe('09011112222');
    expect(out!.startAt).toBe('2026-04-24T01:00:00.000Z');
    expect(out!.endAt).toBe('2026-04-24T02:30:00.000Z');
    expect(out!.menu).toBe('ジェルネイル(ワンカラー)');
    expect(out!.staff).toBe('田中 美咲');
    expect(out!.amount).toBe(6600);
    expect(out!.warnings).toEqual([]);
  });

  it('parses a modify email', () => {
    const text = loadFixture('minimo-modify.txt');
    const out = parseMinimo(text, '【minimo】予約内容変更のご連絡');
    expect(out).not.toBeNull();
    expect(out!.status).toBe('modified');
    expect(out!.externalId).toBe('M9876543');
    expect(out!.startAt).toBe('2026-04-25T05:00:00.000Z'); // 14:00 JST = 05:00Z
    expect(out!.amount).toBe(7700);
  });

  it('parses a cancellation email', () => {
    const text = loadFixture('minimo-cancel.txt');
    const out = parseMinimo(text, '【minimo】予約キャンセルのご連絡');
    expect(out).not.toBeNull();
    expect(out!.status).toBe('cancelled');
    expect(out!.externalId).toBe('M9876543');
  });

  it('returns null when no external id is present', () => {
    expect(parseMinimo('hello world', 'random subject')).toBeNull();
  });
});
