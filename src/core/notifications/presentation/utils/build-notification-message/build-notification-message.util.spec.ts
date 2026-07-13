import { describe, it, expect } from 'vitest';
import { buildNotificationMessage } from './build-notification-message.util';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { NotificationMessagesDict } from './notification-messages-dict.interface';

const dict: NotificationMessagesDict = {
  careScheduleDue: '{activity} due',
  activityTypes: {
    WATERING: 'Watering',
    FERTILIZING: 'Fertilizing',
    PRUNING: 'Pruning',
    REPOTTING: 'Repotting',
    TRANSPLANTING: 'Transplanting',
    PEST_TREATMENT: 'Pest treatment',
    MISTING: 'Misting',
    ROTATION: 'Rotation',
    OTHER: 'Other',
  },
  inventoryLowStock: '{itemName} is running low ({quantity} {unit} left)',
  inventoryExpiringSoon: '{itemName} expires soon',
  fallback: 'Notification',
};

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'CARE_SCHEDULE_DUE',
    referenceType: 'CARE_SCHEDULE',
    referenceId: 'cs-1',
    payload: {},
    status: 'UNREAD',
    readAt: null,
    resolvedAt: null,
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildNotificationMessage', () => {
  it('builds a CARE_SCHEDULE_DUE message from the activityType label', () => {
    const notification = makeNotification({
      type: 'CARE_SCHEDULE_DUE',
      payload: { plantId: 'plant-1', activityType: 'WATERING', nextDueAt: '2026-07-10' },
    });

    expect(buildNotificationMessage(notification, dict)).toBe('Watering due');
  });

  it('falls back to the generic message when activityType is missing', () => {
    const notification = makeNotification({ type: 'CARE_SCHEDULE_DUE', payload: {} });

    expect(buildNotificationMessage(notification, dict)).toBe('Notification');
  });

  it('falls back to the generic message when activityType is unknown', () => {
    const notification = makeNotification({
      type: 'CARE_SCHEDULE_DUE',
      payload: { activityType: 'SOMETHING_NEW' },
    });

    expect(buildNotificationMessage(notification, dict)).toBe('Notification');
  });

  it('builds an INVENTORY_LOW_STOCK message interpolating itemName/quantity/unit', () => {
    const notification = makeNotification({
      type: 'INVENTORY_LOW_STOCK',
      referenceType: 'INVENTORY_ITEM',
      payload: { itemName: 'Compost', itemType: 'FERTILIZER', quantity: 2, unit: 'KG', lowStockThreshold: 5 },
    });

    expect(buildNotificationMessage(notification, dict)).toBe('Compost is running low (2 KG left)');
  });

  it('falls back to the generic message when itemName is missing for INVENTORY_LOW_STOCK', () => {
    const notification = makeNotification({ type: 'INVENTORY_LOW_STOCK', payload: {} });

    expect(buildNotificationMessage(notification, dict)).toBe('Notification');
  });

  it('builds an INVENTORY_EXPIRING_SOON message interpolating itemName', () => {
    const notification = makeNotification({
      type: 'INVENTORY_EXPIRING_SOON',
      referenceType: 'INVENTORY_ITEM',
      payload: { itemName: 'Fish emulsion', itemType: 'FERTILIZER', expiresAt: '2026-07-15' },
    });

    expect(buildNotificationMessage(notification, dict)).toBe('Fish emulsion expires soon');
  });

  it('falls back to the generic message when itemName is missing for INVENTORY_EXPIRING_SOON', () => {
    const notification = makeNotification({ type: 'INVENTORY_EXPIRING_SOON', payload: {} });

    expect(buildNotificationMessage(notification, dict)).toBe('Notification');
  });
});
