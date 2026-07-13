import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { NotificationMessagesDict } from './notification-messages-dict.interface';

// The API doesn't enrich CARE_SCHEDULE_DUE payloads with a plant name (only `plantId`),
// so the message is built from the activity type alone — see notifications-web tasks.md.
interface CareScheduleDuePayload {
  activityType?: string;
}

interface InventoryLowStockPayload {
  itemName?: string;
  quantity?: number;
  unit?: string;
}

interface InventoryExpiringSoonPayload {
  itemName?: string;
}

export function buildNotificationMessage(notification: Notification, dict: NotificationMessagesDict): string {
  switch (notification.type) {
    case 'CARE_SCHEDULE_DUE': {
      const payload = notification.payload as CareScheduleDuePayload;
      const activityLabel = payload.activityType ? dict.activityTypes[payload.activityType] : undefined;
      if (!activityLabel) return dict.fallback;
      return dict.careScheduleDue.replace('{activity}', activityLabel);
    }
    case 'INVENTORY_LOW_STOCK': {
      const payload = notification.payload as InventoryLowStockPayload;
      if (!payload.itemName) return dict.fallback;
      return dict.inventoryLowStock
        .replace('{itemName}', payload.itemName)
        .replace('{quantity}', String(payload.quantity ?? ''))
        .replace('{unit}', payload.unit ?? '');
    }
    case 'INVENTORY_EXPIRING_SOON': {
      const payload = notification.payload as InventoryExpiringSoonPayload;
      if (!payload.itemName) return dict.fallback;
      return dict.inventoryExpiringSoon.replace('{itemName}', payload.itemName);
    }
    default:
      return dict.fallback;
  }
}
