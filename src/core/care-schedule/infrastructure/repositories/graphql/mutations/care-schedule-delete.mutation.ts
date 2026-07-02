import { gql } from '@apollo/client';

// careScheduleDelete takes a bare `id` arg, not an `input` wrapper — unlike the other care-schedule mutations.
export const CARE_SCHEDULE_DELETE = gql`
  mutation CareScheduleDelete($id: String!) {
    careScheduleDelete(id: $id) {
      success
      message
    }
  }
`;
