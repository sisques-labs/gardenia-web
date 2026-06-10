import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockUseScheduleTask, mockUseTaskTemplates } = vi.hoisted(() => {
  const mockMutate = vi.fn();
  const mockUseScheduleTask = vi.fn(() => ({ mutate: mockMutate, isPending: false }));
  const mockTemplates = [
    {
      id: 'tmpl-1',
      spaceId: 'space-1',
      name: 'Daily sync',
      defaultPayload: { cron: '0 8 * * *' },
      maxRetries: 3,
      backoffStrategy: 'EXPONENTIAL',
      createdAt: '2026-06-10T00:00:00Z',
      updatedAt: '2026-06-10T00:00:00Z',
    },
    {
      id: 'tmpl-2',
      spaceId: 'space-1',
      name: 'Weekly report',
      defaultPayload: { freq: 'weekly' },
      maxRetries: 1,
      backoffStrategy: 'FIXED',
      createdAt: '2026-06-10T00:00:00Z',
      updatedAt: '2026-06-10T00:00:00Z',
    },
    {
      id: 'tmpl-3',
      spaceId: 'space-1',
      name: 'Hourly check',
      defaultPayload: {},
      maxRetries: 5,
      backoffStrategy: 'LINEAR',
      createdAt: '2026-06-10T00:00:00Z',
      updatedAt: '2026-06-10T00:00:00Z',
    },
  ];
  const mockUseTaskTemplates = vi.fn(() => ({
    data: { items: mockTemplates, total: 3, page: 1, pageSize: 50 },
    isLoading: false,
  }));
  return { mockUseScheduleTask, mockUseTaskTemplates };
});

vi.mock('@/core/tasks/presentation/hooks/use-schedule-task/use-schedule-task.hook', () => ({
  useScheduleTask: mockUseScheduleTask,
}));

vi.mock('@/core/tasks/presentation/hooks/use-task-templates/use-task-templates.hook', () => ({
  useTaskTemplates: mockUseTaskTemplates,
}));

vi.mock('@/shared/presentation/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'dialog-root' }, children) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-content' }, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', {}, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', {}, children),
  DialogFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', {}, children),
  ConfirmModal: () => null,
}));

vi.mock('@/shared/presentation/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode; onValueChange?: (value: string) => void }) =>
    React.createElement('div', { 'data-testid': 'select-root' }, children),
  SelectTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement('button', { 'data-testid': 'select-trigger' }, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) =>
    React.createElement('span', {}, placeholder),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'select-content' }, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement('div', { 'data-testid': `select-item-${value}` }, children),
  SelectGroup: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', {}, children),
  SelectLabel: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', {}, children),
  SelectSeparator: () => null,
}));

vi.mock('@/shared/presentation/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: { children: React.ReactNode; onClick?: () => void; type?: string; disabled?: boolean }) =>
    React.createElement('button', { onClick, type: type ?? 'button', disabled }, children),
}));

import { ScheduleTaskModal } from './schedule-task-modal';

describe('ScheduleTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders template-picker with 3 templates when modal is open', () => {
    render(<ScheduleTaskModal open={true} onClose={vi.fn()} spaceId="space-1" />);

    expect(screen.getByTestId('template-picker')).toBeInTheDocument();
    expect(screen.getByText('Daily sync')).toBeInTheDocument();
    expect(screen.getByText('Weekly report')).toBeInTheDocument();
    expect(screen.getByText('Hourly check')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(<ScheduleTaskModal open={false} onClose={vi.fn()} spaceId="space-1" />);

    expect(screen.queryByTestId('template-picker')).not.toBeInTheDocument();
  });
});
