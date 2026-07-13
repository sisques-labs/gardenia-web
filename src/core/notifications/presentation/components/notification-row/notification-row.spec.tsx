import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationRow } from './notification-row';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import en from '@/core/notifications/presentation/i18n/en';

const dict: AppDict['notifications'] = en;

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
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
    ...overrides,
  };
}

describe('NotificationRow', () => {
  const onMarkRead = vi.fn();

  beforeEach(() => {
    onMarkRead.mockClear();
  });

  it('renders the built message text', () => {
    render(<NotificationRow notification={makeNotification()} dict={dict} onMarkRead={onMarkRead} />);
    expect(screen.getByText('Watering due')).toBeInTheDocument();
  });

  it('shows an unread indicator when status is UNREAD', () => {
    render(<NotificationRow notification={makeNotification({ status: 'UNREAD' })} dict={dict} onMarkRead={onMarkRead} />);
    expect(screen.getByTestId('unread-indicator')).toBeInTheDocument();
  });

  it('does not show an unread indicator when status is READ', () => {
    render(<NotificationRow notification={makeNotification({ status: 'READ' })} dict={dict} onMarkRead={onMarkRead} />);
    expect(screen.queryByTestId('unread-indicator')).not.toBeInTheDocument();
  });

  it('calls onMarkRead with the notification id when an unread row is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationRow notification={makeNotification({ id: 'notif-2', status: 'UNREAD' })} dict={dict} onMarkRead={onMarkRead} />);

    await user.click(screen.getByRole('button'));

    expect(onMarkRead).toHaveBeenCalledWith('notif-2');
  });

  it('does not call onMarkRead when a read row is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationRow notification={makeNotification({ status: 'READ' })} dict={dict} onMarkRead={onMarkRead} />);

    await user.click(screen.getByRole('button'));

    expect(onMarkRead).not.toHaveBeenCalled();
  });
});
