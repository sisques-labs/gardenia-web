'use client';

import { SpacesProviders } from '@/core/spaces/presentation/providers/spaces.providers';
// import { OtherProtectedProviders } from '@/core/other/presentation/providers/other.providers';

interface ProtectedProvidersProps {
  children: React.ReactNode;
  lang: string;
}

export function ProtectedProviders({ children, lang }: ProtectedProvidersProps) {
  return (
    <SpacesProviders lang={lang}>
      {children}
    </SpacesProviders>
  );
}
