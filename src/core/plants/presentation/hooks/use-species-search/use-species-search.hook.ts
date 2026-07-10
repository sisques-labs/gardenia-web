import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/shared/presentation/hooks/use-debounced-value/use-debounced-value.hook';
import { SearchSpeciesUseCase } from '@/core/plants/application/use-cases/search-species/search-species.use-case';
import { plantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';

const searchSpeciesUseCase = new SearchSpeciesUseCase(plantsGqlRepository);

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 10;

export function useSpeciesSearch(rawQuery: string) {
  const debouncedQuery = useDebouncedValue(rawQuery, 300);
  const trimmed = debouncedQuery.trim();

  return useQuery({
    queryKey: ['species-search', trimmed],
    queryFn: () => searchSpeciesUseCase.execute(trimmed, RESULT_LIMIT),
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
    retry: false,
  });
}
