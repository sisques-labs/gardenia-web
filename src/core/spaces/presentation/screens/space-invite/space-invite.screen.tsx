'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useAcceptInvitation } from '@/core/spaces/presentation/hooks/use-accept-invitation/use-accept-invitation.hook';
import { useSpaceInvitationPreview } from '@/core/spaces/presentation/hooks/use-space-invitation-preview/use-space-invitation-preview.hook';
import {
  claimInviteAccept,
  markInviteAcceptCompleted,
  releaseInviteAccept,
  wasInviteAcceptCompleted,
} from '@/core/spaces/presentation/screens/space-invite/invite-accept-in-flight';
import {
  getInvitationErrorCode,
  type InviteErrorCode,
} from '@/core/spaces/presentation/screens/space-invite/invite-error-code';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['invite'];
  lang: string;
};

const SUCCESS_REDIRECT_DELAY_MS = 1200;

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

function errorMessage(dict: Props['dict'], code: InviteErrorCode | null): string {
  return (code && dict.errors[code]) || dict.errors.fallback;
}

function SpaceInviteInner({ dict, lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code')?.trim() ?? '';

  const isBootComplete = useAuthStore((s) => s.isBootComplete);
  const accessToken = useAuthStore((s) => s.accessToken);

  const preview = useSpaceInvitationPreview(code);
  const { mutateAsync: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();

  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!succeeded) return;
    const timer = setTimeout(() => router.replace(`/${lang}/home`), SUCCESS_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [succeeded, router, lang]);

  if (!code) {
    return (
      <p role="alert" style={{ textAlign: 'center' }}>
        {dict.missingCode}
      </p>
    );
  }

  if (!isBootComplete || preview.isLoading) {
    return (
      <p role="status" style={{ textAlign: 'center' }}>
        {dict.previewLoading}
      </p>
    );
  }

  if (preview.isError) {
    return (
      <p role="alert" style={{ textAlign: 'center' }}>
        {errorMessage(dict, getInvitationErrorCode(preview.error))}
      </p>
    );
  }

  const invitation = preview.data;
  if (!invitation) return null;

  if (invitation.isExpired) {
    return (
      <p role="alert" style={{ textAlign: 'center' }}>
        {dict.errors.InvitationExpiredException}
      </p>
    );
  }

  if (succeeded) {
    return (
      <p role="status" style={{ textAlign: 'center' }}>
        {interpolate(dict.success, { spaceName: invitation.spaceName })}
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

  const roleLabel = invitation.role === 'OWNER' ? dict.roleOwner : dict.roleMember;

  if (!accessToken) {
    const prompt = interpolate(dict.joinPromptUnauthenticated, {
      spaceName: invitation.spaceName,
      role: roleLabel,
    });
    const returnUrl = `/${lang}/invite?code=${encodeURIComponent(code)}`;

    return (
      <div style={{ textAlign: 'center' }}>
        <p>{prompt}</p>
        <button
          type="button"
          onClick={() => router.push(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`)}
        >
          {dict.signInCta}
        </button>
      </div>
    );
  }

  const prompt = interpolate(dict.joinPromptAuthenticated, {
    spaceName: invitation.spaceName,
    role: roleLabel,
  });

  const handleJoin = async () => {
    if (wasInviteAcceptCompleted(code)) {
      setSucceeded(true);
      return;
    }
    if (!claimInviteAccept(code)) return;

    try {
      await acceptInvitation(code);
      markInviteAcceptCompleted(code);
      setSucceeded(true);
    } catch (error) {
      setAcceptError(errorMessage(dict, getInvitationErrorCode(error)));
    } finally {
      releaseInviteAccept(code);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p>{prompt}</p>
      <button type="button" disabled={isAccepting} onClick={() => void handleJoin()}>
        {isAccepting ? dict.joining : dict.joinCta}
      </button>
    </div>
  );
}

export function SpaceInviteScreen({ dict, lang }: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" style={{ textAlign: 'center' }}>
          {dict.previewLoading}
        </p>
      }
    >
      <SpaceInviteInner dict={dict} lang={lang} />
    </Suspense>
  );
}
