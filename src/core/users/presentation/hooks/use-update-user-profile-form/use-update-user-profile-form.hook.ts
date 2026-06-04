'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUser } from '@/core/users/presentation/hooks/use-update-user/use-update-user.hook';
import {
  updateUserProfileSchema,
  type UpdateUserProfileFormValues,
} from '@/core/users/presentation/schemas/update-user-profile.schema';
import type { User } from '@/core/users/domain/interfaces/user.interface';

export function useUpdateUserProfileForm(user: User | undefined) {
  const { mutate: updateUser, isPending, error, isSuccess } = useUpdateUser(user?.id);

  const form = useForm<UpdateUserProfileFormValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      avatarUrl: '',
      bio: '',
      locale: '',
      timezone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        avatarUrl: user.avatarUrl ?? '',
        bio: user.bio ?? '',
        locale: user.locale ?? '',
        timezone: user.timezone ?? '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = form.handleSubmit((values) => {
    if (!user) return;
    updateUser({
      id: user.id,
      username: values.username,
      firstName: values.firstName || null,
      lastName: values.lastName || null,
      avatarUrl: values.avatarUrl || null,
      bio: values.bio || null,
      locale: values.locale || null,
      timezone: values.timezone || null,
    });
  });

  return { form, onSubmit, isPending, error, isSuccess };
}
