import { gql } from '@apollo/client';

export const NOTIFICATION_MARK_READ = gql`
  mutation NotificationMarkRead($id: String!) {
    notificationMarkRead(id: $id) {
      success
      message
    }
  }
`;
