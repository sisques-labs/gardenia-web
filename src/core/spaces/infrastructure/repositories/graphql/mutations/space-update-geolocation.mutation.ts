import { gql } from '@apollo/client';

export const SPACE_UPDATE = gql`
  mutation SpaceUpdate($input: SpaceUpdateRequestDto!) {
    spaceUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
