import { gql } from '@apollo/client';

export const HARVEST_CREATE = gql`
  mutation HarvestCreate($input: HarvestCreateRequestDto!) {
    harvestCreate(input: $input) {
      id
      success
      message
    }
  }
`;
