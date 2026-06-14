'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Alert } from '@/shared/presentation/components/ui/alert';
import { Card, CardContent } from '@/shared/presentation/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { InDevelopment } from '@/shared/presentation/components/in-development/in-development';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpaceDetail } from '@/core/spaces/presentation/hooks/use-space-detail/useSpaceDetail.hook';
import { useCreateInvitation } from '@/core/spaces/presentation/hooks/use-create-invitation/useCreateInvitation.hook';
import { useAddMember } from '@/core/spaces/presentation/hooks/use-add-member/useAddMember.hook';
import { useRemoveMember } from '@/core/spaces/presentation/hooks/use-remove-member/useRemoveMember.hook';
import {
  createInvitationSchema,
  type CreateInvitationFormValues,
} from '@/core/spaces/presentation/schemas/create-invitation.schema';
import { addMemberSchema, type AddMemberFormValues } from '@/core/spaces/presentation/schemas/add-member.schema';
import type { SpaceInvitation } from '@/core/spaces/domain/interfaces/space-invitation.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['settings'];
  lang: string;
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
}

export function SpaceSettingsScreen({ dict, lang }: Props) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const currentUserId = useAuthStore((s) => s.currentUser?.userId ?? '');

  const { data: space, isLoading, isError } = useSpaceDetail(spaceId);
  const { mutate: createInvitation, isPending: invPending, error: invError, data: invitation, reset: resetInv } = useCreateInvitation();
  const { mutate: addMember, isPending: addPending, error: addError, isSuccess: addSuccess, reset: resetAdd } = useAddMember();
  const { mutate: removeMember, isPending: removePending, error: removeError, isSuccess: removeSuccess, reset: resetRemove } = useRemoveMember();

  const isOwner = !!space && space.ownerId === currentUserId;
  const { copied, copy } = useCopy();

  const invForm = useForm<CreateInvitationFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { role: 'member' },
  });

  const addForm = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
  });

  const removeForm = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
  });

  const onCreateInvitation = (values: CreateInvitationFormValues) => {
    if (!spaceId) return;
    resetInv();
    createInvitation({
      spaceId,
      role: values.role,
      expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined,
    });
  };

  const onAddMember = (values: AddMemberFormValues) => {
    if (!spaceId) return;
    resetAdd();
    addMember(
      { spaceId, targetUserId: values.targetUserId },
      { onSuccess: () => addForm.reset() },
    );
  };

  const onRemoveMember = (values: AddMemberFormValues) => {
    if (!spaceId) return;
    resetRemove();
    removeMember(
      { spaceId, targetUserId: values.targetUserId },
      { onSuccess: () => removeForm.reset() },
    );
  };

  const inviteLink = (inv: SpaceInvitation) =>
    `${window.location.origin}/${lang}/invite?code=${encodeURIComponent(inv.code)}`;

  return (
    <div className="flex flex-col">
      <ScreenHeader title={dict.title} />

      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        {/* Details */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.details.title}
            </p>
            {isLoading && (
              <div className="flex flex-col gap-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            )}
            {isError && <Alert variant="error" message={dict.errors.loadFailed} />}
            {space && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{dict.details.name}</dt>
                <dd data-testid="space-name" className="font-medium">{space.name}</dd>
                <dt className="text-muted-foreground">{dict.details.owner}</dt>
                <dd data-testid="space-owner" className="font-mono text-xs">{space.ownerId}</dd>
                <dt className="text-muted-foreground">{dict.details.createdAt}</dt>
                <dd data-testid="space-created-at">
                  {new Date(space.createdAt).toLocaleDateString()}
                </dd>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Invitation — owner only */}
        {isOwner && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.invitation.title}
              </p>
              <form onSubmit={invForm.handleSubmit(onCreateInvitation)} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">{dict.invitation.roleLabel}</label>
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
                  <label className="text-sm text-muted-foreground">{dict.invitation.expiresLabel}</label>
                  <Input
                    type="datetime-local"
                    data-testid="invitation-expires-input"
                    {...invForm.register('expiresAt')}
                  />
                </div>
                {invError && <Alert variant="error" message={dict.errors.invitationFailed} />}
                <Button type="submit" disabled={invPending} data-testid="invitation-submit">
                  {invPending ? dict.invitation.submitting : dict.invitation.submit}
                </Button>
              </form>

              {invitation && (
                <div data-testid="invitation-result" className="flex flex-col gap-3 pt-2 border-t border-[var(--rule)]">
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
                        alt="QR"
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
        )}

        {/* Members */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.members.title}
            </p>
            <InDevelopment label={dict.members.pendingApi} />

            {isOwner && (
              <div className="flex flex-col gap-6 pt-2 border-t border-[var(--rule)]">
                {/* Add member */}
                <form onSubmit={addForm.handleSubmit(onAddMember)} className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{dict.members.addTitle}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={dict.members.addUserIdPlaceholder}
                      data-testid="add-member-input"
                      {...addForm.register('targetUserId')}
                    />
                    <Button type="submit" disabled={addPending} data-testid="add-member-submit">
                      {addPending ? dict.members.addSubmitting : dict.members.addSubmit}
                    </Button>
                  </div>
                  {addForm.formState.errors.targetUserId && (
                    <span className="text-destructive text-xs">
                      {addForm.formState.errors.targetUserId.message}
                    </span>
                  )}
                  {addError && <Alert variant="error" message={dict.errors.addFailed} />}
                  {addSuccess && (
                    <Alert variant="success" message={dict.members.addSuccess} />
                  )}
                </form>

                {/* Remove member */}
                <form onSubmit={removeForm.handleSubmit(onRemoveMember)} className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{dict.members.removeTitle}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={dict.members.removeUserIdPlaceholder}
                      data-testid="remove-member-input"
                      {...removeForm.register('targetUserId')}
                    />
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={removePending}
                      data-testid="remove-member-submit"
                    >
                      {removePending ? dict.members.removeSubmitting : dict.members.removeSubmit}
                    </Button>
                  </div>
                  {removeForm.formState.errors.targetUserId && (
                    <span className="text-destructive text-xs">
                      {removeForm.formState.errors.targetUserId.message}
                    </span>
                  )}
                  {removeError && <Alert variant="error" message={dict.errors.removeFailed} />}
                  {removeSuccess && (
                    <Alert variant="success" message={dict.members.removeSuccess} />
                  )}
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
