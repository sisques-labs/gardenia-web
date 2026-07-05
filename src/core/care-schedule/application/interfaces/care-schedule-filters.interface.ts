import type { CareScheduleActivityType } from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CareScheduleFilters {
  plantId?: string;
  activityType?: CareScheduleActivityType;
  active?: boolean;
  /** Restrict to schedules whose nextDueAt falls on this exact calendar day ('YYYY-MM-DD'). */
  dueOnDay?: string;
  /** Restrict to schedules whose nextDueAt falls on or after this calendar day ('YYYY-MM-DD'). Ignored when dueOnDay is set. */
  dueFrom?: string;
  /** Restrict to schedules whose nextDueAt falls on or before this calendar day ('YYYY-MM-DD'). Ignored when dueOnDay is set. */
  dueTo?: string;
}
