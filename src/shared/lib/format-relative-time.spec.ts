import { describe, it, expect, vi } from 'vitest';
import { formatRelativeTime } from './format-relative-time';

describe('formatRelativeTime', () => {
  it('formats a date a few seconds in the past', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const past = new Date(now - 30 * 1000).toISOString();

    expect(formatRelativeTime(past, 'en')).toMatch(/second/i);
  });

  it('formats a date a few days in the future', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const future = new Date(now + 2 * 86400 * 1000).toISOString();

    expect(formatRelativeTime(future, 'en')).toMatch(/day/i);
  });

  it('reuses the Intl.RelativeTimeFormat instance across calls for the same locale', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const OriginalRTF = Intl.RelativeTimeFormat;
    const ctorSpy = vi
      .spyOn(Intl, 'RelativeTimeFormat')
      .mockImplementation(function (this: unknown, locale, opts) {
        return new OriginalRTF(locale, opts);
      });

    formatRelativeTime(new Date(now - 1000).toISOString(), 'en');
    const callsAfterFirst = ctorSpy.mock.calls.length;
    formatRelativeTime(new Date(now - 2000).toISOString(), 'en');

    expect(ctorSpy.mock.calls.length).toBe(callsAfterFirst);
  });
});
