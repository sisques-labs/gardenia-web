'use client';

import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
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
import { Check, Copy } from 'lucide-react';
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
      <CardContent className="pt-6 flex flex-col gap-4">
        <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {dict.invitation.title}
        </p>
        <form onSubmit={invForm.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">
              {dict.invitation.roleLabel}
            </label>
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
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">
              {dict.invitation.expiresLabel}
            </label>
            <Input
              type="datetime-local"
              data-testid="invitation-expires-input"
              {...invForm.register('expiresAt')}
            />
          </div>
          {isError && (
            <Alert variant="error" message={dict.errors.invitationFailed} />
          )}
          <Button type="submit" disabled={isPending} data-testid="invitation-submit">
            {isPending ? dict.invitation.submitting : dict.invitation.submit}
          </Button>
        </form>

        {invitation && (
          <div
            data-testid="invitation-result"
            className="flex flex-col gap-3 pt-2 border-t border-[var(--rule)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{dict.invitation.code}:</span>
              <code data-testid="invitation-display-code" className="font-mono text-sm font-semibold">
                {invitation.displayCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                data-testid="copy-code-btn"
                onClick={() => copy(invitation.code, 'code')}
              >
                {copied === 'code' ? (
                  <><Check className="w-3 h-3" /> {dict.invitation.codeCopied}</>
                ) : (
                  <><Copy className="w-3 h-3" /> {dict.invitation.copyCode}</>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                data-testid="copy-link-btn"
                onClick={() => copy(inviteLink(invitation), 'link')}
              >
                {copied === 'link' ? (
                  <><Check className="w-3 h-3" /> {dict.invitation.linkCopied}</>
                ) : (
                  <><Copy className="w-3 h-3" /> {dict.invitation.copyLink}</>
                )}
              </Button>
            </div>
            {invitation.qrId && (
              <div className="flex flex-col gap-2">
                <Image
                  data-testid="invitation-qr"
                  src={`/api/qrs/${invitation.qrId}/image`}
                  alt={dict.invitation.qrAlt}
                  width={128}
                  height={128}
                  unoptimized
                  className="border border-[var(--rule)] rounded-md"
                />
                <p className="text-xs text-muted-foreground">{dict.invitation.qrHint}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
