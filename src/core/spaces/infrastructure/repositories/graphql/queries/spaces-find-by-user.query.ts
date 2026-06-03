import { gql } from '@apollo/client';

export const SPACES_FIND_BY_USER = gql`
  query SpacesFindByUser {
    spacesFindByUser {
      items {
        id
        name
        ownerId
        createdAt
      }
    }
  }
`;
