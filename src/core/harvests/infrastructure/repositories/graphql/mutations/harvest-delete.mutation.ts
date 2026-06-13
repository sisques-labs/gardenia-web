import { gql } from '@apollo/client';

export const HARVEST_DELETE = gql`
  mutation HarvestDelete($input: HarvestDeleteRequestDto!) {
    harvestDelete(input: $input) {
      success
      message
    }
  }
`;
