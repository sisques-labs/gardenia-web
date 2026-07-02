import { describe, it, expect } from 'vitest';
import { formatDueDate } from './format-due-date.util';

describe('formatDueDate', () => {
  it('formats an ISO datetime as DD-MM-YYYY, dropping the time', () => {
    expect(formatDueDate('2026-07-01T15:17:17.390Z')).toBe('01-07-2026');
  });

  it('pads single-digit day and month', () => {
    expect(formatDueDate(new Date(2026, 0, 5).toISOString())).toBe('05-01-2026');
  });
});
