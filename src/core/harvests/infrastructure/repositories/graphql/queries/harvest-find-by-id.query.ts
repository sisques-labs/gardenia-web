import { gql } from '@apollo/client';

export const HARVEST_FIND_BY_ID = gql`
  query HarvestFindById($input: HarvestFindByIdRequestDto!) {
    harvestFindById(input: $input) {
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
`;
