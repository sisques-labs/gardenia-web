import { gql } from '@apollo/client';

export const PLANTING_SPOT_MARK_ACTIVE = gql`
  mutation PlantingSpotMarkActive($input: PlantingSpotMarkActiveRequestDto!) {
    plantingSpotMarkActive(input: $input) {
      id
      success
      message
    }
  }
`;
