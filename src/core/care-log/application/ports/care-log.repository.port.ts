import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CreateCareLogInput } from '@/core/care-log/application/interfaces/create-care-log-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export interface ICareLogRepository {
  findByPlantId(plantId: string, limit?: number): Promise<CareLogEntry[]>;
  create(input: CreateCareLogInput): Promise<CreatedEntity>;
}
