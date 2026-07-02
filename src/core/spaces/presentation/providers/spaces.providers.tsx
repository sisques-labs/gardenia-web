'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/use-spaces.hook';
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

  useEffect(() => {
    if (!isAuthenticated || !spaces) return;
    resolveActiveSpace(spaces, currentSpaceId);
  }, [isAuthenticated, spaces]);

  if (isResolved && !currentSpaceId) {
    redirect(`/${lang}/spaces/new`);
  }

  return <>{children}</>;
}
