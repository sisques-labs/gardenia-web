import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import { NotificationRow } from '@/core/notifications/presentation/components/notification-row/notification-row';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

interface NotificationListProps {
  notifications: Notification[];
  dict: AppDict['notifications'];
  onMarkRead: (id: string) => void;
}

export function NotificationList({ notifications, dict, onMarkRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">{dict.screen.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationRow key={notification.id} notification={notification} dict={dict} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}
