import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantingSpotFormScreen } from '@/core/planting-spots/presentation/screens/planting-spot-form/planting-spot-form.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <PlantingSpotFormScreen dict={dict.plantingSpots} lang={locale} mode="create" />;
}
