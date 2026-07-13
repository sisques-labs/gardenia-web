import { gql } from '@apollo/client';

export const BRIDGES_FIND_BY_CRITERIA = gql`
  query BridgesFindByCriteria($input: BridgeFindByCriteriaRequestDto) {
    bridgesFindByCriteria(input: $input) {
      items {
        id
        spaceId
        name
        status
        lastSeenAt
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
