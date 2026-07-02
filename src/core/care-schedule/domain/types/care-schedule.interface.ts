export const CARE_SCHEDULE_ACTIVITY_TYPES = [
  'WATERING',
  'FERTILIZING',
  'PRUNING',
  'REPOTTING',
  'TRANSPLANTING',
  'PEST_TREATMENT',
  'MISTING',
  'ROTATION',
  'OTHER',
] as const;

export type CareScheduleActivityType = (typeof CARE_SCHEDULE_ACTIVITY_TYPES)[number];

export const CARE_SCHEDULE_UNITS = ['ML', 'L', 'G', 'KG'] as const;

export type CareScheduleUnit = (typeof CARE_SCHEDULE_UNITS)[number];

export interface CareSchedule {
  id: string;
  plantId: string;
  activityType: CareScheduleActivityType;
  intervalDays: number | null;
  quantity: number | null;
  unit: CareScheduleUnit | null;
  notes: string | null;
  nextDueAt: string;
  lastCompletedAt: string | null;
  active: boolean;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
