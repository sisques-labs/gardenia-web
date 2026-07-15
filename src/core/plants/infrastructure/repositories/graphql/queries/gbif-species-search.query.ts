import { gql } from '@apollo/client';

export const GBIF_SPECIES_SEARCH = gql`
  query GbifSpeciesSearch($input: GbifSpeciesSearchRequestDto!) {
    gbifSpeciesSearch(input: $input) {
      gbifKey
      scientificName
    }
  }
`;
