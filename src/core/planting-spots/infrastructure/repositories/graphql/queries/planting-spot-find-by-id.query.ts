import { gql } from '@apollo/client';

export const PLANTING_SPOT_FIND_BY_ID = gql`
  query PlantingSpotFindById($input: PlantingSpotFindByIdRequestDto!) {
    plantingSpotFindById(input: $input) {
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
`;
