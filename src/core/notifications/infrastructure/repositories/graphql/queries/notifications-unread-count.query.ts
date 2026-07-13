import { gql } from '@apollo/client';

export const NOTIFICATIONS_UNREAD_COUNT = gql`
  query NotificationsUnreadCount {
    notificationsUnreadCount
  }
`;
