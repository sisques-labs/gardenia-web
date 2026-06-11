import { gql } from '@apollo/client';

export const TASK_FIND_BY_ID = gql`
  query TaskFindById($input: TaskFindByIdInput!) {
    taskFindById(input: $input) {
      id
      templateId
      triggerType
      title
      description
      status
      payload
      priority
      isRecurring
      runCount
      userId
      targetType
      targetId
      scheduledAt
      startedAt
      completedAt
      failedAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;
