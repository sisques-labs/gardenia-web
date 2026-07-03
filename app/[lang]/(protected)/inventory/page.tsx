import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { InventoryListScreen } from '@/core/inventory/presentation/screens/inventory-list/inventory-list.screen';
import { InventoryListSkeleton } from '@/core/inventory/presentation/components/inventory-list-skeleton/inventory-list-skeleton';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<InventoryListSkeleton />}>
      <InventoryListScreen dict={dict.inventory} lang={locale} />
    </Suspense>
  );
}
