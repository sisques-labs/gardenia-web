import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case',
  () => ({
    updateSpaceGeolocationUseCase: { execute: mockExecute },
  }),
);

import { useUpdateGeolocation } from './use-update-geolocation.hook';

const input = {
  spaceId: 'space-1',
  latitude: 40.4,
  longitude: -3.7,
  environment: 'OUTDOOR' as const,
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useUpdateGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls updateSpaceGeolocationUseCase.execute on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateGeolocation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('propagates errors from use case', async () => {
    mockExecute.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateGeolocation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
