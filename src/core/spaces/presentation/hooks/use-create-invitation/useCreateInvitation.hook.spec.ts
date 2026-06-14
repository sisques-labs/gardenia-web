import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useCreateInvitation } from './useCreateInvitation.hook';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';

const mockInvitation: SpaceInvitation = {
  id: 'inv-1',
  displayCode: 'GAR · 2026 · AB',
  code: 'full-code-uuid',
  qrId: 'qr-1',
  expiresAt: '2026-12-31T00:00:00.000Z',
  role: 'MEMBER',
  spaceId: 'space-1',
};

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock(
  '@/core/spaces/application/use-cases/create-space-invitation/create-space-invitation.use-case',
  () => ({
    CreateSpaceInvitationUseCase: class {
      execute = mockExecute;
    },
  }),
);

describe('useCreateInvitation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockResolvedValue(mockInvitation);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns invitation data after successful mutation', async () => {
    const { result } = renderHook(() => useCreateInvitation(), { wrapper });

    result.current.mutate({ spaceId: 'space-1', role: 'member' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockInvitation);
  });
});
