'use client';

import { useState } from 'react';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/presentation/components/ui/tabs/tabs';
import { NotificationList } from '@/core/notifications/presentation/components/notification-list/notification-list';
import { NotificationsSkeleton } from '@/core/notifications/presentation/components/notifications-skeleton/notifications-skeleton';
import { useNotifications } from '@/core/notifications/presentation/hooks/use-notifications/use-notifications.hook';
import { useMarkNotificationRead } from '@/core/notifications/presentation/hooks/use-mark-notification-read/use-mark-notification-read.hook';
import { useMarkAllNotificationsRead } from '@/core/notifications/presentation/hooks/use-mark-all-notifications-read/use-mark-all-notifications-read.hook';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['notifications'];
};

type NotificationsTab = 'unread' | 'all';

export function NotificationsScreen({ dict }: Props) {
  const [tab, setTab] = useState<NotificationsTab>('unread');
  const filters: NotificationFilters = tab === 'unread' ? { status: 'UNREAD' } : {};
  const { notifications, isLoading } = useNotifications(filters);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  return (
    <div>
      <ScreenHeader
        title={dict.screen.title}
        actions={
          <Button size="sm" variant="ghost" onClick={() => markAllRead()}>
            {dict.screen.markAllRead}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 px-6 py-6">
        <Tabs value={tab} onValueChange={(value) => setTab(value as NotificationsTab)}>
          <TabsList>
            <TabsTrigger value="unread">{dict.screen.tabs.unread}</TabsTrigger>
            <TabsTrigger value="all">{dict.screen.tabs.all}</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <NotificationsSkeleton />
        ) : (
          <NotificationList notifications={notifications} dict={dict} onMarkRead={markRead} />
        )}
      </div>
    </div>
  );
}
