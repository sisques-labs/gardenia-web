import { gql } from '@apollo/client';

export const CARE_SCHEDULES_FIND_BY_CRITERIA = gql`
  query CareSchedulesFindByCriteria($input: CareScheduleCriteriaInput) {
    careSchedulesFindByCriteria(input: $input) {
      items {
        id
        plantId
        activityType
        intervalDays
        quantity
        unit
        notes
        nextDueAt
        lastCompletedAt
        active
        userId
        spaceId
        createdAt
        updatedAt
      }
    }
  }
`;
