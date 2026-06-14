import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { SpaceMembersList } from '@/core/spaces/presentation/components/space-members-list/space-members-list.component';

export default async function SpaceMembersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="p-6">
      <SpaceMembersList dict={dict.spaces.members.list} />
    </div>
  );
}
