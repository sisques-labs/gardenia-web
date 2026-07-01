import type {
  CareScheduleActivityType,
  CareScheduleUnit,
} from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CreateCareScheduleInput {
  plantId: string;
  activityType: CareScheduleActivityType;
  intervalDays?: number | null;
  quantity?: number;
  unit?: CareScheduleUnit;
  notes?: string;
  nextDueAt?: string;
}
