import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';

vi.mock('@/core/tasks/presentation/hooks/use-task/use-task.hook', () => ({
  useTask: vi.fn(),
}));

vi.mock('@/core/tasks/presentation/hooks/use-task-runs/use-task-runs.hook', () => ({
  useTaskRuns: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useTask } from '@/core/tasks/presentation/hooks/use-task/use-task.hook';
import { useTaskRuns } from '@/core/tasks/presentation/hooks/use-task-runs/use-task-runs.hook';
import { TaskDetailScreen } from './task-detail.screen';

const mockTask: ITask = {
  id: 't1',
  name: 'Daily Sync',
  status: TaskStatus.Pending,
  spaceId: 's1',
  payload: { cron: '0 8 * * *' },
  scheduledAt: '2026-06-10T08:00:00Z',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

const mockRuns: ITaskRun[] = [
  {
    id: 'r1',
    taskId: 't1',
    status: TaskRunStatus.Completed,
    output: {},
    startedAt: '2026-06-10T08:00:00Z',
    completedAt: '2026-06-10T08:01:00Z',
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-06-10T08:01:00Z',
  },
  {
    id: 'r2',
    taskId: 't1',
    status: TaskRunStatus.Failed,
    output: {},
    error: 'Connection refused',
    startedAt: '2026-06-09T08:00:00Z',
    createdAt: '2026-06-09T08:00:00Z',
    updatedAt: '2026-06-09T08:00:00Z',
  },
  {
    id: 'r3',
    taskId: 't1',
    status: TaskRunStatus.Running,
    output: {},
    startedAt: '2026-06-08T08:00:00Z',
    createdAt: '2026-06-08T08:00:00Z',
    updatedAt: '2026-06-08T08:00:00Z',
  },
];

const dict = {
  nav: 'Tasks',
  list: {
    title: 'Tasks',
    empty: 'No tasks yet',
    columns: { name: 'Name', status: 'Status', scheduledAt: 'Scheduled At' },
  },
  detail: {
    title: 'Task Detail',
    breadcrumbList: 'Tasks',
    payload: 'Payload',
    runs: 'Run History',
    runsEmpty: 'No runs yet',
    columns: { status: 'Status', startedAt: 'Started At', completedAt: 'Completed At', error: 'Error' },
  },
};

describe('TaskDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task name and status when task is loaded', () => {
    vi.mocked(useTask).mockReturnValue({ data: mockTask, isLoading: false, isError: false } as ReturnType<typeof useTask>);
    vi.mocked(useTaskRuns).mockReturnValue({ data: { items: [], total: 0, page: 1, pageSize: 10 }, isLoading: false, isError: false } as ReturnType<typeof useTaskRuns>);

    render(<TaskDetailScreen dict={dict} lang="en" taskId="t1" />);

    expect(screen.getByText('Daily Sync')).toBeInTheDocument();
  });

  it('renders run history with 3 run entries', () => {
    vi.mocked(useTask).mockReturnValue({ data: mockTask, isLoading: false, isError: false } as ReturnType<typeof useTask>);
    vi.mocked(useTaskRuns).mockReturnValue({ data: { items: mockRuns, total: 3, page: 1, pageSize: 10 }, isLoading: false, isError: false } as ReturnType<typeof useTaskRuns>);

    render(<TaskDetailScreen dict={dict} lang="en" taskId="t1" />);

    const runList = screen.getByTestId('task-run-list');
    expect(runList).toBeInTheDocument();
    const runItems = runList.querySelectorAll('[data-testid="task-run-item"]');
    expect(runItems).toHaveLength(3);
  });

  it('renders empty run history state when no runs', () => {
    vi.mocked(useTask).mockReturnValue({ data: mockTask, isLoading: false, isError: false } as ReturnType<typeof useTask>);
    vi.mocked(useTaskRuns).mockReturnValue({ data: { items: [], total: 0, page: 1, pageSize: 10 }, isLoading: false, isError: false } as ReturnType<typeof useTaskRuns>);

    render(<TaskDetailScreen dict={dict} lang="en" taskId="t1" />);

    expect(screen.getByTestId('task-run-list-empty')).toBeInTheDocument();
  });

  it('renders loading skeleton when task is loading', () => {
    vi.mocked(useTask).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof useTask>);
    vi.mocked(useTaskRuns).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof useTaskRuns>);

    const { container } = render(<TaskDetailScreen dict={dict} lang="en" taskId="t1" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
