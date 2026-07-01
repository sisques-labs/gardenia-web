import type { CareScheduleActivityType } from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CareScheduleFilters {
  plantId?: string;
  activityType?: CareScheduleActivityType;
  active?: boolean;
  dueBefore?: string;
}
