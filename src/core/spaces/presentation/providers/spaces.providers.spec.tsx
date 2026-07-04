import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockUseSpaces = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock('@/core/spaces/presentation/hooks/use-spaces/use-spaces.hook', () => ({
  useSpaces: () => mockUseSpaces(),
}));

import { SpacesProviders } from './spaces.providers';

describe('SpacesProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpacesStore.setState({ availableSpaces: [], currentSpaceId: null, isResolved: false });
    useAuthStore.setState({ accessToken: null, currentUser: null, isBootComplete: false });
    mockUseSpaces.mockReturnValue({ data: undefined });
  });

  it('renders children without resolving spaces when unauthenticated', () => {
    const { getByText } = render(
      <SpacesProviders lang="en">
        <span>child</span>
      </SpacesProviders>,
    );

    expect(getByText('child')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('resolves the active space once authenticated and spaces are loaded', async () => {
    useAuthStore.setState({ accessToken: 'tok' });
    mockUseSpaces.mockReturnValue({ data: [{ id: 'space-1' }] });

    render(
      <SpacesProviders lang="en">
        <span>child</span>
      </SpacesProviders>,
    );

    await waitFor(() => expect(useSpacesStore.getState().currentSpaceId).toBe('space-1'));
  });

  it('redirects to space creation when resolved without a current space', () => {
    useSpacesStore.setState({ availableSpaces: [], currentSpaceId: null, isResolved: true });

    render(
      <SpacesProviders lang="es">
        <span>child</span>
      </SpacesProviders>,
    );

    expect(mockRedirect).toHaveBeenCalledWith('/es/spaces/new');
  });
});
