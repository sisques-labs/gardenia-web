export const NOTIFICATION_TYPES = [
  'CARE_SCHEDULE_DUE',
  'INVENTORY_LOW_STOCK',
  'INVENTORY_EXPIRING_SOON',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_REFERENCE_TYPES = ['CARE_SCHEDULE', 'INVENTORY_ITEM'] as const;

export type NotificationReferenceType = (typeof NOTIFICATION_REFERENCE_TYPES)[number];

export const NOTIFICATION_STATUSES = ['UNREAD', 'READ'] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface Notification {
  id: string;
  type: NotificationType;
  referenceType: NotificationReferenceType;
  referenceId: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  readAt: string | null;
  resolvedAt: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
