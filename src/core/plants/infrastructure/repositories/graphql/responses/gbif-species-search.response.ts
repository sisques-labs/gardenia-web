import type { GbifSpeciesSuggestion } from '@/core/plants/domain/interfaces/gbif-species-suggestion.interface';

export interface GbifSpeciesSearchResponse {
  gbifSpeciesSearch: GbifSpeciesSuggestion[];
}
