import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import en from '@/core/notifications/presentation/i18n/en';

const dict: AppDict['notifications'] = en;

vi.mock('next/navigation', () => ({
  useParams: () => ({ lang: 'en' }),
}));

const mockUnreadCount = vi.hoisted(() => ({ value: 0 }));
const mockNotifications = vi.hoisted(() => ({ value: [] as Notification[] }));
const mockMarkRead = vi.hoisted(() => vi.fn());
const mockMarkAllRead = vi.hoisted(() => vi.fn());

vi.mock('@/core/notifications/presentation/hooks/use-notifications-unread-count/use-notifications-unread-count.hook', () => ({
  useNotificationsUnreadCount: () => ({ unreadCount: mockUnreadCount.value }),
}));

vi.mock('@/core/notifications/presentation/hooks/use-notifications/use-notifications.hook', () => ({
  useNotifications: () => ({ notifications: mockNotifications.value }),
}));

vi.mock('@/core/notifications/presentation/hooks/use-mark-notification-read/use-mark-notification-read.hook', () => ({
  useMarkNotificationRead: () => ({ mutate: mockMarkRead }),
}));

vi.mock('@/core/notifications/presentation/hooks/use-mark-all-notifications-read/use-mark-all-notifications-read.hook', () => ({
  useMarkAllNotificationsRead: () => ({ mutate: mockMarkAllRead }),
}));

import { NotificationBell } from './notification-bell';

describe('NotificationBell', () => {
  beforeEach(() => {
    mockUnreadCount.value = 0;
    mockNotifications.value = [];
    mockMarkRead.mockClear();
    mockMarkAllRead.mockClear();
  });

  it('renders the bell button with the given aria label', () => {
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('does not show a badge when unreadCount is 0', () => {
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows the unread count badge when greater than 0', () => {
    mockUnreadCount.value = 3;
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('opens the dropdown and shows the empty state when there are no recent notifications', async () => {
    const user = userEvent.setup();
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByText(dict.bell.empty)).toBeInTheDocument();
  });

  it('shows recent notifications and marks one as read on click', async () => {
    mockNotifications.value = [
      {
        id: 'notif-1',
        type: 'CARE_SCHEDULE_DUE',
        referenceType: 'CARE_SCHEDULE',
        referenceId: 'cs-1',
        payload: { activityType: 'WATERING' },
        status: 'UNREAD',
        readAt: null,
        resolvedAt: null,
        userId: 'user-1',
        spaceId: 'space-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const user = userEvent.setup();
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    await user.click(await screen.findByText('Watering due'));

    expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
  });

  it('calls markAllRead when "mark all as read" is clicked', async () => {
    mockUnreadCount.value = 1;
    const user = userEvent.setup();
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    await user.click(await screen.findByText(dict.bell.markAllRead));

    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('renders a "view all" link to the notifications page for the current locale', async () => {
    const user = userEvent.setup();
    render(<NotificationBell ariaLabel="Notifications" dict={dict} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByText(dict.bell.viewAll)).toHaveAttribute('href', '/en/notifications');
  });
});
