import { gql } from '@apollo/client';

export const PLANTING_SPOT_FIND_BY_ID = gql`
  query PlantingSpotFindById($input: PlantingSpotFindByIdRequestDto!) {
    plantingSpotFindById(input: $input) {
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
  }
`;
