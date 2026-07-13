import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from './format-relative-time.util';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats seconds ago', () => {
    expect(formatRelativeTime('2026-07-13T11:59:30.000Z')).toBe('30 seconds ago');
  });

  it('formats minutes ago', () => {
    expect(formatRelativeTime('2026-07-13T11:45:00.000Z')).toBe('15 minutes ago');
  });

  it('formats hours ago', () => {
    expect(formatRelativeTime('2026-07-13T09:00:00.000Z')).toBe('3 hours ago');
  });

  it('formats days ago', () => {
    expect(formatRelativeTime('2026-07-10T12:00:00.000Z')).toBe('3 days ago');
  });
});
