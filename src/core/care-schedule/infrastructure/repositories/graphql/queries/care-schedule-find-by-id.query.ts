import { gql } from '@apollo/client';

export const CARE_SCHEDULE_FIND_BY_ID = gql`
  query CareScheduleFindById($input: CareScheduleFindByIdInput!) {
    careScheduleFindById(input: $input) {
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
`;
