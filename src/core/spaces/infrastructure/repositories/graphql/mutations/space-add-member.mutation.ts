import { gql } from '@apollo/client';

export const SPACE_ADD_MEMBER = gql`
  mutation SpaceAddMember($input: SpaceAddMemberRequestDto!) {
    spaceAddMember(input: $input) {
      id
      success
      message
    }
  }
`;
