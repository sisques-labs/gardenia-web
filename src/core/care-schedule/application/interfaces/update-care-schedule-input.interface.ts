import type {
  CareScheduleActivityType,
  CareScheduleUnit,
} from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface UpdateCareScheduleInput {
  id: string;
  activityType?: CareScheduleActivityType;
  intervalDays?: number | null;
  quantity?: number | null;
  unit?: CareScheduleUnit | null;
  notes?: string | null;
  active?: boolean;
}
