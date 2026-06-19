import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantingSpotDetailScreen } from '@/core/planting-spots/presentation/screens/planting-spot-detail/planting-spot-detail.screen';

export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <PlantingSpotDetailScreen dict={dict.plantingSpots} lang={locale} spotId={id} />;
}
