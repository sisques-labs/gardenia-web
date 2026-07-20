import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/plant-identification/application/use-cases/create-plant-from-identification/create-plant-from-identification.use-case',
  () => ({
    CreatePlantFromIdentificationUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/plant-identification/infrastructure/repositories/graphql/plant-identification.gql.repository', () => ({
  plantIdentificationGqlRepository: {},
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' }),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useCreatePlantFromIdentification } from './use-create-plant-from-identification.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCreatePlantFromIdentification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls CreatePlantFromIdentificationUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue({ id: 'plant-1' });
    const input = { identificationId: 'ident-1', name: 'My Monstera' };

    const { result } = renderHook(() => useCreatePlantFromIdentification(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates plants and plant-identifications queries on success', async () => {
    mockExecute.mockResolvedValue({ id: 'plant-1' });

    const { result } = renderHook(() => useCreatePlantFromIdentification(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ identificationId: 'ident-1', name: 'My Monstera' });
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plants', 'space-1'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant-identifications', 'space-1'] });
  });

  it('surfaces errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Mutation failed'));

    const { result } = renderHook(() => useCreatePlantFromIdentification(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ identificationId: 'ident-1', name: 'My Monstera' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
