import { DEFAULT_LOCALE, isLocale } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { SpaceInviteScreen } from '@/core/spaces/presentation/screens/space-invite/space-invite.screen';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <SpaceInviteScreen dict={dict.spaces.invite} lang={locale} />;
}
