'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/presentation/components/ui/button';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';
import { useCreateTaskTemplate } from '@/core/tasks/presentation/hooks/use-create-task-template/use-create-task-template.hook';
import { useUpdateTaskTemplate } from '@/core/tasks/presentation/hooks/use-update-task-template/use-update-task-template.hook';
import {
  taskTemplateSchema,
  type TaskTemplateFormValues,
} from '@/core/tasks/presentation/schemas/task-template.schema';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

interface TemplateFormProps {
  dict: AppDict['tasks'];
  spaceId: string | null;
  template?: ITaskTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ dict, spaceId, template, onSuccess }: TemplateFormProps) {
  const isEdit = !!template;
  const { mutate: createTemplate, isPending: isCreating } = useCreateTaskTemplate(spaceId);
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTaskTemplate(spaceId);
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskTemplateFormValues>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      name: template?.name ?? '',
      defaultPayload: template?.defaultPayload
        ? JSON.stringify(template.defaultPayload, null, 2)
        : '{}',
      maxRetries: template?.maxRetries ?? 3,
      backoffStrategy: template?.backoffStrategy ?? TaskBackoffStrategy.Exponential,
    },
  });

  const t = dict.templates;

  const onSubmit = (values: TaskTemplateFormValues) => {
    const defaultPayload = JSON.parse(values.defaultPayload) as Record<string, unknown>;

    if (isEdit) {
      updateTemplate(
        { id: template.id, ...values, defaultPayload },
        { onSuccess },
      );
    } else {
      createTemplate(
        { spaceId: spaceId!, ...values, defaultPayload },
        { onSuccess },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.nameLabel}</label>
        <input
          {...register('name')}
          placeholder={t.namePlaceholder}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{t.validation[errors.name.message as keyof typeof t.validation] ?? errors.name.message}</p>
        )}
      </div>

      {/* Default Payload */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.defaultPayloadLabel}</label>
        <textarea
          {...register('defaultPayload')}
          rows={5}
          placeholder={t.defaultPayloadPlaceholder}
          className="w-full border rounded-md px-3 py-2 text-sm font-mono"
        />
        {errors.defaultPayload && (
          <p className="text-xs text-destructive mt-1">{t.validation[errors.defaultPayload.message as keyof typeof t.validation] ?? errors.defaultPayload.message}</p>
        )}
      </div>

      {/* Max Retries */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.maxRetriesLabel}</label>
        <input
          {...register('maxRetries', { valueAsNumber: true })}
          type="number"
          min={0}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        {errors.maxRetries && (
          <p className="text-xs text-destructive mt-1">{t.validation[errors.maxRetries.message as keyof typeof t.validation] ?? errors.maxRetries.message}</p>
        )}
      </div>

      {/* Backoff Strategy */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.backoffStrategyLabel}</label>
        <select
          {...register('backoffStrategy')}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          {Object.values(TaskBackoffStrategy).map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
        {errors.backoffStrategy && (
          <p className="text-xs text-destructive mt-1">{t.validation[errors.backoffStrategy.message as keyof typeof t.validation] ?? errors.backoffStrategy.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t.submittingBtn : t.submitBtn}
        </Button>
      </div>
    </form>
  );
}
