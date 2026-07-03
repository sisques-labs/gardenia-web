import { gql } from '@apollo/client';

export const CARE_LOG_ENTRY_CREATE = gql`
  mutation CareLogEntryCreate($input: CreateCareLogEntryGraphQLDto!) {
    careLogEntryCreate(input: $input) {
      id
      success
      message
    }
  }
`;
