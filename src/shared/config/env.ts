import { OAuthProvider } from '@/core/auth/domain/enums/oauth-provider.enum';

export { OAuthProvider };

export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
export const OAUTH_API_ORIGIN = process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN ?? '';

export function oauthUrl(provider: OAuthProvider): string {
  if (!OAUTH_API_ORIGIN) {
    throw new Error(
      '[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set — OAuth initiation requires the real API origin (not the /api proxy).',
    );
  }
  return `${OAUTH_API_ORIGIN}/auth/oauth/${provider}`;
}
