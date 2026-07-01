import { gql } from '@apollo/client';

export const CARE_SCHEDULE_CREATE = gql`
  mutation CareScheduleCreate($input: CreateCareScheduleInput!) {
    careScheduleCreate(input: $input) {
      id
      success
      message
    }
  }
`;
