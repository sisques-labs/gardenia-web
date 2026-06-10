'use client';

import { useRouter } from 'next/navigation';
import { TemplateForm } from '@/core/tasks/presentation/components/template-form/template-form';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

// This page uses client-side navigation via useSpacesStore and useRouter.
// If you need SSR dict, lift to a server component parent and pass dict as props.

export default function Page({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const lang = params.lang;

  // Minimal dict for the form — in production, pass from parent server component
  const dict = {
    templates: {
      formTitle: 'Create Template',
      nameLabel: 'Name',
      namePlaceholder: 'Template name',
      defaultPayloadLabel: 'Default Payload (JSON)',
      defaultPayloadPlaceholder: '{}',
      maxRetriesLabel: 'Max Retries',
      backoffStrategyLabel: 'Backoff Strategy',
      submitBtn: 'Create',
      submittingBtn: 'Creating...',
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

  return (
    <div className="px-6 pt-4 max-w-lg">
      <h1 className="text-xl font-semibold mb-6">Create Template</h1>
      <TemplateForm
        dict={dict}
        spaceId={spaceId}
        onSuccess={() => router.push(`/${lang}/tasks/templates`)}
      />
    </div>
  );
}
