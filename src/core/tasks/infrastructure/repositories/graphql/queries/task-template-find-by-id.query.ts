import { gql } from '@apollo/client';

export const TASK_TEMPLATE_FIND_BY_ID = gql`
  query TaskTemplateFindById($input: TaskTemplateFindByIdInput!) {
    taskTemplateFindById(input: $input) {
      id
      spaceId
      name
      defaultPayload
      maxRetries
      backoffStrategy
      createdAt
      updatedAt
    }
  }
`;
