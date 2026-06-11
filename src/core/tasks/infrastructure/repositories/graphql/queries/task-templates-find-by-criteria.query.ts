import { gql } from '@apollo/client';

export const TASK_TEMPLATES_FIND_BY_CRITERIA = gql`
  query TaskTemplateFindByCriteria($input: TaskTemplateFindByCriteriaInput) {
    taskTemplateFindByCriteria(input: $input) {
      items {
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
      total
      page
    }
  }
`;
