import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { SpaceSettingsScreen } from '@/core/spaces/presentation/screens/space-settings/space-settings.screen';

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <SpaceSettingsScreen dict={dict.spaces.settings} weatherDict={dict.spaces.weather} memberListDict={dict.spaces.members.list} lang={locale} />;
}
