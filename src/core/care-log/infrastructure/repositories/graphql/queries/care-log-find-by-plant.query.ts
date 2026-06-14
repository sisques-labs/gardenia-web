import { gql } from '@apollo/client';

export const CARE_LOG_FIND_BY_PLANT = gql`
  query CareLogFindByPlant($input: CareLogFindByCriteriaGraphQLDto!) {
    careLogFindByCriteria(input: $input) {
      items {
        id
        plantId
        userId
        spaceId
        activityType
        performedAt
        notes
        quantity
        unit
        createdAt
        updatedAt
      }
      total
      page
      perPage
      totalPages
    }
  }
`;
