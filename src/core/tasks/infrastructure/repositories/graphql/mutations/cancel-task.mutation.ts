import { gql } from '@apollo/client';

export const CANCEL_TASK = gql`
  mutation CancelTask($id: String!) {
    cancelTask(id: $id) {
      success
      message
      id
    }
  }
`;
