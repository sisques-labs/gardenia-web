import { gql } from '@apollo/client';

export const SCHEDULE_TASK = gql`
  mutation ScheduleTask($input: ScheduleTaskInput!) {
    scheduleTask(input: $input) {
      success
      message
      id
    }
  }
`;
