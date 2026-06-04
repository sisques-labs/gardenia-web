import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios before importing the module under test
vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  http: {
    post: vi.fn(),
  },
}));

// Mock stores used by the http client module
vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: { getState: vi.fn(() => ({ accessToken: null, isBootComplete: false, clearAuth: vi.fn(), setBootComplete: vi.fn(), setAccessToken: vi.fn(), setCurrentUser: vi.fn(), currentUser: null })) },
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: { getState: vi.fn(() => ({ currentSpaceId: null })) },
}));

import { http } from '@/shared/infrastructure/http/axios.client';
import { AuthHttpRepository } from './auth-http.repository';

describe('AuthHttpRepository.forgotPassword', () => {
  let repository: AuthHttpRepository;

  beforeEach(() => {
    repository = new AuthHttpRepository();
    vi.clearAllMocks();
  });

  it('resolves void on 200', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: undefined, status: 200 });

    const result = await repository.forgotPassword('user@example.com');

    expect(http.post).toHaveBeenCalledOnce();
    expect(http.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@example.com' });
    expect(result).toBeUndefined();
  });

  it('throws on 500 error', async () => {
    const serverError = new Error('Request failed with status code 500');
    vi.mocked(http.post).mockRejectedValue(serverError);

    await expect(repository.forgotPassword('user@example.com')).rejects.toThrow('Request failed with status code 500');
  });
});
