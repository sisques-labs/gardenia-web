import { gql } from '@apollo/client';

export const SPACE_INVITATION_PREVIEW = gql`
  query SpaceInvitationPreview($code: String!) {
    spaceInvitationPreview(code: $code) {
      spaceName
      role
      expiresAt
      isExpired
    }
  }
`;
