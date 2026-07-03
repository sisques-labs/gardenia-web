import type { CareLogActivityType, CareLogUnit } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export interface CreateCareLogInput {
  plantId: string;
  activityType: CareLogActivityType;
  performedAt?: string;
  notes?: string;
  quantity?: number;
  unit?: CareLogUnit;
}
