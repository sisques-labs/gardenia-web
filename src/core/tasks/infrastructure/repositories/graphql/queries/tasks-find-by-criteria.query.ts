import { gql } from '@apollo/client';

export const TASKS_FIND_BY_CRITERIA = gql`
  query TaskFindByCriteria($input: TaskFindByCriteriaInput) {
    taskFindByCriteria(input: $input) {
      items {
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
      total
      page
    }
  }
`;
