import type { ListCriteria } from '@/shared/domain/interfaces/list-criteria.interface';
import type { PlantQueryableField } from '@/core/plants/domain/enums/plant-queryable-field.enum';

export type PlantListCriteria = ListCriteria<PlantQueryableField>;
