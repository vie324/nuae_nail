import { describe, it, expect } from 'vitest';
import { createScraper, ReAuthRequired, SelectorDriftError } from '../index.ts';

describe('createScraper factory', () => {
  it('returns a HpbScraper instance for "hpb"', () => {
    const s = createScraper('hpb');
    expect(s.source).toBe('hpb');
    expect(s.loginUrl).toContain('salonboard');
  });

  it('returns a MinimoScraper instance for "minimo"', () => {
    const s = createScraper('minimo');
    expect(s.source).toBe('minimo');
    expect(s.loginUrl).toContain('minimo');
  });
});

describe('error types', () => {
  it('ReAuthRequired carries source and reason', () => {
    const err = new ReAuthRequired('hpb', 'session expired');
    expect(err.name).toBe('ReAuthRequired');
    expect(err.source).toBe('hpb');
    expect(err.reason).toBe('session expired');
  });

  it('SelectorDriftError carries selector and hint', () => {
    const err = new SelectorDriftError('minimo', '.row', 'login form drifted');
    expect(err.name).toBe('SelectorDriftError');
    expect(err.selector).toBe('.row');
  });
});

describe('dry-run', () => {
  it('returns empty result without launching browser', async () => {
    const s = createScraper('hpb');
    const result = await s.run({ dryRun: true });
    expect(result.reservations).toEqual([]);
    expect(result.warnings).toContain('dryRun');
  });
});
