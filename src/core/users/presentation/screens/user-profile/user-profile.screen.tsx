'use client';

import { Globe, Clock } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Textarea } from '@/shared/presentation/components/ui/textarea/textarea';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/presentation/components/ui/avatar/avatar';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { useUser } from '@/core/users/presentation/hooks/use-user/use-user.hook';
import { useUserInitials } from '@/core/users/presentation/hooks/use-user-initials/use-user-initials.hook';
import { useUpdateUserProfileForm } from '@/core/users/presentation/hooks/use-update-user-profile-form/use-update-user-profile-form.hook';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function ProfileSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className={`h-16 w-16 rounded-full ${shimmer}`} />
        <div className="flex flex-col gap-2">
          <div className={`h-5 w-32 ${shimmer}`} />
          <div className={`h-4 w-24 ${shimmer}`} />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className={`h-4 w-20 ${shimmer}`} />
          <div className={`h-9 w-full ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}

type Props = {
  dict: AppDict['users'];
  lang: string;
};

export function UserProfileScreen({ dict, lang }: Props) {
  const isBootComplete = useAuthStore((s) => s.isBootComplete);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: user, isLoading, isError } = useUser(currentUser?.userId);
  const initials = useUserInitials(user);
  const { form, onSubmit, isPending, error, isSuccess } = useUpdateUserProfileForm(user);
  const t = dict.profile;

  if (!isBootComplete || !currentUser || isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title={t.title} breadcrumbs={[{ label: t.title }]} />
        <div className="p-6 max-w-2xl">
          <Alert variant="error" message={t.loadError} />
        </div>
      </div>
    );
  }

  const { register, formState: { errors } } = form;

  function fieldError(msg: string | undefined) {
    if (!msg) return undefined;
    return (t as Record<string, string>)[msg] ?? msg;
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title={t.title} breadcrumbs={[{ label: t.title }]} />

      <div className="p-6 flex flex-col gap-8 max-w-2xl">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 bg-[var(--forest-bg)]">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
            <AvatarFallback className="text-xl font-semibold text-[var(--forest)] bg-[var(--forest-bg)]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[var(--ink)]">@{user.username}</p>
            <p className="text-sm text-muted-foreground">
              {t.memberSince}{' '}
              {new Date(user.createdAt).toLocaleDateString(lang)}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormField label={t.username} error={fieldError(errors.username?.message)}>
            <Input {...register('username')} placeholder={t.usernamePlaceholder} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t.firstName}>
              <Input {...register('firstName')} placeholder={t.firstNamePlaceholder} />
            </FormField>
            <FormField label={t.lastName}>
              <Input {...register('lastName')} placeholder={t.lastNamePlaceholder} />
            </FormField>
          </div>

          <FormField label={t.avatarUrl}>
            <Input {...register('avatarUrl')} placeholder={t.avatarUrlPlaceholder} />
          </FormField>

          <FormField label={t.bio} error={fieldError(errors.bio?.message)}>
            <Textarea
              {...register('bio')}
              placeholder={t.bioPlaceholder}
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={<span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{t.locale}</span>}>
              <Input {...register('locale')} placeholder={t.localePlaceholder} />
            </FormField>
            <FormField label={<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{t.timezone}</span>}>
              <Input {...register('timezone')} placeholder={t.timezonePlaceholder} />
            </FormField>
          </div>

          {isSuccess && <Alert variant="success" message={t.saveSuccess} />}
          {error && <Alert variant="error" message={t.saveError} />}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
