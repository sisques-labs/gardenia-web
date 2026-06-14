import { gql } from '@apollo/client';

export const SPACE_REMOVE_MEMBER = gql`
  mutation SpaceRemoveMember($input: SpaceRemoveMemberRequestDto!) {
    spaceRemoveMember(input: $input) {
      id
      success
      message
    }
  }
`;
