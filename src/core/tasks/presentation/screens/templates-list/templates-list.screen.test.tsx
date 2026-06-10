import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

vi.mock(
  '@/core/tasks/presentation/hooks/use-task-templates/use-task-templates.hook',
  () => ({
    useTaskTemplates: vi.fn(),
  }),
);

vi.mock(
  '@/core/tasks/presentation/hooks/use-delete-task-template/use-delete-task-template.hook',
  () => ({
    useDeleteTaskTemplate: vi.fn(),
  }),
);

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 's1' }),
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/shared/presentation/components/ui/dialog', () => ({
  ConfirmModal: ({
    open,
    onConfirm,
  }: {
    open: boolean;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="delete-template-confirm">
        <button data-testid="confirm-action-btn" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    ) : null,
}));

import { useTaskTemplates } from '@/core/tasks/presentation/hooks/use-task-templates/use-task-templates.hook';
import { useDeleteTaskTemplate } from '@/core/tasks/presentation/hooks/use-delete-task-template/use-delete-task-template.hook';
import { TemplatesListScreen } from './templates-list.screen';

const mockDeleteMutate = vi.fn();

function makeTemplates(count: number): ITaskTemplate[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tmpl-${i + 1}`,
    spaceId: 's1',
    name: `Template ${i + 1}`,
    defaultPayload: {},
    maxRetries: 3,
    backoffStrategy: TaskBackoffStrategy.Exponential,
    createdAt: '',
    updatedAt: '',
  }));
}

const dict = {
  templates: {
    listTitle: 'Templates',
    newTemplate: 'New Template',
    empty: 'No templates yet',
    columns: {
      name: 'Name',
      maxRetries: 'Max Retries',
      backoffStrategy: 'Backoff Strategy',
    },
    deleteConfirmTitle: 'Delete Template',
    deleteConfirmDescription: 'Are you sure you want to delete this template?',
    deleteConfirmLabel: 'Yes, delete',
    keepLabel: 'Keep',
    deleteBtn: 'Delete',
  },
};

describe('TemplatesListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteTaskTemplate).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as ReturnType<typeof useDeleteTaskTemplate>);
  });

  it('renders 10 rows for 15 total templates', () => {
    const templates = makeTemplates(10);
    vi.mocked(useTaskTemplates).mockReturnValue({
      data: { items: templates, total: 15, page: 1, pageSize: 10 },
      isLoading: false,
    } as ReturnType<typeof useTaskTemplates>);

    render(<TemplatesListScreen dict={dict as never} lang="en" spaceId="s1" />);

    const rows = screen.getAllByRole('row');
    // 10 data rows + 1 header row
    expect(rows).toHaveLength(11);
  });

  it('renders Pagination with 2 pages for 15 templates with pageSize 10', () => {
    const templates = makeTemplates(10);
    vi.mocked(useTaskTemplates).mockReturnValue({
      data: { items: templates, total: 15, page: 1, pageSize: 10 },
      isLoading: false,
    } as ReturnType<typeof useTaskTemplates>);

    render(<TemplatesListScreen dict={dict as never} lang="en" spaceId="s1" />);
    // 2 pages means next button is enabled
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('opens delete confirm when delete button is clicked', async () => {
    const templates = makeTemplates(1);
    vi.mocked(useTaskTemplates).mockReturnValue({
      data: { items: templates, total: 1, page: 1, pageSize: 10 },
      isLoading: false,
    } as ReturnType<typeof useTaskTemplates>);

    render(<TemplatesListScreen dict={dict as never} lang="en" spaceId="s1" />);

    fireEvent.click(screen.getByTestId('delete-template-btn-tmpl-1'));
    expect(screen.getByTestId('delete-template-confirm')).toBeInTheDocument();
  });

  it('calls deleteTaskTemplate mutation when confirm is clicked', async () => {
    const templates = makeTemplates(1);
    vi.mocked(useTaskTemplates).mockReturnValue({
      data: { items: templates, total: 1, page: 1, pageSize: 10 },
      isLoading: false,
    } as ReturnType<typeof useTaskTemplates>);

    render(<TemplatesListScreen dict={dict as never} lang="en" spaceId="s1" />);

    fireEvent.click(screen.getByTestId('delete-template-btn-tmpl-1'));
    fireEvent.click(screen.getByTestId('confirm-action-btn'));

    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith('tmpl-1', expect.any(Object));
    });
  });

  it('renders empty state when no templates', () => {
    vi.mocked(useTaskTemplates).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as ReturnType<typeof useTaskTemplates>);

    render(<TemplatesListScreen dict={dict as never} lang="en" spaceId="s1" />);
    expect(screen.getByText('No templates yet')).toBeInTheDocument();
  });
});
