import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

const mockReplace = vi.hoisted(() => vi.fn());
const mockRefreshTokenOnce = vi.hoisted(() => vi.fn());
const mockDoRefresh = vi.hoisted(() => vi.fn());
const mockMe = vi.hoisted(() => vi.fn());
let mockLang = 'es';
let mockReturnUrl: string | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useParams: () => ({ lang: mockLang }),
  useSearchParams: () => ({ get: (key: string) => (key === 'returnUrl' ? mockReturnUrl : null) }),
}));

vi.mock('@/core/auth/infrastructure/http/refresh-mutex', () => ({
  refreshTokenOnce: mockRefreshTokenOnce,
}));

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  doRefresh: mockDoRefresh,
}));

vi.mock('@/core/auth/application/use-cases/me/me.use-case', () => ({
  MeUseCase: vi.fn(function () {
    this.me = mockMe;
  }),
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import CallbackPage from './page';

describe('CallbackPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefreshTokenOnce.mockReset();
    mockMe.mockReset();
    mockLang = 'es';
    mockReturnUrl = null;
  });

  it('redirects to /{lang}/home when token resolves and no returnUrl', async () => {
    mockRefreshTokenOnce.mockResolvedValue('abc123');
    mockMe.mockResolvedValue({ id: '1', email: 'test@example.com' });

    render(<CallbackPage />);

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/es/home');
    });
  });

  it('redirects to returnUrl when token resolves and returnUrl present', async () => {
    mockReturnUrl = '/dashboard/plants';
    mockRefreshTokenOnce.mockResolvedValue('abc123');
    mockMe.mockResolvedValue({ id: '1', email: 'test@example.com' });

    render(<CallbackPage />);

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/plants');
    });
  });

  it('redirects to /{lang}/login?error=oauth_failed when refreshTokenOnce returns null', async () => {
    mockRefreshTokenOnce.mockResolvedValue(null);

    render(<CallbackPage />);

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/es/login?error=oauth_failed');
    });
  });

  it('redirects to /{lang}/login?error=oauth_failed when me() rejects', async () => {
    mockRefreshTokenOnce.mockResolvedValue('abc123');
    mockMe.mockRejectedValue(new Error('network error'));

    render(<CallbackPage />);

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/es/login?error=oauth_failed');
    });
  });

  it('calls router.replace exactly once even on StrictMode double-mount (ran ref guard)', async () => {
    mockRefreshTokenOnce.mockResolvedValue('abc123');
    mockMe.mockResolvedValue({ id: '1', email: 'test@example.com' });

    render(
      <React.StrictMode>
        <CallbackPage />
      </React.StrictMode>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });
});
