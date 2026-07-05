import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { HomeScreen } from '@/core/home/presentation/screens/home/home.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <HomeScreen
      dict={dict.home}
      careScheduleDict={dict.careSchedule}
      plantingSpotsDict={dict.plantingSpots}
      plantsDict={dict.plants.create}
    />
  );
}
