import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { TasksListScreen } from '@/core/tasks/presentation/screens/tasks-list/tasks-list.screen';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <TasksListScreen dict={dict.tasks} lang={locale} spaceId={null} />;
}
