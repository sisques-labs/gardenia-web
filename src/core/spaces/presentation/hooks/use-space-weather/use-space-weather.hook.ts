import { useQuery } from '@tanstack/react-query';
import { getSpaceWeatherUseCase } from '@/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case';

export function useSpaceWeather(spaceId: string | null) {
  return useQuery({
    queryKey: ['space-weather', spaceId],
    queryFn: () => getSpaceWeatherUseCase.execute(spaceId!),
    enabled: !!spaceId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
