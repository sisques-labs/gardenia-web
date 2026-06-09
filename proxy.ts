import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/shared/presentation/i18n/locale';

const REFRESH_COOKIE = 'refresh_token';
const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password'];
const PUBLIC_PATHS = [...GUEST_ONLY_PATHS, '/invite'];

function getLocaleFromPathname(pathname: string): string | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/graphql')
  ) {
    return NextResponse.next();
  }

  const hasAuth = Boolean(req.cookies.get(REFRESH_COOKIE));

  if (pathname === '/') {
    const dest = hasAuth ? `/${DEFAULT_LOCALE}/home` : `/${DEFAULT_LOCALE}/login`;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const locale = getLocaleFromPathname(pathname);
  if (!locale) {
    const url = new URL(`/${DEFAULT_LOCALE}${pathname}`, req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  if (pathWithoutLocale === '/') {
    const dest = hasAuth ? `/${locale}/home` : `/${locale}/login`;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));
  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  if (isGuestOnly && hasAuth) {
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
  }
  if (!isPublic && !hasAuth) {
    const url = new URL(`/${locale}/login`, req.url);
    const returnUrl = `${pathWithoutLocale}${req.nextUrl.search}`;
    url.searchParams.set('returnUrl', returnUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
