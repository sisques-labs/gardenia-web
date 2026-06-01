'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

interface Props {
  children: React.ReactNode;
  lang: string;
}

export function SpacesProviders({ children, lang }: Props) {
  const { data: spaces } = useSpaces();
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  const { currentSpaceId, isResolved, resolveActiveSpace } = useSpacesStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !spaces) return;
    resolveActiveSpace(spaces, currentSpaceId);
  }, [isAuthenticated, spaces]);

  useEffect(() => {
    if (!isResolved) return;
    if (!currentSpaceId) router.replace(`/${lang}/spaces/new`);
  }, [isResolved, currentSpaceId]);

  return <>{children}</>;
}
