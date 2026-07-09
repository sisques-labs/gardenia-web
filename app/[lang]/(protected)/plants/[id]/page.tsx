import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantDetailScreen } from '@/core/plants/presentation/screens/plant-detail/plant-detail.screen';

export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <PlantDetailScreen
      dict={dict.plants}
      careLogDict={dict.careLog}
      careScheduleDict={dict.careSchedule}
      photosDict={dict.plantPhotos}
      lang={locale}
      spaceId={null}
      plantId={id}
    />
  );
}
