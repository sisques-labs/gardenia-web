'use client';

import { ApolloClientProvider } from './apollo.provider';
import { ReactQueryProvider } from './query.provider';

import { AuthProviders } from '@/core/auth/presentation/providers/auth.providers';
import { NotificationsProvider } from '@/core/notifications/presentation/providers/notifications.providers';
// SpacesProviders lives in app/[lang]/(protected)/layout.tsx — needs lang prop

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloClientProvider>
      <ReactQueryProvider>
        <AuthProviders>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </AuthProviders>
      </ReactQueryProvider>
    </ApolloClientProvider>
  );
}
