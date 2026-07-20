import { gql } from '@apollo/client';

export const CREATE_PLANT_FROM_IDENTIFICATION = gql`
  mutation CreatePlantFromIdentification($input: CreatePlantFromIdentificationRequestDto!) {
    createPlantFromIdentification(input: $input) {
      id
    }
  }
`;
