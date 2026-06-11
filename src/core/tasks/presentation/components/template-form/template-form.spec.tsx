import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock(
  '@/core/tasks/presentation/hooks/use-create-task-template/use-create-task-template.hook',
  () => ({
    useCreateTaskTemplate: () => ({ mutate: mockCreate, isPending: false }),
  }),
);

vi.mock(
  '@/core/tasks/presentation/hooks/use-update-task-template/use-update-task-template.hook',
  () => ({
    useUpdateTaskTemplate: () => ({ mutate: mockUpdate, isPending: false }),
  }),
);

import { TemplateForm } from './template-form';

const dict = {
  templates: {
    formTitle: 'Template',
    nameLabel: 'Name',
    namePlaceholder: 'Template name',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Optional description',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'Optional task title',
    taskDescriptionLabel: 'Task Description',
    taskDescriptionPlaceholder: 'Optional task description',
    handlerKeyLabel: 'Handler Key',
    handlerKeyPlaceholder: 'Optional handler key',
    defaultPriorityLabel: 'Priority',
    defaultTimeoutMsLabel: 'Timeout (ms)',
    maxConcurrencyLabel: 'Max Concurrency',
    maxRetriesLabel: 'Max Retries',
    backoffStrategyLabel: 'Backoff Strategy',
    defaultCronExpressionLabel: 'Cron Expression',
    defaultCronExpressionPlaceholder: '0 8 * * *',
    defaultIsRecurringLabel: 'Recurring',
    submitBtn: 'Save',
    submittingBtn: 'Saving...',
    cancelBtn: 'Cancel',
    validation: {
      nameRequired: 'Name is required',
      nameMax: 'Name must be 100 characters or less',
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
      backoffStrategyInvalid: 'Invalid backoff strategy',
      timeoutInvalid: 'Invalid',
      timeoutMin: 'Too low',
      maxConcurrencyInvalid: 'Invalid',
      maxConcurrencyMin: 'Too low',
      maxConcurrencyMax: 'Too high',
      cronMax: 'Too long',
    },
  },
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('TemplateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockImplementation((_input: unknown, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    mockUpdate.mockImplementation((_input: unknown, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
  });

  it('renders in create mode with empty fields', () => {
    render(
      <TemplateForm dict={dict as never} spaceId="s1" onSuccess={vi.fn()} />,
      { wrapper },
    );

    const nameInput = screen.getByPlaceholderText('Template name');
    expect(nameInput).toHaveValue('');
  });

  it('pre-populates fields in edit mode', () => {
    const template: ITaskTemplate = {
      id: 'tmpl-1',
      name: 'Daily sync',
      defaultPriority: 5,
      defaultRetryCount: 3,
      defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
      defaultTimeoutMs: 30000,
      maxConcurrency: 1,
      defaultIsRecurring: false,
      userId: 'u1',
      createdAt: '',
      updatedAt: '',
    };

    render(
      <TemplateForm dict={dict as never} spaceId="s1" template={template} onSuccess={vi.fn()} />,
      { wrapper },
    );

    expect(screen.getByPlaceholderText('Template name')).toHaveValue('Daily sync');
  });

  it('calls createTemplate when no template prop and form is valid', async () => {
    const onSuccess = vi.fn();
    render(
      <TemplateForm dict={dict as never} spaceId="s1" onSuccess={onSuccess} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('Template name'), {
      target: { value: 'My Template' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('calls updateTemplate when template prop is provided and form is valid', async () => {
    const template: ITaskTemplate = {
      id: 'tmpl-1',
      name: 'Daily sync',
      defaultPriority: 5,
      defaultRetryCount: 3,
      defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
      defaultTimeoutMs: 30000,
      maxConcurrency: 1,
      defaultIsRecurring: false,
      userId: 'u1',
      createdAt: '',
      updatedAt: '',
    };

    render(
      <TemplateForm dict={dict as never} spaceId="s1" template={template} onSuccess={vi.fn()} />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('does not submit when name is empty', async () => {
    render(
      <TemplateForm dict={dict as never} spaceId="s1" onSuccess={vi.fn()} />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
