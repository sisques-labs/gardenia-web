import { DEFAULT_LOCALE, isLocale } from "@/shared/presentation/i18n/locale";
import { ProtectedProviders } from "@/shared/presentation/providers/protected.providers";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  return <ProtectedProviders lang={locale}>{children}</ProtectedProviders>;
}
