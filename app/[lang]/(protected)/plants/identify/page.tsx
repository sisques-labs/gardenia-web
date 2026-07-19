import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { IdentifyPlantScreen } from '@/core/plant-identification/presentation/screens/identify-plant/identify-plant.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <IdentifyPlantScreen
      dict={dict.plantIdentification}
      createPlantDict={dict.plants.create}
      lang={locale}
      spaceId={null}
    />
  );
}
