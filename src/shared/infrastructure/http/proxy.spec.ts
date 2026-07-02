import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { internalUrl, proxyTo } from './proxy';

function request(path: string, init?: { method?: string }) {
  return new NextRequest(new URL(path, 'http://localhost:3001'), init);
}

describe('proxyTo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards every Set-Cookie header from the upstream response', async () => {
    const setCookies = ['refresh_token=abc; HttpOnly; Path=/', 'other=xyz; Path=/'];

    // Mirrors real fetch() semantics: Set-Cookie is excluded from forEach on
    // a network response (only getSetCookie() exposes it) — a manually
    // constructed `new Response()` does NOT reproduce that guard, so it
    // can't stand in for the real bug here.
    const upstreamHeaders = {
      forEach: (cb: (value: string, key: string) => void) => {
        cb('application/json', 'content-type');
      },
      getSetCookie: () => setCookies,
    } as unknown as Headers;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, body: null, headers: upstreamHeaders } as Response),
    );

    const res = await proxyTo(
      request('/api/auth/register', { method: 'POST' }),
      internalUrl('/api/auth/register'),
    );

    expect(res.headers.getSetCookie()).toEqual(setCookies);
  });
});
