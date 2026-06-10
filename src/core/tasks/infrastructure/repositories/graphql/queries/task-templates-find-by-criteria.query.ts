import { gql } from '@apollo/client';

export const TASK_TEMPLATES_FIND_BY_CRITERIA = gql`
  query TaskTemplatesFindByCriteria($input: TaskTemplatesFindByCriteriaInput!) {
    taskTemplatesFindByCriteria(input: $input) {
      items {
        id
        spaceId
        name
        defaultPayload
        maxRetries
        backoffStrategy
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;
