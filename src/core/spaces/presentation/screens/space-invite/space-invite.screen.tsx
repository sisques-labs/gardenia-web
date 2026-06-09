'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useAcceptInvitation } from '@/core/spaces/presentation/hooks/use-accept-invitation/useAcceptInvitation.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['invite'];
  lang: string;
};

function SpaceInviteInner({ dict, lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);
  const [acceptError, setAcceptError] = useState(false);

  const isBootComplete = useAuthStore((s) => s.isBootComplete);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutate: acceptInvitation } = useAcceptInvitation();

  const code = searchParams.get('code')?.trim() ?? '';

  useEffect(() => {
    if (!isBootComplete || !code || ran.current) return;

    if (!accessToken) {
      const returnUrl = `/${lang}/invite?code=${encodeURIComponent(code)}`;
      router.replace(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    ran.current = true;
    acceptInvitation(code, {
      onSuccess: () => router.replace(`/${lang}/home`),
      onError: () => setAcceptError(true),
    });
  }, [acceptInvitation, accessToken, code, isBootComplete, lang, router]);

  if (!code) {
    return (
      <p role="alert" style={{ textAlign: 'center' }}>
        {dict.missingCode}
      </p>
    );
  }

  if (acceptError) {
    return (
      <p role="alert" style={{ textAlign: 'center' }}>
        {dict.error}
      </p>
    );
  }

  return (
    <p role="status" style={{ textAlign: 'center' }}>
      {dict.accepting}
    </p>
  );
}

export function SpaceInviteScreen({ dict, lang }: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" style={{ textAlign: 'center' }}>
          {dict.accepting}
        </p>
      }
    >
      <SpaceInviteInner dict={dict} lang={lang} />
    </Suspense>
  );
}
