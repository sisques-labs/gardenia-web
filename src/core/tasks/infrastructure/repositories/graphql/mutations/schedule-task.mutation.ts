import { gql } from '@apollo/client';

export const SCHEDULE_TASK = gql`
  mutation ScheduleTask($input: ScheduleTaskInput!) {
    scheduleTask(input: $input) {
      id
      spaceId
      templateId
      name
      status
      payload
      scheduledAt
      startedAt
      completedAt
      createdAt
      updatedAt
    }
  }
`;
