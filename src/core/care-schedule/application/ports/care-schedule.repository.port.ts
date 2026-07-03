import type { CareSchedule, WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';
import type { CareScheduleFilters } from '@/core/care-schedule/application/interfaces/care-schedule-filters.interface';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';

export type { CreateCareScheduleInput, UpdateCareScheduleInput };

export interface ICareScheduleRepository {
  findByCriteria(filters?: CareScheduleFilters): Promise<CareSchedule[]>;
  findById(id: string): Promise<CareSchedule>;
  create(input: CreateCareScheduleInput): Promise<CareSchedule>;
  update(input: UpdateCareScheduleInput): Promise<CareSchedule>;
  complete(id: string, completedAt?: string): Promise<CareSchedule>;
  delete(id: string): Promise<void>;
  waterPlant(plantId: string, performedAt?: string): Promise<WaterPlantResult>;
}
