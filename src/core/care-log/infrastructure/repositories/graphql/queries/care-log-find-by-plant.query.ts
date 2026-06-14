import { gql } from '@apollo/client';

export const CARE_LOG_FIND_BY_PLANT = gql`
  query CareLogFindByCriteria($input: CareLogFindByCriteriaRequestDto) {
    careLogFindByCriteria(input: $input) {
      items {
        id
        plantId
        activityType
        performedAt
      }
      total
      page
      perPage
    }
  }
`;
