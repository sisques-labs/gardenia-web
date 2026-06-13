import { gql } from '@apollo/client';

export const HARVEST_UPDATE = gql`
  mutation HarvestUpdate($input: HarvestUpdateRequestDto!) {
    harvestUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
