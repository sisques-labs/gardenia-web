'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/presentation/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select';
import { Button } from '@/shared/presentation/components/ui/button';
import { useScheduleTask } from '@/core/tasks/presentation/hooks/use-schedule-task/use-schedule-task.hook';
import { useTaskTemplates } from '@/core/tasks/presentation/hooks/use-task-templates/use-task-templates.hook';
import {
  scheduleTaskSchema,
  type ScheduleTaskFormValues,
} from '@/core/tasks/presentation/schemas/schedule-task.schema';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

interface ScheduleTaskModalProps {
  open: boolean;
  onClose: () => void;
  spaceId?: string | null;
}

export function ScheduleTaskModal({ open, onClose }: ScheduleTaskModalProps) {
  const { data: templatesData } = useTaskTemplates({ page: 1, pageSize: 50 });
  const { mutate: scheduleTask, isPending } = useScheduleTask();
  const [selectedTemplate, setSelectedTemplate] = useState<ITaskTemplate | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleTaskFormValues>({
    resolver: zodResolver(scheduleTaskSchema),
    defaultValues: {
      templateId: '',
      payload: '{}',
    },
  });

  const templates = templatesData?.items ?? [];

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setValue('templateId', template.id);
    }
  };

  const onSubmit = (values: ScheduleTaskFormValues) => {
    const payload = JSON.parse(values.payload) as Record<string, unknown>;
    scheduleTask(
      { templateId: values.templateId, payload },
      {
        onSuccess: () => {
          reset();
          setSelectedTemplate(null);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Template picker */}
          <div data-testid="template-picker">
            <label className="text-sm font-medium mb-1 block">Template</label>
            <Select onValueChange={handleTemplateSelect} value={selectedTemplate?.id ?? ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.templateId && (
              <p className="text-xs text-destructive mt-1">{errors.templateId.message}</p>
            )}
          </div>

          {/* Payload editor */}
          <div>
            <label className="text-sm font-medium mb-1 block">Payload (JSON)</label>
            <textarea
              {...register('payload')}
              rows={5}
              className="w-full border rounded-md px-3 py-2 text-sm font-mono"
              placeholder="{}"
            />
            {errors.payload && (
              <p className="text-xs text-destructive mt-1">{errors.payload.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
