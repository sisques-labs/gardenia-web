import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];
// TODO: confirm exact cookie name with backend
const REFRESH_COOKIE = 'refreshToken';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAuth = Boolean(req.cookies.get(REFRESH_COOKIE));
  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  if (isPublic && hasAuth) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (!isPublic && !hasAuth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
