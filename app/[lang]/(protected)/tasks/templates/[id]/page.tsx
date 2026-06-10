'use client';

import { useRouter } from 'next/navigation';
import { TemplateForm } from '@/core/tasks/presentation/components/template-form/template-form';
import { useTaskTemplate } from '@/core/tasks/presentation/hooks/use-task-template/use-task-template.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export default function Page({ params }: { params: { lang: string; id: string } }) {
  const router = useRouter();
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { lang, id } = params;
  const { data: template, isLoading } = useTaskTemplate(id);

  const dict = {
    templates: {
      formTitle: 'Edit Template',
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
  } as never;

  if (isLoading) {
    return (
      <div className="px-6 pt-4">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="px-6 pt-4">
        <p>Template not found.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 max-w-lg">
      <h1 className="text-xl font-semibold mb-6">Edit Template</h1>
      <TemplateForm
        dict={dict}
        spaceId={spaceId}
        template={template}
        onSuccess={() => router.push(`/${lang}/tasks/templates`)}
      />
    </div>
  );
}
