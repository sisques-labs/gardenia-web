import { gql } from '@apollo/client';

export const PLANT_CREATE = gql`
  mutation PlantCreate($input: PlantCreateRequestDto!) {
    plantCreate(input: $input) {
      id
      success
      message
    }
  }
`;
