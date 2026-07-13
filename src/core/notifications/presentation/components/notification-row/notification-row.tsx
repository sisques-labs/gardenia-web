import { CalendarClock, PackageMinus, Hourglass } from 'lucide-react';
import type { ReactElement } from 'react';
import type { Notification, NotificationType } from '@/core/notifications/domain/types/notification.interface';
import { buildNotificationMessage } from '@/core/notifications/presentation/utils/build-notification-message/build-notification-message.util';
import { formatRelativeTime } from '@/core/notifications/presentation/utils/format-relative-time/format-relative-time.util';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const TYPE_ICONS: Record<NotificationType, ReactElement> = {
  CARE_SCHEDULE_DUE: <CalendarClock className="w-4 h-4" />,
  INVENTORY_LOW_STOCK: <PackageMinus className="w-4 h-4" />,
  INVENTORY_EXPIRING_SOON: <Hourglass className="w-4 h-4" />,
};

interface NotificationRowProps {
  notification: Notification;
  dict: AppDict['notifications'];
  onMarkRead: (id: string) => void;
}

export function NotificationRow({ notification, dict, onMarkRead }: NotificationRowProps) {
  const isUnread = notification.status === 'UNREAD';

  return (
    <button
      type="button"
      onClick={() => isUnread && onMarkRead(notification.id)}
      className="w-full rounded-lg border bg-[var(--paper)] p-4 text-left flex items-start gap-3"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--forest-bg)] text-[var(--forest)]">
        {TYPE_ICONS[notification.type]}
      </span>
      <span className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm">{buildNotificationMessage(notification, dict.messages)}</span>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
      </span>
      {isUnread && (
        <span
          data-testid="unread-indicator"
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--forest)]"
        />
      )}
    </button>
  );
}
