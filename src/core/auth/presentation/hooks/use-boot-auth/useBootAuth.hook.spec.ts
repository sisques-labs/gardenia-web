import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockMe = vi.hoisted(() => vi.fn());
const mockRefreshTokenOnce = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/me/me.use-case', () => ({
  MeUseCase: class {
    me(...args: unknown[]) {
      return mockMe(...args);
    }
  },
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

vi.mock('@/core/auth/infrastructure/http/refresh-mutex', () => ({
  refreshTokenOnce: (...args: unknown[]) => mockRefreshTokenOnce(...args),
}));

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  doRefresh: vi.fn(),
}));

import { useBootAuth } from './useBootAuth.hook';

describe('useBootAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, currentUser: null, isBootComplete: false });
  });

  it('fetches the current user directly when an access token already exists', async () => {
    useAuthStore.setState({ accessToken: 'tok-123' });
    mockMe.mockResolvedValue({ userId: 'user-1' });

    renderHook(() => useBootAuth());

    await waitFor(() => expect(useAuthStore.getState().isBootComplete).toBe(true));
    expect(mockMe).toHaveBeenCalledOnce();
    expect(mockRefreshTokenOnce).not.toHaveBeenCalled();
    expect(useAuthStore.getState().currentUser).toEqual({ userId: 'user-1' });
  });

  it('does not re-fetch the current user if it is already in the store', async () => {
    useAuthStore.setState({ accessToken: 'tok-123', currentUser: { userId: 'existing' } as never });

    renderHook(() => useBootAuth());

    await waitFor(() => expect(useAuthStore.getState().isBootComplete).toBe(true));
    expect(mockMe).not.toHaveBeenCalled();
  });

  it('refreshes the session when there is no access token and a refresh succeeds', async () => {
    mockRefreshTokenOnce.mockResolvedValue('new-token');
    mockMe.mockResolvedValue({ userId: 'user-2' });

    renderHook(() => useBootAuth());

    await waitFor(() => expect(useAuthStore.getState().isBootComplete).toBe(true));
    expect(mockRefreshTokenOnce).toHaveBeenCalledOnce();
    expect(mockMe).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().currentUser).toEqual({ userId: 'user-2' });
  });

  it('completes boot silently when the refresh fails', async () => {
    mockRefreshTokenOnce.mockResolvedValue(null);

    renderHook(() => useBootAuth());

    await waitFor(() => expect(useAuthStore.getState().isBootComplete).toBe(true));
    expect(mockMe).not.toHaveBeenCalled();
  });

  it('completes boot silently when me() throws', async () => {
    useAuthStore.setState({ accessToken: 'tok-123' });
    mockMe.mockRejectedValue(new Error('unauthorized'));

    renderHook(() => useBootAuth());

    await waitFor(() => expect(useAuthStore.getState().isBootComplete).toBe(true));
    expect(useAuthStore.getState().currentUser).toBeNull();
  });
});
