import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { NotificationsScreen } from '@/core/notifications/presentation/screens/notifications/notifications.screen';
import { NotificationsSkeleton } from '@/core/notifications/presentation/components/notifications-skeleton/notifications-skeleton';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsScreen dict={dict.notifications} />
    </Suspense>
  );
}
