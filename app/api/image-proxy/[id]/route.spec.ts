import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

function request(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3001'));
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/image-proxy/[id]', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('fetches the internal file-content endpoint with a Bearer token and X-Space-ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('img-bytes', {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(
      request('/api/image-proxy/abc-123?token=tok-1&spaceId=space-1'),
      params('abc-123'),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/abc-123/content',
      { headers: { Authorization: 'Bearer tok-1', 'X-Space-ID': 'space-1' } },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('falls back to localhost:3000 when INTERNAL_API_URL is unset', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('img-bytes', {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await GET(request('/api/image-proxy/abc-123'), params('abc-123'));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/abc-123/content',
      undefined,
    );
  });

  it('fetches without headers when no token or spaceId are provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('img-bytes', { status: 200, headers: {} }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await GET(request('/api/image-proxy/abc-123'), params('abc-123'));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/abc-123/content',
      undefined,
    );
  });

  it('passes through a non-ok upstream status without streaming the error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('unauthorized', { status: 401 })),
    );

    const res = await GET(
      request('/api/image-proxy/abc-123?token=bad'),
      params('abc-123'),
    );

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('');
  });
});
