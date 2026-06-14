import { gql } from '@apollo/client';

export const USERS_FIND_BY_CRITERIA = gql`
  query UsersFindByCriteria {
    usersFindByCriteria {
      items {
        id
        username
        firstName
        lastName
        avatarUrl
        status
      }
      total
    }
  }
`;
