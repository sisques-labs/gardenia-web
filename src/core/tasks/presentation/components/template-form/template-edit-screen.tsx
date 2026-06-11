'use client';

import { useRouter } from 'next/navigation';
import { TemplateForm } from './template-form';
import { useTaskTemplate } from '@/core/tasks/presentation/hooks/use-task-template/use-task-template.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

interface Props {
  dict: AppDict['tasks'];
  lang: string;
  id: string;
}

export function TemplateEditScreen({ dict, lang, id }: Props) {
  const router = useRouter();
  const { data: template, isLoading } = useTaskTemplate(id);

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
      <h1 className="text-xl font-semibold mb-6">{dict.templates.formTitle}</h1>
      <TemplateForm
        dict={dict}
        template={template}
        onSuccess={() => router.push(`/${lang}/settings/templates`)}
      />
    </div>
  );
}
