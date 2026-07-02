import { describe, it, expect } from 'vitest';
import { toISODate } from './to-iso-date.util';

describe('toISODate', () => {
  it('formats a date as YYYY-MM-DD using local components', () => {
    expect(toISODate(new Date(2026, 4, 18))).toBe('2026-05-18');
  });

  it('pads single-digit month and day', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
