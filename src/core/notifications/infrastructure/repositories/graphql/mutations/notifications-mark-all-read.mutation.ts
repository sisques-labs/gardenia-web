import { gql } from '@apollo/client';

export const NOTIFICATIONS_MARK_ALL_READ = gql`
  mutation NotificationsMarkAllRead {
    notificationsMarkAllRead {
      success
      message
    }
  }
`;
