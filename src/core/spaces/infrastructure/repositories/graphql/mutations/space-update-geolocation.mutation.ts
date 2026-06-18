import { gql } from '@apollo/client';

export const SPACE_UPDATE_GEOLOCATION = gql`
  mutation SpaceUpdateGeolocation($input: SpaceUpdateGeolocationRequestDto!) {
    spaceUpdateGeolocation(input: $input) {
      id
      success
      message
    }
  }
`;
