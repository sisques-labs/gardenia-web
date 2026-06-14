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
