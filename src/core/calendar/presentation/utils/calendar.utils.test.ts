import { describe, it, expect } from 'vitest';
import { getDaysInMonth, getFirstDayOffset, toISODate, getSeason } from './calendar.utils';

describe('getDaysInMonth', () => {
  it('returns 28 for Feb 2026 (non-leap)', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
  });

  it('returns 29 for Feb 2024 (leap)', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it('returns 31 for May 2026', () => {
    expect(getDaysInMonth(2026, 4)).toBe(31);
  });

  it('returns 30 for April 2026', () => {
    expect(getDaysInMonth(2026, 3)).toBe(30);
  });
});

describe('getFirstDayOffset', () => {
  it('returns 4 for May 2026 (Friday = Mon-indexed 4)', () => {
    expect(getFirstDayOffset(2026, 4)).toBe(4);
  });

  it('returns 3 for Jan 2026 (Thursday = Mon-indexed 3)', () => {
    expect(getFirstDayOffset(2026, 0)).toBe(3);
  });

  it('returns 0 for a month starting on Monday', () => {
    // June 2026 starts on Monday
    expect(getFirstDayOffset(2026, 5)).toBe(0);
  });
});

describe('toISODate', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 4, 18))).toBe('2026-05-18');
  });

  it('pads month and day with leading zeros', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('getSeason', () => {
  it('returns invierno for December (11)', () => {
    expect(getSeason(11)).toBe('invierno');
  });

  it('returns invierno for January (0)', () => {
    expect(getSeason(0)).toBe('invierno');
  });

  it('returns invierno for February (1)', () => {
    expect(getSeason(1)).toBe('invierno');
  });

  it('returns primavera for March (2)', () => {
    expect(getSeason(2)).toBe('primavera');
  });

  it('returns primavera for May (4)', () => {
    expect(getSeason(4)).toBe('primavera');
  });

  it('returns verano for June (5)', () => {
    expect(getSeason(5)).toBe('verano');
  });

  it('returns verano for August (7)', () => {
    expect(getSeason(7)).toBe('verano');
  });

  it('returns otoño for September (8)', () => {
    expect(getSeason(8)).toBe('otoño');
  });

  it('returns otoño for October (9)', () => {
    expect(getSeason(9)).toBe('otoño');
  });
});
