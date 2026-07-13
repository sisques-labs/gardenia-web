'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bell } from 'lucide-react';
import { NumericBadge } from '@/shared/presentation/components/ui/numeric-badge/numeric-badge';
import { Popover } from '@/shared/presentation/components/ui/popover/popover';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { NotificationList } from '@/core/notifications/presentation/components/notification-list/notification-list';
import { useNotifications } from '@/core/notifications/presentation/hooks/use-notifications/use-notifications.hook';
import { useNotificationsUnreadCount } from '@/core/notifications/presentation/hooks/use-notifications-unread-count/use-notifications-unread-count.hook';
import { useMarkNotificationRead } from '@/core/notifications/presentation/hooks/use-mark-notification-read/use-mark-notification-read.hook';
import { useMarkAllNotificationsRead } from '@/core/notifications/presentation/hooks/use-mark-all-notifications-read/use-mark-all-notifications-read.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const RECENT_LIMIT = 6;

interface NotificationBellProps {
  ariaLabel: string;
  dict: AppDict['notifications'];
}

export function NotificationBell({ ariaLabel, dict }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const params = useParams<{ lang: string }>();
  const { unreadCount } = useNotificationsUnreadCount();
  const { notifications } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const recent = notifications.slice(0, RECENT_LIMIT);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      contentClassName="w-80 p-0"
      trigger={
        <Button variant="ghost" size="sm" aria-label={ariaLabel} className="relative p-2">
          <Bell size={18} />
          {unreadCount > 0 && (
            <NumericBadge count={unreadCount} variant="danger" className="absolute -top-1 -right-1" />
          )}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{dict.screen.title}</span>
          {unreadCount > 0 && (
            <button type="button" className="text-xs text-[var(--forest)]" onClick={() => markAllRead()}>
              {dict.bell.markAllRead}
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dict.bell.empty}</p>
        ) : (
          <NotificationList notifications={recent} dict={dict} onMarkRead={markRead} />
        )}

        <Link
          href={`/${params.lang}/notifications`}
          className="text-xs text-center text-[var(--forest)]"
          onClick={() => setOpen(false)}
        >
          {dict.bell.viewAll}
        </Link>
      </div>
    </Popover>
  );
}
