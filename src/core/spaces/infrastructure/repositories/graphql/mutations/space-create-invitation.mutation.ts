import { gql } from '@apollo/client';

export const SPACE_CREATE_INVITATION = gql`
  mutation SpaceCreateInvitation($input: SpaceCreateInvitationRequestDto!) {
    spaceCreateInvitation(input: $input) {
      id
      displayCode
      code
      qrId
      expiresAt
      role
      spaceId
    }
  }
`;
