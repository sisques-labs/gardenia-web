import { gql } from '@apollo/client';

export const PLANT_IDENTIFICATIONS = gql`
  query PlantIdentifications($input: PlantIdentificationFindByCriteriaRequestDto) {
    plantIdentifications(input: $input) {
      items {
        id
        status
        resolved {
          gbifKey
          scientificName
        }
        candidates {
          scientificName
          commonNames
          score
        }
        photos {
          url
          organ
        }
        convertedToPlantId
        createdAt
      }
      total
    }
  }
`;
