'use client';

import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
import { Input } from '@/shared/presentation/components/ui/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateInvitationFormValues } from '@/core/spaces/presentation/schemas/create-invitation.schema';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';
import { Check, Copy, UserPlus } from 'lucide-react';
import Image from 'next/image';

interface SpaceInvitationCardProps {
  dict: AppDict['spaces']['settings'];
  invForm: UseFormReturn<CreateInvitationFormValues>;
  onSubmit: (values: CreateInvitationFormValues) => void;
  isPending: boolean;
  isError: boolean;
  invitation: SpaceInvitation | undefined;
  copied: string | null;
  copy: (text: string, key: string) => void;
  inviteLink: (inv: SpaceInvitation) => string;
}

export function SpaceInvitationCard({
  dict,
  invForm,
  onSubmit,
  isPending,
  isError,
  invitation,
  copied,
  copy,
  inviteLink,
}: SpaceInvitationCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-bg text-forest"
          >
            <UserPlus className="h-5 w-5" />
          </span>
          <p className="eyebrow">{dict.invitation.title}</p>
        </div>

        <form onSubmit={invForm.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label={dict.invitation.roleLabel}>
            <Select
              defaultValue="member"
              onValueChange={(v) => invForm.setValue('role', v as 'owner' | 'member')}
            >
              <SelectTrigger data-testid="invitation-role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{dict.invitation.roleMember}</SelectItem>
                <SelectItem value="owner">{dict.invitation.roleOwner}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={dict.invitation.expiresLabel}>
            <Input
              type="datetime-local"
              data-testid="invitation-expires-input"
              {...invForm.register('expiresAt')}
            />
          </FormField>

          {isError && <Alert variant="error" message={dict.errors.invitationFailed} />}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} data-testid="invitation-submit">
              {isPending ? dict.invitation.submitting : dict.invitation.submit}
            </Button>
          </div>
        </form>

        {invitation && (
          <div
            data-testid="invitation-result"
            className="dashed-rule flex flex-col gap-3 pt-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">{dict.invitation.code}</span>
              <code
                data-testid="invitation-display-code"
                className="chip forest font-mono font-semibold tracking-wide"
              >
                {invitation.displayCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                data-testid="copy-code-btn"
                onClick={() => copy(invitation.code, 'code')}
              >
                {copied === 'code' ? (
                  <><Check className="h-3 w-3" /> {dict.invitation.codeCopied}</>
                ) : (
                  <><Copy className="h-3 w-3" /> {dict.invitation.copyCode}</>
                )}
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                data-testid="copy-link-btn"
                onClick={() => copy(inviteLink(invitation), 'link')}
              >
                {copied === 'link' ? (
                  <><Check className="h-3 w-3" /> {dict.invitation.linkCopied}</>
                ) : (
                  <><Copy className="h-3 w-3" /> {dict.invitation.copyLink}</>
                )}
              </Button>
            </div>
            {invitation.qrId && (
              <div className="flex flex-col items-center gap-2 rounded-md bg-paper-2 p-4">
                <Image
                  data-testid="invitation-qr"
                  src={`/api/qrs/${invitation.qrId}/image`}
                  alt={dict.invitation.qrAlt}
                  width={128}
                  height={128}
                  unoptimized
                  className="rounded-md border border-rule bg-(--white)"
                />
                <p className="text-center text-xs text-ink-3">{dict.invitation.qrHint}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
