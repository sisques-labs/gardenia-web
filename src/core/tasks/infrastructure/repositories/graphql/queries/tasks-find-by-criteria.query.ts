import { gql } from '@apollo/client';

export const TASKS_FIND_BY_CRITERIA = gql`
  query TasksFindByCriteria($input: TasksFindByCriteriaInput!) {
    tasksFindByCriteria(input: $input) {
      items {
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
      total
      page
      pageSize
    }
  }
`;
