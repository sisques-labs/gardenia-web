import { ApolloClient, ApolloLink, InMemoryCache, Observable, createHttpLink, from } from '@apollo/client';
import type { FetchResult } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { GRAPHQL_URL } from '@/shared/config/env';

// ── httpLink ────────────────────────────────────────────────────────────────
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

// ── authLink ────────────────────────────────────────────────────────────────
// Reads accessToken at request time (rotation-safe). Omits header when null.
export const authLink: ApolloLink = setContext((_, previousContext) => {
  const token = useAuthStore.getState().accessToken;
  if (!token) return previousContext;
  return {
    ...previousContext,
    headers: {
      ...(previousContext.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
});

// ── spaceLink ───────────────────────────────────────────────────────────────
// Reads currentSpaceId at request time. Omits header when null.
export const spaceLink: ApolloLink = setContext((_, previousContext) => {
  const spaceId = useSpacesStore.getState().currentSpaceId;
  if (!spaceId) return previousContext;
  return {
    ...previousContext,
    headers: {
      ...(previousContext.headers ?? {}),
      'X-Space-ID': spaceId,
    },
  };
});

// ── onErrorLink ─────────────────────────────────────────────────────────────
// On 401 / UNAUTHENTICATED: refresh once via mutex, retry. On failure: logout.
// __retried guard prevents infinite loop.
function isUnauthorizedError(error: unknown): boolean {
  if (ServerError.is(error) && error.statusCode === 401) return true;
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
  }
  // Fallback: plain error object with statusCode (e.g. from tests)
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as { statusCode: number }).statusCode === 401;
  }
  return false;
}

export const onErrorLink: ApolloLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isUnauthorizedError(error)) return;

  const ctx = operation.getContext();
  if (ctx.__retried) return;

  return new Observable<FetchResult>((observer) => {
    refreshTokenOnce(doRefresh)
      .then((token) => {
        if (!token) {
          useAuthStore.getState().clearAuth();
          observer.error(error);
          return;
        }
        operation.setContext({ ...ctx, __retried: true });
        // authLink will re-read the fresh token at retry time
        const sub = forward(operation).subscribe({
          next: (v) => observer.next(v),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
        return () => sub.unsubscribe();
      })
      .catch((err) => observer.error(err));
  });
});

// ── Apollo client — link order: authLink → spaceLink → onErrorLink → httpLink
export const apolloClient = new ApolloClient({
  link: from([authLink, spaceLink, onErrorLink, httpLink]),
  cache: new InMemoryCache(),
});
