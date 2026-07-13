import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { NotificationList } from './notification-list';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import en from '@/core/notifications/presentation/i18n/en';

const dict: AppDict['notifications'] = en;

const mockNotifications: Notification[] = [
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
  {
    id: 'notif-2',
    type: 'INVENTORY_LOW_STOCK',
    referenceType: 'INVENTORY_ITEM',
    referenceId: 'item-1',
    payload: { itemName: 'Compost', quantity: 2, unit: 'KG' },
    status: 'READ',
    readAt: new Date().toISOString(),
    resolvedAt: null,
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('NotificationList', () => {
  it('renders one row per notification', () => {
    render(<NotificationList notifications={mockNotifications} dict={dict} onMarkRead={vi.fn()} />);
    expect(screen.getByText('Watering due')).toBeInTheDocument();
    expect(screen.getByText('Compost is running low (2 KG left)')).toBeInTheDocument();
  });

  it('shows the empty state when there are no notifications', () => {
    render(<NotificationList notifications={[]} dict={dict} onMarkRead={vi.fn()} />);
    expect(screen.getByText(dict.screen.empty)).toBeInTheDocument();
  });
});
