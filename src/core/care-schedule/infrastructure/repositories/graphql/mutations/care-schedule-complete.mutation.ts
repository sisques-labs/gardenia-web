import { gql } from '@apollo/client';

export const CARE_SCHEDULE_COMPLETE = gql`
  mutation CareScheduleComplete($input: CompleteCareScheduleInput!) {
    careScheduleComplete(input: $input) {
      id
      success
      message
    }
  }
`;
