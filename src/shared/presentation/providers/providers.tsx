'use client';

import { ApolloClientProvider } from './apollo.provider';
import { ReactQueryProvider } from './query.provider';

// Module providers — import and add here as new modules are created
// import { AuthProviders } from '@/core/auth/presentation/providers/auth.providers';
// import { SpacesProviders } from '@/core/spaces/presentation/providers/spaces.providers';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloClientProvider>
      <ReactQueryProvider>
        {/* Module providers nest here */}
        {children}
      </ReactQueryProvider>
    </ApolloClientProvider>
  );
}
