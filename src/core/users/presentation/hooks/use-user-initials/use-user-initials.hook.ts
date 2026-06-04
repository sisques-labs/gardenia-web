import { useMemo } from 'react';
import type { User } from '@/core/users/domain/interfaces/user.interface';

export function useUserInitials(user: User | undefined): string {
  return useMemo(() => {
    if (!user) return '';
    return (
      [user.firstName, user.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('') || user.username[0].toUpperCase()
    );
  }, [user]);
}
