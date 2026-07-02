'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Sprout } from 'lucide-react';
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
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Spinner } from '@/shared/presentation/components/ui/spinner/spinner';
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

function errorVariant(code: InviteErrorCode | null): 'warning' | 'error' {
  return code === 'InvitationExpiredException' ? 'warning' : 'error';
}

function InviteIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--forest-bg)]">
      {children}
    </div>
  );
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
    return <Alert variant="error" message={dict.missingCode} />;
  }

  if (!isBootComplete || preview.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Spinner size="lg" label={dict.previewLoading} />
        <p className="text-sm text-muted-foreground">{dict.previewLoading}</p>
      </div>
    );
  }

  if (preview.isError) {
    const code = getInvitationErrorCode(preview.error);
    return <Alert variant={errorVariant(code)} message={errorMessage(dict, code)} />;
  }

  const invitation = preview.data;
  if (!invitation) return null;

  if (invitation.isExpired) {
    return <Alert variant="warning" message={dict.errors.InvitationExpiredException} />;
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <InviteIcon>
          <CheckCircle2 className="h-6 w-6 text-[var(--forest)]" />
        </InviteIcon>
        <p className="headline text-xl">
          {interpolate(dict.success, { spaceName: invitation.spaceName })}
        </p>
      </div>
    );
  }

  if (acceptError) {
    return <Alert variant="error" message={acceptError} />;
  }

  const roleLabel = invitation.role === 'OWNER' ? dict.roleOwner : dict.roleMember;

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
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <InviteIcon>
        <Sprout className="h-6 w-6 text-[var(--forest)]" />
      </InviteIcon>
      <div className="flex flex-col items-center gap-2">
        <p className="headline text-xl">{invitation.spaceName}</p>
        <Badge variant="forest">{roleLabel}</Badge>
      </div>
      {accessToken ? (
        <>
          <p className="text-sm text-muted-foreground">{dict.joinPromptAuthenticated}</p>
          <Button
            className="w-full"
            disabled={isAccepting}
            loading={isAccepting}
            onClick={() => void handleJoin()}
          >
            {isAccepting ? dict.joining : dict.joinCta}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{dict.joinPromptUnauthenticated}</p>
          <Button
            className="w-full"
            onClick={() => {
              const returnUrl = `/${lang}/invite?code=${encodeURIComponent(code)}`;
              router.push(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            }}
          >
            {dict.signInCta}
          </Button>
        </>
      )}
    </div>
  );
}

export function SpaceInviteScreen({ dict, lang }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Spinner size="lg" label={dict.previewLoading} />
          <p className="text-sm text-muted-foreground">{dict.previewLoading}</p>
        </div>
      }
    >
      <SpaceInviteInner dict={dict} lang={lang} />
    </Suspense>
  );
}
