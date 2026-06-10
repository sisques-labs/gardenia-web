import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

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
    defaultPayloadLabel: 'Default Payload (JSON)',
    defaultPayloadPlaceholder: '{}',
    maxRetriesLabel: 'Max Retries',
    backoffStrategyLabel: 'Backoff Strategy',
    submitBtn: 'Save',
    submittingBtn: 'Saving...',
    cancelBtn: 'Cancel',
    validation: {
      nameRequired: 'Name is required',
      nameMax: 'Name must be 100 characters or less',
      defaultPayloadInvalidJson: 'Default payload must be valid JSON',
      maxRetriesInvalid: 'Max retries must be a non-negative integer',
      maxRetriesMin: 'Max retries must be 0 or greater',
      backoffStrategyInvalid: 'Invalid backoff strategy',
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
      spaceId: 's1',
      name: 'Daily sync',
      defaultPayload: { cron: '0 8 * * *' },
      maxRetries: 3,
      backoffStrategy: TaskBackoffStrategy.Exponential,
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
      spaceId: 's1',
      name: 'Daily sync',
      defaultPayload: {},
      maxRetries: 3,
      backoffStrategy: TaskBackoffStrategy.Exponential,
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
