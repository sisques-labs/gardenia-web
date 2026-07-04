import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useSpaceInvitationPreview } from './use-space-invitation-preview.hook';

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock(
  '@/core/spaces/application/use-cases/get-space-invitation-preview/get-space-invitation-preview.use-case',
  () => ({
    GetSpaceInvitationPreviewUseCase: class {
      execute = mockExecute;
    },
  }),
);

const preview = {
  spaceName: 'Greenhouse A',
  role: 'MEMBER' as const,
  expiresAt: '2026-12-31T00:00:00.000Z',
  isExpired: false,
};

describe('useSpaceInvitationPreview', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns the preview for a given code', async () => {
    mockExecute.mockResolvedValue(preview);

    const { result } = renderHook(() => useSpaceInvitationPreview('TES · 2026 · AB'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(preview);
    expect(mockExecute).toHaveBeenCalledWith('TES · 2026 · AB');
  });

  it('is disabled when code is empty', () => {
    const { result } = renderHook(() => useSpaceInvitationPreview(''), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('surfaces the error without retrying', async () => {
    mockExecute.mockRejectedValue(new Error('Invitation not found'));

    const { result } = renderHook(() => useSpaceInvitationPreview('BADCODE'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
