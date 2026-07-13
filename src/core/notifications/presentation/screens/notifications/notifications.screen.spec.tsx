import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import en from '@/core/notifications/presentation/i18n/en';

const dict: AppDict['notifications'] = en;

const mockUseNotifications = vi.hoisted(() => vi.fn());
const mockMarkRead = vi.hoisted(() => vi.fn());
const mockMarkAllRead = vi.hoisted(() => vi.fn());

vi.mock('@/core/notifications/presentation/hooks/use-notifications/use-notifications.hook', () => ({
  useNotifications: (filters?: NotificationFilters) => mockUseNotifications(filters),
}));

vi.mock('@/core/notifications/presentation/hooks/use-mark-notification-read/use-mark-notification-read.hook', () => ({
  useMarkNotificationRead: () => ({ mutate: mockMarkRead }),
}));

vi.mock('@/core/notifications/presentation/hooks/use-mark-all-notifications-read/use-mark-all-notifications-read.hook', () => ({
  useMarkAllNotificationsRead: () => ({ mutate: mockMarkAllRead }),
}));

import { NotificationsScreen } from './notifications.screen';

const unreadNotification: Notification = {
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
};

describe('NotificationsScreen', () => {
  beforeEach(() => {
    mockUseNotifications.mockReset();
    mockMarkRead.mockClear();
    mockMarkAllRead.mockClear();
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: false });
  });

  it('renders the title', () => {
    render(<NotificationsScreen dict={dict} />);
    expect(screen.getByText(dict.screen.title)).toBeInTheDocument();
  });

  it('defaults to the Unread tab, querying with status UNREAD', () => {
    render(<NotificationsScreen dict={dict} />);
    expect(mockUseNotifications).toHaveBeenCalledWith({ status: 'UNREAD' });
  });

  it('switches to the All tab and queries with no status filter', async () => {
    const user = userEvent.setup();
    render(<NotificationsScreen dict={dict} />);

    await user.click(screen.getByRole('tab', { name: dict.screen.tabs.all }));

    expect(mockUseNotifications).toHaveBeenCalledWith({});
  });

  it('shows the skeleton while loading', () => {
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: true });
    render(<NotificationsScreen dict={dict} />);
    expect(screen.queryByText(dict.screen.empty)).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no notifications', () => {
    render(<NotificationsScreen dict={dict} />);
    expect(screen.getByText(dict.screen.empty)).toBeInTheDocument();
  });

  it('renders notifications and marks one as read on click', async () => {
    mockUseNotifications.mockReturnValue({ notifications: [unreadNotification], isLoading: false });
    const user = userEvent.setup();
    render(<NotificationsScreen dict={dict} />);

    await user.click(screen.getByText('Watering due'));

    expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
  });

  it('calls markAllRead when the header action is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationsScreen dict={dict} />);

    await user.click(screen.getByRole('button', { name: dict.screen.markAllRead }));

    expect(mockMarkAllRead).toHaveBeenCalled();
  });
});
