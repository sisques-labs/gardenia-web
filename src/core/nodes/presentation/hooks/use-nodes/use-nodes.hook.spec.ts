import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useNodes } from './use-nodes.hook';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

const mockNodes: Node[] = [
  {
    id: 'node-1',
    spaceId: 'space-1',
    bridgeId: 'bridge-1',
    name: null,
    status: 'ONLINE',
    lastSeenAt: '2024-01-02',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock('@/core/nodes/application/use-cases/get-nodes/get-nodes.use-case', () => ({
  GetNodesUseCase: class {
    execute = mockExecute;
  },
}));

describe('useNodes', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockClear();
    mockExecute.mockResolvedValue(mockNodes);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('fetches nodes when a spaceId is present', async () => {
    const { result } = renderHook(() => useNodes('space-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNodes);
  });

  it('does not fetch when spaceId is null', () => {
    const { result } = renderHook(() => useNodes(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
