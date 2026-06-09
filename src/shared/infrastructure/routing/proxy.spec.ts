import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '../../../../proxy';

function request(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(path, 'http://localhost:3001'));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

describe('proxy', () => {
  it('prefixes locale and preserves query string for /invite', () => {
    const res = proxy(request('/invite?code=TES%20%C2%B7%202026%20%C2%B7%20MR'));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/en/invite');
    expect(location.searchParams.get('code')).toBe('TES · 2026 · MR');
  });

  it('allows unauthenticated access to /en/invite', () => {
    const res = proxy(request('/en/invite?code=ABC'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows authenticated access to /en/invite so accept can run', () => {
    const res = proxy(
      request('/en/invite?code=TES%20%C2%B7%202026%20%C2%B7%20MR', {
        refresh_token: 'token',
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects authenticated users away from login', () => {
    const res = proxy(request('/en/login', { refresh_token: 'token' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/en/home');
  });

  it('includes query string in login returnUrl for protected routes', () => {
    const res = proxy(request('/en/home?tab=plants'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'http://localhost:3001/en/login?returnUrl=%2Fhome%3Ftab%3Dplants',
    );
  });
});
