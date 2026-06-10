import { gql } from '@apollo/client';

export const TASK_FIND_BY_ID = gql`
  query TaskFindById($input: TaskFindByIdInput!) {
    taskFindById(input: $input) {
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
