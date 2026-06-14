import { gql } from '@apollo/client';

export const PLANTING_SPOT_UPDATE = gql`
  mutation PlantingSpotUpdate($input: PlantingSpotUpdateRequestDto!) {
    plantingSpotUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
