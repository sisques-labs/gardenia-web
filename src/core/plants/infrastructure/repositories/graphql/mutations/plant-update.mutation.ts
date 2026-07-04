import { gql } from '@apollo/client';

export const PLANT_UPDATE = gql`
  mutation PlantUpdate($input: PlantUpdateRequestDto!) {
    plantUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
