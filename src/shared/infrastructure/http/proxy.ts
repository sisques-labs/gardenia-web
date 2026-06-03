import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? 'http://localhost:3000';

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'transfer-encoding', 'upgrade',
  'proxy-authorization', 'proxy-authenticate', 'te', 'trailer',
]);

export async function proxyTo(req: NextRequest, upstreamUrl: string): Promise<NextResponse> {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: 'manual',
    // @ts-expect-error — duplex required for streaming request body in Node fetch
    duplex: hasBody ? 'half' : undefined,
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export function internalUrl(path: string): string {
  return `${INTERNAL_API_URL}${path}`;
}
