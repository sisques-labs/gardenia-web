import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import type { CareScheduleFilters } from '@/core/care-schedule/application/interfaces/care-schedule-filters.interface';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export type { CreateCareScheduleInput, UpdateCareScheduleInput };

export interface ICareScheduleRepository {
  findByCriteria(filters?: CareScheduleFilters): Promise<CareSchedule[]>;
  findById(id: string): Promise<CareSchedule>;
  create(input: CreateCareScheduleInput): Promise<CreatedEntity>;
  update(input: UpdateCareScheduleInput): Promise<CreatedEntity>;
  complete(id: string, completedAt?: string): Promise<CreatedEntity>;
  delete(id: string): Promise<void>;
}
