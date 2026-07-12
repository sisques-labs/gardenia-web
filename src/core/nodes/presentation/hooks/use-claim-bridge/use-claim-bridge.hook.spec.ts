import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useClaimBridge } from './use-claim-bridge.hook';

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock('@/core/nodes/application/use-cases/claim-bridge/claim-bridge.use-case', () => ({
  ClaimBridgeUseCase: class {
    execute = mockExecute;
  },
}));

describe('useClaimBridge', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockResolvedValue(undefined);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('invalidates bridges and nodes query caches after a successful claim', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useClaimBridge(), { wrapper });

    result.current.mutate({ bridgeId: 'bridge-1', pairingCode: 'GRDN-4F7K' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['bridges'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['nodes'] });
  });

  it('surfaces a mutation error for a wrong pairing code', async () => {
    mockExecute.mockRejectedValue(new Error('Invalid pairing code'));
    const { result } = renderHook(() => useClaimBridge(), { wrapper });

    result.current.mutate({ bridgeId: 'bridge-1', pairingCode: 'WRONG' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid pairing code');
  });
});
