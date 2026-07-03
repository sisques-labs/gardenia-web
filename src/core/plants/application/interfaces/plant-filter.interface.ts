import type { Filter } from '@/shared/domain/interfaces/filter.interface';
import type { PlantQueryableField } from '@/core/plants/domain/enums/plant-queryable-field.enum';

export type PlantFilter = Filter<PlantQueryableField>;
