import { describe, it, expect } from 'vitest';
import { formatShortDate } from './format-short-date.util';

describe('formatShortDate', () => {
  it('formats an ISO date with day and short month for the given locale', () => {
    const formatted = formatShortDate('2026-04-12T10:00:00.000Z', 'en');
    expect(formatted).toMatch(/12/);
    expect(formatted).toMatch(/Apr/i);
  });
});
