import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case', () => ({
  getSpaceWeatherUseCase: { execute: mockExecute },
}));

import { useSpaceWeather } from './use-space-weather.hook';

const mockWeather: SpaceWeather = {
  latitude: 40.4,
  longitude: -3.7,
  timezone: 'Europe/Madrid',
  daily: [],
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useSpaceWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns weather data when spaceId is provided', async () => {
    mockExecute.mockResolvedValue(mockWeather);

    const { result } = renderHook(() => useSpaceWeather('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockWeather);
    expect(mockExecute).toHaveBeenCalledWith('space-1');
  });

  it('is disabled when spaceId is null', () => {
    const { result } = renderHook(() => useSpaceWeather(null), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('is in loading state initially when spaceId is provided', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useSpaceWeather('space-1'), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });
});
