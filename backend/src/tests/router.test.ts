import { describe, it, expect } from 'vitest';
import { detectSource } from '../parsers/router.ts';

describe('detectSource', () => {
  it('detects minimo from From header', () => {
    expect(detectSource({ from: 'minimo <noreply@minimodel.jp>' })).toBe('minimo');
    expect(detectSource({ from: 'no-reply@notify.minimo.mu' })).toBe('minimo');
  });

  it('detects hpb from From header', () => {
    expect(detectSource({ from: 'reserve-noreply.beauty.hotpepper.jp' })).toBe('hpb');
    expect(detectSource({ from: 'system@salonboard.com' })).toBe('hpb');
  });

  it('falls back to subject signal when From is generic', () => {
    expect(detectSource({
      from: 'noreply@example.com',
      subject: '【minimo】山田様より新規予約'
    })).toBe('minimo');

    expect(detectSource({
      from: 'noreply@example.com',
      subject: '【ホットペッパービューティー】予約完了のお知らせ'
    })).toBe('hpb');
  });

  it('returns null for unrelated mail', () => {
    expect(detectSource({ from: 'friend@gmail.com', subject: 'Hi!' })).toBeNull();
    expect(detectSource({})).toBeNull();
  });

  it('handles missing fields gracefully', () => {
    expect(detectSource({ subject: undefined, from: undefined })).toBeNull();
  });
});
