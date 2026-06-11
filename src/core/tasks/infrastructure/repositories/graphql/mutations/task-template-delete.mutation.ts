import { gql } from '@apollo/client';

export const TASK_TEMPLATE_DELETE = gql`
  mutation TaskTemplateDelete($id: String!) {
    deleteTaskTemplate(id: $id) {
      success
      message
      id
    }
  }
`;
