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
  spaceId?: string | null;
  template?: ITaskTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ dict, template, onSuccess }: TemplateFormProps) {
  const isEdit = !!template;
  const { mutate: createTemplate, isPending: isCreating } = useCreateTaskTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTaskTemplate();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskTemplateFormValues>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      name: template?.name ?? '',
      description: template?.description ?? '',
      taskTitle: template?.taskTitle ?? '',
      taskDescription: template?.taskDescription ?? '',
      handlerKey: template?.handlerKey ?? '',
      defaultPriority: template?.defaultPriority ?? 5,
      defaultRetryCount: template?.defaultRetryCount ?? 3,
      defaultBackoffStrategy: (template?.defaultBackoffStrategy as TaskBackoffStrategy | undefined) ?? TaskBackoffStrategy.Exponential,
      defaultTimeoutMs: template?.defaultTimeoutMs ?? 30000,
      maxConcurrency: template?.maxConcurrency ?? 1,
      defaultCronExpression: template?.defaultCronExpression ?? '',
      defaultIsRecurring: template?.defaultIsRecurring ?? false,
    },
  });

  const t = dict.templates;
  const v = t.validation;

  const fieldError = (msg: string | undefined) =>
    msg ? <p className="text-xs text-destructive mt-1">{v[msg as keyof typeof v] ?? msg}</p> : null;

  const onSubmit = (values: TaskTemplateFormValues) => {
    const clean = {
      ...values,
      description: values.description || null,
      taskTitle: values.taskTitle || null,
      taskDescription: values.taskDescription || null,
      handlerKey: values.handlerKey || null,
      defaultCronExpression: values.defaultCronExpression || null,
    };
    if (isEdit) {
      updateTemplate({ id: template.id, ...clean }, { onSuccess });
    } else {
      createTemplate(clean, { onSuccess });
    }
  };

  const inputClass = 'w-full border rounded-md px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      {/* Name */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.nameLabel} <span className="text-destructive">*</span></label>
        <input {...register('name')} placeholder={t.namePlaceholder} className={inputClass} />
        {fieldError(errors.name?.message)}
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.descriptionLabel}</label>
        <textarea {...register('description')} placeholder={t.descriptionPlaceholder} rows={2} className={inputClass} />
        {fieldError(errors.description?.message)}
      </div>

      <hr className="border-border" />

      {/* Task Title */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.taskTitleLabel}</label>
        <input {...register('taskTitle')} placeholder={t.taskTitlePlaceholder} className={inputClass} />
        {fieldError(errors.taskTitle?.message)}
      </div>

      {/* Task Description */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.taskDescriptionLabel}</label>
        <textarea {...register('taskDescription')} placeholder={t.taskDescriptionPlaceholder} rows={2} className={inputClass} />
        {fieldError(errors.taskDescription?.message)}
      </div>

      {/* Handler Key */}
      <div>
        <label className="text-sm font-medium mb-1 block">{t.handlerKeyLabel}</label>
        <input {...register('handlerKey')} placeholder={t.handlerKeyPlaceholder} className={inputClass} />
        {fieldError(errors.handlerKey?.message)}
      </div>

      <hr className="border-border" />

      {/* Priority + Timeout + Concurrency */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t.defaultPriorityLabel}</label>
          <input {...register('defaultPriority', { valueAsNumber: true })} type="number" min={1} max={10} className={inputClass} />
          {fieldError(errors.defaultPriority?.message)}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t.defaultTimeoutMsLabel}</label>
          <input {...register('defaultTimeoutMs', { valueAsNumber: true })} type="number" min={1000} step={1000} className={inputClass} />
          {fieldError(errors.defaultTimeoutMs?.message)}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t.maxConcurrencyLabel}</label>
          <input {...register('maxConcurrency', { valueAsNumber: true })} type="number" min={1} max={100} className={inputClass} />
          {fieldError(errors.maxConcurrency?.message)}
        </div>
      </div>

      {/* Retries + Backoff */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t.maxRetriesLabel}</label>
          <input {...register('defaultRetryCount', { valueAsNumber: true })} type="number" min={0} max={10} className={inputClass} />
          {fieldError(errors.defaultRetryCount?.message)}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t.backoffStrategyLabel}</label>
          <select {...register('defaultBackoffStrategy')} className={inputClass}>
            {Object.values(TaskBackoffStrategy).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldError(errors.defaultBackoffStrategy?.message)}
        </div>
      </div>

      <hr className="border-border" />

      {/* Cron + Recurring */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t.defaultCronExpressionLabel}</label>
          <input {...register('defaultCronExpression')} placeholder={t.defaultCronExpressionPlaceholder} className={inputClass} />
          {fieldError(errors.defaultCronExpression?.message)}
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input {...register('defaultIsRecurring')} type="checkbox" id="defaultIsRecurring" className="h-4 w-4" />
          <label htmlFor="defaultIsRecurring" className="text-sm font-medium">{t.defaultIsRecurringLabel}</label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t.submittingBtn : t.submitBtn}
        </Button>
      </div>
    </form>
  );
}
