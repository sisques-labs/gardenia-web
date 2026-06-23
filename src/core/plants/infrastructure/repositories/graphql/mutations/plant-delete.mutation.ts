import { gql } from '@apollo/client';

export const PLANT_DELETE = gql`
  mutation PlantDelete($input: PlantDeleteRequestDto!) {
    plantDelete(input: $input) {
      id
      success
      message
    }
  }
`;
