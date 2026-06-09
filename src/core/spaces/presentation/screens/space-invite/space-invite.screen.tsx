'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useAcceptInvitation } from '@/core/spaces/presentation/hooks/use-accept-invitation/useAcceptInvitation.hook';
import {
  claimInviteAccept,
  isAlreadyMemberError,
  releaseInviteAccept,
} from '@/core/spaces/presentation/screens/space-invite/invite-accept-in-flight';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['invite'];
  lang: string;
};

function SpaceInviteInner({ dict, lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const isBootComplete = useAuthStore((s) => s.isBootComplete);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutate: acceptInvitation } = useAcceptInvitation();

  const code = searchParams.get('code')?.trim() ?? '';

  const goHome = () => router.replace(`/${lang}/home`);

  useEffect(() => {
    if (!isBootComplete || !code) return;

    if (!accessToken) {
      const returnUrl = `/${lang}/invite?code=${encodeURIComponent(code)}`;
      router.replace(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!claimInviteAccept(code)) return;

    acceptInvitation(code, {
      onSuccess: () => {
        releaseInviteAccept(code);
        goHome();
      },
      onError: (error) => {
        releaseInviteAccept(code);
        if (isAlreadyMemberError(error)) {
          goHome();
          return;
        }
        setAcceptError(error instanceof Error ? error.message : dict.error);
      },
    });
  }, [acceptInvitation, accessToken, code, dict.error, isBootComplete, lang, router]);

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
        {acceptError}
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
