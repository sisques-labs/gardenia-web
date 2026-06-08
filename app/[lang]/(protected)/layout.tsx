import { DEFAULT_LOCALE, isLocale } from "@/shared/presentation/i18n/locale";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { ProtectedProviders } from "@/shared/presentation/providers/protected.providers";
import { AppShell } from "@/shared/presentation/components/app-shell/app-shell";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <ProtectedProviders lang={locale}>
      <AppShell dict={dict.shell}>{children}</AppShell>
    </ProtectedProviders>
  );
}
