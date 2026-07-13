import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { connectNotificationsStream } from './notifications-sse.client';
import type { NotificationSseEvent } from './notification-sse-event.interface';

describe('connectNotificationsStream', () => {
  let controller: AbortController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AbortController();
  });

  it('calls fetchEventSource with the stream URL, auth/space headers, and the given signal', () => {
    connectNotificationsStream({
      spaceId: 'space-1',
      getAccessToken: () => 'token-abc',
      onEvent: vi.fn(),
      signal: controller.signal,
    });

    expect(fetchEventSource).toHaveBeenCalledWith(
      '/api/notifications/stream',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token-abc',
          'X-Space-ID': 'space-1',
        },
        signal: controller.signal,
      }),
    );
  });

  it('sends an empty bearer token when getAccessToken returns null', () => {
    connectNotificationsStream({
      spaceId: 'space-1',
      getAccessToken: () => null,
      onEvent: vi.fn(),
      signal: controller.signal,
    });

    expect(fetchEventSource).toHaveBeenCalledWith(
      '/api/notifications/stream',
      expect.objectContaining({
        headers: { Authorization: 'Bearer ', 'X-Space-ID': 'space-1' },
      }),
    );
  });

  it('ignores heartbeat messages', () => {
    const onEvent = vi.fn();
    connectNotificationsStream({
      spaceId: 'space-1',
      getAccessToken: () => 'token-abc',
      onEvent,
      signal: controller.signal,
    });

    const options = vi.mocked(fetchEventSource).mock.calls[0][1];
    options.onmessage?.({ event: 'heartbeat', data: '', id: '', retry: undefined } as never);

    expect(onEvent).not.toHaveBeenCalled();
  });

  it('parses and forwards non-heartbeat messages to onEvent', () => {
    const onEvent = vi.fn();
    connectNotificationsStream({
      spaceId: 'space-1',
      getAccessToken: () => 'token-abc',
      onEvent,
      signal: controller.signal,
    });

    const options = vi.mocked(fetchEventSource).mock.calls[0][1];
    const payload: NotificationSseEvent = { type: 'notification-created', notificationId: 'notif-1' };
    options.onmessage?.({ event: 'message', data: JSON.stringify(payload), id: '', retry: undefined } as never);

    expect(onEvent).toHaveBeenCalledWith(payload);
  });
});
