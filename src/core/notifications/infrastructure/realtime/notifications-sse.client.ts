import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { NotificationSseEvent } from './notification-sse-event.interface';

export interface ConnectNotificationsStreamParams {
  spaceId: string;
  getAccessToken: () => string | null;
  onEvent: (event: NotificationSseEvent) => void;
  signal: AbortSignal;
}

export function connectNotificationsStream(params: ConnectNotificationsStreamParams): void {
  fetchEventSource('/api/notifications/stream', {
    headers: {
      Authorization: `Bearer ${params.getAccessToken() ?? ''}`,
      'X-Space-ID': params.spaceId,
    },
    signal: params.signal,
    onmessage(msg) {
      if (msg.event === 'heartbeat') return;
      params.onEvent(JSON.parse(msg.data) as NotificationSseEvent);
    },
  });
}
