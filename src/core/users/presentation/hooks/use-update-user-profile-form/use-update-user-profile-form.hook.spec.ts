import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/users/application/use-cases/update-user/update-user.use-case', () => ({
  UpdateUserUseCase: class {
    execute(...args: unknown[]) {
      return mockExecute(...args);
    }
  },
}));

vi.mock('@/core/users/infrastructure/repositories/graphql/users.gql.repository', () => ({
  usersGqlRepository: {},
}));

import { useUpdateUserProfileForm } from './use-update-user-profile-form.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const user: User = {
  id: 'user-1',
  username: 'jdoe',
  firstName: 'John',
  lastName: 'Doe',
  avatarUrl: 'https://example.com/a.png',
  bio: 'Gardener',
  locale: 'en',
  timezone: 'UTC',
} as User;

describe('useUpdateUserProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets the form with the user data once it is available', async () => {
    const { result, rerender } = renderHook(({ u }) => useUpdateUserProfileForm(u), {
      wrapper: makeWrapper(),
      initialProps: { u: undefined as User | undefined },
    });

    expect(result.current.form.getValues('username')).toBe('');

    rerender({ u: user });

    await waitFor(() => expect(result.current.form.getValues('username')).toBe('jdoe'));
  });

  it('does not submit when there is no user', async () => {
    const { result } = renderHook(() => useUpdateUserProfileForm(undefined), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => undefined } as unknown as React.BaseSyntheticEvent);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('submits update payload converting empty strings to null', async () => {
    mockExecute.mockResolvedValue(user);
    const { result, rerender } = renderHook(({ u }) => useUpdateUserProfileForm(u), {
      wrapper: makeWrapper(),
      initialProps: { u: user },
    });
    rerender({ u: user });
    await waitFor(() => expect(result.current.form.getValues('username')).toBe('jdoe'));

    act(() => {
      result.current.form.setValue('bio', '');
    });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => undefined } as unknown as React.BaseSyntheticEvent);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', bio: null }),
    );
    expect(result.current.isSuccess).toBe(true);
  });
});
