import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

vi.mock('@/core/tasks/presentation/hooks/use-tasks/use-tasks.hook', () => ({
  useTasks: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  '@/core/tasks/presentation/components/schedule-task-modal/schedule-task-modal',
  () => ({
    ScheduleTaskModal: ({ open }: { open: boolean }) =>
      open ? <div data-testid="schedule-task-modal" /> : null,
  }),
);

import { useTasks } from '@/core/tasks/presentation/hooks/use-tasks/use-tasks.hook';
import { TasksListScreen } from './tasks-list.screen';

const mockTasks: ITask[] = [
  {
    id: 't1',
    title: 'Daily Sync',
    triggerType: 'template',
    status: TaskStatus.Pending,
    payload: {},
    priority: 5,
    isRecurring: false,
    runCount: 0,
    userId: 'u1',
    scheduledAt: '2026-06-10T10:00:00Z',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 't2',
    title: 'Weekly Report',
    triggerType: 'template',
    status: TaskStatus.Completed,
    payload: {},
    priority: 5,
    isRecurring: false,
    runCount: 1,
    userId: 'u1',
    scheduledAt: '2026-06-09T08:00:00Z',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

const dict = {
  nav: 'Tasks',
  list: {
    title: 'Tasks',
    empty: 'No tasks yet',
    columns: {
      name: 'Name',
      status: 'Status',
      scheduledAt: 'Scheduled At',
    },
  },
  detail: {
    title: 'Task Detail',
    breadcrumbList: 'Tasks',
    payload: 'Payload',
    runs: 'Run History',
    runsEmpty: 'No runs yet',
    columns: {
      status: 'Status',
      startedAt: 'Started At',
      completedAt: 'Completed At',
      error: 'Error',
    },
  },
  schedule: {
    title: 'Schedule Task',
  },
  templates: {
    listTitle: 'Templates',
    newTemplate: 'New Template',
    empty: 'No templates yet',
    columns: { name: 'Name', maxRetries: 'Max Retries', backoffStrategy: 'Backoff Strategy' },
    deleteConfirmTitle: 'Delete',
    deleteConfirmDescription: 'Sure?',
    deleteConfirmLabel: 'Yes',
    keepLabel: 'Keep',
    deleteBtn: 'Delete',
    formTitle: 'Template',
    nameLabel: 'Name',
    namePlaceholder: 'Name',
    descriptionLabel: 'Description',
    descriptionPlaceholder: '',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: '',
    taskDescriptionLabel: 'Task Description',
    taskDescriptionPlaceholder: '',
    handlerKeyLabel: 'Handler Key',
    handlerKeyPlaceholder: '',
    defaultPriorityLabel: 'Priority',
    defaultTimeoutMsLabel: 'Timeout',
    maxConcurrencyLabel: 'Concurrency',
    maxRetriesLabel: 'Retries',
    backoffStrategyLabel: 'Backoff',
    defaultCronExpressionLabel: 'Cron',
    defaultCronExpressionPlaceholder: '',
    defaultIsRecurringLabel: 'Recurring',
    submitBtn: 'Save',
    submittingBtn: 'Saving...',
    cancelBtn: 'Cancel',
    validation: {
      nameRequired: 'Required',
      nameMax: 'Too long',
      descriptionMax: 'Too long',
      taskTitleMax: 'Too long',
      taskDescriptionMax: 'Too long',
      handlerKeyMax: 'Too long',
      priorityInvalid: 'Invalid',
      priorityMin: 'Too low',
      priorityMax: 'Too high',
      maxRetriesInvalid: 'Invalid',
      maxRetriesMin: 'Too low',
      maxRetriesMax: 'Too high',
      backoffStrategyInvalid: 'Invalid',
      timeoutInvalid: 'Invalid',
      timeoutMin: 'Too low',
      maxConcurrencyInvalid: 'Invalid',
      maxConcurrencyMin: 'Too low',
      maxConcurrencyMax: 'Too high',
      cronMax: 'Too long',
    },
  },
};

describe('TasksListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task rows when data is available', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: { items: mockTasks, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useTasks>);

    render(<TasksListScreen dict={dict} lang="en" spaceId={null} />);

    expect(screen.getByText('Daily Sync')).toBeInTheDocument();
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useTasks>);

    const { container } = render(<TasksListScreen dict={dict} lang="en" spaceId="s1" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useTasks>);

    render(<TasksListScreen dict={dict} lang="en" spaceId={null} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders Pagination with 2 pages for 12 tasks with pageSize 10', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: { items: mockTasks, total: 12, page: 1, pageSize: 10 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useTasks>);

    render(<TasksListScreen dict={dict} lang="en" spaceId={null} />);
    // Pagination should be visible (2 pages means next button is enabled)
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('calls useTasks with page 2 after clicking next', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: { items: mockTasks, total: 12, page: 1, pageSize: 10 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useTasks>);

    render(<TasksListScreen dict={dict} lang="en" spaceId={null} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(vi.mocked(useTasks)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 })
    );
  });
});
