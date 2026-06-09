import { gql } from '@apollo/client';

export const SPACE_ACCEPT_INVITATION = gql`
  mutation SpaceAcceptInvitation($input: SpaceAcceptInvitationRequestDto!) {
    spaceAcceptInvitation(input: $input) {
      success
      message
      id
    }
  }
`;
