'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';

const meService = new MeUseCase(authHttpRepository);

function CallbackInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const lang = (params.lang as string) ?? '';
    const returnUrl = searchParams.get('returnUrl') ?? `/${lang}/home`;
    const errorRedirect = `/${lang}/login?error=oauth_failed`;

    refreshTokenOnce(doRefresh)
      .then((token) => (token ? meService.me() : Promise.reject(new Error('no-token'))))
      .then(() => router.replace(returnUrl))
      .catch(() => router.replace(errorRedirect));
  }, [params, router, searchParams]);

  return <p role="status">Finishing sign-in…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p role="status">Finishing sign-in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
