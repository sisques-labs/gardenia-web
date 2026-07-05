import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export function groupCareSchedulesByDay(careSchedules: CareSchedule[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const schedule of careSchedules) {
    const day = schedule.nextDueAt.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return counts;
}
