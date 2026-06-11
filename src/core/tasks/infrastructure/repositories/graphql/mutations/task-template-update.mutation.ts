import { gql } from '@apollo/client';

export const TASK_TEMPLATE_UPDATE = gql`
  mutation TaskTemplateUpdate($input: UpdateTaskTemplateInput!) {
    updateTaskTemplate(input: $input) {
      success
      message
      id
    }
  }
`;
