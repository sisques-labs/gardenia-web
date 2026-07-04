import { gql } from '@apollo/client';

export const PLANTING_SPOTS_FIND_BY_CRITERIA = gql`
  query PlantingSpotsFindByCriteria($input: PlantingSpotFindByCriteriaRequestDto) {
    plantingSpotsFindByCriteria(input: $input) {
      items {
        id
        name
        type
        description
        capacity
        row
        column
        dimensionsWidth
        dimensionsHeight
        dimensionsLength
        soilType
        status
        fallowSince
        userId
        spaceId
        resolvedPlants {
          id
          name
          plantSpeciesId
          imageUrl
          userId
          spaceId
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      total
      page
      perPage
      totalPages
    }
  }
`;
