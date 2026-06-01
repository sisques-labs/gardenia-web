import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

function makeRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url);
  Object.entries(cookies).forEach(([name, value]) => {
    req.cookies.set(name, value);
  });
  return req;
}

describe('middleware', () => {
  it('redirects unauthenticated user from protected route to /login', () => {
    const req = makeRequest('/');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('returnUrl=%2F');
  });

  it('redirects unauthenticated user from /spaces/new to /login', () => {
    const req = makeRequest('/spaces/new');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('allows public route /login without cookie', () => {
    const req = makeRequest('/login');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows public route /register without cookie', () => {
    const req = makeRequest('/register');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('redirects authenticated user from /login to /', () => {
    const req = makeRequest('/login', { refreshToken: 'some-token' });
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('http://localhost/');
  });

  it('allows authenticated user access to protected routes', () => {
    const req = makeRequest('/', { refreshToken: 'some-token' });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });
});
