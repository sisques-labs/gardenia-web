import { gql } from '@apollo/client';

export const PLANTING_SPOT_DELETE = gql`
  mutation PlantingSpotDelete($input: PlantingSpotDeleteRequestDto!) {
    plantingSpotDelete(input: $input) {
      id
      success
      message
    }
  }
`;
