import { gql } from '@apollo/client';

export const HARVESTS_FIND_BY_CRITERIA = gql`
  query HarvestsFindByCriteria($input: HarvestFindByCriteriaRequestDto) {
    harvestsFindByCriteria(input: $input) {
      items {
        id
        cropType
        quantity
        unit
        harvestedAt
        userId
        spaceId
        createdAt
        updatedAt
      }
    }
  }
`;
