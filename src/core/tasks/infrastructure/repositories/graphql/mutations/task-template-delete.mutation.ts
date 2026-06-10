import { gql } from '@apollo/client';

export const TASK_TEMPLATE_DELETE = gql`
  mutation TaskTemplateDelete($input: DeleteTaskTemplateInput!) {
    deleteTaskTemplate(input: $input) {
      success
      message
    }
  }
`;
