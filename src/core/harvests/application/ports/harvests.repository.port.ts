import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';

export type { CreateHarvestInput, UpdateHarvestInput };

export interface IHarvestsRepository {
  findByCriteria(): Promise<Harvest[]>;
  findById(id: string): Promise<Harvest>;
  create(input: CreateHarvestInput): Promise<Harvest>;
  update(input: UpdateHarvestInput): Promise<Harvest>;
  delete(id: string): Promise<void>;
}
