'use client';

import { Suspense } from 'react';
import { useAcceptInvitationFlow } from '@/core/spaces/presentation/hooks/use-accept-invitation-flow/use-accept-invitation-flow.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['invite'];
  lang: string;
};

function SpaceInviteInner({ dict, lang }: Props) {
  const { code, acceptError } = useAcceptInvitationFlow({ lang, fallbackErrorMessage: dict.error });

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
