import type { PlantFilterOperator } from '@/core/plants/domain/enums/plant-filter-operator.enum';
import type { PlantQueryableField } from '@/core/plants/domain/enums/plant-queryable-field.enum';

export interface PlantFilter {
  field: PlantQueryableField;
  operator: PlantFilterOperator;
  value: unknown;
}
