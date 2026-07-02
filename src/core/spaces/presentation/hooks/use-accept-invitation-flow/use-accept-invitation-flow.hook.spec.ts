import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockReplace = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());
const mockAcceptInvitation = vi.hoisted(() => vi.fn());
const mockClaimInviteAccept = vi.hoisted(() => vi.fn());
const mockReleaseInviteAccept = vi.hoisted(() => vi.fn());
const mockWasInviteAcceptCompleted = vi.hoisted(() => vi.fn());
const mockMarkInviteAcceptCompleted = vi.hoisted(() => vi.fn());
const mockIsAlreadyMemberError = vi.hoisted(() => vi.fn());
let mockAccessToken: string | null = vi.hoisted(() => 'token-1') as string | null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: mockGet }),
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: (selector: (s: { isBootComplete: boolean; accessToken: string | null }) => unknown) =>
    selector({ isBootComplete: true, accessToken: mockAccessToken }),
}));

vi.mock('@/core/spaces/presentation/hooks/use-accept-invitation/use-accept-invitation.hook', () => ({
  useAcceptInvitation: () => ({ mutateAsync: mockAcceptInvitation }),
}));

vi.mock('@/core/spaces/presentation/screens/space-invite/invite-accept-in-flight', () => ({
  claimInviteAccept: mockClaimInviteAccept,
  releaseInviteAccept: mockReleaseInviteAccept,
  wasInviteAcceptCompleted: mockWasInviteAcceptCompleted,
  markInviteAcceptCompleted: mockMarkInviteAcceptCompleted,
  isAlreadyMemberError: mockIsAlreadyMemberError,
}));

import { useAcceptInvitationFlow } from './use-accept-invitation-flow.hook';

describe('useAcceptInvitationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccessToken = 'token-1';
    mockClaimInviteAccept.mockReturnValue(true);
    mockWasInviteAcceptCompleted.mockReturnValue(false);
    mockIsAlreadyMemberError.mockReturnValue(false);
  });

  it('does nothing when there is no code', () => {
    mockGet.mockReturnValue(null);

    const { result } = renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    expect(result.current.code).toBe('');
    expect(mockClaimInviteAccept).not.toHaveBeenCalled();
  });

  it('redirects to login with a returnUrl when there is no access token', () => {
    mockGet.mockReturnValue('abc');
    mockAccessToken = null;

    renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('/en/login?returnUrl='),
    );
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  it('redirects home without accepting again when the invite was already completed', () => {
    mockGet.mockReturnValue('abc');
    mockWasInviteAcceptCompleted.mockReturnValue(true);

    renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    expect(mockReplace).toHaveBeenCalledWith('/en/home');
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  it('accepts the invitation and redirects home on success', async () => {
    mockGet.mockReturnValue('abc');
    mockAcceptInvitation.mockResolvedValue(undefined);

    renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    await waitFor(() => expect(mockAcceptInvitation).toHaveBeenCalledWith('abc'));
    await waitFor(() => expect(mockMarkInviteAcceptCompleted).toHaveBeenCalledWith('abc'));
    expect(mockReplace).toHaveBeenCalledWith('/en/home');
    expect(mockReleaseInviteAccept).toHaveBeenCalledWith('abc');
  });

  it('treats an already-a-member error as success and redirects home', async () => {
    mockGet.mockReturnValue('abc');
    mockAcceptInvitation.mockRejectedValue(new Error('already a member'));
    mockIsAlreadyMemberError.mockReturnValue(true);

    const { result } = renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    await waitFor(() => expect(mockMarkInviteAcceptCompleted).toHaveBeenCalledWith('abc'));
    expect(mockReplace).toHaveBeenCalledWith('/en/home');
    expect(result.current.acceptError).toBeNull();
  });

  it('surfaces the error message when acceptance fails for another reason', async () => {
    mockGet.mockReturnValue('abc');
    mockAcceptInvitation.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    await waitFor(() => expect(result.current.acceptError).toBe('boom'));
    expect(mockReplace).not.toHaveBeenCalledWith('/en/home');
    expect(mockReleaseInviteAccept).toHaveBeenCalledWith('abc');
  });

  it('does not accept again while a claim for the same code is already in flight', () => {
    mockGet.mockReturnValue('abc');
    mockClaimInviteAccept.mockReturnValue(false);

    renderHook(() => useAcceptInvitationFlow({ lang: 'en', fallbackErrorMessage: 'error' }));

    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });
});
