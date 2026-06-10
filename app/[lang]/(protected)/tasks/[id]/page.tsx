import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { TaskDetailScreen } from '@/core/tasks/presentation/screens/task-detail/task-detail.screen';

export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return <TaskDetailScreen dict={dict.tasks} lang={locale} taskId={id} />;
}
