import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { InventoryListScreen } from '@/core/inventory/presentation/screens/inventory-list/inventory-list.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <InventoryListScreen dict={dict.inventory} lang={locale} />;
}
