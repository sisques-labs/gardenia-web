import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

function request(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3001'));
}

describe('GET /api/image-proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 400 when the url param is missing', async () => {
    const res = await GET(request('/api/image-proxy'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when the url param is not a valid url', async () => {
    const res = await GET(request('/api/image-proxy?url=not-a-url'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when the host is not allowlisted', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    const res = await GET(
      request(
        `/api/image-proxy?url=${encodeURIComponent('http://evil.com/files/abc/content')}`,
      ),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when the pathname is not the protected file-content pattern', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    const res = await GET(
      request(
        `/api/image-proxy?url=${encodeURIComponent('http://localhost:3000/api/other')}`,
      ),
    );
    expect(res.status).toBe(400);
  });

  it('fetches the upstream url with a Bearer token and forwards content-type', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(['img-bytes']), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const target = 'http://localhost:3000/api/files/abc-123/content';
    const res = await GET(
      request(`/api/image-proxy?url=${encodeURIComponent(target)}&token=tok-1`),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL(target),
      expect.objectContaining({ headers: { Authorization: 'Bearer tok-1' } }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('forwards the X-Space-ID header alongside the Bearer token', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(['img-bytes']), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const target = 'http://localhost:3000/api/files/abc-123/content';
    await GET(
      request(
        `/api/image-proxy?url=${encodeURIComponent(target)}&token=tok-1&spaceId=space-1`,
      ),
    );

    expect(fetchMock).toHaveBeenCalledWith(new URL(target), {
      headers: { Authorization: 'Bearer tok-1', 'X-Space-ID': 'space-1' },
    });
  });

  it('fetches without an Authorization header when no token is provided', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(['img-bytes']), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const target = 'http://localhost:3000/files/abc-123/content';
    await GET(request(`/api/image-proxy?url=${encodeURIComponent(target)}`));

    expect(fetchMock).toHaveBeenCalledWith(new URL(target), undefined);
  });

  it('passes through a non-ok upstream status without streaming the error body', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('unauthorized', { status: 401 })),
    );

    const target = 'http://localhost:3000/api/files/abc-123/content';
    const res = await GET(
      request(`/api/image-proxy?url=${encodeURIComponent(target)}&token=bad`),
    );

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('');
  });
});
