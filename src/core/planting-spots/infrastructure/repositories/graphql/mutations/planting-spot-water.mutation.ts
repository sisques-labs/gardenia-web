import { gql } from '@apollo/client';

export const PLANTING_SPOT_WATER = gql`
  mutation PlantingSpotWater($input: WaterPlantingSpotGraphQLDto!) {
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
