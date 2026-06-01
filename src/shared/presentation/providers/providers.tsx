'use client';

import { ApolloClientProvider } from './apollo.provider';
import { ReactQueryProvider } from './query.provider';

import { AuthProviders } from '@/core/auth/presentation/providers/auth.providers';
// import { SpacesProviders } from '@/core/spaces/presentation/providers/spaces.providers';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloClientProvider>
      <ReactQueryProvider>
        <AuthProviders>
          {children}
        </AuthProviders>
      </ReactQueryProvider>
    </ApolloClientProvider>
  );
}
