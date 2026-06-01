import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { SpacesProviders } from '@/core/spaces/presentation/providers/spaces.providers';

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  return <SpacesProviders lang={locale}>{children}</SpacesProviders>;
}
