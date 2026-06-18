import { gql } from '@apollo/client';

export const SPACE_WEATHER = gql`
  query SpaceWeather($input: SpaceWeatherRequestDto!) {
    spaceWeather(input: $input) {
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
`;
