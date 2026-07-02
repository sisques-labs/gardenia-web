import { describe, it, expect, beforeEach } from 'vitest';
import { useCalendarStore } from './calendar.store';
import { toISODate } from '../../presentation/utils/to-iso-date/to-iso-date.util';

const today = new Date();

beforeEach(() => {
  useCalendarStore.setState({
    selectedDate: toISODate(today),
    currentYear: today.getFullYear(),
    currentMonth: today.getMonth(),
  });
});

describe('useCalendarStore — initial state', () => {
  it('selectedDate defaults to today ISO string', () => {
    expect(useCalendarStore.getState().selectedDate).toBe(toISODate(today));
  });

  it('currentYear defaults to today year', () => {
    expect(useCalendarStore.getState().currentYear).toBe(today.getFullYear());
  });

  it('currentMonth defaults to today month (0-indexed)', () => {
    expect(useCalendarStore.getState().currentMonth).toBe(today.getMonth());
  });
});

describe('setSelectedDate', () => {
  it('updates selectedDate with the given ISO string', () => {
    useCalendarStore.getState().setSelectedDate('2026-07-04');
    expect(useCalendarStore.getState().selectedDate).toBe('2026-07-04');
  });
});

describe('setCurrentMonth', () => {
  it('updates currentYear and currentMonth', () => {
    useCalendarStore.getState().setCurrentMonth(2027, 3);
    expect(useCalendarStore.getState().currentYear).toBe(2027);
    expect(useCalendarStore.getState().currentMonth).toBe(3);
  });
});

describe('prevMonth', () => {
  it('decrements month by one', () => {
    useCalendarStore.getState().setCurrentMonth(2026, 5);
    useCalendarStore.getState().prevMonth();
    expect(useCalendarStore.getState().currentMonth).toBe(4);
    expect(useCalendarStore.getState().currentYear).toBe(2026);
  });

  it('wraps from January to December of previous year', () => {
    useCalendarStore.getState().setCurrentMonth(2026, 0);
    useCalendarStore.getState().prevMonth();
    expect(useCalendarStore.getState().currentMonth).toBe(11);
    expect(useCalendarStore.getState().currentYear).toBe(2025);
  });
});

describe('nextMonth', () => {
  it('increments month by one', () => {
    useCalendarStore.getState().setCurrentMonth(2026, 5);
    useCalendarStore.getState().nextMonth();
    expect(useCalendarStore.getState().currentMonth).toBe(6);
    expect(useCalendarStore.getState().currentYear).toBe(2026);
  });

  it('wraps from December to January of next year', () => {
    useCalendarStore.getState().setCurrentMonth(2025, 11);
    useCalendarStore.getState().nextMonth();
    expect(useCalendarStore.getState().currentMonth).toBe(0);
    expect(useCalendarStore.getState().currentYear).toBe(2026);
  });
});
