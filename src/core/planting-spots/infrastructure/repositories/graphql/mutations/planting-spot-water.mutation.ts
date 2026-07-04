import { gql } from '@apollo/client';

export const PLANTING_SPOT_WATER = gql`
  mutation PlantingSpotWater($input: PlantingSpotWaterRequestDto!) {
    plantingSpotWater(input: $input) {
      plantingSpotId
      wateredPlantIds
      failedPlants {
        plantId
        reason
      }
    }
  }
`;
