import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────
// T3: oauthUrl tests
// We test via vi.doMock to control the OAUTH_API_ORIGIN constant
// because Next.js would inline NEXT_PUBLIC_* at build time.
// ──────────────────────────────────────────────

describe('oauthUrl', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns the correct URL for each provider when OAUTH_API_ORIGIN is set', async () => {
    vi.doMock('./env', async (importOriginal) => {
      const mod = await importOriginal<typeof import('./env')>();
      return {
        ...mod,
        OAUTH_API_ORIGIN: 'https://api.example.com',
        oauthUrl: (provider: string) => `https://api.example.com/auth/oauth/${provider}`,
      };
    });

    const { oauthUrl } = await import('./env');

    expect(oauthUrl('github')).toBe('https://api.example.com/auth/oauth/github');
    expect(oauthUrl('google')).toBe('https://api.example.com/auth/oauth/google');
    expect(oauthUrl('apple')).toBe('https://api.example.com/auth/oauth/apple');

    vi.doUnmock('./env');
  });

  it('throws when OAUTH_API_ORIGIN is empty', async () => {
    vi.doMock('./env', async (importOriginal) => {
      const mod = await importOriginal<typeof import('./env')>();
      return {
        ...mod,
        OAUTH_API_ORIGIN: '',
        oauthUrl: () => {
          throw new Error(
            '[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set — OAuth initiation requires the real API origin (not the /api proxy).',
          );
        },
      };
    });

    const { oauthUrl } = await import('./env');

    expect(() => oauthUrl('github')).toThrow('[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set');

    vi.doUnmock('./env');
  });
});

describe('oauthUrl — real implementation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('oauthUrl throws when OAUTH_API_ORIGIN is the empty string', async () => {
    // Stub process.env before module load
    const original = process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN;
    delete process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN;

    const { oauthUrl } = await import('./env');

    expect(() => oauthUrl('github')).toThrow('[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set');

    process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN = original;
  });

  it('OAUTH_API_ORIGIN is exported as a string', async () => {
    const { OAUTH_API_ORIGIN } = await import('./env');
    expect(typeof OAUTH_API_ORIGIN).toBe('string');
  });
});
