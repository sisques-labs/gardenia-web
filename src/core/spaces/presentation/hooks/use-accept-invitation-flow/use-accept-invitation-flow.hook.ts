'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useAcceptInvitation } from '@/core/spaces/presentation/hooks/use-accept-invitation/use-accept-invitation.hook';
import {
  claimInviteAccept,
  isAlreadyMemberError,
  markInviteAcceptCompleted,
  releaseInviteAccept,
  wasInviteAcceptCompleted,
} from '@/core/spaces/presentation/screens/space-invite/invite-accept-in-flight';

type Params = {
  lang: string;
  fallbackErrorMessage: string;
};

export function useAcceptInvitationFlow({ lang, fallbackErrorMessage }: Params) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const isBootComplete = useAuthStore((s) => s.isBootComplete);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutateAsync: acceptInvitation } = useAcceptInvitation();

  const code = searchParams.get('code')?.trim() ?? '';

  useEffect(() => {
    if (!isBootComplete || !code) return;

    const goHome = () => router.replace(`/${lang}/home`);

    if (!accessToken) {
      const returnUrl = `/${lang}/invite?code=${encodeURIComponent(code)}`;
      router.replace(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (wasInviteAcceptCompleted(code)) {
      goHome();
      return;
    }

    if (!claimInviteAccept(code)) return;

    void (async () => {
      try {
        await acceptInvitation(code);
        markInviteAcceptCompleted(code);
        goHome();
      } catch (error) {
        if (isAlreadyMemberError(error)) {
          markInviteAcceptCompleted(code);
          goHome();
          return;
        }
        setAcceptError(error instanceof Error ? error.message : fallbackErrorMessage);
      } finally {
        releaseInviteAccept(code);
      }
    })();
  }, [acceptInvitation, accessToken, code, fallbackErrorMessage, isBootComplete, lang, router]);

  return { code, acceptError };
}
