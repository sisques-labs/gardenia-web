import { gql } from '@apollo/client';

export const PLANTING_SPOT_MARK_FALLOW = gql`
  mutation PlantingSpotMarkFallow($input: PlantingSpotMarkFallowRequestDto!) {
    plantingSpotMarkFallow(input: $input) {
      id
      success
      message
    }
  }
`;
