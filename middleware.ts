import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from '@/shared/presentation/i18n/locale';

const REFRESH_COOKIE = 'refresh_token';
const PUBLIC_PATHS = ['/login', '/register'];

function getLocaleFromPathname(pathname: string): string | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals and static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirect root to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, req.url));
  }

  // Redirect paths without locale prefix
  const locale = getLocaleFromPathname(pathname);
  if (!locale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, req.url));
  }

  // Auth guard — check cookie presence
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const hasAuth = Boolean(req.cookies.get(REFRESH_COOKIE));
  const isPublic = PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  if (isPublic && hasAuth) {
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
  }
  if (!isPublic && !hasAuth) {
    const url = new URL(`/${locale}/login`, req.url);
    url.searchParams.set('returnUrl', pathWithoutLocale);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
