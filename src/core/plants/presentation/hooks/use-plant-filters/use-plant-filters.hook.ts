import { useMemo, useState } from 'react';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { useDebouncedValue } from '@/shared/presentation/hooks/use-debounced-value/use-debounced-value.hook';
import { PlantQueryableField } from '@/core/plants/domain/enums/plant-queryable-field.enum';
import type { PlantFilter } from '@/core/plants/application/interfaces/plant-filter.interface';

export function usePlantFilters() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<PlantFilter[]>(() => {
    const trimmed = debouncedSearch.trim();
    if (!trimmed) return [];
    return [{ field: PlantQueryableField.NAME, operator: FilterOperator.LIKE, value: trimmed }];
  }, [debouncedSearch]);

  return { search, setSearch, filters };
}
