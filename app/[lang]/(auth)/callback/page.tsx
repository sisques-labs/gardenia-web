'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef, useState } from 'react';
import { redirect, useSearchParams, useParams } from 'next/navigation';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';

const meService = new MeUseCase(authHttpRepository);

function CallbackInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const ran = useRef(false);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const lang = (params.lang as string) ?? '';
    const returnUrl = searchParams.get('returnUrl') ?? `/${lang}/home`;
    const errorRedirect = `/${lang}/login?error=oauth_failed`;

    refreshTokenOnce(doRefresh)
      .then((token) => (token ? meService.me() : Promise.reject(new Error('no-token'))))
      .then(() => setDestination((current) => current ?? returnUrl))
      .catch(() => setDestination((current) => current ?? errorRedirect));
  }, [params, searchParams]);

  if (destination) {
    redirect(destination);
  }

  return <p role="status">Finishing sign-in…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p role="status">Finishing sign-in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
