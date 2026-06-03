import { gql } from '@apollo/client';

export const SPACE_CREATE = gql`
  mutation SpaceCreate($input: SpaceCreateRequestDto!) {
    spaceCreate(input: $input) {
      id
      success
      message
    }
  }
`;
