import { gql } from '@apollo/client';

export const BRIDGE_CLAIM = gql`
  mutation BridgeClaim($input: BridgeClaimRequestDto!) {
    bridgeClaim(input: $input) {
      success
      message
      id
    }
  }
`;
