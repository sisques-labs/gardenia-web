import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CreateCareLogInput } from '@/core/care-log/application/interfaces/create-care-log-input.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-log/application/use-cases/create-care-log/create-care-log.use-case', () => ({
  CreateCareLogUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository', () => ({
  careLogGqlRepository: {},
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' })
  ),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useCreateCareLog } from './use-create-care-log.hook';

const input: CreateCareLogInput = { plantId: 'plant-1', activityType: CareLogActivityType.WATERING };

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCreateCareLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls CreateCareLogUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue({ id: 'entry-1' });

    const { result } = renderHook(() => useCreateCareLog('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates the care-log query for this plant on success', async () => {
    mockExecute.mockResolvedValue({ id: 'entry-1' });

    const { result } = renderHook(() => useCreateCareLog('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-log', 'space-1', 'plant-1'] })
    );
  });
});
