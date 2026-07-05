import type { CareScheduleActivityType } from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CareScheduleFilters {
  plantId?: string;
  activityType?: CareScheduleActivityType;
  active?: boolean;
  /** Restrict to schedules whose nextDueAt falls on this exact calendar day ('YYYY-MM-DD'). */
  dueOnDay?: string;
  /** Restrict to schedules whose nextDueAt is on or before the end of this calendar day ('YYYY-MM-DD') — overdue + due today. */
  dueBefore?: string;
}
