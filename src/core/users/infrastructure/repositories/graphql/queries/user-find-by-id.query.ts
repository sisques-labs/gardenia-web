import { gql } from '@apollo/client';

export const USER_FIND_BY_ID = gql`
  query UserFindById($input: UserFindByIdRequestDto!) {
    userFindById(input: $input) {
      id
      status
      username
      firstName
      lastName
      avatarUrl
      bio
      locale
      timezone
      createdAt
      updatedAt
    }
  }
`;
