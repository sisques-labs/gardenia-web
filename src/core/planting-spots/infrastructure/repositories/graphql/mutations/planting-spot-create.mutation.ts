import { gql } from '@apollo/client';

export const PLANTING_SPOT_CREATE = gql`
  mutation PlantingSpotCreate($input: PlantingSpotCreateRequestDto!) {
    plantingSpotCreate(input: $input) {
      id
      success
      message
    }
  }
`;
