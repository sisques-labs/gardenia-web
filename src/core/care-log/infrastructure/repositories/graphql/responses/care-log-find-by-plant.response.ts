import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export interface CareLogFindByPlantResponse {
  careLogFindByCriteria: {
    items: CareLogEntry[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  } | null;
}
