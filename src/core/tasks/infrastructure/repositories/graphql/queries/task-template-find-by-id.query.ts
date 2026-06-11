import { gql } from '@apollo/client';

export const TASK_TEMPLATE_FIND_BY_ID = gql`
  query TaskTemplateFindById($id: String!) {
    taskTemplateFindById(id: $id) {
      id
      name
      description
      taskTitle
      taskDescription
      handlerKey
      defaultPriority
      defaultRetryCount
      defaultBackoffStrategy
      defaultTimeoutMs
      maxConcurrency
      defaultCronExpression
      defaultIsRecurring
      userId
      createdAt
      updatedAt
    }
  }
`;
