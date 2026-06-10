import { gql } from '@apollo/client';

export const TASK_TEMPLATE_UPDATE = gql`
  mutation TaskTemplateUpdate($input: UpdateTaskTemplateInput!) {
    updateTaskTemplate(input: $input) {
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
