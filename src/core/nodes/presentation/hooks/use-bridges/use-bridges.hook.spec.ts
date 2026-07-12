import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useBridges } from './use-bridges.hook';
import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';

const mockBridges: Bridge[] = [
  {
    id: 'bridge-1',
    spaceId: 'space-1',
    name: null,
    status: 'ACTIVE',
    lastSeenAt: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock('@/core/nodes/application/use-cases/get-bridges/get-bridges.use-case', () => ({
  GetBridgesUseCase: class {
    execute = mockExecute;
  },
}));

describe('useBridges', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockClear();
    mockExecute.mockResolvedValue(mockBridges);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('fetches bridges when a spaceId is present', async () => {
    const { result } = renderHook(() => useBridges('space-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBridges);
  });

  it('does not fetch when spaceId is null', () => {
    const { result } = renderHook(() => useBridges(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
