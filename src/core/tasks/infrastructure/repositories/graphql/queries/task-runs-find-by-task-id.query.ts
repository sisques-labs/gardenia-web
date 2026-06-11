import { gql } from '@apollo/client';

export const TASK_RUNS_FIND_BY_TASK_ID = gql`
  query TaskRunsFindByTaskId($input: TaskRunsFindByTaskIdInput!) {
    taskRunsFindByTaskId(input: $input) {
      id
      taskId
      attempt
      status
      progress
      error
      startedAt
      endedAt
      createdAt
    }
  }
`;
