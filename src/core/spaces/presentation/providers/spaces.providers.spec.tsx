import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockRedirect = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

const mockSpaces = [{ id: 'space-1', name: 'Home' }];

vi.mock('@/core/spaces/presentation/hooks/use-spaces/use-spaces.hook', () => ({
  useSpaces: vi.fn(() => ({ data: mockSpaces })),
}));

import { SpacesProviders } from './spaces.providers';

describe('SpacesProviders', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    useSpacesStore.getState().clear();
    useAuthStore.setState({ accessToken: null, currentUser: null });
  });

  it('resolves the active space once authenticated and renders children', () => {
    useAuthStore.setState({ accessToken: 'token' });
    const { getByText } = render(
      <SpacesProviders lang="en">
        <p>content</p>
      </SpacesProviders>,
    );
    expect(getByText('content')).toBeInTheDocument();
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-1');
  });

  it('re-validates a stale currentSpaceId set externally after mount, without a new spaces fetch', () => {
    useAuthStore.setState({ accessToken: 'token' });

    const { rerender } = render(
      <SpacesProviders lang="en">
        <p>content</p>
      </SpacesProviders>,
    );
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-1');

    // Simulate another part of the app setting a stale/invalid space id directly on the store —
    // `spaces` and `isAuthenticated` do not change, only `currentSpaceId` does.
    useSpacesStore.setState({ currentSpaceId: 'deleted-space' });
    rerender(
      <SpacesProviders lang="en">
        <p>content</p>
      </SpacesProviders>,
    );

    expect(useSpacesStore.getState().currentSpaceId).toBe('space-1');
  });
});
