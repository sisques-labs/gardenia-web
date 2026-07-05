import { describe, it, expect } from 'vitest';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import { groupCareSchedulesByDay } from './group-care-schedules-by-day.util';

function makeCareSchedule(overrides: Partial<CareSchedule>): CareSchedule {
  return {
    id: 'cs-1',
    plantId: 'plant-1',
    activityType: 'WATERING',
    intervalDays: null,
    quantity: null,
    unit: null,
    notes: null,
    nextDueAt: '2026-07-05',
    lastCompletedAt: null,
    active: true,
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
    ...overrides,
  };
}

describe('groupCareSchedulesByDay', () => {
  it('returns an empty object for an empty list', () => {
    expect(groupCareSchedulesByDay([])).toEqual({});
  });

  it('counts one schedule under its due day', () => {
    const result = groupCareSchedulesByDay([makeCareSchedule({ nextDueAt: '2026-07-05' })]);
    expect(result).toEqual({ '2026-07-05': 1 });
  });

  it('sums multiple schedules due on the same day', () => {
    const result = groupCareSchedulesByDay([
      makeCareSchedule({ id: 'cs-1', nextDueAt: '2026-07-05' }),
      makeCareSchedule({ id: 'cs-2', nextDueAt: '2026-07-05' }),
    ]);
    expect(result).toEqual({ '2026-07-05': 2 });
  });

  it('keeps separate counts per day', () => {
    const result = groupCareSchedulesByDay([
      makeCareSchedule({ id: 'cs-1', nextDueAt: '2026-07-05' }),
      makeCareSchedule({ id: 'cs-2', nextDueAt: '2026-07-12' }),
    ]);
    expect(result).toEqual({ '2026-07-05': 1, '2026-07-12': 1 });
  });

  it('ignores any time component and groups by calendar day only', () => {
    const result = groupCareSchedulesByDay([
      makeCareSchedule({ id: 'cs-1', nextDueAt: '2026-07-05T08:00:00.000' }),
      makeCareSchedule({ id: 'cs-2', nextDueAt: '2026-07-05T22:30:00.000' }),
    ]);
    expect(result).toEqual({ '2026-07-05': 2 });
  });
});
