import { gql } from '@apollo/client';

export const NODES_FIND_BY_CRITERIA = gql`
  query NodesFindByCriteria($input: NodeFindByCriteriaRequestDto) {
    nodesFindByCriteria(input: $input) {
      items {
        id
        spaceId
        bridgeId
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
