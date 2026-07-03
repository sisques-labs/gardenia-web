export enum CareLogActivityType {
  WATERING = 'WATERING',
  FERTILIZING = 'FERTILIZING',
  PRUNING = 'PRUNING',
  REPOTTING = 'REPOTTING',
  TRANSPLANTING = 'TRANSPLANTING',
  PEST_TREATMENT = 'PEST_TREATMENT',
  MISTING = 'MISTING',
  ROTATION = 'ROTATION',
  OTHER = 'OTHER',
}

export interface CareLogEntry {
  id: string;
  plantId: string;
  activityType: CareLogActivityType;
  performedAt: string;
}

export type LastCareByType = Partial<Record<CareLogActivityType, CareLogEntry>>;

export const CARE_LOG_UNITS = ['ML', 'L', 'G', 'KG'] as const;

export type CareLogUnit = (typeof CARE_LOG_UNITS)[number];
