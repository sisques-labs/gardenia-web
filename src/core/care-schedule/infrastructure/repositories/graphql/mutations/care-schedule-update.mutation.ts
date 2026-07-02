import { gql } from '@apollo/client';

export const CARE_SCHEDULE_UPDATE = gql`
  mutation CareScheduleUpdate($input: UpdateCareScheduleInput!) {
    careScheduleUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
