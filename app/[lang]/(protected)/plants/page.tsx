import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantsListScreen } from '@/core/plants/presentation/screens/plants-list/plants-list.screen';
import { PlantsListSkeleton } from '@/core/plants/presentation/components/plants-list-skeleton/plants-list-skeleton';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<PlantsListSkeleton />}>
      <PlantsListScreen
        dict={dict.plants}
        lang={locale}
        spaceId={null}
        identifyLabel={dict.plantIdentification.submit}
      />
    </Suspense>
  );
}
