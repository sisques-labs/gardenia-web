import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export type { CreateHarvestInput, UpdateHarvestInput };

export interface IHarvestsRepository {
  findByCriteria(): Promise<Harvest[]>;
  findById(id: string): Promise<Harvest>;
  create(input: CreateHarvestInput): Promise<CreatedEntity>;
  update(input: UpdateHarvestInput): Promise<CreatedEntity>;
  delete(id: string): Promise<void>;
}
