import { gql } from '@apollo/client';

export const SPACE_FIND_BY_ID = gql`
  query SpaceFindById($input: SpaceFindByIdRequestDto!) {
    spaceFindById(input: $input) {
      id
      name
      ownerId
      createdAt
      updatedAt
      latitude
      longitude
      environment
      weather {
        latitude
        longitude
        timezone
        daily {
          date
          temperatureMin
          temperatureMax
          precipitationSum
          weatherCode
        }
      }
    }
  }
`;
