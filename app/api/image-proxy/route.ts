import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_FILE_PATHNAME = /^\/(api\/)?files\/[^/]+\/content$/;

function getAllowedHosts(): Set<string> {
  const hosts = new Set(['localhost', '127.0.0.1']);
  for (const envVar of [process.env.INTERNAL_API_URL, process.env.NEXT_PUBLIC_API_URL]) {
    if (!envVar) continue;
    try {
      hosts.add(new URL(envVar).hostname);
    } catch {
      // relative value (e.g. "/api") — no hostname to allowlist
    }
  }
  return hosts;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const target = req.nextUrl.searchParams.get('url');
  const token = req.nextUrl.searchParams.get('token');
  const spaceId = req.nextUrl.searchParams.get('spaceId');

  if (!target) {
    return NextResponse.json({ message: 'Missing url' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }

  const isAllowed =
    getAllowedHosts().has(targetUrl.hostname) &&
    PROTECTED_FILE_PATHNAME.test(targetUrl.pathname);
  if (!isAllowed) {
    return NextResponse.json({ message: 'URL not allowed' }, { status: 400 });
  }

  const upstreamHeaders: Record<string, string> = {};
  if (token) upstreamHeaders.Authorization = `Bearer ${token}`;
  if (spaceId) upstreamHeaders['X-Space-ID'] = spaceId;

  const upstream = await fetch(
    targetUrl,
    Object.keys(upstreamHeaders).length ? { headers: upstreamHeaders } : undefined,
  );

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) headers.set('cache-control', cacheControl);

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
