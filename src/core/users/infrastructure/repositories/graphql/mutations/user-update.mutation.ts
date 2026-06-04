import { gql } from '@apollo/client';

export const USER_UPDATE = gql`
  mutation UserUpdate($input: UserUpdateRequestDto!) {
    userUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
