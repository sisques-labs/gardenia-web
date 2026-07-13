export const NOTIFICATION_SSE_EVENT_TYPES = [
  'notification-created',
  'notification-read',
  'notification-resolved',
] as const;

export type NotificationSseEventType = (typeof NOTIFICATION_SSE_EVENT_TYPES)[number];

export interface NotificationSseEvent {
  type: NotificationSseEventType;
  notificationId: string;
}
