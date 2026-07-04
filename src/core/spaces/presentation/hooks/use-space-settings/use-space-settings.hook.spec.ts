import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockUseSpaceDetail = vi.hoisted(() => vi.fn());
const mockCreateInvitationMutate = vi.hoisted(() => vi.fn());
const mockCreateInvitationReset = vi.hoisted(() => vi.fn());
const mockAddMemberMutate = vi.hoisted(() => vi.fn());
const mockAddMemberReset = vi.hoisted(() => vi.fn());
const mockRemoveMemberMutate = vi.hoisted(() => vi.fn());
const mockRemoveMemberReset = vi.hoisted(() => vi.fn());
const mockUpdateSpaceMutate = vi.hoisted(() => vi.fn());
const mockUpdateSpaceReset = vi.hoisted(() => vi.fn());

vi.mock('@/core/spaces/presentation/hooks/use-space-detail/use-space-detail.hook', () => ({
  useSpaceDetail: (...args: unknown[]) => mockUseSpaceDetail(...args),
}));

vi.mock('@/core/spaces/presentation/hooks/use-create-invitation/use-create-invitation.hook', () => ({
  useCreateInvitation: () => ({ mutate: mockCreateInvitationMutate, reset: mockCreateInvitationReset }),
}));

vi.mock('@/core/spaces/presentation/hooks/use-add-member/use-add-member.hook', () => ({
  useAddMember: () => ({ mutate: mockAddMemberMutate, reset: mockAddMemberReset }),
}));

vi.mock('@/core/spaces/presentation/hooks/use-remove-member/use-remove-member.hook', () => ({
  useRemoveMember: () => ({ mutate: mockRemoveMemberMutate, reset: mockRemoveMemberReset }),
}));

vi.mock('@/core/spaces/presentation/hooks/use-update-space/use-update-space.hook', () => ({
  useUpdateSpace: () => ({ mutate: mockUpdateSpaceMutate, reset: mockUpdateSpaceReset }),
}));

import { useSpaceSettings } from './use-space-settings.hook';

const writeText = vi.fn().mockResolvedValue(undefined);

describe('useSpaceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpacesStore.setState({ currentSpaceId: 'space-1' });
    useAuthStore.setState({ currentUser: { userId: 'user-1' } as never });
    mockUseSpaceDetail.mockReturnValue({ data: undefined });
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it('computes isOwner and hasGeolocation from space detail', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: { ownerId: 'user-1', latitude: 40.4, longitude: -3.7 },
    });

    const { result } = renderHook(() => useSpaceSettings('en'));

    expect(result.current.isOwner).toBe(true);
    expect(result.current.hasGeolocation).toBe(true);
  });

  it('is not owner and has no geolocation when data is missing fields', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: { ownerId: 'other-user', latitude: null, longitude: null },
    });

    const { result } = renderHook(() => useSpaceSettings('en'));

    expect(result.current.isOwner).toBe(false);
    expect(result.current.hasGeolocation).toBe(false);
  });

  it('copies text to clipboard and clears it after the timeout', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useSpaceSettings('en'));

      act(() => {
        result.current.copy('some-code', 'invite');
      });

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith('some-code');
      expect(result.current.copied).toBe('invite');

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copied).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('builds an invite link using the current origin and lang', () => {
    const { result } = renderHook(() => useSpaceSettings('es'));

    const link = result.current.inviteLink({ code: 'ABC 123' } as never);

    expect(link).toBe(`${window.location.origin}/es/invite?code=ABC%20123`);
  });

  it('resets the update-space form when space detail data arrives', async () => {
    mockUseSpaceDetail.mockReturnValue({
      data: { name: 'My Garden', latitude: 1, longitude: 2, environment: 'OUTDOOR' },
    });

    const { result } = renderHook(() => useSpaceSettings('en'));

    await waitFor(() => expect(result.current.updateSpaceForm.getValues('name')).toBe('My Garden'));
  });

  it('does not call mutations when spaceId is missing', () => {
    useSpacesStore.setState({ currentSpaceId: null });
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onCreateInvitation({ role: 'member' } as never);
    result.current.onAddMember({ targetUserId: 'u2' } as never);
    result.current.onRemoveMember({ targetUserId: 'u2' } as never);
    result.current.onUpdateSpace({ name: 'X' } as never);

    expect(mockCreateInvitationMutate).not.toHaveBeenCalled();
    expect(mockAddMemberMutate).not.toHaveBeenCalled();
    expect(mockRemoveMemberMutate).not.toHaveBeenCalled();
    expect(mockUpdateSpaceMutate).not.toHaveBeenCalled();
  });

  it('creates an invitation with an explicit expiry date', () => {
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onCreateInvitation({ role: 'admin', expiresAt: '2026-01-01' } as never);

    expect(mockCreateInvitationReset).toHaveBeenCalled();
    expect(mockCreateInvitationMutate).toHaveBeenCalledWith({
      spaceId: 'space-1',
      role: 'admin',
      expiresAt: new Date('2026-01-01'),
    });
  });

  it('creates an invitation without an expiry date', () => {
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onCreateInvitation({ role: 'member' } as never);

    expect(mockCreateInvitationMutate).toHaveBeenCalledWith({
      spaceId: 'space-1',
      role: 'member',
      expiresAt: undefined,
    });
  });

  it('adds a member and resets the add form on success', () => {
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onAddMember({ targetUserId: 'u2' } as never);

    expect(mockAddMemberReset).toHaveBeenCalled();
    expect(mockAddMemberMutate).toHaveBeenCalledWith(
      { spaceId: 'space-1', targetUserId: 'u2' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const [, options] = mockAddMemberMutate.mock.calls[0] as [unknown, { onSuccess: () => void }];
    options.onSuccess();
  });

  it('removes a member and resets the remove form on success', () => {
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onRemoveMember({ targetUserId: 'u2' } as never);

    expect(mockRemoveMemberReset).toHaveBeenCalled();
    expect(mockRemoveMemberMutate).toHaveBeenCalledWith(
      { spaceId: 'space-1', targetUserId: 'u2' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const [, options] = mockRemoveMemberMutate.mock.calls[0] as [unknown, { onSuccess: () => void }];
    options.onSuccess();
  });

  it('updates the space', () => {
    const { result } = renderHook(() => useSpaceSettings('en'));

    result.current.onUpdateSpace({ name: 'New name', latitude: null, longitude: null, environment: null } as never);

    expect(mockUpdateSpaceReset).toHaveBeenCalled();
    expect(mockUpdateSpaceMutate).toHaveBeenCalledWith({
      spaceId: 'space-1',
      name: 'New name',
      latitude: null,
      longitude: null,
      environment: null,
    });
  });
});
