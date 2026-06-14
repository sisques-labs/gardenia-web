'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';

export function useSpaceSettings(lang: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const currentUserId = useAuthStore((s) => s.currentUser?.userId ?? '');

  const spaceDetail = useSpaceDetail(spaceId);
  const createInvitationMutation = useCreateInvitation();
  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();

  const isOwner = !!spaceDetail.data && spaceDetail.data.ownerId === currentUserId;

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const inviteLink = (inv: SpaceInvitation) =>
    `${window.location.origin}/${lang}/invite?code=${encodeURIComponent(inv.code)}`;

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
    createInvitationMutation.reset();
    createInvitationMutation.mutate({
      spaceId,
      role: values.role,
      expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined,
    });
  };

  const onAddMember = (values: AddMemberFormValues) => {
    if (!spaceId) return;
    addMemberMutation.reset();
    addMemberMutation.mutate(
      { spaceId, targetUserId: values.targetUserId },
      { onSuccess: () => addForm.reset() },
    );
  };

  const onRemoveMember = (values: AddMemberFormValues) => {
    if (!spaceId) return;
    removeMemberMutation.reset();
    removeMemberMutation.mutate(
      { spaceId, targetUserId: values.targetUserId },
      { onSuccess: () => removeForm.reset() },
    );
  };

  return {
    spaceDetail,
    isOwner,
    copied,
    copy,
    inviteLink,
    invForm,
    addForm,
    removeForm,
    onCreateInvitation,
    onAddMember,
    onRemoveMember,
    createInvitation: createInvitationMutation,
    addMember: addMemberMutation,
    removeMember: removeMemberMutation,
  };
}
