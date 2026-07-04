import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockUseBootAuth = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/presentation/hooks/use-boot-auth/useBootAuth.hook', () => ({
  useBootAuth: () => mockUseBootAuth(),
}));

import { AuthProviders } from './auth.providers';

describe('AuthProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, currentUser: null, isBootComplete: false });
  });

  it('renders nothing while boot is not complete', () => {
    const { container } = render(
      <AuthProviders>
        <span>child</span>
      </AuthProviders>,
    );

    expect(mockUseBootAuth).toHaveBeenCalledOnce();
    expect(container.textContent).toBe('');
  });

  it('renders children once boot completes', () => {
    useAuthStore.setState({ isBootComplete: true });

    const { getByText } = render(
      <AuthProviders>
        <span>child</span>
      </AuthProviders>,
    );

    expect(getByText('child')).toBeTruthy();
  });
});
