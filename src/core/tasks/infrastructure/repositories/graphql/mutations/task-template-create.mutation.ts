import { gql } from '@apollo/client';

export const TASK_TEMPLATE_CREATE = gql`
  mutation TaskTemplateCreate($input: CreateTaskTemplateInput!) {
    createTaskTemplate(input: $input) {
      success
      message
      id
    }
  }
`;
