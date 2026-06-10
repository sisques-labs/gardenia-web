import { gql } from '@apollo/client';

export const CANCEL_TASK = gql`
  mutation CancelTask($input: CancelTaskInput!) {
    cancelTask(input: $input) {
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
