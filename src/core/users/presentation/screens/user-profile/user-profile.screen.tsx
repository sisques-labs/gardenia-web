'use client';

import { AtSign, Calendar, Clock, FileText, Globe, Image as ImageIcon, User as UserIcon } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Textarea } from '@/shared/presentation/components/ui/textarea/textarea';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/presentation/components/ui/avatar/avatar';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { useUser } from '@/core/users/presentation/hooks/use-user/use-user.hook';
import { useUserInitials } from '@/core/users/presentation/hooks/use-user-initials/use-user-initials.hook';
import { useUpdateUserProfileForm } from '@/core/users/presentation/hooks/use-update-user-profile-form/use-update-user-profile-form.hook';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { UserProfileSkeleton } from '@/core/users/presentation/components/user-profile-skeleton/user-profile-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

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
    return <UserProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title={t.title} breadcrumbs={[{ label: t.title }]} />
        <div className="p-4 md:p-6">
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

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
          {/* Identity */}
          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <Avatar className="h-24 w-24 bg-forest-bg">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
                <AvatarFallback className="bg-forest-bg text-2xl font-semibold text-forest">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="headline text-xl">@{user.username}</p>
                <p className="flex items-center justify-center gap-1.5 text-sm text-ink-3">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {t.memberSince} {new Date(user.createdAt).toLocaleDateString(lang)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card>
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-bg text-forest"
                >
                  <UserIcon className="h-5 w-5" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <p className="eyebrow">{t.title}</p>
                  <p className="text-sm text-ink-3">{t.subtitle}</p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <FormField
                  label={
                    <span className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5" aria-hidden /> {t.username}
                    </span>
                  }
                  error={fieldError(errors.username?.message)}
                >
                  <Input {...register('username')} placeholder={t.usernamePlaceholder} />
                </FormField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label={t.firstName}>
                    <Input {...register('firstName')} placeholder={t.firstNamePlaceholder} />
                  </FormField>
                  <FormField label={t.lastName}>
                    <Input {...register('lastName')} placeholder={t.lastNamePlaceholder} />
                  </FormField>
                </div>

                <FormField
                  label={
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden /> {t.avatarUrl}
                    </span>
                  }
                >
                  <Input {...register('avatarUrl')} placeholder={t.avatarUrlPlaceholder} />
                </FormField>

                <FormField
                  label={
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" aria-hidden /> {t.bio}
                    </span>
                  }
                  error={fieldError(errors.bio?.message)}
                >
                  <Textarea {...register('bio')} placeholder={t.bioPlaceholder} rows={3} />
                </FormField>

                <div className="dashed-rule grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
                  <FormField label={<span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" aria-hidden />{t.locale}</span>}>
                    <Input {...register('locale')} placeholder={t.localePlaceholder} />
                  </FormField>
                  <FormField label={<span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />{t.timezone}</span>}>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
