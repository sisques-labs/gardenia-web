import { gql } from '@apollo/client';

export const PLANTING_SPOTS_FIND_BY_CRITERIA = gql`
  query PlantingSpotsFindByCriteria {
    plantingSpotsFindByCriteria {
      items {
        id
        name
        type
        description
        userId
        spaceId
        createdAt
        updatedAt
      }
    }
  }
`;
