import { redirect } from 'next/navigation';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  redirect(`/${locale}/home`);
}
