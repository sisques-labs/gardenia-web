import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantingSpotsListScreen } from '@/core/planting-spots/presentation/screens/planting-spots-list/planting-spots-list.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense>
      <PlantingSpotsListScreen dict={dict.plantingSpots} lang={locale} />
    </Suspense>
  );
}
