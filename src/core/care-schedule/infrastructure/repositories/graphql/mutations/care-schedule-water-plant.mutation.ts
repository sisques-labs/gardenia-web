import { gql } from '@apollo/client';

export const CARE_SCHEDULE_WATER_PLANT = gql`
  mutation CareScheduleWaterPlant($input: WaterPlantGraphQLDto!) {
    careScheduleWaterPlant(input: $input) {
      plantId
      mode
      careScheduleId
    }
  }
`;
