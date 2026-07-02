import type { PlantFilter } from '@/core/plants/application/interfaces/plant-filter.interface';

export interface PlantListCriteria {
  filters?: PlantFilter[];
  pagination?: { page: number; perPage: number };
}
