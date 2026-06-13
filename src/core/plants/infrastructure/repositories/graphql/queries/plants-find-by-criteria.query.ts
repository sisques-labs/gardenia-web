import { gql } from '@apollo/client';

export const PLANTS_FIND_BY_CRITERIA = gql`
  query PlantsFindByCriteria {
    plantsFindByCriteria {
      items {
        id
        name
        plantSpeciesId
        species {
          id
          scientificName
          description
          imageUrl
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
  }
`;
