'use client';

import Image from 'next/image';
import { Globe, Clock } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { useUser } from '@/core/users/presentation/hooks/use-user/use-user.hook';
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
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: user, isLoading } = useUser(currentUser?.id);
  const { form, onSubmit, isPending, error, isSuccess } = useUpdateUserProfileForm(user);

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  const { register, formState: { errors } } = form;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('') || user.username[0].toUpperCase();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={dict.profile.title}
        breadcrumbs={[{ label: dict.profile.title }]}
      />

      <div className="p-6 flex flex-col gap-8 max-w-2xl">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--forest-bg)] flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
            ) : (
              <span className="text-xl font-semibold text-[var(--forest)]">{initials}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)]">@{user.username}</p>
            <p className="text-sm text-muted-foreground">
              {dict.profile.memberSince}{' '}
              {new Date(user.createdAt).toLocaleDateString(lang)}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">
              {dict.profile.username}
            </label>
            <Input
              {...register('username')}
              placeholder={dict.profile.usernamePlaceholder}
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {(dict.profile as Record<string, string>)[errors.username.message!] ??
                  errors.username.message}
              </p>
            )}
          </div>

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--ink)]">
                {dict.profile.firstName}
              </label>
              <Input
                {...register('firstName')}
                placeholder={dict.profile.firstNamePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--ink)]">
                {dict.profile.lastName}
              </label>
              <Input
                {...register('lastName')}
                placeholder={dict.profile.lastNamePlaceholder}
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">
              {dict.profile.avatarUrl}
            </label>
            <Input
              {...register('avatarUrl')}
              placeholder={dict.profile.avatarUrlPlaceholder}
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">
              {dict.profile.bio}
            </label>
            <textarea
              {...register('bio')}
              placeholder={dict.profile.bioPlaceholder}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.bio && (
              <p className="text-xs text-destructive">
                {(dict.profile as Record<string, string>)[errors.bio.message!] ??
                  errors.bio.message}
              </p>
            )}
          </div>

          {/* Locale + Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--ink)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {dict.profile.locale}
              </label>
              <Input
                {...register('locale')}
                placeholder={dict.profile.localePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--ink)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {dict.profile.timezone}
              </label>
              <Input
                {...register('timezone')}
                placeholder={dict.profile.timezonePlaceholder}
              />
            </div>
          </div>

          {/* Feedback */}
          {isSuccess && (
            <p className="text-sm text-[var(--forest)]">{dict.profile.saveSuccess}</p>
          )}
          {error && (
            <p className="text-sm text-destructive">{dict.profile.saveError}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.profile.saving : dict.profile.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
