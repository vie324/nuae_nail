import { describe, it, expect } from 'vitest';
import {
  toHankaku,
  normalizePhone,
  parseYen,
  parseJpDateTimeRange
} from '../parsers/normalize.ts';

describe('toHankaku', () => {
  it('converts 全角 digits and symbols', () => {
    expect(toHankaku('１２３')).toBe('123');
    expect(toHankaku('Ａ：１０')).toBe('A:10');
    expect(toHankaku('全角　スペース')).toBe('全角 スペース');
  });
});

describe('normalizePhone', () => {
  it('strips dashes and parens', () => {
    expect(normalizePhone('090-1111-2222')).toBe('09011112222');
    expect(normalizePhone('(080)3333-4444')).toBe('08033334444');
  });
  it('returns undefined for too-short input', () => {
    expect(normalizePhone('123')).toBeUndefined();
    expect(normalizePhone(undefined)).toBeUndefined();
  });
});

describe('parseYen', () => {
  it('handles ¥ and , and 円', () => {
    expect(parseYen('¥6,600')).toBe(6600);
    expect(parseYen('7,700円')).toBe(7700);
    expect(parseYen('11000')).toBe(11000);
  });
  it('returns undefined for nonsense', () => {
    expect(parseYen('abc')).toBeUndefined();
    expect(parseYen(undefined)).toBeUndefined();
  });
});

describe('parseJpDateTimeRange', () => {
  it('parses full Japanese date+range with weekday', () => {
    const out = parseJpDateTimeRange('2026年4月24日(金) 10:00 〜 11:30');
    // 10:00 JST = 01:00 UTC
    expect(out.startAt).toBe('2026-04-24T01:00:00.000Z');
    expect(out.endAt).toBe('2026-04-24T02:30:00.000Z');
  });

  it('parses ISO-style separators', () => {
    const out = parseJpDateTimeRange('2026/04/24 13:00 〜 14:15');
    expect(out.startAt).toBe('2026-04-24T04:00:00.000Z');
    expect(out.endAt).toBe('2026-04-24T05:15:00.000Z');
  });

  it('parses single-time only', () => {
    const out = parseJpDateTimeRange('2026年4月24日 10:00');
    expect(out.startAt).toBe('2026-04-24T01:00:00.000Z');
    expect(out.endAt).toBeUndefined();
  });

  it('returns empty for unparseable', () => {
    expect(parseJpDateTimeRange('not a date')).toEqual({});
  });
});
