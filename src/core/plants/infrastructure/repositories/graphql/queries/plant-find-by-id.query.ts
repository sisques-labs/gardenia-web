import { gql } from '@apollo/client';

export const PLANT_FIND_BY_ID = gql`
  query PlantFindById($input: PlantFindByIdRequestDto!) {
    plantFindById(input: $input) {
      id
      name
      plantSpeciesId
      species {
        id
        name
        createdAt
        updatedAt
      }
      imageUrl
      userId
      spaceId
      qr {
        id
        spaceId
        targetUrl
        generation
        image
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
