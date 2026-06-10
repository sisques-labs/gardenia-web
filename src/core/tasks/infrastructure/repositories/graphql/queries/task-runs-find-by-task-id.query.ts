import { gql } from '@apollo/client';

export const TASK_RUNS_FIND_BY_TASK_ID = gql`
  query TaskRunsFindByTaskId($input: TaskRunsFindByTaskIdInput!) {
    taskRunsFindByTaskId(input: $input) {
      items {
        id
        taskId
        status
        output
        error
        startedAt
        completedAt
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;
