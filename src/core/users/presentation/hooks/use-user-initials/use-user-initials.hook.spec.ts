import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { User } from '@/core/users/domain/interfaces/user.interface';
import { useUserInitials } from './use-user-initials.hook';

describe('useUserInitials', () => {
  it('returns an empty string when there is no user', () => {
    const { result } = renderHook(() => useUserInitials(undefined));

    expect(result.current).toBe('');
  });

  it('builds initials from first and last name', () => {
    const user = { username: 'jdoe', firstName: 'John', lastName: 'Doe' } as User;
    const { result } = renderHook(() => useUserInitials(user));

    expect(result.current).toBe('JD');
  });

  it('falls back to the username initial when there is no first/last name', () => {
    const user = { username: 'jdoe', firstName: null, lastName: null } as User;
    const { result } = renderHook(() => useUserInitials(user));

    expect(result.current).toBe('J');
  });
});
