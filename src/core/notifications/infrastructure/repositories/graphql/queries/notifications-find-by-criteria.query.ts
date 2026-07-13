import { gql } from '@apollo/client';

export const NOTIFICATIONS_FIND_BY_CRITERIA = gql`
  query NotificationsFindByCriteria($input: NotificationCriteriaInput) {
    notificationsFindByCriteria(input: $input) {
      items {
        id
        type
        referenceType
        referenceId
        payload
        status
        readAt
        resolvedAt
        userId
        spaceId
        createdAt
        updatedAt
      }
    }
  }
`;
