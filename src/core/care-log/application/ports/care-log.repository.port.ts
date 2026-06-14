import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export interface ICareLogRepository {
  findByPlantId(plantId: string, limit?: number): Promise<CareLogEntry[]>;
}
