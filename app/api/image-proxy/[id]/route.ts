import { NextRequest, NextResponse } from 'next/server';
import { internalUrl } from '@/shared/infrastructure/http/proxy';

type Params = Promise<{ id: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params },
): Promise<NextResponse> {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');
  const spaceId = req.nextUrl.searchParams.get('spaceId');

  const upstreamHeaders: Record<string, string> = {};
  if (token) upstreamHeaders.Authorization = `Bearer ${token}`;
  if (spaceId) upstreamHeaders['X-Space-ID'] = spaceId;

  const upstream = await fetch(
    internalUrl(`/api/files/${id}/content`),
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
