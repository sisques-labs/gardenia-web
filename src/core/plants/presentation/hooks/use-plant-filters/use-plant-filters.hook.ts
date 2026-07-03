import { useMemo, useState } from 'react';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { PlantQueryableField } from '@/core/plants/domain/enums/plant-queryable-field.enum';
import type { PlantFilter } from '@/core/plants/application/interfaces/plant-filter.interface';

export function usePlantFilters() {
  const [search, setSearch] = useState('');

  const filters = useMemo<PlantFilter[]>(() => {
    const trimmed = search.trim();
    if (!trimmed) return [];
    return [{ field: PlantQueryableField.NAME, operator: FilterOperator.LIKE, value: trimmed }];
  }, [search]);

  return { search, setSearch, filters };
}
